import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 S3-compatible client
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Generate presigned PUT URL for direct browser upload
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600,
) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

// Generate presigned GET URL for downloading
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600,
) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return getSignedUrl(r2Client, command, { expiresIn });
}

// Delete object from R2
export async function deleteR2Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });
  return r2Client.send(command);
}
