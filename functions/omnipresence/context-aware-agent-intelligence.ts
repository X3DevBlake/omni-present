import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, update_context = true, generate_adaptations = true } = await req.json();

    // Get agent data
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agentPos = agent.current_location || { x: 0, y: 0, z: 0 };

    // Get semantic graph for current area
    const semanticGraphs = await base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1);
    const semanticGraph = semanticGraphs[0];

    // Get nearby sensor data
    const allSensorData = await base44.asServiceRole.entities.SensorData.list('-reading_timestamp', 50);
    const nearbySensors = allSensorData.filter(sensor => {
      if (!sensor.position) return false;
      const distance = Math.sqrt(
        Math.pow((sensor.position.x || 0) - agentPos.x, 2) +
        Math.pow((sensor.position.z || 0) - agentPos.z, 2)
      );
      return distance < 5;
    });

    // Find nearby semantic objects
    const nearbyObjects = (semanticGraph?.nodes || [])
      .map(node => {
        const distance = Math.sqrt(
          Math.pow((node.position?.x || 0) - agentPos.x, 2) +
          Math.pow((node.position?.z || 0) - agentPos.z, 2)
        );
        return { ...node, distance_meters: distance };
      })
      .filter(obj => obj.distance_meters < 3)
      .sort((a, b) => a.distance_meters - b.distance_meters)
      .slice(0, 10)
      .map(obj => ({
        object_label: obj.label,
        object_type: obj.object_type,
        distance_meters: obj.distance_meters,
        interactable: obj.properties?.interactable || false,
        semantic_tags: obj.properties?.semantic_tags || []
      }));

    // Get nearby agents
    const allAgents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({
      projection_status: 'active'
    });
    const nearbyAgents = allAgents
      .filter(a => a.agent_id !== agent_id)
      .map(a => {
        const distance = Math.sqrt(
          Math.pow((a.current_location?.x || 0) - agentPos.x, 2) +
          Math.pow((a.current_location?.z || 0) - agentPos.z, 2)
        );
        return { ...a, distance };
      })
      .filter(a => a.distance < 4)
      .map(a => ({
        agent_id: a.agent_id,
        distance: a.distance,
        activity: a.current_activity,
        collaboration_potential: a.distance < 2 ? 0.9 : 0.5
      }));

    // Compile environmental conditions
    const environmentalConditions = {};
    nearbySensors.forEach(sensor => {
      environmentalConditions[sensor.sensor_type] = sensor.reading_value;
    });

    // Build context object
    const currentContext = {
      room_type: semanticGraph?.ai_analysis?.room_type || 'unknown',
      activity_zone: semanticGraph?.ai_analysis?.activity_zones?.[0] || 'general',
      nearby_objects: nearbyObjects,
      environmental_conditions: environmentalConditions,
      nearby_agents: nearbyAgents
    };

    // Use AI to generate behavioral adaptations
    let behavioralAdaptations = [];
    let communicationAdjustments = {};
    let awarenessScore = 70;

    if (generate_adaptations) {
      const adaptationPrompt = `You are an AI agent operating in a physical space. Analyze your current context and determine behavioral adaptations.

Agent ID: ${agent_id}
Current Activity: ${agent.current_activity || 'idle'}
Current Location: ${JSON.stringify(agentPos)}

Context:
- Room Type: ${currentContext.room_type}
- Activity Zone: ${currentContext.activity_zone}
- Nearby Objects: ${JSON.stringify(nearbyObjects.map(o => o.object_label))}
- Environmental Conditions: ${JSON.stringify(environmentalConditions)}
- Temperature: ${environmentalConditions.temperature || 'N/A'}°F
- Light Level: ${environmentalConditions.light || 'N/A'} lux
- Nearby Agents: ${nearbyAgents.length}

Based on this context, recommend:
1. Behavioral adaptations (movement speed, interaction style, task priorities)
2. Communication adjustments (tone, verbosity, formality)
3. Environmental awareness score (0-100)
4. Specific actions the agent should consider

Be practical and context-aware.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: adaptationPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            behavioral_adaptations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  adaptation_type: { type: "string" },
                  trigger: { type: "string" },
                  adjustment: { type: "string" },
                  confidence: { type: "number" },
                  reasoning: { type: "string" }
                }
              }
            },
            communication_adjustments: {
              type: "object",
              properties: {
                tone: { type: "string" },
                verbosity: { type: "string" },
                formality: { type: "number" },
                adaptation_reason: { type: "string" }
              }
            },
            awareness_score: { type: "number" },
            recommended_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            environmental_insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      behavioralAdaptations = aiResponse.behavioral_adaptations || [];
      communicationAdjustments = aiResponse.communication_adjustments || {};
      awarenessScore = aiResponse.awareness_score || 70;
    }

    // Store or update contextual state
    const existingStates = await base44.asServiceRole.entities.AgentContextualState.filter({ agent_id });
    
    const contextualState = existingStates.length > 0
      ? await base44.asServiceRole.entities.AgentContextualState.update(existingStates[0].id, {
          current_context: currentContext,
          behavioral_adaptations: behavioralAdaptations,
          communication_adjustments: communicationAdjustments,
          awareness_score: awarenessScore,
          last_context_update: new Date().toISOString()
        })
      : await base44.asServiceRole.entities.AgentContextualState.create({
          agent_id,
          current_context: currentContext,
          behavioral_adaptations: behavioralAdaptations,
          communication_adjustments: communicationAdjustments,
          awareness_score: awarenessScore,
          last_context_update: new Date().toISOString()
        });

    return Response.json({
      success: true,
      agent_id,
      contextual_state: contextualState,
      context_summary: {
        room_type: currentContext.room_type,
        nearby_objects_count: nearbyObjects.length,
        environmental_readings: Object.keys(environmentalConditions).length,
        nearby_agents_count: nearbyAgents.length,
        awareness_score: awarenessScore,
        adaptations_applied: behavioralAdaptations.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});