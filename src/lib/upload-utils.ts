export async function uploadToS3(content: string | Blob, contentType: string, extension: string) {
  // 1. Get signed URL
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, extension }),
  });

  if (!res.ok) throw new Error("Failed to get upload URL");

  const { uploadUrl, fileUrl } = await res.json();

  // 2. Upload to S3
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: content,
  });

  if (!uploadRes.ok) throw new Error("Failed to upload to S3");

  return fileUrl;
}
