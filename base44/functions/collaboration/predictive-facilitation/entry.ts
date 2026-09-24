import { base44 } from '@/api/base44Client';

export async function predictCollaborationOutcome(collaborationId) {
  const collab = await base44.entities.AgentCollaboration.filter({ workspace_id: collaborationId });
  if (collab.length === 0) return null;

  const communications = await base44.entities.AgentCommunication.filter({ collaboration_id: collaborationId });
  const agents = collab[0].participating_agents || [];

  const prediction = await base44.integrations.Core.InvokeLLM({
    prompt: `Predict collaboration outcome: ${agents.length} agents, ${communications.length} messages, objective: "${collab[0].task_objective}". Analyze patterns, predict success probability, bottlenecks, and optimal reassignments.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        success_probability: { type: 'number' },
        predicted_completion_time: { type: 'number' },
        bottleneck_predictions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              agent_id: { type: 'string' },
              bottleneck_type: { type: 'string' },
              severity: { type: 'number' },
              mitigation: { type: 'string' }
            }
          }
        },
        suggested_reassignments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              from_agent: { type: 'string' },
              to_agent: { type: 'string' },
              task: { type: 'string' },
              reason: { type: 'string' }
            }
          }
        },
        agent_needs_forecast: {
          type: 'array',
          items: {
            type: 'object'
          }
        }
      }
    }
  });

  const predictionRecord = await base44.entities.CollaborationPrediction.create({
    collaboration_id: collaborationId,
    user_email: collab[0].user_email,
    predicted_outcome: { completion_time: prediction.predicted_completion_time },
    success_probability: prediction.success_probability,
    bottleneck_predictions: prediction.bottleneck_predictions,
    suggested_reassignments: prediction.suggested_reassignments,
    agent_needs_forecast: prediction.agent_needs_forecast,
    confidence_score: 85,
    created_at: new Date().toISOString()
  });

  return predictionRecord;
}

export async function proactiveTaskReassignment(collaborationId) {
  const prediction = await predictCollaborationOutcome(collaborationId);
  
  if (prediction.success_probability < 70) {
    // Auto-execute reassignments
    for (const reassignment of prediction.suggested_reassignments) {
      await base44.entities.AgentCommunication.create({
        collaboration_id: collaborationId,
        sender_agent_id: 'AI_FACILITATOR',
        recipient_agent_id: reassignment.to_agent,
        message_type: 'request',
        content: {
          type: 'task_reassignment',
          task: reassignment.task,
          reason: reassignment.reason,
          priority: 'high'
        },
        priority: 'urgent'
      });
    }
  }

  return prediction;
}

export async function analyzeMultiModalCommunication(collaborationId) {
  const communications = await base44.entities.AgentCommunication.filter({ collaboration_id: collaborationId });
  
  const textMessages = communications.filter(c => c.message_type === 'text');
  const dataMessages = communications.filter(c => c.message_type === 'data');
  
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Multi-modal communication analysis: ${textMessages.length} text, ${dataMessages.length} data messages. Analyze sentiment, information flow, decision patterns, and communication effectiveness across modalities.`,
    response_json_schema: {
      type: 'object',
      properties: {
        text_sentiment: { type: 'object' },
        data_quality: { type: 'number' },
        information_density: { type: 'number' },
        communication_efficiency: { type: 'number' },
        modal_preferences: { type: 'object' },
        optimization_suggestions: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return analysis;
}