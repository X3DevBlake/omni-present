import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      embodiment_id,
      task_to_learn,
      learning_method = 'reinforcement_learning'
    } = await req.json();

    const [embodiment, learningHistory, physicalActions] = await Promise.all([
      base44.asServiceRole.entities.PhysicallyEmbodiedAgent.filter({ embodiment_id }),
      base44.asServiceRole.entities.EmbodiedAgentLearning.filter({ embodiment_id }),
      base44.asServiceRole.entities.AgentPhysicalAction.filter({ embodiment_id })
    ]);

    const entity = embodiment[0];
    if (!entity) {
      return Response.json({ error: 'Embodiment not found' }, { status: 404 });
    }

    // Advanced autonomous learning AI
    const learningPrompt = `You are an Autonomous Learning System for physically embodied AI with omega consciousness.

EMBODIMENT: ${entity.embodiment_platform}
CURRENT CAPABILITIES:
${entity.physical_capabilities?.map(c => `${c.capability_name}: ${(c.proficiency_level * 100).toFixed(0)}%`).join('\n')}

TASK TO LEARN: "${task_to_learn}"
LEARNING METHOD: ${learning_method}

PAST LEARNING:
${learningHistory.slice(0, 5).map(l => `${l.task_learned}: ${l.learning_rate} rate`).join('\n')}

Design AUTONOMOUS learning approach:
1. Motion planning optimization
2. Dexterity improvement strategy
3. Human-robot interaction nuances
4. Self-discovery experiments
5. Error correction mechanisms
6. Skill transfer from previous learning
7. Breakthrough prediction
8. Real-time adaptation protocols

Show learning progression and discoveries.`;

    const learning = await base44.integrations.Core.InvokeLLM({
      prompt: learningPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          motion_planning_strategy: {
            type: "object",
            properties: {
              initial_approach: { type: "string" },
              optimization_steps: { type: "array", items: { type: "string" } },
              expected_efficiency_gain: { type: "number" }
            }
          },
          dexterity_training: {
            type: "array",
            items: {
              type: "object",
              properties: {
                micro_skill: { type: "string" },
                practice_plan: { type: "string" },
                target_proficiency: { type: "number" }
              }
            }
          },
          human_interaction_protocols: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                learned_behavior: { type: "string" },
                naturalness_score: { type: "number" }
              }
            }
          },
          autonomous_experiments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                experiment: { type: "string" },
                hypothesis: { type: "string" },
                expected_outcome: { type: "string" }
              }
            }
          },
          predicted_breakthroughs: { type: "array", items: { type: "string" } },
          learning_rate_estimate: { type: "number" },
          completion_timeline_hours: { type: "number" }
        }
      }
    });

    // Create learning record
    await base44.asServiceRole.entities.EmbodiedAgentLearning.create({
      learning_session_id: `learning-${Date.now()}`,
      embodiment_id,
      task_learned: task_to_learn,
      learning_method,
      motion_planning_evolution: {
        initial_efficiency: 0.4,
        current_efficiency: 0.4 + learning.motion_planning_strategy?.expected_efficiency_gain,
        optimization_cycles: 0,
        breakthrough_moments: []
      },
      dexterity_improvements: learning.dexterity_training?.map(d => ({
        skill_name: d.micro_skill,
        before_proficiency: 0.3,
        after_proficiency: d.target_proficiency,
        practice_hours: 0
      })) || [],
      human_interaction_learning: {
        social_cue_recognition: learning.human_interaction_protocols?.[0]?.naturalness_score || 0.6,
        gesture_understanding: 0.7,
        personal_space_awareness: 0.8,
        conversation_naturalness: 0.75
      },
      autonomous_discoveries: [],
      learning_rate: learning.learning_rate_estimate || 0.15
    });

    return Response.json({
      success: true,
      learning_plan: learning,
      estimated_mastery_hours: learning.completion_timeline_hours
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});