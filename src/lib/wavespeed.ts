const API_BASE = process.env.WAVESPEED_API_URL || "https://api.wavespeed.ai/api/v3";
const API_KEY = process.env.WAVESPEED_API_KEY!;

type SubmitResponse = {
  data?: { id: string; urls?: { get?: string } };
  id?: string;
  urls?: { get?: string };
};

type PredictionResult = {
  id: string;
  status: "created" | "processing" | "completed" | "failed" | "cancelled" | "timeout";
  outputs?: string[];
  error?: string;
};

/**
 * Modèle WaveSpeed utilisé par défaut. Change ici selon le modèle que
 * tu veux utiliser pour Camille (ex: "wavespeed-ai/flux-dev",
 * "bytedance/seedream-v4.5", etc). Voir https://wavespeed.ai/models
 */
const DEFAULT_MODEL = process.env.WAVESPEED_MODEL || "wavespeed-ai/flux-dev";

export async function submitImageGeneration(params: {
  prompt: string;
  size?: string; // ex "1024*1024"
  seed?: number;
  model?: string;
}): Promise<string> {
  const model = params.model || DEFAULT_MODEL;

  const res = await fetch(`${API_BASE}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: params.prompt,
      size: params.size || "1024*1024",
      seed: params.seed ?? -1,
    }),
  });

  if (!res.ok) {
    throw new Error(`WaveSpeed a refusé la soumission (${res.status}): ${await res.text()}`);
  }

  const body: SubmitResponse = await res.json();
  const task = body.data || body;
  if (!task.id) throw new Error("Réponse WaveSpeed sans id de prédiction");
  return task.id;
}

async function getPrediction(predictionId: string): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predictions/${predictionId}/result`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Impossible de lire la prédiction ${predictionId}: ${res.status}`);
  }
  const body = await res.json();
  return body.data || body;
}

/** Poll toutes les ~2s jusqu'à complétion, avec un timeout global. */
export async function waitForPrediction(
  predictionId: string,
  maxWaitMs = 180_000
): Promise<string[]> {
  const start = Date.now();
  let interval = 2000;

  while (Date.now() - start < maxWaitMs) {
    const result = await getPrediction(predictionId);

    if (result.status === "completed") {
      return result.outputs || [];
    }
    if (["failed", "cancelled", "timeout"].includes(result.status)) {
      throw new Error(`Génération échouée (${result.status}): ${result.error || "erreur inconnue"}`);
    }

    await new Promise((r) => setTimeout(r, interval));
    interval = Math.min(interval + 500, 5000); // ralentit le polling progressivement
  }

  throw new Error("Timeout : la génération a pris trop de temps");
}

export async function downloadOutput(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Impossible de télécharger le résultat: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Lance une génération complète: soumission -> polling -> téléchargement du résultat brut. */
export async function generateImage(params: {
  prompt: string;
  size?: string;
  seed?: number;
  model?: string;
}): Promise<Buffer[]> {
  const predictionId = await submitImageGeneration(params);
  const outputUrls = await waitForPrediction(predictionId);
  return Promise.all(outputUrls.map(downloadOutput));
}
