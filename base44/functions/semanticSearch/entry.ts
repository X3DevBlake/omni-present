import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, agent_id, limit = 10 } = await req.json();

    // Fetch all knowledge graph nodes
    const nodes = await base44.asServiceRole.entities.KnowledgeGraphNode.filter(
      agent_id ? { agent_id } : {}
    );

    // Simple text-based search (in production, use embeddings and vector similarity)
    const queryLower = query.toLowerCase();
    const scoredNodes = nodes.map(node => {
      let score = 0;
      
      // Label match
      if (node.label?.toLowerCase().includes(queryLower)) {
        score += 50;
      }
      
      // Content match
      if (node.content?.toLowerCase().includes(queryLower)) {
        score += 30;
      }
      
      // Tag match
      if (node.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
        score += 20;
      }
      
      // Factor in confidence and relevance
      score *= (node.confidence_score || 0.5);
      score += (node.relevance_score || 50) * 0.1;

      return { ...node, search_score: score };
    });

    // Sort by score and take top results
    const results = scoredNodes
      .filter(n => n.search_score > 0)
      .sort((a, b) => b.search_score - a.search_score)
      .slice(0, limit);

    // Build context from connected nodes
    const contextualResults = await Promise.all(
      results.map(async (node) => {
        const connected = await Promise.all(
          (node.connected_nodes || []).slice(0, 3).map(id =>
            base44.asServiceRole.entities.KnowledgeGraphNode.filter({ id })
          )
        );

        return {
          ...node,
          connected_context: connected.flat().map(c => ({
            label: c.label,
            type: c.node_type,
          })),
        };
      })
    );

    return Response.json({
      success: true,
      query,
      results: contextualResults,
      total_found: results.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});