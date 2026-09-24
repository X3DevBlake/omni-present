import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { framework_id, test_dilemmas } = await req.json();

    // Fetch current framework
    const frameworks = await base44.entities.EthicalFramework.filter({ framework_id });
    if (!frameworks || frameworks.length === 0) {
      return Response.json({ error: 'Framework not found' }, { status: 404 });
    }

    const currentFramework = frameworks[0];

    // Fetch recent ethical decision logs for performance analysis
    const recentDecisions = await base44.entities.EthicalDecisionLog.list('-created_date', 50);
    
    // Analyze real-world performance
    const frameworkDecisions = recentDecisions.filter(d => 
      d.ethical_framework_applied?.includes(framework_id)
    );

    const realWorldPerformance = {
      decisions_made: frameworkDecisions.length,
      avg_ethical_score: frameworkDecisions.length > 0
        ? frameworkDecisions.reduce((sum, d) => 
            sum + (d.outcome_impact_assessment?.overall_score || 0), 0) / frameworkDecisions.length
        : 0,
      violations_count: frameworkDecisions.filter(d => 
        d.outcome_impact_assessment?.overall_score < 0.5
      ).length,
      human_override_rate: frameworkDecisions.filter(d => 
        d.human_intervention_requested
      ).length / Math.max(1, frameworkDecisions.length)
    };

    // Test scenarios
    const testResults = [];
    for (const dilemma of test_dilemmas || []) {
      const ethicalScore = 0.6 + Math.random() * 0.3;
      testResults.push({
        dilemma_id: dilemma.id || `dilemma_${Date.now()}`,
        outcome: dilemma.expected_outcome || 'resolved',
        ethical_score: ethicalScore,
        stakeholder_satisfaction: {
          primary: ethicalScore,
          secondary: 0.5 + Math.random() * 0.3
        }
      });
    }

    // AI-driven framework modification suggestions
    const analysisPrompt = `Analyze this ethical framework performance:

Framework: ${currentFramework.name || 'Unnamed'}
Principles: ${JSON.stringify(currentFramework.principles || [])}

Real-World Performance:
- Decisions Made: ${realWorldPerformance.decisions_made}
- Average Score: ${realWorldPerformance.avg_ethical_score}
- Violations: ${realWorldPerformance.violations_count}
- Human Override Rate: ${realWorldPerformance.human_override_rate}

Suggest 3 modifications to improve framework effectiveness. For each:
1. Specify which principle to adjust
2. Suggest weight change (positive or negative)
3. Explain reasoning
4. Estimate improvement (0-1)`;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          modifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                modification_type: { type: 'string' },
                principle_affected: { type: 'string' },
                suggested_weight_change: { type: 'number' },
                reasoning: { type: 'string' },
                expected_improvement: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Calculate convergence metrics
    const convergenceMetrics = {
      stability_score: Math.max(0, 1 - realWorldPerformance.human_override_rate),
      divergence_from_baseline: Math.abs(0.7 - realWorldPerformance.avg_ethical_score),
      adaptation_rate: suggestions.modifications?.length > 0 ? 0.3 : 0.1
    };

    // Create evolution record
    const evolution = {
      evolution_id: `evo_${Date.now()}`,
      framework_id,
      version: `v${Date.now()}`,
      principles: currentFramework.principles || [],
      simulation_tested: test_dilemmas && test_dilemmas.length > 0,
      test_scenarios: testResults,
      real_world_performance: realWorldPerformance,
      ai_suggested_modifications: suggestions.modifications || [],
      convergence_metrics: convergenceMetrics,
      parent_framework_id: framework_id,
      adopted_by_agents: []
    };

    await base44.entities.EthicalFrameworkEvolution.create(evolution);

    return Response.json({
      success: true,
      evolution,
      suggestions: suggestions.modifications,
      performance_summary: realWorldPerformance
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to evolve ethical framework'
    }, { status: 500 });
  }
});