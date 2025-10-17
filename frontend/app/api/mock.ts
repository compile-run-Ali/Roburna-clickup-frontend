import { ArchivedFeedback, ArchivedProject, ArchivedTask, BoardColumn, Client, FeedbackItem, Project } from './types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchProjects(): Promise<Project[]> {
  await sleep(400);
  return [
    {
      id: 1,
      title: 'Improve Security Measures',
      description: 'Implement two-factor authentication and data encryption.',
      status: 'Active',
      progressPercent: 65,
      dueDate: '2025-10-13',
      tags: ['Planning'],
      priority: 'High',
      members: 4,
    },
    {
      id: 2,
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX principles.',
      status: 'Active',
      progressPercent: 45,
      dueDate: '2025-11-20',
      tags: ['Design'],
      priority: 'Medium',
      members: 6,
    },
    {
      id: 3,
      title: 'Mobile App Development',
      description: 'Develop a cross-platform mobile application for iOS and Android.',
      status: 'Active',
      progressPercent: 78,
      dueDate: '2025-12-05',
      tags: ['Development'],
      priority: 'High',
      members: 8,
    },
    {
      id: 4,
      title: 'Database Migration',
      description: 'Migrate legacy database to cloud infrastructure.',
      status: 'Active',
      progressPercent: 30,
      dueDate: '2026-01-15',
      tags: ['Planning'],
      priority: 'Medium',
      members: 3,
    },
  ];
}

export async function fetchArchive() {
  await sleep(350);
  return {
    projects: [
      {
        id: 1,
        name: 'Legacy Website Redesign',
        description: "Complete overhaul of the company's legacy website from 2015",
        dateArchived: '2025-09-15',
        teamSize: 5,
        duration: '6 months',
      },
      {
        id: 2,
        name: 'Mobile App v1.0',
        description: 'First version of the company mobile application for iOS and Android',
        dateArchived: '2025-08-22',
        teamSize: 8,
        duration: '8 months',
      },
      {
        id: 3,
        name: 'Database Migration 2024',
        description: 'Migration of legacy database to cloud infrastructure',
        dateArchived: '2025-07-30',
        teamSize: 4,
        duration: '4 months',
      },
    ] as ArchivedProject[],
    tasks: [
      { id: 101, title: 'Update documentation for API v1', project: 'Legacy Website Redesign', assignedTo: 'Alex Johnson', dateArchived: '2025-09-10', priority: 'Medium' },
      { id: 102, title: 'Remove deprecated endpoints', project: 'API Modernization', assignedTo: 'Sam Wilson', dateArchived: '2025-08-15', priority: 'High' },
      { id: 103, title: 'Archive old user accounts', project: 'User Management System', assignedTo: 'Taylor Reed', dateArchived: '2025-07-20', priority: 'Low' },
    ] as ArchivedTask[],
    feedback: [
      { id: 201, title: 'UI suggestions for dashboard', category: 'User Interface', submittedBy: 'Michael Chen', dateArchived: '2025-09-05', status: 'Implemented' },
      { id: 202, title: 'Performance improvement ideas', category: 'System Performance', submittedBy: 'Sarah Miller', dateArchived: '2025-08-18', status: 'Reviewed' },
    ] as ArchivedFeedback[],
  };
}

