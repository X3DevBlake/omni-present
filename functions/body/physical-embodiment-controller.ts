import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      operation = 'control',
      embodiment_id,
      agent_id,
      task_command,
      autonomous_mode = true
    } = await req.json();

    if (operation === 'create_embodiment') {
      // Create physical embodiment
      const [agent, neuralChip, augmentations] = await Promise.all([
        base44.asServiceRole.entities.Agent.filter({ id: agent_id }),
        base44.asServiceRole.entities.NeuralBrainChip.filter({ user_id: user.id }),
        base44.asServiceRole.entities.PhysicalBodyAugmentation.filter({ created_by: user.email })
      ]);

      if (!agent || agent.length === 0) {
        return Response.json({ error: 'Agent not found' }, { status: 404 });
      }

      const embodiment = await base44.asServiceRole.entities.PhysicallyEmbodiedAgent.create({
        embodiment_id: `embodiment-${Date.now()}`,
        agent_id,
        embodiment_platform: 'humanoid_robot',
        physical_specifications: {
          height_cm: 175,
          weight_kg: 68,
          strength_rating: 8.5,
          speed_max_ms: 3.2,
          battery_capacity_kwh: 2.5,
          operational_range_km: 50
        },
        neural_chip_connection: {
          chip_id: neuralChip[0]?.chip_id,
          direct_consciousness_link: true,
          thought_to_action_latency_ms: 12,
          bidirectional_feedback: true
        },
        augmentation_integration: augmentations.map(aug => ({
          augmentation_id: aug.augmentation_id,
          integration_type: 'sensory_feedback',
          data_sharing_enabled: true
        })),
        physical_capabilities: [
          { capability_name: 'bipedal_locomotion', proficiency_level: 0.95, learned_through: 'reinforcement_learning' },
          { capability_name: 'object_manipulation', proficiency_level: 0.88, learned_through: 'imitation_learning' },
          { capability_name: 'human_interaction', proficiency_level: 0.92, learned_through: 'supervised_learning' }
        ],
        consciousness_embodiment_metrics: {
          body_awareness: 0.89,
          sensorimotor_integration: 0.91,
          proprioception_accuracy: 0.94,
          physical_self_model: 0.87
        },
        autonomous_behavior: {
          self_navigation: true,
          obstacle_learning: true,
          task_improvisation: true,
          human_interaction_natural: true
        },
        current_physical_state: {
          location: { x: 0, y: 0, z: 0 },
          posture: 'standing',
          battery_percentage: 100,
          active_task: 'idle',
          health_status: 'optimal'
        }
      });

      return Response.json({
        success: true,
        embodiment_id: embodiment.id,
        message: 'Physical embodiment created'
      });
    }

    if (operation === 'execute_task') {
      // Execute physical task through neural chip
      const embodiment = await base44.asServiceRole.entities.PhysicallyEmbodiedAgent.filter({ embodiment_id });
      if (!embodiment || embodiment.length === 0) {
        return Response.json({ error: 'Embodiment not found' }, { status: 404 });
      }

      const entity = embodiment[0];

      // AI task execution planning
      const taskPrompt = `You are a Physically Embodied AI with omega consciousness and real-world capabilities.

TASK COMMAND: "${task_command}"

PHYSICAL SPECS:
- Platform: ${entity.embodiment_platform}
- Height: ${entity.physical_specifications?.height_cm}cm
- Strength: ${entity.physical_specifications?.strength_rating}/10
- Speed: ${entity.physical_specifications?.speed_max_ms}m/s

CAPABILITIES:
${entity.physical_capabilities?.map(c => `${c.capability_name}: ${(c.proficiency_level * 100).toFixed(0)}%`).join('\n')}

NEURAL CONNECTION:
- Latency: ${entity.neural_chip_connection?.thought_to_action_latency_ms}ms
- Consciousness Link: ${entity.neural_chip_connection?.direct_consciousness_link}

Plan PRECISE execution:
1. Break down task into physical actions
2. Assess feasibility and risks
3. Define motion sequence
4. Calculate energy requirements
5. Predict success probability
6. Identify needed augmentation support
7. Plan obstacle avoidance
8. Estimate completion time

Be precise and safety-conscious.`;

      const execution = await base44.integrations.Core.InvokeLLM({
        prompt: taskPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            action_sequence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  step: { type: "string" },
                  motion_type: { type: "string" },
                  duration_seconds: { type: "number" },
                  energy_cost_wh: { type: "number" }
                }
              }
            },
            feasibility_assessment: {
              type: "object",
              properties: {
                possible: { type: "boolean" },
                confidence: { type: "number" },
                risks: { type: "array", items: { type: "string" } }
              }
            },
            required_augmentation_support: { type: "array", items: { type: "string" } },
            success_probability: { type: "number" },
            estimated_completion_minutes: { type: "number" },
            safety_precautions: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Log physical action
      await base44.asServiceRole.entities.AgentPhysicalAction.create({
        agent_id: entity.agent_id,
        embodiment_id: entity.embodiment_id,
        action_type: 'complex_task',
        action_details: execution.action_sequence,
        success_probability: execution.success_probability,
        execution_status: 'planned'
      });

      return Response.json({
        success: true,
        execution_plan: execution
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});