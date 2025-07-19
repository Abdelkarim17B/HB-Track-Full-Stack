import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = resolvedParams.id;
    
    const client = await clientPromise;
    const db = client.db();
    
    const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Check if user has access to this task
    if (
      !['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role) && 
      task.lot !== session.user.lot
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = resolvedParams.id;
    const { status, comment, photoUrl } = await req.json();
    
    const client = await clientPromise;
    const db = client.db();
    
    const task = await db.collection("tasks").findOne({ _id: new ObjectId(id) });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // Check if user has access to this task
    if (task.lot !== session.user.lot && !['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Update status if provided
    if (status) {
      updateData.status = status;
    }
    
    // Add comment if provided
    if (comment) {
      const newComment = {
        _id: new ObjectId(),
        taskId: id,
        userId: session.user.id,
        userName: session.user.name,
        text: comment,
        photoUrl: photoUrl || null,
        createdAt: new Date()
      };
      
      // Fix: Using the correct $push operator format
      await db.collection("tasks").updateOne(
        { _id: new ObjectId(id) },
        { $push: { comments: newComment } as any }
      );
    }
    
    // Update task
    await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    return NextResponse.json(
      { message: "Task updated successfully" }
    );
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only management team can delete tasks
    if (!['ingenieur', 'chef_chantier', 'conducteur'].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const id = resolvedParams.id;
    
    const client = await clientPromise;
    const db = client.db();
    
    const result = await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Task deleted successfully" }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}