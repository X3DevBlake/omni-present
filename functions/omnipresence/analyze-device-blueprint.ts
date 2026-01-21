import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { device_id, blueprint_id, usage_data, include_optimization } = await req.json();

    // Get device and blueprint data
    let device, blueprint;
    
    if (device_id) {
      const devices = await base44.asServiceRole.entities.CrossPlatformDevice.filter({ id: device_id });
      device = devices[0];
    }
    
    if (blueprint_id) {
      const blueprints = await base44.asServiceRole.entities.DeviceBlueprintEnhanced.filter({ id: blueprint_id });
      blueprint = blueprints[0];
    }

    const analysisPrompt = `Analyze this smart device and provide comprehensive insights.

Device Info:
${JSON.stringify(device || {})}

Blueprint Data:
${JSON.stringify(blueprint || {})}

Usage Data:
${JSON.stringify(usage_data || {})}

Provide:
1. Overall device health assessment
2. Component-level health analysis
3. Performance metrics and trends
4. Maintenance recommendations
5. Energy efficiency analysis
6. Optimization suggestions for better agent interaction
7. Predicted lifespan and replacement timeline
8. Integration improvement suggestions`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          health_assessment: {
            type: "object",
            properties: {
              overall_score: { type: "number" },
              status: { type: "string" },
              critical_issues: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } }
            }
          },
          component_health: {
            type: "array",
            items: {
              type: "object",
              properties: {
                component_name: { type: "string" },
                health_score: { type: "number" },
                status: { type: "string" },
                issues: { type: "array", items: { type: "string" } },
                estimated_remaining_life_days: { type: "number" }
              }
            }
          },
          performance_analysis: {
            type: "object",
            properties: {
              response_time_rating: { type: "string" },
              reliability_rating: { type: "string" },
              efficiency_rating: { type: "string" },
              trend: { type: "string" }
            }
          },
          maintenance_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                priority: { type: "string" },
                due_date: { type: "string" },
                estimated_duration_minutes: { type: "number" },
                impact_if_delayed: { type: "string" }
              }
            }
          },
          energy_analysis: {
            type: "object",
            properties: {
              current_consumption_watts: { type: "number" },
              efficiency_score: { type: "number" },
              savings_potential_percent: { type: "number" },
              optimization_tips: { type: "array", items: { type: "string" } }
            }
          },
          agent_optimization: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                benefit: { type: "string" },
                implementation_difficulty: { type: "string" }
              }
            }
          },
          lifespan_prediction: {
            type: "object",
            properties: {
              estimated_total_lifespan_days: { type: "number" },
              remaining_lifespan_days: { type: "number" },
              factors_affecting_lifespan: { type: "array", items: { type: "string" } },
              recommended_replacement_date: { type: "string" }
            }
          }
        }
      }
    });

    // Update blueprint with analysis results if we have one
    if (blueprint_id && blueprint) {
      await base44.asServiceRole.entities.DeviceBlueprintEnhanced.update(blueprint_id, {
        performance_metrics: {
          uptime_percentage: analysis.health_assessment?.overall_score || 0,
          avg_response_time_ms: 50,
          power_efficiency_score: analysis.energy_analysis?.efficiency_score || 0,
          reliability_score: analysis.health_assessment?.overall_score || 0
        },
        maintenance_schedule: (analysis.maintenance_recommendations || []).map(mr => ({
          task_name: mr.task,
          frequency_days: 30,
          next_due: mr.due_date,
          estimated_duration_minutes: mr.estimated_duration_minutes
        }))
      });
    }

    return Response.json({
      success: true,
      device_id,
      blueprint_id,
      analysis,
      summary: {
        overall_health: analysis.health_assessment?.status,
        critical_issues_count: analysis.health_assessment?.critical_issues?.length || 0,
        maintenance_tasks_pending: analysis.maintenance_recommendations?.length || 0,
        energy_savings_potential: `${analysis.energy_analysis?.savings_potential_percent || 0}%`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});