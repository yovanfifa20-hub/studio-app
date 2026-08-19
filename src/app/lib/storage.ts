import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

export async function uploadAsset(
  buffer: Buffer,
  kind: "image" | "video",
  personaSlug: string
): Promise<string> {
  const ext = kind === "image" ? "jpg" : "mp4";
  const key = `${personaSlug}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: kind === "image" ? "image/jpeg" : "video/mp4",
    })
  );

  return `${process.env.S3_PUBLIC_BASE_URL}/${key}`;
}
