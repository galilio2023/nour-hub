import { S3Client } from "@aws-sdk/client-s3";

const bucketName = process.env.S3_BUCKET_NAME;

export const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // For R2 or other S3-compatible storage
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

export const BUCKET_NAME = bucketName || "placeholder-bucket-for-build";
