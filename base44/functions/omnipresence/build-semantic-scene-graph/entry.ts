import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spatial_map_id, scan_data, image_urls } = await req.json();

    // Use LLM with vision to analyze the environment
    const analysisPrompt = `Analyze this 3D environment scan and create a detailed semantic scene graph.

Scan Data: ${JSON.stringify(scan_data || {})}

For each detected object, provide:
1. Object type and label
2. Estimated position (x, y, z coordinates)
3. Estimated dimensions
4. Material and color if visible
5. Whether it's interactable or movable
6. Semantic tags (e.g., "seating", "surface", "obstacle")

Also determine:
- Room type
- Activity zones (work area, relaxation area, etc.)
- Safety considerations
- Navigation suggestions for agents

Return a structured analysis.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: image_urls || [],
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          nodes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                node_id: { type: "string" },
                object_type: { type: "string" },
                label: { type: "string" },
                position: {
                  type: "object",
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                    z: { type: "number" }
                  }
                },
                dimensions: {
                  type: "object",
                  properties: {
                    width: { type: "number" },
                    height: { type: "number" },
                    depth: { type: "number" }
                  }
                },
                properties: {
                  type: "object",
                  properties: {
                    material: { type: "string" },
                    color: { type: "string" },
                    interactable: { type: "boolean" },
                    movable: { type: "boolean" },
                    semantic_tags: { type: "array", items: { type: "string" } }
                  }
                },
                confidence: { type: "number" }
              }
            }
          },
          edges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                from_node: { type: "string" },
                to_node: { type: "string" },
                relationship: { type: "string" },
                weight: { type: "number" }
              }
            }
          },
          room_analysis: {
            type: "object",
            properties: {
              room_type: { type: "string" },
              activity_zones: { type: "array", items: { type: "string" } },
              safety_score: { type: "number" },
              optimization_suggestions: { type: "array", items: { type: "string" } }
            }
          },
          navigation_waypoints: {
            type: "array",
            items: {
              type: "object",
              properties: {
                waypoint_id: { type: "string" },
                position: { type: "object" },
                connected_to: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Generate walkable areas from nodes
    const walkableAreas = [];
    const obstacles = [];
    
    (llmResponse.nodes || []).forEach(node => {
      if (node.properties?.movable === false && node.dimensions) {
        obstacles.push({
          node_id: node.node_id,
          position: node.position,
          dimensions: node.dimensions,
          buffer: 0.3
        });
      }
    });

    // Create the semantic graph entity
    const semanticGraph = await base44.asServiceRole.entities.EnvironmentSemanticGraph.create({
      graph_name: `Semantic Graph - ${new Date().toISOString()}`,
      spatial_map_id,
      nodes: llmResponse.nodes || [],
      edges: llmResponse.edges || [],
      navigation_mesh: {
        walkable_areas: walkableAreas,
        obstacles,
        waypoints: llmResponse.navigation_waypoints || []
      },
      ai_analysis: llmResponse.room_analysis || {},
      last_updated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      semantic_graph: semanticGraph,
      summary: {
        total_objects: llmResponse.nodes?.length || 0,
        relationships: llmResponse.edges?.length || 0,
        room_type: llmResponse.room_analysis?.room_type,
        safety_score: llmResponse.room_analysis?.safety_score
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});