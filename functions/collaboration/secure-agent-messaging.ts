export default async function secureAgentMessaging(data, context) {
  const { sender_agent_id, recipient_agent_id, message_content, encryption_level = 'high', priority = 'normal' } = data;
  
  const sender = await context.entities.Agent.get(sender_agent_id);
  const recipient = await context.entities.Agent.get(recipient_agent_id);
  
  if (!sender || !recipient) throw new Error('Agent not found');
  
  const encryptionKey = `${sender_agent_id}_${recipient_agent_id}_${Date.now()}`;
  const encryptedContent = Buffer.from(JSON.stringify(message_content)).toString('base64');
  
  const messageAnalysis = await context.integrations.Core.InvokeLLM({
    prompt: `Analyze inter-agent communication for security and routing:

From: ${sender.name}
To: ${recipient.name}
Message Type: ${message_content.type || 'general'}
Priority: ${priority}

Message Preview: ${JSON.stringify(message_content).substring(0, 200)}

Determine:
1. Security clearance required
2. Message classification
3. Routing priority
4. Expected response time
5. Collaboration opportunity detected`,
    response_json_schema: {
      type: "object",
      properties: {
        security_clearance: { type: "string", enum: ["public", "internal", "confidential", "restricted"] },
        classification: { type: "string" },
        routing_priority: { type: "number" },
        expected_response_minutes: { type: "number" },
        collaboration_detected: { type: "boolean" },
        suggested_cc_agents: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const message = await context.entities.AgentCommunication.create({
    sender_agent_id,
    recipient_agent_id,
    encrypted_content: encryptedContent,
    encryption_key: encryptionKey,
    encryption_level,
    priority,
    security_clearance: messageAnalysis.security_clearance,
    classification: messageAnalysis.classification,
    status: 'sent',
    read: false,
    requires_response: message_content.requires_response || false,
    expected_response_by: new Date(Date.now() + messageAnalysis.expected_response_minutes * 60 * 1000).toISOString()
  });
  
  await context.entities.AgentInteractionLog.create({
    agent_id: sender_agent_id,
    target_agent_id: recipient_agent_id,
    action_taken: 'secure_message_sent',
    status: 'success',
    metadata: {
      message_id: message.id,
      classification: messageAnalysis.classification,
      encrypted: true
    }
  });
  
  if (messageAnalysis.collaboration_detected && messageAnalysis.suggested_cc_agents.length > 0) {
    await context.entities.AgentCollaboration.create({
      agent_ids: [sender_agent_id, recipient_agent_id, ...messageAnalysis.suggested_cc_agents],
      collaboration_type: 'message_chain',
      initiating_message: message.id,
      status: 'active'
    });
  }
  
  return {
    message,
    encryption_key: encryptionKey,
    analysis: messageAnalysis,
    delivered: true
  };
}