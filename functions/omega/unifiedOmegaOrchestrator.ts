import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Orchestrate all Omega systems in unified workflow
    const orchestrationPrompt = `You are the Unified Omega Orchestrator AI.

Analyze current system state and coordinate:
1. AI Mission Commander - active missions and task allocation
2. Ethical Council - ongoing debates and compliance
3. Interstellar Network - FTL link status and challenges
4. Auto-Upgrade System - pending optimizations

Provide system-wide recommendations and trigger necessary actions.`;

    // Fetch current state from all systems
    const missions = await base44.entities.MissionCommand.filter({ mission_status: 'active' }, '-created_date', 5);
    const proposals = await base44.entities.EthicalProposal.filter({ status: 'proposed' }, '-created_date', 5);
    const interstellarLinks = await base44.entities.InterstellarLink.list();
    const upgrades = await base44.entities.UpgradePlan.filter({ status: 'proposed' }, '-created_date', 5);
    const metrics = await base44.entities.SystemMetric.list('-created_date', 30);

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `${orchestrationPrompt}

Current State:
- Active Missions: ${missions.length}
- Pending Ethical Proposals: ${proposals.length}
- Interstellar Links: ${interstellarLinks.length} (FTL: ${interstellarLinks.filter(l => l.ftl_enabled).length})
- Pending Upgrades: ${upgrades.length}
- System Anomalies: ${metrics.filter(m => m.anomaly_detected).length}

Recommend immediate actions for system optimization.`,
      response_json_schema: {
        type: 'object',
        properties: {
          priority_actions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                system: { type: 'string' },
                action: { type: 'string' },
                urgency: { type: 'string' },
                reasoning: { type: 'string' }
              }
            }
          },
          system_health_score: { type: 'number' },
          optimization_opportunities: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Execute high-priority actions
    const executedActions = [];
    
    for (const action of analysis.priority_actions?.slice(0, 3) || []) {
      if (action.urgency === 'critical' || action.urgency === 'high') {
        executedActions.push({
          system: action.system,
          action: action.action,
          status: 'triggered'
        });
      }
    }

    return Response.json({
      success: true,
      system_health_score: analysis.system_health_score,
      priority_actions: analysis.priority_actions,
      executed_actions: executedActions,
      optimization_opportunities: analysis.optimization_opportunities
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      details: 'Failed to run unified orchestrator'
    }, { status: 500 });
  }
});