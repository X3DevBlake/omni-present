import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      agent_id, 
      object_node_id, 
      interaction_type,
      interaction_params = {}
    } = await req.json();

    // Get agent data
    const agents = await base44.asServiceRole.entities.AgentPhysicalPresence.filter({ agent_id });
    const agent = agents[0];

    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get semantic graph
    const semanticGraphs = await base44.asServiceRole.entities.EnvironmentSemanticGraph.list('-created_date', 1);
    const graph = semanticGraphs[0];

    if (!graph?.nodes) {
      return Response.json({ error: 'No semantic graph available' }, { status: 404 });
    }

    // Find the target object
    const targetObject = graph.nodes.find(n => n.node_id === object_node_id);
    if (!targetObject) {
      return Response.json({ error: 'Object not found in semantic graph' }, { status: 404 });
    }

    // Check if object is interactable
    if (!targetObject.properties?.interactable) {
      return Response.json({ error: 'Object is not interactable' }, { status: 400 });
    }

    // Define interaction capabilities based on object type
    const objectInteractions = {
      furniture: ['move', 'rotate', 'push', 'pull'],
      door: ['open', 'close', 'lock', 'unlock'],
      window: ['open', 'close', 'tilt'],
      appliance: ['turn_on', 'turn_off', 'adjust'],
      decoration: ['move', 'rotate', 'adjust'],
      plant: ['water', 'move', 'inspect']
    };

    const allowedInteractions = objectInteractions[targetObject.object_type] || ['inspect'];
    
    if (!allowedInteractions.includes(interaction_type)) {
      return Response.json({ 
        error: `Interaction '${interaction_type}' not available for ${targetObject.object_type}`,
        allowed_interactions: allowedInteractions 
      }, { status: 400 });
    }

    // Calculate distance between agent and object
    const agentPos = agent.current_location || { x: 0, y: 0, z: 0 };
    const objectPos = targetObject.position || { x: 0, y: 0, z: 0 };
    const distance = Math.sqrt(
      Math.pow(agentPos.x - objectPos.x, 2) +
      Math.pow(agentPos.z - objectPos.z, 2)
    );

    // Check if agent is close enough
    const interactionRange = 2;
    let navigationRequired = distance > interactionRange;
    let navigationPath = null;

    if (navigationRequired) {
      // Calculate approach point
      const approachAngle = Math.atan2(agentPos.z - objectPos.z, agentPos.x - objectPos.x);
      const approachPoint = {
        x: objectPos.x + Math.cos(approachAngle) * (interactionRange * 0.8),
        y: 0,
        z: objectPos.z + Math.sin(approachAngle) * (interactionRange * 0.8)
      };
      
      navigationPath = [
        { waypoint: agentPos, eta_seconds: 0 },
        { waypoint: approachPoint, eta_seconds: distance * 0.5 }
      ];
    }

    // Use AI to plan the interaction execution
    const interactionPlanPrompt = `Plan an interaction for an AI agent with a physical object.

Agent: ${agent_id}
Agent Position: ${JSON.stringify(agentPos)}
Target Object: ${targetObject.label} (${targetObject.object_type})
Object Position: ${JSON.stringify(objectPos)}
Object Properties: ${JSON.stringify(targetObject.properties)}
Interaction Type: ${interaction_type}
Additional Parameters: ${JSON.stringify(interaction_params)}
Distance to Object: ${distance.toFixed(2)} meters
Navigation Required: ${navigationRequired}

Plan the interaction steps including:
1. Pre-interaction checks
2. Movement sequence (if needed)
3. Interaction execution steps
4. Post-interaction state changes
5. Any device commands needed (if object is connected to smart devices)
6. Expected outcome and verification`;

    const interactionPlan = await base44.integrations.Core.InvokeLLM({
      prompt: interactionPlanPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          pre_checks: {
            type: "array",
            items: { type: "string" }
          },
          movement_sequence: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step: { type: "string" },
                target_position: { type: "object" },
                duration_seconds: { type: "number" }
              }
            }
          },
          interaction_steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "integer" },
                action: { type: "string" },
                parameters: { type: "object" },
                expected_duration_ms: { type: "number" }
              }
            }
          },
          device_commands: {
            type: "array",
            items: {
              type: "object",
              properties: {
                device_type: { type: "string" },
                command: { type: "string" },
                parameters: { type: "object" }
              }
            }
          },
          new_object_state: { type: "object" },
          success_criteria: { type: "array", items: { type: "string" } },
          estimated_total_time_seconds: { type: "number" }
        }
      }
    });

    // Log the interaction
    await base44.asServiceRole.entities.PhysicalInteraction.create({
      agent_id,
      interaction_type: 'object_manipulation',
      physical_action: {
        target_device_id: object_node_id,
        device_type: targetObject.object_type,
        action: interaction_type,
        parameters: interaction_params,
        success: true
      },
      agent_response: `Executing ${interaction_type} on ${targetObject.label}`,
      success_score: 90
    });

    // Update agent activity
    await base44.asServiceRole.entities.AgentPhysicalPresence.update(agent.id, {
      current_activity: `Interacting with ${targetObject.label}: ${interaction_type}`,
      movement_path: navigationPath || agent.movement_path
    });

    return Response.json({
      success: true,
      interaction: {
        agent_id,
        target_object: {
          node_id: object_node_id,
          label: targetObject.label,
          type: targetObject.object_type,
          position: objectPos
        },
        interaction_type,
        distance_meters: distance,
        navigation_required: navigationRequired,
        navigation_path: navigationPath
      },
      execution_plan: interactionPlan,
      allowed_interactions: allowedInteractions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});