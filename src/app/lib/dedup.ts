import sharp from "sharp";

/**
 * Calcule un "average hash" (aHash) 64 bits d'une image : on la réduit
 * à 8x8 pixels en niveaux de gris, puis on compare chaque pixel à la
 * moyenne pour obtenir une empreinte binaire. Deux images visuellement
 * proches auront des hashes proches, même si elles ne sont pas
 * strictement identiques en octets.
 */
export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .resize(8, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
  let bits = "";
  for (const v of data) bits += v >= avg ? "1" : "0";

  // bits (64 caractères de '0'/'1') -> hex, plus compact à stocker
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

function hexToBits(hex: string): string {
  return hex
    .split("")
    .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
    .join("");
}

/** Distance de Hamming entre deux hashes hex (nombre de bits différents, 0-64). */
export function hammingDistance(hexA: string, hexB: string): number {
  const a = hexToBits(hexA);
  const b = hexToBits(hexB);
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

/**
 * Seuil en dessous duquel deux images sont considérées comme quasi-
 * identiques. 64 bits au total ; en dessous de 6-8 bits de différence,
 * l'image est presque toujours une quasi-copie visuelle.
 */
export const DUPLICATE_THRESHOLD = 6;

export function isDuplicate(hexA: string, hexB: string): boolean {
  return hammingDistance(hexA, hexB) <= DUPLICATE_THRESHOLD;
}
