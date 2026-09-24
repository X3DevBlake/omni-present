import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { time_range_hours, agent_id } = await req.json();

    const hoursAgo = time_range_hours || 24;
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    // Get interaction logs
    const interactions = await base44.entities.RealWorldInteractionLog.filter({
      ...(agent_id ? { agent_id } : {})
    }).limit(200);

    const recentInteractions = interactions.filter(i => 
      new Date(i.created_date) > new Date(cutoffDate)
    );

    // Get agent presences
    const presences = await base44.entities.AgentPhysicalPresence.filter({
      ...(agent_id ? { agent_id } : {})
    });

    // Use AI to analyze patterns
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze spatial interaction data:
      
Total interactions: ${recentInteractions.length}
Time range: ${hoursAgo} hours
Active agent presences: ${presences.length}
Interaction types: ${[...new Set(recentInteractions.map(i => i.interaction_type))].join(', ')}

Generate comprehensive analysis:
1. interaction_summary (string, natural language summary)
2. top_patterns (5 identified patterns with {pattern, frequency, significance})
3. performance_metrics ({success_rate, avg_response_time, user_satisfaction_estimate})
4. bottlenecks (3 issues with {issue, impact, location})
5. improvement_suggestions (5 actionable recommendations)`,
      response_json_schema: {
        type: "object",
        properties: {
          interaction_summary: { type: "string" },
          top_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern: { type: "string" },
                frequency: { type: "number" },
                significance: { type: "string" }
              }
            }
          },
          performance_metrics: {
            type: "object",
            properties: {
              success_rate: { type: "number" },
              avg_response_time: { type: "number" },
              user_satisfaction: { type: "number" }
            }
          },
          bottlenecks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                impact: { type: "string" },
                location: { type: "string" }
              }
            }
          },
          improvements: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Calculate statistics
    const successRate = recentInteractions.filter(i => i.interaction_success).length / Math.max(recentInteractions.length, 1);
    const interactionTypes = recentInteractions.reduce((acc, i) => {
      acc[i.interaction_type] = (acc[i.interaction_type] || 0) + 1;
      return acc;
    }, {});

    return Response.json({
      success: true,
      analysis,
      statistics: {
        total_interactions: recentInteractions.length,
        success_rate: successRate,
        interaction_type_breakdown: interactionTypes,
        active_agents: presences.length,
        time_range_hours: hoursAgo
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});