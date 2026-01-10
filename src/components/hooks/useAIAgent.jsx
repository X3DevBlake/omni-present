/**
 * useAIAgent Hook
 * Manages AI agent interactions and state
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useAgent(agentId) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => base44.entities.Agent.read(agentId)
  });
}

export function useAgentPersonality(agentId) {
  return useQuery({
    queryKey: ['agentPersonality', agentId],
    queryFn: async () => {
      const result = await base44.entities.AgentPersonality.filter({
        agent_id: agentId
      });
      return result[0] || null;
    }
  });
}

export function useAgentMemory(agentId) {
  return useQuery({
    queryKey: ['agentMemory', agentId],
    queryFn: () => base44.entities.AgentMemory.filter({ agent_id: agentId })
  });
}

export function useKnowledgeGraph(agentId) {
  return useQuery({
    queryKey: ['knowledgeGraph', agentId],
    queryFn: () => base44.entities.KnowledgeGraphNode.filter({ agent_id: agentId })
  });
}

export function useAgentDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, situation, options }) => {
      const response = await fetch('/api/functions/process-agent-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, situation, options })
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agentMemory', variables.agentId] });
    }
  });
}

export function useTrainingProgress(agentId) {
  return useQuery({
    queryKey: ['trainingProgress', agentId],
    queryFn: () => base44.entities.TrainingProgress.filter({ agent_id: agentId })
  });
}