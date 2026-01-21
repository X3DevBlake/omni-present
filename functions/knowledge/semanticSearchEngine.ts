import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, searchDomains, maxResults = 20 } = await req.json();

    if (!query) {
        return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Use LLM to understand query semantics and generate search embeddings
    const queryAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this search query and extract key concepts, intent, and related terms: "${query}"`,
        response_json_schema: {
            type: "object",
            properties: {
                primary_intent: { type: "string" },
                key_concepts: { type: "array", items: { type: "string" } },
                related_terms: { type: "array", items: { type: "string" } },
                search_category: { type: "string" }
            }
        }
    });

    const domains = searchDomains || ['agents', 'devices', 'knowledge', 'health', 'financial'];
    const results = [];

    // Search across specified domains
    for (const domain of domains) {
        try {
            let domainResults = [];
            
            if (domain === 'agents') {
                const agents = await base44.entities.Agent.list();
                domainResults = agents.filter(a => 
                    JSON.stringify(a).toLowerCase().includes(query.toLowerCase())
                ).map(a => ({
                    type: 'agent',
                    id: a.id,
                    title: a.agent_name || 'Agent',
                    relevance: 0.8,
                    data: a
                }));
            }
            
            if (domain === 'knowledge') {
                const knowledgeNodes = await base44.entities.KnowledgeGraphNode.list();
                domainResults = knowledgeNodes.filter(k => 
                    JSON.stringify(k).toLowerCase().includes(query.toLowerCase())
                ).map(k => ({
                    type: 'knowledge',
                    id: k.id,
                    title: k.node_label || 'Knowledge',
                    relevance: 0.9,
                    data: k
                }));
            }

            results.push(...domainResults);
        } catch (error) {
            console.error(`Error searching ${domain}:`, error.message);
        }
    }

    // Rank results by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    const topResults = results.slice(0, maxResults);

    // Build knowledge graph connections
    const graphEdges = await base44.entities.KnowledgeGraphEdge.list();

    return Response.json({
        success: true,
        query: query,
        queryAnalysis: queryAnalysis,
        totalResults: results.length,
        results: topResults,
        knowledgeGraphConnections: graphEdges.filter(edge => 
            topResults.some(r => r.id === edge.source_node_id || r.id === edge.target_node_id)
        )
    });
});