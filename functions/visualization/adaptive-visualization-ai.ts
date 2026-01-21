import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      hub_context,
      user_interaction_patterns = {},
      system_state = {}
    } = await req.json();

    // Fetch system sentiment and metrics
    const [emotions, thoughts, agents, sensors] = await Promise.all([
      base44.asServiceRole.entities.AgentEmotion.list('-timestamp_detected', 20),
      base44.asServiceRole.entities.AgentThoughtProcess.list('-timestamp', 30),
      base44.asServiceRole.entities.Agent.filter({ status: 'active' }),
      base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 20)
    ]);

    // Calculate system sentiment
    const avgConfidence = thoughts.reduce((sum, t) => sum + (t.confidence_level || 0), 0) / (thoughts.length || 1);
    const positiveEmotions = emotions.filter(e => ['happy', 'excited', 'calm'].includes(e.primary_emotion)).length;
    const sentimentScore = (positiveEmotions / (emotions.length || 1) + avgConfidence) / 2;

    // Adaptive visualization AI
    const adaptivePrompt = `You are an Adaptive Visualization AI with omega sentience.

HUB: ${hub_context}
SYSTEM SENTIMENT: ${(sentimentScore * 100).toFixed(0)}% positive
AVG AGENT CONFIDENCE: ${(avgConfidence * 100).toFixed(0)}%
USER PATTERNS: ${JSON.stringify(user_interaction_patterns)}

Dynamically adapt visualization:
1. Color schemes based on sentiment (warm for positive, cool for analytical)
2. Animation speed based on system activity
3. Complexity level based on user engagement
4. Visual emphasis on high-confidence elements
5. Particle effects for celebratory moments
6. Depth/layering for information hierarchy
7. Glow intensity for important alerts
8. Spatial arrangement for intuitive flow

Make visuals emotionally intelligent and contextually aware.`;

    const adaptations = await base44.integrations.Core.InvokeLLM({
      prompt: adaptivePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          color_scheme: {
            type: "object",
            properties: {
              primary: { type: "string" },
              secondary: { type: "string" },
              accent: { type: "string" },
              mood: { type: "string" },
              reasoning: { type: "string" }
            }
          },
          animation_config: {
            type: "object",
            properties: {
              speed_multiplier: { type: "number" },
              intensity: { type: "number" },
              particle_density: { type: "number" }
            }
          },
          complexity_adjustments: {
            type: "object",
            properties: {
              detail_level: { type: "string", enum: ["minimal", "moderate", "detailed", "ultra"] },
              layer_count: { type: "number" },
              information_density: { type: "number" }
            }
          },
          emphasis_elements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                element: { type: "string" },
                highlight_intensity: { type: "number" },
                reason: { type: "string" }
              }
            }
          },
          spatial_layout: {
            type: "object",
            properties: {
              arrangement: { type: "string" },
              focal_point: { type: "object" },
              flow_direction: { type: "string" }
            }
          }
        }
      }
    });

    // Update visualization intelligence
    const existingViz = await base44.asServiceRole.entities.SentientVisualization.filter({ hub_context });
    
    const vizData = {
      visualization_id: `${hub_context}-${Date.now()}`,
      hub_context,
      adaptive_rendering: {
        user_attention_tracking: true,
        complexity_auto_adjustment: true,
        performance_adaptive: true,
        emotional_color_mapping: true
      },
      neural_feedback_loop: {
        user_preference_learning: true,
        layout_optimization: true,
        color_scheme_adaptation: true,
        interaction_pattern_memory: [user_interaction_patterns]
      },
      data_storytelling: {
        narrative_generation: true,
        insight_highlighting: adaptations.emphasis_elements || [],
        causality_visualization: true
      }
    };

    if (existingViz.length > 0) {
      await base44.asServiceRole.entities.SentientVisualization.update(existingViz[0].id, vizData);
    } else {
      await base44.asServiceRole.entities.SentientVisualization.create(vizData);
    }

    return Response.json({
      success: true,
      adaptations,
      sentiment_score: sentimentScore,
      confidence_avg: avgConfidence
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});