import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_template') {
      const { template_name, personality_archetype, traits } = await req.json();

      // AI-generated training curriculum
      const curriculum = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a training curriculum for an AI agent with ${personality_archetype} personality. Include 5-7 skills with training methods and target proficiency levels.`,
        response_json_schema: {
          type: 'object',
          properties: {
            skills: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  training_method: { type: 'string' },
                  target_proficiency: { type: 'number' }
                }
              }
            },
            ethical_principles: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const template = await base44.entities.AgentBehaviorTemplate.create({
        template_name: template_name,
        creator_id: user.id,
        personality_archetype: personality_archetype,
        behavioral_traits: traits || {
          proactiveness: 0.7,
          risk_preference: 0.5,
          collaboration_style: 'cooperative',
          decision_speed: 0.8,
          learning_aggressiveness: 0.7
        },
        communication_config: {
          language_style: 'professional',
          formality_level: 0.6,
          emoji_usage: 0.3,
          explanation_depth: 'detailed'
        },
        ethical_guidelines: curriculum.ethical_principles.map((principle, idx) => ({
          principle: principle,
          priority: idx + 1,
          enforcement: 'strict'
        })),
        training_curriculum: curriculum.skills,
        usage_stats: {
          times_applied: 0,
          user_satisfaction_avg: 0
        },
        is_public: false
      });

      return Response.json({
        success: true,
        template: template,
        message: 'Behavior template created'
      });
    }

    if (action === 'apply_template') {
      const { template_id, agent_id } = await req.json();

      const templates = await base44.entities.AgentBehaviorTemplate.filter({ template_id });
      const template = templates[0];

      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      // Create custom behavior from template
      const customBehavior = await base44.entities.CustomAgentBehavior.create({
        agent_id: agent_id,
        user_id: user.id,
        behavioral_parameters: {
          proactiveness_level: template.behavioral_traits.proactiveness,
          risk_tolerance: template.behavioral_traits.risk_preference,
          creativity_factor: 0.7,
          social_engagement: 0.6,
          autonomy_level: 0.7
        },
        communication_style: {
          formality: template.communication_config.formality_level,
          verbosity: template.communication_config.explanation_depth,
          tone: template.communication_config.language_style,
          humor_frequency: 0.3,
          empathy_expression: 0.8
        },
        ethical_framework_custom: {
          core_values: template.ethical_guidelines.map(g => g.principle),
          ethical_priorities: template.ethical_guidelines.sort((a, b) => a.priority - b.priority).map(g => g.principle),
          conflict_resolution_approach: 'principled',
          transparency_level: 0.9
        },
        learning_preferences: {
          learning_rate: template.behavioral_traits.learning_aggressiveness,
          exploration_vs_exploitation: 0.6,
          knowledge_sharing_willingness: 0.9,
          autonomous_skill_acquisition: true
        },
        interaction_boundaries: {
          max_autonomy_scope: 'supervised',
          requires_approval_for: ['high_risk_actions'],
          forbidden_actions: [],
          intervention_thresholds: {}
        }
      });

      // Update template usage
      await base44.entities.AgentBehaviorTemplate.update(template.id, {
        usage_stats: {
          times_applied: (template.usage_stats?.times_applied || 0) + 1,
          user_satisfaction_avg: template.usage_stats?.user_satisfaction_avg || 0
        }
      });

      return Response.json({
        success: true,
        custom_behavior: customBehavior,
        message: 'Template applied to agent'
      });
    }

    if (action === 'get_templates') {
      const { public_only } = await req.json();

      let query = public_only ? { is_public: true } : { creator_id: user.id };
      const templates = await base44.entities.AgentBehaviorTemplate.filter(query);

      return Response.json({
        success: true,
        templates: templates
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});