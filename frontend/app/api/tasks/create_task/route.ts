import { NextRequest, NextResponse } from 'next/server';
import { addTask, getNextTaskId, users } from '@/lib/data-store';
import { Task } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    const body = await request.json();
    const {
      title,
      description,
      project_id,
      start_date,
      due_date,
      assignee_ids = [],
      priority = 'medium',
      labels = '',
      status = 'todo'
    } = body;

    // Validate required fields
    if (!title || !project_id) {
      return NextResponse.json(
        { detail: 'Title and project_id are required' },
        { status: 400 }
      );
    }

    // Get assignees from user IDs
    const assignees = users.filter(user => assignee_ids.includes(user.id));

    // Create new task
    const newTask: Task = {
      id: getNextTaskId(),
      title,
      description: description || '',
      status: status as any || 'todo',
      assignees,
      projectId: project_id,
      createdAt: new Date(),
      updatedAt: new Date(),
      startDate: start_date ? new Date(start_date) : undefined,
      dueDate: due_date ? new Date(due_date) : undefined,
      priority: priority || 'medium',
      labels: labels || '',
    };

    // Add task to store
    const createdTask = addTask(newTask);

    // Return response in expected format
    return NextResponse.json({
      message: 'Task created successfully',
      task_id: createdTask.id,
      task: {
        task_id: createdTask.id,
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        assignees: createdTask.assignees,
        project_id: createdTask.projectId,
        created_at: createdTask.createdAt.toISOString(),
        updated_at: createdTask.updatedAt.toISOString(),
        start_date: createdTask.startDate?.toISOString(),
        due_date: createdTask.dueDate?.toISOString(),
        priority: createdTask.priority,
        labels: createdTask.labels,
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { detail: 'Failed to create task' },
      { status: 500 }
    );
  }
}