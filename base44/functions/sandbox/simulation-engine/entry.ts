import { base44 } from '@/api/base44Client';

export async function createSandboxSimulation(userEmail, name, scenario, agentConfigs) {
  const simulation = await base44.entities.SandboxSimulation.create({
    user_email: userEmail,
    simulation_name: name,
    market_scenario: scenario,
    agent_configurations: agentConfigs,
    resource_constraints: { max_capital: 100000, max_trades_per_day: 50 },
    status: 'setup'
  });

  return simulation;
}

export async function runSandboxSimulation(simulationId) {
  const sim = await base44.entities.SandboxSimulation.filter({ id: simulationId });
  if (sim.length === 0) return null;

  await base44.entities.SandboxSimulation.update(simulationId, { status: 'running' });

  const results = await base44.integrations.Core.InvokeLLM({
    prompt: `Simulate trading scenario: ${JSON.stringify(sim[0].market_scenario)} with ${sim[0].agent_configurations.length} agents. Analyze performance, identify failures, suggest optimizations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        performance_metrics: { type: 'object' },
        failure_cases: { type: 'array', items: { type: 'object' } },
        optimizations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  await base44.entities.SandboxSimulation.update(simulationId, {
    status: 'completed',
    performance_metrics: results.performance_metrics,
    failure_cases: results.failure_cases,
    optimizations: results.optimizations
  });

  return results;
}

export async function deploySandboxToProduction(simulationId) {
  const sim = await base44.entities.SandboxSimulation.filter({ id: simulationId });
  if (sim.length === 0) return null;

  for (const agentConfig of sim[0].agent_configurations) {
    await base44.entities.AutonomousTradingAgent.create({
      user_email: sim[0].user_email,
      agent_name: agentConfig.name,
      authorized_actions: agentConfig.actions,
      trading_limits: sim[0].resource_constraints,
      status: 'active',
      permissions_granted: true
    });
  }

  await base44.entities.SandboxSimulation.update(simulationId, { status: 'deployed' });

  return { deployed: true, agents: sim[0].agent_configurations.length };
}