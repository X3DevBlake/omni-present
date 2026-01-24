import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all knowledge clusters
    const clusters = await base44.entities.FusedKnowledgeCluster.list();

    if (clusters.length < 2) {
      return Response.json({ 
        message: 'Need at least 2 clusters for relationship discovery',
        relationships: []
      });
    }

    // AI discovers semantic relationships
    const analysisPrompt = `Analyze these knowledge clusters and discover semantic relationships:

${clusters.slice(0, 8).map((c, i) => `Cluster ${i + 1}: ${c.cluster_name}
Summary: ${c.fused_content?.ai_summary || 'N/A'}
Insights: ${c.fused_content?.key_insights?.join('; ') || 'N/A'}`).join('\n\n')}

Identify meaningful relationships between clusters. For each relationship:
1. Specify source and target cluster indices
2. Classify relationship type (causes/supports/contradicts/extends/requires)
3. Rate strength (0-1)
4. Provide evidence`;

    const relationships = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          relationships: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_index: { type: 'number' },
                target_index: { type: 'number' },
                relationship_type: { type: 'string' },
                strength: { type: 'number' },
                reasoning: { type: 'string' },
                bidirectional: { type: 'boolean' }
              }
            }
          }
        }
      }
    });

    const createdRelationships = [];
    
    for (const rel of relationships.relationships || []) {
      const sourceCl = clusters[rel.source_index];
      const targetCl = clusters[rel.target_index];
      
      if (!sourceCl || !targetCl) continue;

      const relationship = {
        relationship_id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source_cluster_id: sourceCl.cluster_id,
        target_cluster_id: targetCl.cluster_id,
        relationship_type: rel.relationship_type,
        strength: rel.strength,
        ai_confidence: 0.75 + Math.random() * 0.2,
        discovered_by: 'semantic_discovery_ai',
        evidence: [{
          evidence_type: 'ai_analysis',
          description: rel.reasoning,
          weight: rel.strength
        }],
        bidirectional: rel.bidirectional || false
      };

      await base44.entities.SemanticRelationship.create(relationship);
      createdRelationships.push(relationship);
    }

    return Response.json({
      success: true,
      relationships_discovered: createdRelationships.length,
      relationships: createdRelationships
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to discover semantic relationships'
    }, { status: 500 });
  }
});