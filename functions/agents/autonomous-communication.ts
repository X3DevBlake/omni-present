import { base44 } from '@/api/base44Client';

export async function enableAutonomousCommunication(collaborationId, enabled = true) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  if (enabled) {
    // Start autonomous communication loop
    await initiateAgentConversation(collaborationId);
  }

  return { autonomous_enabled: enabled };
}

async function initiateAgentConversation(collaborationId) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return;

  const agents = collab[0].participating_agents || [];
  const objective = collab[0].task_objective;

  // Each agent contributes insights
  for (let i = 0; i < agents.length; i++) {
    const agentId = agents[i];
    const otherAgent = agents[(i + 1) % agents.length];

    const message = await generateAgentMessage(agentId, objective, collab[0].shared_memory);

    await base44.entities.AgentCommunication.create({
      collaboration_id: collaborationId,
      sender_agent_id: agentId,
      recipient_agent_id: otherAgent,
      message_type: 'text',
      content: { text: message, context: 'autonomous' },
      priority: 'medium',
      timestamp: new Date().toISOString()
    });
  }
}

async function generateAgentMessage(agentId, objective, sharedMemory) {
  const message = await base44.integrations.Core.InvokeLLM({
    prompt: `As agent ${agentId} working on "${objective}", contribute your analysis. Consider shared knowledge: ${JSON.stringify(sharedMemory)}. Be concise and insightful.`
  });

  return message;
}

export async function communicateDataToUser(agentId, userEmail, dataType, data) {
  // Agent autonomously communicates important information to user
  const message = await base44.integrations.Core.InvokeLLM({
    prompt: `Format this ${dataType} data for user notification: ${JSON.stringify(data)}. Be clear and actionable.`
  });

  // Send via notification system
  await base44.integrations.Core.SendEmail({
    to: userEmail,
    subject: `Agent Update: ${dataType}`,
    body: message
  });

  return { sent: true, message };
}

export async function autonomousInformationSharing(collaborationId, information) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  // Update shared memory
  const sharedMem = collab[0].shared_memory || {};
  const key = `info_${Date.now()}`;
  sharedMem[key] = {
    content: information,
    timestamp: new Date().toISOString(),
    shared_by: 'system'
  };

  await base44.entities.AgentCollaboration.update(collab[0].id, {
    shared_memory: sharedMem
  });

  // Broadcast to all agents
  for (const agentId of collab[0].participating_agents || []) {
    await base44.entities.AgentCommunication.create({
      collaboration_id: collaborationId,
      sender_agent_id: 'SYSTEM',
      recipient_agent_id: agentId,
      message_type: 'data',
      content: { type: 'shared_knowledge', data: information },
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  }

  return { shared: true };
}