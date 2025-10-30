import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@/lib/data-store';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the current user from the session
    // const session = await getServerSession();
    // const currentUserId = session?.user?.id;
    
    // For now, return all tasks (in a real app, filter by assigned user)
    const assignedTasks = tasks;
    
    // Return tasks in the format expected by the frontend
    const formattedTasks = assignedTasks.map(task => ({
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
    console.error('Error fetching assigned tasks:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch assigned tasks' },
      { status: 500 }
    );
  }
}