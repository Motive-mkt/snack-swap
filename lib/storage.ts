import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const PDF_FILENAME = "Snack_Swap_Playbook.pdf";

export type PdfSource =
  | { kind: "redirect"; url: string }
  | { kind: "stream"; stream: ReadableStream; size: number };

/**
 * Private PDF delivery. Never place the PDF under /public.
 *  - S3 / Cloudflare R2 (S3-compatible): set S3_BUCKET, S3_KEY, S3_REGION, AWS_ACCESS_KEY_ID,
 *    AWS_SECRET_ACCESS_KEY (+ S3_ENDPOINT for R2). A 5-minute presigned URL is issued per request.
 *  - Local dev fallback: reads ./private/Snack_Swap_Playbook.pdf (or PRIVATE_PDF_PATH) from disk.
 */
export async function getPdfSource(): Promise<PdfSource> {
  const bucket = process.env.S3_BUCKET;
  if (bucket) {
    const client = new S3Client({
      region: process.env.S3_REGION ?? "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: process.env.S3_KEY ?? PDF_FILENAME,
        ResponseContentDisposition: `attachment; filename="${PDF_FILENAME}"`,
        ResponseContentType: "application/pdf",
      }),
      { expiresIn: 300 },
    );
    return { kind: "redirect", url };
  }
  const file = path.resolve(/*turbopackIgnore: true*/ process.env.PRIVATE_PDF_PATH ?? path.join(process.cwd(), "private", PDF_FILENAME));
  const size = statSync(file).size; // throws if missing -> 500, surfaced in logs
  return { kind: "stream", stream: Readable.toWeb(createReadStream(file)) as ReadableStream, size };
}
