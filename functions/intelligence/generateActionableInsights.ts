import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gather data from all hubs
    const [
      securityEvents,
      defiRisks,
      marketProfiles,
      simulations,
      governanceProposals
    ] = await Promise.all([
      base44.asServiceRole.entities.SecurityEvent.filter({ status: 'detected' }, '-created_date', 20),
      base44.asServiceRole.entities.DeFiRiskAssessment.list('-created_date', 20),
      base44.asServiceRole.entities.AgentMarketplaceProfile.list('', 50),
      base44.asServiceRole.entities.Simulation.list('-created_date', 20),
      base44.asServiceRole.entities.GovernanceProposal.filter({ status: 'active' }, '', 20)
    ]);

    // AI-driven cross-hub analysis
    const insights = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze data from multiple hubs and generate actionable insights:

Security Events: ${JSON.stringify(securityEvents.slice(0, 5), null, 2)}
DeFi Risk Assessments: ${JSON.stringify(defiRisks.slice(0, 5), null, 2)}
Agent Marketplace: ${JSON.stringify(marketProfiles.slice(0, 5), null, 2)}
Simulations: ${JSON.stringify(simulations.slice(0, 5), null, 2)}
Governance: ${JSON.stringify(governanceProposals.slice(0, 5), null, 2)}

Generate:
1. Predictive insights about market volatility impact on simulations and agents
2. Security-driven adjustments for agent tasks and simulations
3. Concrete action recommendations for each hub
4. Priority and urgency levels
5. Cross-hub correlation patterns`,
      response_json_schema: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                type: { type: 'string' },
                source_hubs: { type: 'array', items: { type: 'string' } },
                affected_hubs: { type: 'array', items: { type: 'string' } },
                actions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: { type: 'string' },
                      target_hub: { type: 'string' },
                      priority: { type: 'string' },
                      impact: { type: 'number' },
                      automated: { type: 'boolean' }
                    }
                  }
                },
                urgency: { type: 'string' },
                correlation_strength: { type: 'number' },
                confidence: { type: 'number' }
              }
            }
          },
          market_volatility_forecast: {
            type: 'object',
            properties: {
              predicted_volatility: { type: 'number' },
              simulation_impact: { type: 'string' },
              agent_reputation_impact: { type: 'string' }
            }
          }
        }
      }
    });

    // Create actionable insights
    const createdInsights = await Promise.all(
      insights.insights.map(insight =>
        base44.asServiceRole.entities.ActionableInsight.create({
          insight_title: insight.title,
          insight_type: insight.type,
          source_hubs: insight.source_hubs,
          affected_hubs: insight.affected_hubs,
          ai_analysis: {
            detected_pattern: insight.title,
            correlation_strength: insight.correlation_strength,
            confidence_level: insight.confidence,
            predictive_model_used: 'cross_hub_intelligence_v1'
          },
          concrete_actions: insight.actions.map(action => ({
            action_description: action.description,
            target_hub: action.target_hub,
            priority: action.priority,
            estimated_impact: action.impact,
            automated_execution: action.automated,
            requires_approval: !action.automated
          })),
          predictive_data: {
            market_volatility_forecast: insights.market_volatility_forecast,
            simulation_impact_prediction: {},
            agent_reputation_impact: {},
            security_risk_score: securityEvents.length > 0 ? 75 : 25
          },
          urgency_level: insight.urgency,
          status: 'new',
          auto_execution_allowed: false,
          execution_log: []
        })
      )
    );

    return Response.json({
      success: true,
      insights: createdInsights,
      market_forecast: insights.market_volatility_forecast,
      total_insights: createdInsights.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});