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
    const {
      title,
      description,
      start_date,
      due_date,
      status,
      priority,
      labels,
      updated_at,
    } = body;

    console.log('=== LOCAL API TASK UPDATE ===');
    console.log('Task ID:', taskId);
    console.log('Update body:', body);

    // Check if task exists
    const existingTask = findTaskById(taskId);
    if (!existingTask) {
      console.log('Task not found:', taskId);
      return NextResponse.json(
        { detail: 'Task not found' },
        { status: 404 }
      );
    }

    // Prepare updates
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (start_date !== undefined) updates.startDate = start_date ? new Date(start_date) : undefined;
    if (due_date !== undefined) updates.dueDate = due_date ? new Date(due_date) : undefined;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (labels !== undefined) updates.labels = labels;

    console.log('Prepared updates:', updates);

    // Update task
    const updatedTask = updateTask(taskId, updates);
    
    if (!updatedTask) {
      console.log('Failed to update task in data store');
      return NextResponse.json(
        { detail: 'Failed to update task' },
        { status: 500 }
      );
    }

    console.log('Task updated successfully:', updatedTask);

    // Return updated task in expected format
    return NextResponse.json({
      message: 'Task updated successfully',
      task_id: updatedTask.id,
      task: {
        task_id: updatedTask.id,
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        assignees: updatedTask.assignees,
        project_id: updatedTask.projectId,
        created_at: updatedTask.createdAt.toISOString(),
        updated_at: updatedTask.updatedAt.toISOString(),
        start_date: updatedTask.startDate?.toISOString(),
        due_date: updatedTask.dueDate?.toISOString(),
        priority: updatedTask.priority,
        labels: updatedTask.labels,
      }
    });
  } catch (error) {
    console.error('Error updating task details:', error);
    return NextResponse.json(
      { detail: 'Failed to update task details' },
      { status: 500 }
    );
  }
}