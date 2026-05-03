export interface TeamMember {
  id: string;
  email: string;
  password?: string; // Optional for security when passing around
  name: string;
  role: string;
  bio: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "yassin",
    email: "yassin@mas.ai",
    password: "Yassin@4289",
    name: "Yassin Gaml",
    role: "Ai Specialist & Developer",
    bio: "The developer of the dashboard, Sarie, and everything technical."
  },
  {
    id: "dina",
    email: "dina@mas.ai",
    password: "Dina@1984",
    name: "Dina Amer",
    role: "CEO & Podcaster",
    bio: "The podcaster of Rasayel podcast and CEO."
  },
  {
    id: "haitham",
    email: "haitham@mas.ai",
    password: "Haitham@5678",
    name: "Haitham Abdel-aziz",
    role: "Director & Head of Production",
    bio: "The video director and post-production specialist."
  },
  {
    id: "shahd",
    email: "shahd@mas.ai",
    password: "Shahd@9123",
    name: "Shahd Sayed",
    role: "Ugc Creator",
    bio: "UGC content creator."
  },
  {
    id: "sara",
    email: "sara@mas.ai",
    password: "Sara@1234",
    name: "Sara Hatem",
    role: "Marketing Manager & Creative Lead",
    bio: "Leads creative direction, content strategy, and production across all clients. Manages the full content cycle from planning to script development. Supervises content and moderation teams, and handles new client onboarding and marketing strategies."
  },
  {
    id: "shahdm",
    email: "shahdm@mas.ai",
    password: "Shahdm@9012",
    name: "Shahd Mahmoud",
    role: "Content Creator & Community Manager",
    bio: "Handles content, monthly plans, trends, and market research."
  },
  {
    id: "yousef",
    email: "yousef@mas.ai",
    password: "Yousef@3456",
    name: "Yousef Hatem",
    role: "Ai Artist",
    bio: "Generates videos with AI."
  }
];

export function authenticateUser(email: string, password: string): Omit<TeamMember, 'password'> | null {
  const user = TEAM_MEMBERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
