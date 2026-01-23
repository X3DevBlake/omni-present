import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'generate_suggestions') {
      const { current_config } = await req.json();

      // Get successful templates for analysis
      const successfulTemplates = await base44.entities.AgentBehaviorTemplate.filter({});
      const topTemplates = successfulTemplates
        .filter(t => (t.usage_stats?.user_satisfaction_avg || 0) > 4)
        .slice(0, 10);

      // AI analysis of successful patterns
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze ${topTemplates.length} successful agent behavior templates. Current config: proactiveness=${current_config.proactiveness}, creativity=${current_config.creativity}, empathy=${current_config.empathy}. Generate 5 specific suggestions to improve agent effectiveness with expected impact scores and implementation difficulty.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  recommendation: { type: 'string' },
                  expected_impact: { type: 'number' },
                  implementation_difficulty: { type: 'string' },
                  based_on_templates: { type: 'integer' }
                }
              }
            }
          }
        }
      });

      return Response.json({
        success: true,
        suggestions: suggestions.suggestions,
        analyzed_templates: topTemplates.length
      });
    }

    if (action === 'fork_template') {
      const { template_id, new_name } = await req.json();

      const templates = await base44.entities.AgentBehaviorTemplate.filter({ template_id });
      const originalTemplate = templates[0];

      if (!originalTemplate) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      const forkedTemplate = await base44.entities.AgentBehaviorTemplate.create({
        template_name: new_name || `${originalTemplate.template_name} (Fork)`,
        creator_id: user.id,
        personality_archetype: originalTemplate.personality_archetype,
        behavioral_traits: originalTemplate.behavioral_traits,
        communication_config: originalTemplate.communication_config,
        ethical_guidelines: originalTemplate.ethical_guidelines,
        training_curriculum: originalTemplate.training_curriculum,
        usage_stats: { times_applied: 0, user_satisfaction_avg: 0 },
        is_public: false
      });

      // Create version record
      await base44.entities.BehaviorTemplateVersion.create({
        template_id: forkedTemplate.template_id,
        version_number: '1.0.0',
        forked_from: template_id,
        changes: {
          modified_traits: [],
          added_guidelines: [],
          removed_guidelines: []
        },
        ai_diff_summary: `Forked from ${originalTemplate.template_name}`,
        snapshot_data: forkedTemplate
      });

      return Response.json({
        success: true,
        forked_template: forkedTemplate,
        message: 'Template forked successfully'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});