import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { defi_volatility_data } = await req.json();

    // Get recent security events
    const securityEvents = await base44.asServiceRole.entities.SecurityEvent.filter(
      { severity: 'high' },
      '-created_date',
      10
    );

    // Get active simulations
    const activeSimulations = await base44.asServiceRole.entities.Simulation.filter(
      { status: 'running' },
      '',
      20
    );

    // Analyze impact and generate adjustments
    const adjustmentAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze security threats and DeFi volatility to adjust simulation parameters:

Security Events: ${JSON.stringify(securityEvents, null, 2)}
DeFi Volatility: ${JSON.stringify(defi_volatility_data, null, 2)}
Active Simulations: ${JSON.stringify(activeSimulations, null, 2)}

Determine:
1. How security threats should affect simulation risk parameters
2. How market volatility should adjust simulation economic models
3. Which agent task priorities need adjustment
4. Specific parameter changes for each simulation
5. Urgency and automation recommendations`,
      response_json_schema: {
        type: 'object',
        properties: {
          simulation_adjustments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                simulation_id: { type: 'string' },
                parameter_changes: { type: 'object' },
                reasoning: { type: 'string' },
                urgency: { type: 'string' }
              }
            }
          },
          agent_priority_changes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                agent_id: { type: 'string' },
                task_id: { type: 'string' },
                new_priority: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          threat_level_impact: { type: 'number' },
          volatility_impact: { type: 'number' },
          automation_safe: { type: 'boolean' }
        }
      }
    });

    // Create cross-hub data flow record
    const dataFlow = await base44.asServiceRole.entities.CrossHubDataFlow.create({
      flow_name: 'Security-DeFi to Simulation Adjustment',
      source_hub: 'security',
      target_hub: 'simulation',
      flow_type: 'event_triggered',
      data_payload: {
        security_events: securityEvents,
        defi_volatility: defi_volatility_data
      },
      trigger_conditions: [
        {
          condition_type: 'security_threat_high',
          threshold: 75,
          action: 'adjust_simulation_parameters'
        },
        {
          condition_type: 'market_volatility_spike',
          threshold: 0.3,
          action: 'update_economic_models'
        }
      ],
      security_to_simulation_adjustments: {
        threat_level_impact: adjustmentAnalysis.threat_level_impact,
        simulation_parameters_modified: adjustmentAnalysis.simulation_adjustments.map(adj => adj.simulation_id),
        agent_task_priority_changes: adjustmentAnalysis.agent_priority_changes
      },
      defi_volatility_predictions: {
        predicted_volatility: defi_volatility_data?.predicted_volatility || 0,
        confidence_level: defi_volatility_data?.confidence || 0,
        time_horizon: '24h',
        recommended_simulation_adjustments: adjustmentAnalysis.simulation_adjustments.map(adj => adj.reasoning)
      },
      flow_metrics: {
        data_volume: JSON.stringify({ securityEvents, defi_volatility_data }).length,
        latency_ms: 0,
        success_rate: 100,
        last_sync: new Date().toISOString()
      },
      is_active: true,
      automation_enabled: adjustmentAnalysis.automation_safe
    });

    // Apply adjustments if automation is safe
    const appliedAdjustments = [];
    if (adjustmentAnalysis.automation_safe) {
      for (const adj of adjustmentAnalysis.simulation_adjustments) {
        try {
          await base44.asServiceRole.entities.Simulation.update(adj.simulation_id, {
            parameters: adj.parameter_changes
          });
          appliedAdjustments.push(adj);
        } catch (err) {
          console.warn(`Failed to update simulation ${adj.simulation_id}:`, err);
        }
      }

      // Update agent task priorities
      for (const priority of adjustmentAnalysis.agent_priority_changes) {
        try {
          await base44.asServiceRole.entities.AgentTaskAssignment.update(priority.task_id, {
            priority: priority.new_priority,
            priority_change_reason: priority.reason
          });
        } catch (err) {
          console.warn(`Failed to update task priority:`, err);
        }
      }
    }

    return Response.json({
      success: true,
      data_flow: dataFlow,
      adjustments: adjustmentAnalysis,
      applied_automatically: adjustmentAnalysis.automation_safe,
      applied_adjustments: appliedAdjustments
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});