export async function fetchFeedback(): Promise<FeedbackItem[]> {
  await sleep(300);
  return [
    { id: 1, title: 'Dark mode implementation request for better UX', description: 'Our team would like to have a dark mode option for better user experience during night hours. This has been requested by', status: 'Pending', priority: 'High', category: 'Corporate Dashboard', date: 'Oct 04', timeAgo: '2 Hrs', assignee: 'Lars, BigRex', resolved: false },
    { id: 2, title: 'Critical Server Error', description: 'Users are unable to complete purchases due to a payment gateway error that started appearing this morning. Multiple customers have reported failed transactions and money being debited without order', status: 'Escalated', priority: 'High', category: 'Corporate Dashboard', date: 'Oct 04', timeAgo: '1 Hrs', assignee: 'Lars, BigRex', resolved: false },
    { id: 3, title: 'Dark mode implementation request for better UX', description: 'Our team would like to have a dark mode option for better user experience during night hours. This has been requested by', status: 'Resolved', priority: 'High', category: 'Corporate Dashboard', date: 'Oct 04', timeAgo: '2 Hrs', assignee: 'Lars, BigRex', resolved: true },
    { id: 4, title: 'Critical payment gateway failure affecting all transactions', description: 'Users are unable to complete purchases due to a payment gateway error that started appearing this morning. Multiple customers have reported failed transactions and money being debited without order', status: 'Escalated', priority: 'High', category: 'E-commerce Platform', date: 'Oct 04', timeAgo: '2 Hrs', assignee: 'Lars, BigRex', resolved: false },
    { id: 5, title: 'UI performance optimization', description: 'The dashboard is experiencing slow load times on mobile devices, particularly during peak usage hours. Need to optimize rendering performance.', status: 'In Progress', priority: 'Medium', category: 'Mobile App', date: 'Oct 05', timeAgo: '3 Hrs', assignee: 'Alex, Sam', resolved: false },
  ];
}

export async function fetchClients(): Promise<Client[]> {
  await sleep(320);
  return [
    { id: 1, name: 'Sarah Johnson', company: 'TechCorp Inc.', status: 'Active', projects: [{ name: 'Ecommerce Platform', count: 1 }], tasks: { total: 12, escalations: 2 }, lastActivity: { time: '2 hours ago', description: 'Submitted urgent feedback' }, health: 'Critical', avatar: 'SJ' },
    { id: 2, name: 'Mike Chen', company: 'StartupXYZ', status: 'Active', projects: [{ name: 'Mobile App v2.0', count: 2 }], tasks: { total: 2, escalations: 0 }, lastActivity: { time: '3 hours ago', description: 'reviewed design mockups' }, health: 'Good', avatar: 'MJ' },
  ];
}

export async function fetchBoard(): Promise<any[]> {
  await sleep(350);
  return [
    {
      id: 'TES-4',
      title: 'Import your data',
      description: 'Set up data import from your existing tools and systems. This includes configuring API connections, mapping data fields, and ensuring data integrity during the migration process.',
      status: 'In Progress',
      priority: 'High',
      assignee: 'John Doe',
      dueDate: 'Oct 17',
      taskNumber: 4,
      completed: false,
    },
    {
      id: 'TES-1',
      title: 'Get familiar with Linear',
      description: 'Learn the basics of Linear project management. Explore the interface, understand key features, and set up your workspace preferences.',
      status: 'To Do',
      priority: 'Medium',
      assignee: 'Jane Smith',
      dueDate: 'Oct 17',
      taskNumber: 1,
      completed: false,
    },
    {
      id: 'TES-2',
      title: 'Set up your teams',
      description: 'Create and configure your team structure. Add team members, assign roles and permissions, and establish communication channels.',
      status: 'To Do',
      priority: 'High',
      assignee: 'Mike Johnson',
      dueDate: 'Oct 17',
      taskNumber: 2,
      completed: false,
    },
    {
      id: 'TES-3',
      title: 'Connect your tools',
      description: 'Integrate your existing development and productivity tools with Linear. This includes GitHub, Slack, Figma, and other essential services.',
      status: 'In Review',
      priority: 'Medium',
      assignee: 'Sarah Wilson',
      dueDate: 'Oct 17',
      taskNumber: 3,
      completed: false,
    },
    {
      id: 'TES-5',
      title: 'Configure notifications',
      description: 'Set up notification preferences for team updates, task assignments, and project milestones. Customize email and in-app notification settings.',
      status: 'Completed',
      priority: 'Low',
      assignee: 'Alex Brown',
      dueDate: 'Oct 16',
      taskNumber: 5,
      completed: true,
    },
  ];
}


