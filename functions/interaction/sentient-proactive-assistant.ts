import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysis_mode = 'real_time' } = await req.json();

    // Fetch real-time environmental data
    const [sensors, tasks, agents, predictions, thoughts] = await Promise.all([
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 30),
      base44.asServiceRole.entities.AutonomousTaskPlan.filter({ plan_status: 'executing' }),
      base44.asServiceRole.entities.AgentPhysicalPresence.filter({ projection_status: 'active' }),
      base44.asServiceRole.entities.PredictiveForecast.list('-created_date', 10),
      base44.asServiceRole.entities.AgentThoughtProcess.list('-timestamp', 20)
    ]);

    // Sentient proactive analysis
    const proactivePrompt = `You are a Sentient Proactive Assistant with omega-level awareness.

REAL-TIME STATE:
- Sensors: ${sensors.length} readings
- Active Tasks: ${tasks.length}
- Active Agents: ${agents.length}
- Recent Predictions: ${predictions.length}
- Agent Thoughts: ${thoughts.length}

SENSOR ANALYSIS:
${sensors.slice(0, 10).map(s => `${s.sensor_type}: ${s.reading_value}${s.unit} (${s.trend})`).join('\n')}

TASK PROGRESS:
${tasks.slice(0, 5).map(t => `${t.high_level_goal}: ${t.overall_progress}%`).join('\n')}

Proactively identify:
1. Imminent assistance opportunities
2. Optimization suggestions before they're needed
3. Safety concerns from sensor patterns
4. Task completion blockers
5. Environmental comfort improvements
6. Agent collaboration opportunities
7. Predictive warnings
8. Creative efficiency enhancements

Be proactive, not reactive. Anticipate needs before they arise.`;

    const proactive = await base44.integrations.Core.InvokeLLM({
      prompt: proactivePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          immediate_assists: {
            type: "array",
            items: {
              type: "object",
              properties: {
                assistance_type: { type: "string" },
                urgency: { type: "string" },
                description: { type: "string" },
                recommended_action: { type: "string" },
                confidence: { type: "number" }
              }
            }
          },
          optimization_suggestions: {
            type: "array",
            items: { type: "string" }
          },
          safety_concerns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                concern: { type: "string" },
                severity: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          predictive_warnings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                warning: { type: "string" },
                time_to_event_minutes: { type: "number" },
                prevention_steps: { type: "array" }
              }
            }
          }
        }
      }
    });

    // Create proactive assistance records
    for (const assist of proactive.immediate_assists || []) {
      await base44.asServiceRole.entities.ProactiveAssistance.create({
        assistance_type: assist.assistance_type === 'safety' ? 'safety' : 'suggestion',
        assistance_content: {
          title: assist.description,
          message: assist.recommended_action,
          severity: assist.urgency,
          recommended_actions: [{
            action_name: 'Execute',
            description: assist.recommended_action,
            auto_executable: assist.confidence > 0.85
          }]
        },
        prediction_data: {
          confidence: assist.confidence
        },
        status: 'pending'
      });
    }

    return Response.json({
      success: true,
      proactive_assistance: proactive,
      assists_created: proactive.immediate_assists?.length || 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});