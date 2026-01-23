import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_framework') {
      const { framework_name, principles, forbidden_actions } = await req.json();

      // AI enhancement of framework
      const aiEnhancement = await base44.integrations.Core.InvokeLLM({
        prompt: `Ethical framework: ${framework_name}. Principles: ${principles.map(p => p.name).join(', ')}. Generate detailed decision guidelines for 5 common scenarios, suggest bias mitigation strategies, and create a conflict resolution hierarchy.`,
        response_json_schema: {
          type: 'object',
          properties: {
            decision_guidelines: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  scenario_type: { type: 'string' },
                  guideline: { type: 'string' },
                  example_application: { type: 'string' }
                }
              }
            },
            bias_mitigation: {
              type: 'object',
              properties: {
                monitored_biases: { type: 'array', items: { type: 'string' } },
                correction_strategies: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      });

      const framework = await base44.entities.EthicalFramework.create({
        creator_id: user.id,
        framework_name: framework_name,
        core_principles: principles.map(p => ({
          principle_name: p.name,
          description: `Core principle: ${p.name}`,
          priority_level: p.priority,
          non_negotiable: p.nonNegotiable || false
        })),
        decision_guidelines: aiEnhancement.decision_guidelines,
        conflict_resolution_rules: {
          approach: 'principle_priority',
          hierarchy: principles.sort((a, b) => a.priority - b.priority).map(p => p.name),
          human_oversight_required: true
        },
        transparency_requirements: {
          explain_decisions: true,
          log_ethical_deliberations: true,
          user_notification_threshold: 0.7
        },
        forbidden_actions: forbidden_actions || [],
        bias_mitigation: {
          enabled: true,
          monitored_biases: aiEnhancement.bias_mitigation.monitored_biases,
          correction_strategies: aiEnhancement.bias_mitigation.correction_strategies
        },
        applied_to_agents: [],
        effectiveness_metrics: {
          ethical_violations: 0,
          user_trust_score: 1.0,
          alignment_score: 1.0
        },
        is_public: false
      });

      return Response.json({
        success: true,
        framework: framework,
        ai_enhancements: {
          guidelines_count: aiEnhancement.decision_guidelines.length,
          bias_strategies: aiEnhancement.bias_mitigation.correction_strategies.length
        }
      });
    }

    if (action === 'apply_to_agent') {
      const { framework_id, agent_id } = await req.json();

      const frameworks = await base44.entities.EthicalFramework.filter({ framework_id });
      const framework = frameworks[0];

      if (!framework) {
        return Response.json({ error: 'Framework not found' }, { status: 404 });
      }

      await base44.entities.EthicalFramework.update(framework.id, {
        applied_to_agents: [...(framework.applied_to_agents || []), agent_id]
      });

      return Response.json({
        success: true,
        message: 'Framework applied to agent'
      });
    }

    if (action === 'get_frameworks') {
      const frameworks = await base44.entities.EthicalFramework.filter({ 
        creator_id: user.id 
      });

      return Response.json({
        success: true,
        frameworks: frameworks
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});