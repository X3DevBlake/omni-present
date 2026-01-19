import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit = 10 } = await req.json();
    
    // Get all knowledge articles
    const articles = await base44.entities.KnowledgeArticle.filter({
      status: 'published'
    });
    
    // AI-powered semantic search
    const searchResults = await base44.integrations.Core.InvokeLLM({
      prompt: `Given this search query: "${query}"
      
      Find the most relevant articles from this knowledge base:
      ${articles.map(a => `- ${a.title}: ${a.content.substring(0, 200)}...`).join('\n')}
      
      Rank them by relevance and provide relevance scores.`,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                article_title: { type: "string" },
                relevance_score: { type: "number" },
                matching_excerpt: { type: "string" },
                why_relevant: { type: "string" }
              }
            }
          }
        }
      }
    });
    
    // Match results with actual articles
    const rankedArticles = searchResults.results
      .map(result => {
        const article = articles.find(a => a.title === result.article_title);
        return article ? {
          ...article,
          relevance_score: result.relevance_score,
          matching_excerpt: result.matching_excerpt,
          why_relevant: result.why_relevant
        } : null;
      })
      .filter(a => a !== null)
      .slice(0, limit);
    
    // Update view counts
    for (const article of rankedArticles) {
      await base44.entities.KnowledgeArticle.update(article.id, {
        view_count: (article.view_count || 0) + 1
      });
    }
    
    return Response.json({
      query,
      results: rankedArticles,
      total_found: rankedArticles.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});