import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@/lib/data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    // Filter tasks by project ID
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    // Return tasks in the format expected by the frontend
    const formattedTasks = projectTasks.map(task => ({
      task_id: task.id,
      id: task.id,
      title: task.title,
      name: task.title,
      description: task.description,
      status: task.status,
      assignees: task.assignees.map(assignee => ({
        user_id: assignee.id,
        id: assignee.id,
        name: assignee.name,
        email: assignee.email,
        role: assignee.role,
        avatar: assignee.avatar,
      })),
      assigned_users: task.assignees,
      project_id: task.projectId,
      created_at: task.createdAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
      start_date: task.startDate?.toISOString(),
      due_date: task.dueDate?.toISOString(),
      priority: task.priority,
      labels: task.labels,
      completed: task.status === 'done',
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks by project:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}