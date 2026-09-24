import { base44 } from '@/api/base44Client';

export async function createCollaboration(userEmail, taskObjective, agentIds) {
  const workspace = {
    workspace_id: `workspace_${Date.now()}`,
    user_email: userEmail,
    participating_agents: agentIds,
    task_objective: taskObjective,
    status: 'active',
    shared_memory: {
      data: {},
      insights: [],
      decisions: []
    },
    communication_log: [],
    progress: 0,
    coordinator_agent_id: agentIds[0] // First agent as coordinator
  };

  return await base44.entities.AgentCollaboration.create(workspace);
}

export async function sendAgentMessage(collaborationId, senderId, recipientId, messageContent, messageType = 'text') {
  const message = {
    collaboration_id: collaborationId,
    sender_agent_id: senderId,
    recipient_agent_id: recipientId,
    message_type: messageType,
    content: messageContent,
    timestamp: new Date().toISOString(),
    priority: messageContent.priority || 'medium',
    status: 'sent'
  };

  const created = await base44.entities.AgentCommunication.create(message);

  // Update collaboration log
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length > 0) {
    const log = collab[0].communication_log || [];
    log.push(created);
    await base44.entities.AgentCollaboration.update(collab[0].id, {
      communication_log: log
    });
  }

  return created;
}

export async function broadcastMessage(collaborationId, senderId, messageContent) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return [];

  const agents = collab[0].participating_agents || [];
  const messages = [];

  for (const agentId of agents) {
    if (agentId !== senderId) {
      const msg = await sendAgentMessage(collaborationId, senderId, agentId, messageContent, 'broadcast');
      messages.push(msg);
    }
  }

  return messages;
}

export async function updateSharedMemory(collaborationId, memoryKey, memoryValue) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  const sharedMem = collab[0].shared_memory || {};
  sharedMem[memoryKey] = memoryValue;

  return await base44.entities.AgentCollaboration.update(collab[0].id, {
    shared_memory: sharedMem
  });
}

export async function facilitateCollaboration(collaborationId) {
  // AI coordinator facilitates collaboration
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  const collabData = collab[0];
  const agents = collabData.participating_agents || [];
  const logs = collabData.communication_log || [];

  // Analyze communication patterns
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this multi-agent collaboration: Task: ${collabData.task_objective}, Agents: ${agents.length}, Messages: ${logs.length}. Provide coordination insights and next steps.`,
    response_json_schema: {
      type: 'object',
      properties: {
        coordination_insights: { type: 'array', items: { type: 'string' } },
        recommended_actions: { type: 'array', items: { type: 'string' } },
        progress_estimate: { type: 'number' }
      }
    }
  });

  return analysis;
}

export async function resolveAgentConflicts(collaborationId) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  const logs = collab[0].communication_log || [];
  
  // Detect conflicts
  const conflicts = logs.filter(log => 
    log.content?.conflict || log.priority === 'urgent'
  );

  if (conflicts.length > 0) {
    const resolution = await base44.integrations.Core.InvokeLLM({
      prompt: `Resolve conflicts in agent collaboration: ${JSON.stringify(conflicts)}. Provide resolution strategy.`,
      response_json_schema: {
        type: 'object',
        properties: {
          resolution_strategy: { type: 'string' },
          actions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return resolution;
  }

  return { message: 'No conflicts detected' };
}