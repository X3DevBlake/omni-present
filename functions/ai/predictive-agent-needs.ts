import { base44 } from '@/api/base44Client';

export async function predictAgentNeeds(agentId, userEmail) {
  const trainingSessions = await base44.entities.AgentTrainingSession.filter({ agent_id: agentId }).catch(() => []);
  const skills = await base44.entities.AgentSkill.filter({ agent_id: agentId }).catch(() => []);
  const memories = await base44.entities.AgentMemoryStore.filter({ agent_id: agentId }).catch(() => []);
  const trades = await base44.entities.TradeExecution.filter({ agent_id: agentId }).catch(() => []);
  const marketData = await base44.entities.MarketDataStream.filter({ user_email: userEmail }).catch(() => []);

  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze agent ${agentId} performance data: ${trainingSessions.length} training sessions, ${skills.length} skills, ${memories.length} memories, ${trades.length} trades. Market context: ${marketData.length} active streams. Predict agent needs (skill updates, training, resource allocation) with confidence scores and suggested workflows.`,
    response_json_schema: {
      type: 'object',
      properties: {
        predicted_needs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              need_type: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string' },
              rationale: { type: 'string' }
            }
          }
        },
        confidence_score: { type: 'number' },
        suggested_workflows: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              workflow_type: { type: 'string' },
              action: { type: 'string' },
              parameters: { type: 'object' }
            }
          }
        }
      }
    }
  });

  const prediction = await base44.entities.AgentNeedsPrediction.create({
    user_email: userEmail,
    agent_id: agentId,
    predicted_needs: analysis.predicted_needs,
    confidence_score: analysis.confidence_score,
    suggested_workflows: analysis.suggested_workflows,
    status: 'pending'
  });

  return prediction;
}

export async function initiateSuggestedWorkflow(predictionId, workflowIndex) {
  const prediction = await base44.entities.AgentNeedsPrediction.filter({ id: predictionId });
  if (prediction.length === 0) return null;

  const workflow = prediction[0].suggested_workflows[workflowIndex];
  
  await base44.entities.AgentNeedsPrediction.update(predictionId, { 
    status: 'in_progress',
    initiated_at: new Date().toISOString()
  });

  if (workflow.workflow_type === 'training') {
    await base44.entities.AgentTrainingSession.create({
      user_email: prediction[0].user_email,
      agent_id: prediction[0].agent_id,
      training_type: workflow.parameters.training_type || 'skill_enhancement',
      training_data: [],
      status: 'preparing'
    });
  }

  if (workflow.workflow_type === 'skill_update') {
    await base44.entities.AgentSkill.create({
      agent_id: prediction[0].agent_id,
      skill_name: workflow.parameters.skill_name,
      category: workflow.parameters.category || 'general',
      proficiency: 0
    });
  }

  return { initiated: true, workflow };
}