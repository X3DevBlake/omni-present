import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { node_ids, fusion_strategy } = await req.json();

    // Fetch knowledge nodes to fuse
    const allNodes = await base44.entities.DecentralizedKnowledgeNode.list();
    const nodesToFuse = allNodes.filter(n => node_ids.includes(n.node_id));

    if (nodesToFuse.length < 2) {
      return Response.json({ error: 'Need at least 2 nodes to fuse' }, { status: 400 });
    }

    // Determine source types
    const sourceTypes = [...new Set(nodesToFuse.map(n => {
      // Infer source type from content
      if (n.content?.content_type) return n.content.content_type;
      return 'user_contribution';
    }))];

    // AI-powered fusion using LLM
    const nodeContents = nodesToFuse.map(n => ({
      id: n.node_id,
      title: n.content?.title || 'Untitled',
      data: JSON.stringify(n.content?.data || {}),
      contributor: n.contributor_type
    }));

    const fusionPrompt = `You are an AI knowledge fusion agent. Analyze and merge the following knowledge nodes:

${nodeContents.map((nc, i) => `Node ${i + 1} (${nc.contributor}): ${nc.title}\nData: ${nc.data}`).join('\n\n')}

Tasks:
1. Create a concise summary (max 200 words) that captures the essence of all nodes
2. Identify 3-5 key insights that emerge from combining these nodes
3. Suggest 3 emergent insights that aren't explicitly stated but can be inferred
4. Rate the fusion quality (0-1)`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: fusionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          key_insights: { type: 'array', items: { type: 'string' } },
          emergent_insights: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                insight: { type: 'string' },
                novelty_score: { type: 'number' },
                relevance_score: { type: 'number' }
              }
            }
          },
          fusion_quality: { type: 'number' }
        }
      }
    });

    // Create fused cluster
    const cluster = {
      cluster_id: `cluster_${Date.now()}`,
      cluster_name: `Fused: ${nodesToFuse[0].content?.title || 'Knowledge Cluster'}`,
      source_nodes: node_ids,
      fused_content: {
        title: llmResponse.summary?.split('.')[0] || 'Fused Knowledge',
        ai_summary: llmResponse.summary,
        key_insights: llmResponse.key_insights || [],
        synthesized_data: {
          source_count: nodesToFuse.length,
          fusion_timestamp: new Date().toISOString()
        }
      },
      source_types: sourceTypes,
      fusion_confidence: llmResponse.fusion_quality || 0.8,
      emergent_insights: (llmResponse.emergent_insights || []).map(ei => ({
        ...ei,
        supporting_nodes: node_ids
      })),
      semantic_relationships: [],
      query_hits: 0
    };

    await base44.entities.FusedKnowledgeCluster.create(cluster);

    return Response.json({
      success: true,
      cluster,
      summary: llmResponse.summary,
      emergent_insights_count: cluster.emergent_insights.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to fuse knowledge nodes'
    }, { status: 500 });
  }
});