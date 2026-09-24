import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, category = "tutorials", auto_update = true } = await req.json();

    // Check if article already exists
    const existing = await base44.entities.DocumentationArticle.filter({ 
      title: topic,
      category 
    });

    if (existing.length > 0 && !auto_update) {
      return Response.json({
        success: true,
        article: existing[0],
        message: "Article already exists"
      });
    }

    // Gather platform context
    const recentFunctions = await base44.asServiceRole.entities.SDKIntegration.list();
    const recentEntities = await base44.entities.EnvironmentSemanticGraph.list();

    // AI-powered documentation generation
    const docPrompt = `You are an expert technical writer for the Omni-Present platform. Create comprehensive documentation:

Topic: ${topic}
Category: ${category}
Recent Platform Updates: ${JSON.stringify({ 
      functions: recentFunctions.slice(0, 3),
      entities: recentEntities.slice(0, 3)
    })}

Create a detailed, beginner-friendly article with:
1. Clear introduction
2. Step-by-step examples with code
3. Best practices
4. Common pitfalls
5. Related concepts
6. Interactive examples

Format in markdown with code blocks.`;

    const documentation = await base44.integrations.Core.InvokeLLM({
      prompt: docPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          content_markdown: { type: "string" },
          code_examples: { type: "array" },
          tags: { type: "array" },
          search_keywords: { type: "array" },
          difficulty_level: { type: "string" }
        }
      }
    });

    let article;
    if (existing.length > 0) {
      // Update existing article
      article = await base44.asServiceRole.entities.DocumentationArticle.update(
        existing[0].id,
        {
          content_markdown: documentation.content_markdown,
          code_examples: documentation.code_examples || [],
          tags: documentation.tags || [],
          search_keywords: documentation.search_keywords || [],
          last_ai_update: new Date().toISOString(),
          ai_generated: true
        }
      );
    } else {
      // Create new article
      article = await base44.asServiceRole.entities.DocumentationArticle.create({
        article_id: `doc_${Date.now()}_${Math.random()}`,
        title: topic,
        category,
        content_markdown: documentation.content_markdown,
        code_examples: documentation.code_examples || [],
        associated_entities: [],
        associated_functions: [],
        tags: documentation.tags || [],
        difficulty_level: documentation.difficulty_level || "intermediate",
        last_ai_update: new Date().toISOString(),
        ai_generated: true,
        views_count: 0,
        helpful_votes: 0,
        search_keywords: documentation.search_keywords || []
      });
    }

    return Response.json({
      success: true,
      article,
      updated: existing.length > 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});