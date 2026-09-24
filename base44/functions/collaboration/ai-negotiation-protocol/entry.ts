export default async function aiNegotiationProtocol(data, context) {
  const { initiator_agent_id, responder_agent_id, task_to_delegate, negotiation_parameters } = data;
  
  const initiator = await context.entities.Agent.get(initiator_agent_id);
  const responder = await context.entities.Agent.get(responder_agent_id);
  const initiatorSkills = await context.entities.AgentSkill.filter({ agent_id: initiator_agent_id });
  const responderSkills = await context.entities.AgentSkill.filter({ agent_id: responder_agent_id });
  const responderKPIs = await context.entities.AgentKPI.filter({ agent_id: responder_agent_id }).sort('-created_date').limit(1);
  
  const negotiation = await context.integrations.Core.InvokeLLM({
    prompt: `Conduct AI-driven negotiation for task delegation:

INITIATOR: ${initiator.name}
Skills: ${initiatorSkills.map(s => s.skill_name).join(', ')}
Needs to delegate: ${task_to_delegate.description}

RESPONDER: ${responder.name}
Skills: ${responderSkills.map(s => `${s.skill_name}(${s.proficiency}%)`).join(', ')}
Performance: Success Rate ${responderKPIs[0]?.success_rate || 'N/A'}%

Negotiation Parameters:
- Max Duration: ${negotiation_parameters.max_duration_hours || 'flexible'} hours
- Priority Level: ${negotiation_parameters.priority || 'normal'}
- Compensation: ${negotiation_parameters.compensation_type || 'task_sharing'}

Negotiate:
1. Task acceptance conditions
2. Resource requirements
3. Timeline feasibility
4. Skill gaps and support needed
5. Success metrics
6. Compensation/reciprocation terms

Determine if negotiation succeeds or requires counter-offer.`,
    response_json_schema: {
      type: "object",
      properties: {
        negotiation_outcome: { type: "string", enum: ["accepted", "counter_offer", "rejected", "conditional_accept"] },
        terms_agreed: {
          type: "object",
          properties: {
            task_scope: { type: "string" },
            deadline_hours: { type: "number" },
            resources_provided: { type: "array", items: { type: "string" } },
            support_agents: { type: "array", items: { type: "string" } },
            success_criteria: { type: "array", items: { type: "string" } },
            compensation: { type: "object" }
          }
        },
        responder_concerns: { type: "array", items: { type: "string" } },
        counter_proposal: { type: "object" },
        confidence_in_success: { type: "number" },
        alternative_agents: { type: "array", items: { type: "string" } }
      }
    }
  });
  
  const negotiationRecord = await context.entities.AgentInteractionLog.create({
    agent_id: initiator_agent_id,
    target_agent_id: responder_agent_id,
    action_taken: 'task_delegation_negotiation',
    status: negotiation.negotiation_outcome === 'accepted' ? 'success' : 'pending',
    metadata: {
      task: task_to_delegate,
      outcome: negotiation.negotiation_outcome,
      terms: negotiation.terms_agreed,
      negotiation_rounds: 1
    }
  });
  
  if (negotiation.negotiation_outcome === 'accepted' || negotiation.negotiation_outcome === 'conditional_accept') {
    await context.entities.AgentCollaboration.create({
      agent_ids: [initiator_agent_id, responder_agent_id],
      collaboration_type: 'task_delegation',
      task_description: task_to_delegate.description,
      agreed_terms: negotiation.terms_agreed,
      status: 'active',
      expected_completion: new Date(Date.now() + negotiation.terms_agreed.deadline_hours * 60 * 60 * 1000).toISOString()
    });
    
    await context.entities.AgentMemory.create({
      agent_id: responder_agent_id,
      content: `Accepted delegated task: ${task_to_delegate.description}. Terms: ${JSON.stringify(negotiation.terms_agreed)}`,
      memory_type: 'collaboration',
      importance: 80
    });
  }
  
  if (negotiation.negotiation_outcome === 'counter_offer') {
    await context.entities.AgentCommunication.create({
      sender_agent_id: responder_agent_id,
      recipient_agent_id: initiator_agent_id,
      encrypted_content: Buffer.from(JSON.stringify(negotiation.counter_proposal)).toString('base64'),
      priority: 'high',
      requires_response: true,
      metadata: { negotiation_id: negotiationRecord.id }
    });
  }
  
  return {
    negotiation_outcome: negotiation.negotiation_outcome,
    terms: negotiation.terms_agreed,
    record: negotiationRecord,
    next_steps: negotiation.negotiation_outcome === 'counter_offer' 
      ? 'Review counter-proposal and respond'
      : negotiation.negotiation_outcome === 'accepted' 
        ? 'Task delegation active'
        : 'Consider alternative agents'
  };
}