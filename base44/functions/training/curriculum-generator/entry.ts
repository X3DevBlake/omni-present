/**
 * AI Curriculum Generation from Analytics
 */

import { base44 } from '@base44/sdk';

export default async function curriculumGenerator(context) {
  const { agent_id } = context.params;

  try {
    const [agent, analytics, behaviors, goals] = await Promise.all([
      base44.asServiceRole.entities.HolographicAgent.get(agent_id),
      base44.asServiceRole.entities.SimulationAnalytics.list({ simulation_id: agent.id }, '-created_date', 1),
      base44.asServiceRole.entities.EmergentBehavior.list({ agent_id }),
      base44.asServiceRole.entities.AgentGoalDynamic.list({ agent_id })
    ]);

    const curriculum = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate adaptive training curriculum for agent ${agent.name}:

Current Skills: ${agent.skills?.join(', ')}
Failed Goals: ${goals.filter(g => g.status === 'abandoned').length}
Analytics: ${JSON.stringify(analytics[0]?.agent_performance)}
Behaviors: ${behaviors.length} patterns learned

Identify skill gaps and create learning modules with adaptive difficulty.`,
      response_json_schema: {
        type: 'object',
        properties: {
          skill_gaps: { type: 'array' },
          learning_modules: { type: 'array' },
          adaptive_path: { type: 'object' }
        }
      }
    });

    const created = await base44.asServiceRole.entities.TrainingCurriculum.create({
      agent_id,
      skill_gaps_identified: curriculum.skill_gaps,
      learning_modules: curriculum.learning_modules,
      adaptive_path: curriculum.adaptive_path,
      current_difficulty: 'beginner',
      completion_rate: 0
    });

    return { success: true, curriculum_id: created.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}