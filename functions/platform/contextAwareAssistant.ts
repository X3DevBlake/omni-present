import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_page, user_query } = await req.json();

    // Get or create user context
    let context = await base44.entities.PlatformContext.filter({ user_id: user.id });
    context = context[0];

    if (!context) {
      context = await base44.asServiceRole.entities.PlatformContext.create({
        user_id: user.id,
        current_page: current_page,
        recent_actions: [],
        active_tasks: [],
        user_goals: [],
        ai_suggestions: []
      });
    }

    // Get relevant data based on current page
    let pageContext = {};
    if (current_page?.includes('marketplace')) {
      const profiles = await base44.entities.AgentMarketplaceProfile.list('', 10);
      pageContext.marketplace_summary = {
        total_agents: profiles.length,
        avg_price: profiles.reduce((s, p) => s + (p.pricing_model?.current_price || 0), 0) / profiles.length
      };
    } else if (current_page?.includes('defi')) {
      const strategies = await base44.entities.TradingStrategy.list('', 5);
      pageContext.active_strategies = strategies.length;
    }

    // AI assistant response
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a context-aware AI assistant helping the user.
      
      Current Context:
      - Page: ${current_page}
      - User: ${user.full_name}
      - Recent Actions: ${JSON.stringify(context.recent_actions?.slice(-5) || [])}
      - Page Context: ${JSON.stringify(pageContext)}
      
      User Query: "${user_query}"
      
      Provide:
      1. Direct answer to their query
      2. 3-5 proactive suggestions based on context
      3. Automated actions you can perform (with descriptions)
      
      Be helpful, concise, and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: { type: "string" },
                confidence: { type: "number" },
                rationale: { type: "string" }
              }
            }
          },
          automated_actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update context
    await base44.asServiceRole.entities.PlatformContext.update(context.id, {
      current_page,
      recent_actions: [
        ...(context.recent_actions || []),
        {
          action_type: 'ai_query',
          timestamp: new Date().toISOString(),
          details: { query: user_query }
        }
      ].slice(-20),
      ai_suggestions: response.suggestions,
      last_updated: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      response: response.answer,
      suggestions: response.suggestions,
      automated_actions: response.automated_actions
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});