import sharp from "sharp";
import { spawn } from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import crypto from "crypto";

/**
 * Retire toutes les métadonnées (EXIF, IPTC, XMP, GPS...) d'une image
 * en la réencodant avec sharp. sharp ne copie pas les métadonnées
 * par défaut sauf si on appelle .withMetadata(), donc un simple
 * passage par sharp() suffit à les supprimer.
 */
export async function stripImageMetadata(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // applique l'orientation EXIF avant de la supprimer, pour ne pas changer le rendu
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

/**
 * Retire les métadonnées d'une vidéo via ffmpeg (-map_metadata -1),
 * en recopiant les flux sans réencodage (rapide, sans perte).
 * Nécessite le binaire `ffmpeg` disponible dans l'environnement
 * (voir nixpacks.toml à la racine du projet).
 */
export async function stripVideoMetadata(buffer: Buffer, ext = "mp4"): Promise<Buffer> {
  const id = crypto.randomUUID();
  const inPath = path.join(tmpdir(), `${id}-in.${ext}`);
  const outPath = path.join(tmpdir(), `${id}-out.${ext}`);

  await writeFile(inPath, buffer);

  await new Promise<void>((resolve, reject) => {
    const ff = spawn("ffmpeg", [
      "-y",
      "-i", inPath,
      "-map_metadata", "-1",
      "-map_chapters", "-1",
      "-c", "copy",
      outPath,
    ]);
    let stderr = "";
    ff.stderr.on("data", (d) => (stderr += d.toString()));
    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg a échoué (code ${code}): ${stderr}`));
    });
    ff.on("error", reject);
  });

  const cleaned = await readFile(outPath);
  await Promise.all([unlink(inPath).catch(() => {}), unlink(outPath).catch(() => {})]);
  return cleaned;
}
