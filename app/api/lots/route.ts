import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const lots = await db.collection("lots").find({}).toArray();
    
    return NextResponse.json(lots);
  } catch (error) {
    console.error("Error fetching lots:", error);
    return NextResponse.json(
      { error: "Failed to fetch lots" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only management team can create lots
    if (!['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Lot name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    // Check if lot already exists
    const existingLot = await db.collection("lots").findOne({ name });
    if (existingLot) {
      return NextResponse.json(
        { error: "Lot already exists" },
        { status: 409 }
      );
    }
    
    // Create new lot
    const result = await db.collection("lots").insertOne({
      name,
      isDefault: false,
      createdAt: new Date()
    });
    
    return NextResponse.json(
      { 
        message: "Lot created successfully",
        lotId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lot:", error);
    return NextResponse.json(
      { error: "Failed to create lot" },
      { status: 500 }
    );
  }
}