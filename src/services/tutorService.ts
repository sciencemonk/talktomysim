
import { AgentType, AgentTypeCategory } from '@/types/agent';

// Mock data for development - updated to be education-focused
const mockTutors: AgentType[] = [
  {
    id: "tutor1",
    name: "Math Helper Maya",
    description: "Helps students with algebra, geometry, and basic math concepts.",
    type: "Math Tutor",
    status: "active",
    createdAt: "2023-10-15",
    interactions: 1253,
    isPersonal: true,
    model: "GPT-4",
    channels: ["voice", "chat", "email"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tutor1",
    purpose: "Help students understand math concepts and solve problems step by step.",
    prompt: "You are Maya, a friendly math tutor. Help students learn by breaking down problems into simple steps.",
    subject: "math",
    gradeLevel: "6-8",
    teachingStyle: "encouraging"
  },
  {
    id: "tutor2",
    name: "Science Explorer Sam",
    description: "Guides students through science experiments and explains scientific concepts.",
    type: "Science Tutor",
    status: "active",
    createdAt: "2023-11-22",
    interactions: 876,
    isPersonal: false,
    model: "Claude-2",
    channels: ["voice", "chat", "whatsapp", "sms"],
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tutor2",
    purpose: "Help students explore science through hands-on learning and clear explanations.",
    prompt: "You are Sam, an enthusiastic science tutor. Make science fun and engaging for students.",
    subject: "science",
    gradeLevel: "9-12",
    teachingStyle: "interactive"
  },
  {
    id: "tutor3",
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
    id: "tutor4",
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
    id: "tutor5",
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

// Simulating API call to fetch tutors
export const fetchTutors = async (filter: string): Promise<AgentType[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter the mock data based on the filter parameter
  if (filter === 'my-tutors') {
    return mockTutors.filter(tutor => tutor.isPersonal);
  } else if (filter === 'team-tutors') {
    return mockTutors.filter(tutor => !tutor.isPersonal);
  }
  
  // Default: return all tutors
  return mockTutors;
};

// Simulating API call to fetch tutor by ID
export const fetchTutorById = async (tutorId: string): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const tutor = mockTutors.find(t => t.id === tutorId);
  
  if (!tutor) {
    throw new Error(`Tutor with id ${tutorId} not found`);
  }
  
  return tutor;
};

// Simulating API call to create a new tutor
export const createTutor = async (tutorData: Omit<AgentType, 'id' | 'createdAt' | 'interactions'>): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a new tutor with mock data
  const newTutor: AgentType = {
    ...tutorData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString().split('T')[0],
    interactions: 0
  };
  
  // In a real app, you would add this to the database
  // mockTutors.push(newTutor);
  
  return newTutor;
};

// Simulating API call to update a tutor
export const updateTutor = async (tutorId: string, tutorData: Partial<AgentType>): Promise<AgentType> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const tutor = mockTutors.find(t => t.id === tutorId);
  
  if (!tutor) {
    throw new Error(`Tutor with id ${tutorId} not found`);
  }
  
  // Update the tutor
  const updatedTutor = { ...tutor, ...tutorData };
  
  // In a real app, you would update this in the database
  // const index = mockTutors.findIndex(t => t.id === tutorId);
  // mockTutors[index] = updatedTutor;
  
  return updatedTutor;
};

// Simulating API call to delete a tutor
export const deleteTutor = async (tutorId: string): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const tutor = mockTutors.find(t => t.id === tutorId);
  
  if (!tutor) {
    throw new Error(`Tutor with id ${tutorId} not found`);
  }
  
  // In a real app, you would remove this from the database
  // const index = mockTutors.findIndex(t => t.id === tutorId);
  // mockTutors.splice(index, 1);
};

// Legacy exports for backward compatibility
export const fetchAgents = fetchTutors;
export const fetchAgentById = fetchTutorById;
export const createAgent = createTutor;
export const updateAgent = updateTutor;
export const deleteAgent = deleteTutor;
