// Shared types for mock API integration

export type Project = {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Paused' | 'Completed';
  progressPercent: number;
  dueDate: string;
  tags: string[];
  priority: 'Low' | 'Medium' | 'High';
  members: number;
};

export type ArchivedProject = {
  id: number;
  name: string;
  description: string;
  dateArchived: string;
  teamSize: number;
  duration: string;
};

export type ArchivedTask = {
  id: number;
  title: string;
  project: string;
  assignedTo: string;
  dateArchived: string;
  priority: 'Low' | 'Medium' | 'High';
};

export type ArchivedFeedback = {
  id: number;
  title: string;
  category: string;
  submittedBy: string;
  dateArchived: string;
  status: 'Implemented' | 'Reviewed' | 'Rejected';
};

export type FeedbackItem = {
  id: number;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  date: string;
  timeAgo: string;
  assignee: string;
  resolved: boolean;
};

export type Client = {
  id: number;
  name: string;
  company: string;
  status: 'Active' | 'Inactive';
  projects: { name: string; count: number }[];
  tasks: { total: number; escalations: number };
  lastActivity: { time: string; description: string };
  health: 'Critical' | 'Good' | 'Warning';
  avatar: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  count: number;
  color: string; // tailwind color name e.g. green, orange
  tasks: BoardTask[];
};

export type BoardTask = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  filesCount: number;
  membersCount: number;
};


