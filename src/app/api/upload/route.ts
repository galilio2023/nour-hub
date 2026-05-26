import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { s3Client, BUCKET_NAME } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { contentType, extension } = await req.json();

    if (!contentType) {
      return new NextResponse("Missing contentType", { status: 400 });
    }

    // Security: Validate allowed content types
    const allowedTypes = [
        "application/json",
        "image/png",
        "image/jpeg",
        "image/webp",
        "audio/mpeg",
        "audio/wav"
    ];

    if (!allowedTypes.includes(contentType)) {
        return new NextResponse("Forbidden: Invalid content type", { status: 403 });
    }

    const fileKey = `${session.user.id}/${uuidv4()}.${extension || 'json'}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({
      uploadUrl: signedUrl,
      fileUrl: `${process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`}/${fileKey}`,
      fileKey,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
