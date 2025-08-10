
import { AgentType, AgentTypeCategory } from '@/types/agent';

// Mock data for development - updated to be education-focused
const mockAgents: AgentType[] = [
  {
    id: "1",
    name: "Math Helper Maya",
    description: "Helps students with algebra, geometry, and basic math concepts.",
    type: "Math Tutor",
    status: "active",
    createdAt: "2023-10-15",
    interactions: 1253,
    isPersonal: true,
    model: "GPT-4",
    channels: ["voice", "chat", "email"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=1",
    purpose: "Help students understand math concepts and solve problems step by step.",
    prompt: "You are Maya, a friendly math tutor. Help students learn by breaking down problems into simple steps.",
    subject: "math",
    gradeLevel: "6-8",
    teachingStyle: "encouraging"
  },
  {
    id: "2",
    name: "Science Explorer Sam",
    description: "Guides students through science experiments and explains scientific concepts.",
    type: "Science Tutor",
    status: "active",
    createdAt: "2023-11-22",
    interactions: 876,
    isPersonal: false,
    model: "Claude-2",
    channels: ["voice", "chat", "whatsapp", "sms"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=2",
    purpose: "Help students explore science through hands-on learning and clear explanations.",
    prompt: "You are Sam, an enthusiastic science tutor. Make science fun and engaging for students.",
    subject: "science",
    gradeLevel: "9-12",
    teachingStyle: "interactive"
  },
  {
    id: "3",
    name: "Reading Buddy Riley",
    description: "Helps students improve reading comprehension and vocabulary.",
    type: "Reading Assistant",
    status: "inactive",
    createdAt: "2024-01-05",
    interactions: 432,
    isPersonal: true,
    model: "GPT-3.5 Turbo",
    channels: ["voice", "chat"],
    subject: "reading",
    gradeLevel: "K-5",
    teachingStyle: "patient"
  },
  {
    id: "4",
    name: "Homework Helper Alex",
    description: "Assists students with homework across multiple subjects.",
    type: "Homework Helper",
    status: "active",
    createdAt: "2024-02-10",
    interactions: 198,
    isPersonal: false,
    model: "LLama-2",
    channels: ["voice", "email", "sms"],
    subject: "other",
    gradeLevel: "6-12",
    teachingStyle: "supportive"
  },
  {
    id: "5",
    name: "Writing Coach Willow",
    description: "Helps students improve their writing skills and essay composition.",
    type: "Writing Coach",
    status: "inactive",
    createdAt: "2024-03-01",
    interactions: 52,
    isPersonal: true,
    model: "GPT-4",
    channels: ["voice"],
    subject: "english",
    gradeLevel: "9-12",
    teachingStyle: "constructive"
  }
];

// Simulating API call to fetch agents
export const fetchAgents = async (filter: string): Promise<AgentType[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter the mock data based on the filter parameter
  if (filter === 'my-agents') {
    return mockAgents.filter(agent => agent.isPersonal);
  } else if (filter === 'team-agents') {
    return mockAgents.filter(agent => !agent.isPersonal);
  }
  
  // Default: return all agents
  return mockAgents;
};

// Simulating API call to fetch agent by ID
export const fetchAgentById = async (agentId: string): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error(`Agent with id ${agentId} not found`);
  }
  
  return agent;
};

// Simulating API call to create a new agent
export const createAgent = async (agentData: Omit<AgentType, 'id' | 'createdAt' | 'interactions'>): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a new agent with mock data
  const newAgent: AgentType = {
    ...agentData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString().split('T')[0],
    interactions: 0
  };
  
  // In a real app, you would add this to the database
  // mockAgents.push(newAgent);
  
  return newAgent;
};

// Simulating API call to update an agent
export const updateAgent = async (agentId: string, agentData: Partial<AgentType>): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error(`Agent with id ${agentId} not found`);
  }
  
  // Update the agent
  const updatedAgent = { ...agent, ...agentData };
  
  // In a real app, you would update this in the database
  // const index = mockAgents.findIndex(a => a.id === agentId);
  // mockAgents[index] = updatedAgent;
  
  return updatedAgent;
};

// Simulating API call to delete an agent
export const deleteAgent = async (agentId: string): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const agent = mockAgents.find(a => a.id === agentId);
  
  if (!agent) {
    throw new Error(`Agent with id ${agentId} not found`);
  }
  
  // In a real app, you would remove this from the database
  // const index = mockAgents.findIndex(a => a.id === agentId);
  // mockAgents.splice(index, 1);
};
