import { NextRequest, NextResponse } from 'next/server';
import { projects } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    // Return projects in the format expected by the frontend
    const formattedProjects = projects.map(project => ({
      project_id: project.id,
      id: project.id,
      title: project.name,
      name: project.name,
      description: project.description,
      client_company: 'Sample Client',
      client_id: '1',
      created_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      start_date: new Date().toISOString(),
      status: 'in_progress',
      updated_at: new Date().toISOString(),
      urgency: 'medium',
      budget: 50000,
      total_revenue: 75000,
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}