import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const lot = searchParams.get('lot');
    
    const client = await clientPromise;
    const db = client.db();
    
    const query: any = {};
    
    // Filter by date if provided
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.scheduledDate = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by lot if provided, or by user's lot if not management
    if (lot) {
      query.lot = lot;
    } else if (!['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role)) {
      // Non-management users can only see tasks for their lot
      query.lot = session.user.lot;
    }
    
    const tasks = await db.collection("tasks").find(query).toArray();
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only management team can create tasks
    if (!['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { title, description, lot, scheduledDate } = await req.json();
    
    if (!title || !description || !lot || !scheduledDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("tasks").insertOne({
      title,
      description,
      lot,
      createdBy: session.user.id,
      createdAt: new Date(),
      scheduledDate: new Date(scheduledDate),
      status: "pending",
      comments: [],
      updatedAt: new Date()
    });
    
    return NextResponse.json(
      { 
        message: "Task created successfully",
        taskId: result.insertedId 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}