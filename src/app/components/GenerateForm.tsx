"use client";
import { useEffect, useState } from "react";

type Persona = { id: string; name: string };

export default function GenerateForm({ onGenerated }: { onGenerated: () => void }) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaId, setPersonaId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ created: number; duplicatesSkipped: number; errors: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/personas")
      .then((r) => r.json())
      .then((d) => {
        setPersonas(d.personas || []);
        if (d.personas?.[0]) setPersonaId(d.personas[0].id);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId, prompt, count }),
    });
    const data = await res.json();
    setLoading(false);
    setResult({
      created: data.created?.length || 0,
      duplicatesSkipped: data.duplicatesSkipped || 0,
      errors: data.errors || [],
    });
    onGenerated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-5 space-y-4">
      <div>
        <label className="text-xs text-muted block mb-1">Persona</label>
        <select
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value)}
          className="w-full bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent"
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted block mb-1">Prompt</label>
        <textarea
          required
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Portrait, lumière naturelle, cadrage 35mm, fond flou..."
          className="w-full bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="flex items-end gap-4">
        <div>
          <label className="text-xs text-muted block mb-1">Nombre de variations</label>
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24 bg-surface2 border border-line rounded px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !personaId}
          className="bg-accent hover:opacity-90 transition text-ink rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {loading ? "Génération en cours..." : "Générer"}
        </button>
      </div>

      {result && (
        <p className="text-sm mono text-muted">
          {result.created} créées · {result.duplicatesSkipped} doublons évités
          {result.errors.length > 0 && ` · ${result.errors.length} erreurs`}
        </p>
      )}
    </form>
  );
}
