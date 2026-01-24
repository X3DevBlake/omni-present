import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    // Fetch all clusters
    const clusters = await base44.entities.FusedKnowledgeCluster.list();

    // Use LLM for semantic search
    const searchPrompt = `Given the user query: "${query}"

Analyze the following knowledge clusters and return the most relevant ones:

${clusters.map((c, i) => `Cluster ${i + 1}: ${c.cluster_name}\nSummary: ${c.fused_content?.ai_summary || 'N/A'}\nInsights: ${c.fused_content?.key_insights?.join(', ') || 'N/A'}`).join('\n\n')}

Return the top 3 most relevant cluster indices (0-based) and their relevance scores.`;

    const searchResults = await base44.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cluster_index: { type: 'number' },
                relevance_score: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          },
          answer_summary: { type: 'string' }
        }
      }
    });

    // Map results to actual clusters
    const relevantClusters = (searchResults.results || []).map(r => ({
      cluster: clusters[r.cluster_index],
      relevance_score: r.relevance_score,
      reasoning: r.reasoning
    })).filter(r => r.cluster);

    // Update query hits
    for (const result of relevantClusters) {
      if (result.cluster?.id) {
        await base44.entities.FusedKnowledgeCluster.update(result.cluster.id, {
          query_hits: (result.cluster.query_hits || 0) + 1
        });
      }
    }

    return Response.json({
      success: true,
      query,
      results: relevantClusters,
      answer_summary: searchResults.answer_summary,
      total_clusters_searched: clusters.length
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to query knowledge fusion'
    }, { status: 500 });
  }
});