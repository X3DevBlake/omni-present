import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hub_context, user_engagement_data = {} } = await req.json();

    // Fetch visualization intelligence
    const viz = await base44.asServiceRole.entities.SentientVisualization.filter({ hub_context });

    // Autonomous evolution analysis
    const evolutionPrompt = `You are an Autonomous Visualization Evolution AI.

HUB: ${hub_context}
CURRENT CONFIG: ${JSON.stringify(viz[0] || {})}
USER ENGAGEMENT: ${JSON.stringify(user_engagement_data)}

AUTONOMOUSLY REDESIGN the visualization:
1. Propose new layouts for better insight discovery
2. Suggest alternative data representations
3. Redesign color schemes for emotional impact
4. Optimize information hierarchy
5. Add proactive elements
6. Enhance immersion factors
7. Improve interaction patterns
8. Create emergent design innovations

Be bold and creative. Evolve the interface.`;

    const evolution = await base44.integrations.Core.InvokeLLM({
      prompt: evolutionPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          redesigned_layout: {
            type: "object",
            properties: {
              structure: { type: "string" },
              focal_points: { type: "array" },
              information_flow: { type: "string" }
            }
          },
          new_representations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                data_type: { type: "string" },
                old_viz: { type: "string" },
                new_viz: { type: "string" },
                benefit: { type: "string" }
              }
            }
          },
          evolved_color_scheme: {
            type: "object",
            properties: {
              palette: { type: "array", items: { type: "string" } },
              psychological_impact: { type: "string" }
            }
          },
          proactive_elements: {
            type: "array",
            items: { type: "string" }
          },
          immersion_enhancements: {
            type: "array",
            items: { type: "string" }
          },
          innovation_score: { type: "number" }
        }
      }
    });

    // Update visualization with evolution
    if (viz.length > 0) {
      await base44.asServiceRole.entities.SentientVisualization.update(viz[0].id, {
        adaptive_rendering: {
          ...viz[0].adaptive_rendering,
          complexity_auto_adjustment: true,
          emotional_color_mapping: true
        },
        real_time_evolution: {
          auto_layout_adjustment: true,
          dynamic_detail_level: 'ultra',
          predictive_rendering: true
        },
        data_storytelling: {
          narrative_generation: true,
          insight_highlighting: evolution.proactive_elements || [],
          causality_visualization: true
        }
      });
    }

    return Response.json({
      success: true,
      evolution,
      hub_context
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});