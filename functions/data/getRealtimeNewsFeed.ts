import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categories } = await req.json();
    const targetCategories = categories || ['AI', 'Crypto', 'Security'];

    const newsData = await base44.integrations.Core.InvokeLLM({
      prompt: `Get the latest breaking news headlines (last 2 hours) for categories: ${targetCategories.join(', ')}. Include title, summary, source, sentiment, and impact level.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          articles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                source: { type: "string" },
                category: { type: "string" },
                sentiment: { type: "string" },
                impact_level: { type: "string" },
                url: { type: "string" }
              }
            }
          }
        }
      }
    });

    const threatIntelData = await base44.integrations.Core.InvokeLLM({
      prompt: 'Get latest cybersecurity threats and vulnerabilities announced in the past 24 hours. Include threat type, severity, and mitigation.',
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          threats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                threat_name: { type: "string" },
                threat_type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    const feedRecords = await Promise.all([
      ...newsData.articles.map(article => 
        base44.entities.LiveDataFeed.create({
          feed_name: article.title,
          feed_type: 'news',
          source_api: article.source,
          update_frequency_seconds: 300,
          current_value: {
            title: article.title,
            summary: article.summary,
            sentiment: article.sentiment,
            impact: article.impact_level
          },
          trend: article.sentiment === 'positive' ? 'rising' : article.sentiment === 'negative' ? 'falling' : 'stable',
          is_active: true
        })
      ),
      ...threatIntelData.threats.map(threat =>
        base44.entities.LiveDataFeed.create({
          feed_name: threat.threat_name,
          feed_type: 'threat_intel',
          source_api: 'Security Feed',
          update_frequency_seconds: 600,
          current_value: threat,
          trend: 'volatile',
          impact_analysis: {
            impact_score: threat.severity === 'critical' ? 0.9 : 0.5
          },
          is_active: true
        })
      )
    ]);

    return Response.json({
      success: true,
      news: newsData.articles,
      threats: threatIntelData.threats,
      feed_count: feedRecords.length,
      message: 'Real-time news and threat feeds updated'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});