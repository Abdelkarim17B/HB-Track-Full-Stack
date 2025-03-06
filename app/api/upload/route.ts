import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dbcfn455i",
  api_key: "273747925499614",
  api_secret: "SyaKMToG9HcgAWfbxenuSbMWMik",
  secure: true
});

// This is the new way to set config in App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Maximum 5MB file size
export const maxDuration = 10; // 10 seconds timeout

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
   
    // Check if using form data
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }
   
    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;
   
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
   
    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }
   
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }
   
    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
   
    // Create a folder structure based on user and purpose
    const folder = `tasks/${session.user.id}`;
   
    // Upload to Cloudinary
    // We need to convert buffer to base64 for Cloudinary's upload API
    const base64Data = buffer.toString('base64');
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${base64Data}`,
        {
          folder,
          resource_type: "image",
          // Optional transformations
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
   
    return NextResponse.json({
      url: result.secure_url,
      message: "File uploaded successfully"
    });
   
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}