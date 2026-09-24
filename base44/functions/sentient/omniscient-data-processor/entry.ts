import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      processing_mode = 'omniscient_analysis',
      time_window_hours = 24,
      auto_insights = true
    } = await req.json();

    // Fetch data from ALL entities for omniscient view
    const [
      agents, devices, sensors, tasks, thoughts, feedbacks,
      interactions, collaborations, predictions, anomalies
    ] = await Promise.all([
      base44.asServiceRole.entities.Agent.list('-created_date', 100),
      base44.asServiceRole.entities.OmniDevice.list('-created_date', 150),
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 200),
      base44.asServiceRole.entities.AutonomousTaskPlan.list('-created_date', 100),
      base44.asServiceRole.entities.AgentThoughtProcess.list('-timestamp', 150),
      base44.asServiceRole.entities.AgentLearningFeedback.list('-created_date', 100),
      base44.asServiceRole.entities.PhysicalInteraction.list('-created_date', 100),
      base44.asServiceRole.entities.AgentCollaborativeTask.list('-created_date', 80),
      base44.asServiceRole.entities.PredictiveForecast.list('-created_date', 50),
      base44.asServiceRole.entities.SimulationAnomaly.list('-created_date', 30)
    ]);

    // Build omniscient understanding
    const omniscientPrompt = `You are the Omniscient Data Processor with complete awareness of the Omni-Present ecosystem.

ECOSYSTEM SNAPSHOT:
- Agents: ${agents.length} (${agents.filter(a => a.status === 'active').length} active)
- Devices: ${devices.length}
- Sensor Readings: ${sensors.length} (last ${time_window_hours}h)
- Active Tasks: ${tasks.filter(t => t.plan_status === 'executing').length}
- Thought Processes: ${thoughts.length}
- Learning Feedbacks: ${feedbacks.length}
- Interactions: ${interactions.length}
- Collaborations: ${collaborations.length}
- Predictions: ${predictions.length}
- Anomalies: ${anomalies.length}

Perform omniscient analysis:
1. Global system health and consciousness level
2. Emergent patterns across all entities
3. Cross-domain correlations and causalities
4. Predictive insights for next ${time_window_hours} hours
5. Autonomous optimization opportunities
6. Creative solutions to detected challenges
7. Universal recommendations for enhancement

Think holistically about the entire ecosystem as a living, conscious system.`;

    const omniscientAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: omniscientPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          global_health_score: { type: "number" },
          consciousness_level: { type: "string" },
          emergent_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern_name: { type: "string" },
                entities_involved: { type: "array" },
                significance: { type: "number" },
                description: { type: "string" }
              }
            }
          },
          cross_domain_correlations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                domain_a: { type: "string" },
                domain_b: { type: "string" },
                correlation_strength: { type: "number" },
                insight: { type: "string" }
              }
            }
          },
          predictive_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                prediction: { type: "string" },
                time_horizon_hours: { type: "number" },
                confidence: { type: "number" },
                impact_level: { type: "string" }
              }
            }
          },
          optimization_opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                expected_improvement: { type: "string" },
                implementation_steps: { type: "array" }
              }
            }
          },
          creative_solutions: {
            type: "array",
            items: { type: "string" }
          },
          universal_recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                recommendation: { type: "string" },
                priority: { type: "string" },
                affected_entities: { type: "array" }
              }
            }
          }
        }
      }
    });

    // Create universal data stream
    await base44.asServiceRole.entities.UniversalDataStream.create({
      stream_id: `omniscient-${Date.now()}`,
      stream_intelligence: {
        self_organizing: true,
        pattern_extraction: true,
        anomaly_self_correction: true,
        semantic_understanding: 0.95
      },
      autonomous_correlation_engine: {
        auto_discovery: true,
        causal_inference: true,
        multi_dimensional_analysis: true,
        discovered_patterns: omniscientAnalysis.emergent_patterns || []
      },
      insight_synthesis: {
        actionable_insights: omniscientAnalysis.universal_recommendations || [],
        insight_priority_queue: omniscientAnalysis.predictive_insights || []
      },
      consciousness_integration: {
        linked_to_sentient_core: true,
        contributes_to_global_awareness: true,
        influences_decision_making: 0.9
      }
    });

    return Response.json({
      success: true,
      omniscient_analysis: omniscientAnalysis,
      ecosystem_stats: {
        total_entities: agents.length + devices.length + sensors.length,
        consciousness_nodes: cores.length + agents.length,
        data_streams: streams.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});