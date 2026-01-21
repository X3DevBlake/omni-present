import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, learning_type = 'comprehensive' } = await req.json();

    // Get interaction history for learning
    const [interactions, emotions, detections, physicalInteractions] = await Promise.all([
      base44.entities.RealWorldInteractionLog.filter({ agent_id }).limit(100),
      base44.entities.AgentEmotion.filter({ agent_id }).limit(50),
      base44.entities.DynamicObjectDetection.filter({}).limit(100),
      base44.entities.PhysicalInteraction.filter({ agent_id }).limit(50)
    ]);

    // Calculate success metrics
    const successfulInteractions = interactions.filter(i => i.interaction_success);
    const successRate = interactions.length ? (successfulInteractions.length / interactions.length) * 100 : 0;

    // Analyze emotion patterns
    const emotionFrequency = {};
    emotions.forEach(e => {
      emotionFrequency[e.primary_emotion] = (emotionFrequency[e.primary_emotion] || 0) + 1;
    });
    const dominantUserEmotion = Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    // Use AI to generate learning insights
    const learningAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze agent interaction patterns and generate adaptive learning recommendations:

Interaction Stats:
- Total interactions: ${interactions.length}
- Success rate: ${successRate.toFixed(1)}%
- Physical interactions: ${physicalInteractions.length}

Emotion Analysis:
- Dominant user emotion: ${dominantUserEmotion}
- Emotion distribution: ${JSON.stringify(emotionFrequency)}

Dynamic Objects Detected: ${detections.length}

Generate learning adaptations:
1. behavior_adjustments (array of specific behavioral changes)
2. communication_style_updates (how to adjust tone/complexity)
3. physical_action_refinements (improved physical task handling)
4. emotion_response_patterns (optimized emotional responses)
5. environmental_learning (spatial/obstacle insights)
6. proactive_action_triggers (when to initiate actions)
7. collaboration_improvements (multi-agent coordination)
8. overall_effectiveness_score (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          behavior_adjustments: { type: "array", items: { type: "string" } },
          communication_style_updates: {
            type: "object",
            properties: {
              tone: { type: "string" },
              complexity_level: { type: "string" },
              empathy_mode: { type: "string" }
            }
          },
          physical_action_refinements: { type: "array", items: { type: "string" } },
          emotion_response_patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                emotion: { type: "string" },
                response_strategy: { type: "string" }
              }
            }
          },
          environmental_learning: { type: "array", items: { type: "string" } },
          proactive_action_triggers: { type: "array", items: { type: "string" } },
          collaboration_improvements: { type: "array", items: { type: "string" } },
          overall_effectiveness_score: { type: "number" }
        }
      }
    });

    // Update DynamicObjectDetection with learned behaviors
    for (const detection of detections.slice(0, 10)) {
      await base44.entities.DynamicObjectDetection.update(detection.id, {
        learned_behavior: {
          typical_locations: detection.learned_behavior?.typical_locations || [],
          activity_patterns: learningAnalysis.environmental_learning.slice(0, 3),
          interaction_preferences: learningAnalysis.communication_style_updates.tone
        }
      });
    }

    // Update PhysicalInteraction with learned adaptations
    for (const interaction of physicalInteractions.slice(0, 5)) {
      await base44.entities.PhysicalInteraction.update(interaction.id, {
        adaptation_learned: learningAnalysis.behavior_adjustments.join('; ')
      });
    }

    return Response.json({
      success: true,
      agent_id,
      learning_analysis: learningAnalysis,
      metrics: {
        interactions_analyzed: interactions.length,
        success_rate: successRate,
        dominant_emotion: dominantUserEmotion,
        physical_interactions: physicalInteractions.length,
        objects_tracked: detections.length
      },
      updates_applied: {
        detections_updated: Math.min(detections.length, 10),
        interactions_updated: Math.min(physicalInteractions.length, 5)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});