/**
 * Dynamic Goal-Setting System for Autonomous Agents
 */

import { base44 } from '@base44/sdk';

export default async function dynamicGoalSystem(context) {
  const { agent_id } = context.params;

  try {
    const agent = await base44.asServiceRole.entities.HolographicAgent.get(agent_id);
    
    // Fetch recent analytics and market data
    const [analytics, marketData] = await Promise.all([
      base44.asServiceRole.entities.SimulationAnalytics.list('-created_date', 5),
      fetchMarketData()
    ]);

    // AI analyzes performance and proposes new goals
    const goalProposal = await base44.integrations.Core.InvokeLLM({
      prompt: `Agent ${agent.name} autonomous goal proposal:

Current skills: ${agent.skills?.join(', ')}
Recent performance: ${JSON.stringify(analytics[0]?.agent_performance)}
Market data: ${JSON.stringify(marketData)}

Analyze:
1. Performance gaps
2. Market opportunities
3. Skill deficiencies
4. Collaboration needs

Propose 3 new goals with reasoning, expected outcomes, and priority.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          goals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                goal_name: { type: 'string' },
                goal_type: { type: 'string' },
                reasoning: { type: 'string' },
                expected_outcomes: { type: 'array' },
                priority: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Create goal records
    const createdGoals = await Promise.all(
      goalProposal.goals.map(goal =>
        base44.asServiceRole.entities.AgentGoalDynamic.create({
          agent_id,
          goal_name: goal.goal_name,
          goal_type: goal.goal_type,
          proposed_by: 'agent',
          reasoning: goal.reasoning,
          expected_outcomes: goal.expected_outcomes,
          data_sources: ['analytics', 'market_data'],
          priority: goal.priority,
          status: 'proposed',
          progress: 0
        })
      )
    );

    return {
      success: true,
      goals_proposed: createdGoals.length,
      goals: createdGoals
    };

  } catch (error) {
    console.error('Goal system error:', error);
    return { success: false, error: error.message };
  }
}

async function fetchMarketData() {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: 'Fetch real-time crypto market data from CoinMarketCap, Coinbase, Crypto.com: top 10 coins, prices, 24h changes, market sentiment',
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        top_coins: { type: 'array' },
        sentiment: { type: 'string' }
      }
    }
  });
  return result;
}