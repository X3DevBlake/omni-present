import { base44 } from '@/api/base44Client';

export default async function agentCollaboration(req) {
  const { primaryAgentId, collaboratingAgentIds, userId, taskType } = req.body;

  try {
    // Fetch all collaborating agents' knowledge and capabilities
    const collaboratingAgents = await Promise.all(
      collaboratingAgentIds.map(id =>
        base44.entities.Agent.filter({ id })
          .then(agents => agents[0])
      )
    );

    // Fetch agent skills and knowledge
    const agentKnowledge = await Promise.all(
      collaboratingAgentIds.map(id =>
        base44.entities.AgentKnowledge.filter({ agent_id: id }).catch(() => [])
      )
    );

    // Generate collaboration strategy using AI
    const collaborationPrompt = `
      Task Type: ${taskType}
      Primary Agent: Agent #${primaryAgentId}
      Collaborating Agents: ${collaboratingAgentIds.length} agents
      
      Agent Knowledge:
      ${agentKnowledge.map((k, idx) => `Agent ${collaboratingAgentIds[idx]}: ${k.map(item => item.content).join(', ')}`).join('\n')}
      
      Generate a safe collaboration strategy that:
      1. Assigns specific responsibilities to each agent
      2. Defines clear task delegation rules
      3. Ensures knowledge sharing without security risks
      4. Provides conflict resolution mechanisms
      5. Specifies output validation checkpoints
      
      Format as JSON with keys: responsibilities, delegationRules, knowledgeSharing, conflictResolution, validationCheckpoints
    `;

    const strategy = await base44.integrations.Core.InvokeLLM({
      prompt: collaborationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          responsibilities: { type: 'object' },
          delegationRules: { type: 'array', items: { type: 'string' } },
          knowledgeSharing: { type: 'array', items: { type: 'string' } },
          conflictResolution: { type: 'array', items: { type: 'string' } },
          validationCheckpoints: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Create shared knowledge repository
    const sharedKnowledge = await base44.entities.SharedKnowledge.create({
      agents: [primaryAgentId, ...collaboratingAgentIds],
      collaboration_strategy: JSON.stringify(strategy),
      task_type: taskType,
      created_by: userId,
      status: 'active'
    });

    return {
      success: true,
      collaborationId: sharedKnowledge.id,
      strategy,
      message: 'Agent collaboration established'
    };
  } catch (error) {
    console.error('Agent collaboration error:', error);
    throw error;
  }
}