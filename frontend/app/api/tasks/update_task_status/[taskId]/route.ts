import { NextRequest, NextResponse } from 'next/server';
import { updateTask, findTaskById } from '@/lib/data-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    const body = await request.json();
    const { status } = body;

    console.log('=== LOCAL API TASK STATUS UPDATE ===');
    console.log('Task ID:', taskId);
    console.log('New Status:', status);

    // Validate status
    if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
      return NextResponse.json(
        { detail: 'Invalid status. Must be one of: todo, in_progress, done' },
        { status: 422 }
      );
    }

    // Check if task exists
    const existingTask = findTaskById(taskId);
    if (!existingTask) {
      console.log('Task not found:', taskId);
      return NextResponse.json(
        { detail: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task status
    const updates = {
      status: status,
      completed: status === 'done'
    };

    console.log('Updating task with:', updates);

    const updatedTask = updateTask(taskId, updates);
    
    if (!updatedTask) {
      console.log('Failed to update task status in data store');
      return NextResponse.json(
        { detail: 'Failed to update task status' },
        { status: 500 }
      );
    }

    console.log('Task status updated successfully:', updatedTask);

    // Return success response
    return NextResponse.json({
      message: 'Task status updated successfully',
      task_id: updatedTask.id,
      status: updatedTask.status
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { detail: 'Failed to update task status' },
      { status: 500 }
    );
  }
}