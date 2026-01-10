import { base44 } from '@/api/base44Client';

export default async function proactiveAgentSuggestions(req) {
  const { userId, agentId } = req.body;

  try {
    // Fetch user's financial profile
    const user = await base44.auth.me();
    const goals = await base44.entities.FinancialGoal.filter({ user_email: userId });
    const transactions = await base44.entities.FinancialTransaction.filter({ user_email: userId });
    const assets = await base44.entities.MarketAsset.list();

    // Get current market trends
    const marketTrends = await base44.integrations.Core.InvokeLLM({
      prompt: 'Analyze current market trends and provide brief insights on emerging opportunities in tech, finance, and sustainability sectors.',
      add_context_from_internet: true
    });

    // Generate personalized suggestions
    const suggestionPrompt = `
      User Profile:
      - Total Goals: ${goals.length}
      - Active Goals: ${goals.filter(g => g.status === 'active').length}
      - Completed Goals: ${goals.filter(g => g.status === 'completed').length}
      - Recent Transactions: ${transactions.slice(0, 10).length}
      
      Current Market Trends:
      ${marketTrends}
      
      Based on the user's profile and market trends, suggest:
      1. 2-3 new financial goals aligned with their profile
      2. 2-3 investment strategies tailored to their risk profile
      3. 1-2 market opportunities they might benefit from
      4. Recommended actions for the agent to take
      
      Format as JSON with keys: newGoals, strategies, opportunities, agentActions
    `;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: suggestionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          newGoals: { type: 'array', items: { type: 'object' } },
          strategies: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          agentActions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Store suggestions as agent knowledge
    await base44.entities.AgentKnowledge.create({
      agent_id: agentId,
      category: 'proactive_suggestions',
      content: JSON.stringify(suggestions),
      confidence_score: 0.8,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      suggestions,
      message: 'Proactive suggestions generated for agent'
    };
  } catch (error) {
    console.error('Proactive suggestions error:', error);
    throw error;
  }
}