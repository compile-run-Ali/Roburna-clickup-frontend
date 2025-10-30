import { NextRequest, NextResponse } from 'next/server';
import { addAssigneesToTask, findTaskById } from '@/lib/data-store';

export async function POST(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    const body = await request.json();
    const { user_ids } = body;

    // Validate input
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { detail: 'user_ids array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = findTaskById(taskId);
    if (!existingTask) {
      return NextResponse.json(
        { detail: 'Task not found' },
        { status: 404 }
      );
    }

    // Add assignees to task
    const success = addAssigneesToTask(taskId, user_ids);
    
    if (!success) {
      return NextResponse.json(
        { detail: 'Failed to add assignees to task' },
        { status: 500 }
      );
    }

    // Get updated task
    const updatedTask = findTaskById(taskId);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Assignees added successfully',
      task: {
        task_id: updatedTask!.id,
        id: updatedTask!.id,
        assignees: updatedTask!.assignees.map(assignee => ({
          user_id: assignee.id,
          id: assignee.id,
          name: assignee.name,
          email: assignee.email,
          role: assignee.role,
          avatar: assignee.avatar,
        })),
        updated_at: updatedTask!.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error adding assignees to task:', error);
    return NextResponse.json(
      { detail: 'Failed to add assignees to task' },
      { status: 500 }
    );
  }
}