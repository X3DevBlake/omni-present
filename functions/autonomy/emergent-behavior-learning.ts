/**
 * Emergent Behavior Modeling and Learning System
 */

import { base44 } from '@base44/sdk';

export default async function emergentBehaviorLearning(context) {
  const { agent_id, event_description, event_data } = context.params;

  try {
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);

    // AI analyzes if behavior was expected
    const behaviorAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze emergent behavior for agent ${agent.name}:

Event: ${event_description}
Data: ${JSON.stringify(event_data)}
Agent personality: ${JSON.stringify(agent.personality_traits)}
Agent skills: ${agent.skills?.join(', ')}

Determine:
1. Behavior type exhibited
2. Was this expected? (yes/no)
3. Learning extracted
4. How should agent adapt?
5. Impact score (0-100)
6. Should other agents replicate this?`,
      response_json_schema: {
        type: 'object',
        properties: {
          behavior_type: { type: 'string' },
          was_expected: { type: 'boolean' },
          learning: { type: 'object' },
          adaptation: { type: 'string' },
          impact_score: { type: 'number' },
          should_replicate: { type: 'boolean' }
        }
      }
    });

    // Record emergent behavior
    const behavior = await base44.asServiceRole.entities.EmergentBehavior.create({
      agent_id,
      behavior_type: behaviorAnalysis.behavior_type,
      trigger_event: event_description,
      was_expected: behaviorAnalysis.was_expected,
      learning_applied: behaviorAnalysis.learning,
      adaptation_made: behaviorAnalysis.adaptation,
      impact_score: behaviorAnalysis.impact_score,
      replicated: false
    });

    // Update agent state with learning
    await base44.asServiceRole.entities.HolographicAgent.update(agent_id, {
      state: {
        ...agent.state,
        learned_behaviors: [
          ...(agent.state?.learned_behaviors || []),
          {
            behavior_id: behavior.id,
            learned_at: new Date().toISOString(),
            adaptation: behaviorAnalysis.adaptation
          }
        ]
      }
    });

    // If behavior should be replicated, notify other agents
    if (behaviorAnalysis.should_replicate) {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Broadcast learning to all agents: ${behaviorAnalysis.learning}`
      });
    }

    return {
      success: true,
      behavior_id: behavior.id,
      was_expected: behaviorAnalysis.was_expected,
      should_replicate: behaviorAnalysis.should_replicate
    };

  } catch (error) {
    console.error('Emergent behavior error:', error);
    return { success: false, error: error.message };
  }
}