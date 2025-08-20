
import { AgentType } from "@/types/agent";
import { UserAdvisor } from "@/services/userAdvisorService";

export const convertAgentToUserAdvisor = (agent: AgentType): UserAdvisor => {
  return {
    id: agent.id,
    user_id: '', // This will be set by the service
    advisor_id: agent.id,
    name: agent.name,
    title: agent.type, // Use type as title since AgentType doesn't have title
    description: agent.description,
    prompt: agent.prompt || `You are ${agent.name}, a ${agent.type}. Help the user with their questions.`,
    avatar_url: agent.avatar,
    category: agent.type,
    background_content: undefined,
    knowledge_summary: undefined,
    created_at: agent.createdAt,
    updated_at: agent.updatedAt || agent.createdAt
  };
};
