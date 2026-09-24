import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sensor_data, environment_id, scan_type } = await req.json();

    // AI-powered spatial analysis
    const analysisPrompt = `Analyze this spatial sensor data and extract semantic information about objects, their properties, and relationships:
    
Sensor Data: ${JSON.stringify(sensor_data)}
Scan Type: ${scan_type}

Return a JSON object with:
- detected_objects: array of objects with type, position, properties, and confidence
- spatial_relationships: array of relationships between objects
- semantic_tags: contextual labels for the environment`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          detected_objects: { type: "array" },
          spatial_relationships: { type: "array" },
          semantic_tags: { type: "array" }
        }
      }
    });

    // Create or update semantic graph nodes
    const createdNodes = [];
    for (const obj of aiAnalysis.detected_objects || []) {
      const node = await base44.asServiceRole.entities.EnvironmentSemanticGraph.create({
        node_id: `${environment_id}_${obj.type}_${Date.now()}_${Math.random()}`,
        node_type: obj.type,
        spatial_coordinates: obj.position,
        properties_json: obj.properties || {},
        relations_json: {},
        semantic_tags: obj.tags || [],
        confidence_score: obj.confidence || 0.8,
        last_scan_timestamp: new Date().toISOString(),
        scan_source: scan_type,
        dynamic_state: {
          is_moving: false,
          velocity_vector: { x: 0, y: 0, z: 0 },
          predicted_trajectory: []
        }
      });
      createdNodes.push(node);
    }

    // Update relationships
    for (const rel of aiAnalysis.spatial_relationships || []) {
      // Update relation fields for connected nodes
      const sourceNode = createdNodes.find(n => n.semantic_tags?.includes(rel.source));
      const targetNode = createdNodes.find(n => n.semantic_tags?.includes(rel.target));
      
      if (sourceNode && targetNode) {
        await base44.asServiceRole.entities.EnvironmentSemanticGraph.update(sourceNode.id, {
          relations_json: {
            ...sourceNode.relations_json,
            [rel.relationship_type]: targetNode.node_id
          }
        });
      }
    }

    return Response.json({
      success: true,
      nodes_created: createdNodes.length,
      nodes: createdNodes,
      semantic_summary: aiAnalysis.semantic_tags
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});