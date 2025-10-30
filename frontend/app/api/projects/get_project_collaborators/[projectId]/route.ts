import { NextRequest, NextResponse } from 'next/server';
import { getProjectCollaboratorUsers } from '@/lib/data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    // In a real app, you'd verify authentication here
    // const token = request.headers.get('authorization');
    
    const collaborators = getProjectCollaboratorUsers(projectId);
    
    // Return users in the format expected by the frontend
    const formattedUsers = collaborators.map(user => ({
      user_id: user.id,
      id: user.id,
      name: user.name,
      username: user.name.toLowerCase().replace(' ', '.'),
      full_name: user.name,
      email: user.email,
      avatar: user.avatar,
      profile_picture: user.avatar,
      role: user.role,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching project collaborators:', error);
    return NextResponse.json(
      { detail: 'Failed to fetch project collaborators' },
      { status: 500 }
    );
  }
}