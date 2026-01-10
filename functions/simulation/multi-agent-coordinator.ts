import { base44 } from '@/api/base44Client';

export async function createSimulation(userEmail, simulationData) {
  const simulation = {
    user_email: userEmail,
    ...simulationData,
    status: 'draft',
    parameters: simulationData.parameters || {},
    results: {}
  };

  return await base44.entities.Simulation.create(simulation);
}

export async function startSimulation(simulationId) {
  return await base44.entities.Simulation.update(simulationId, {
    status: 'running',
    start_time: new Date().toISOString()
  });
}

export async function pauseSimulation(simulationId) {
  return await base44.entities.Simulation.update(simulationId, {
    status: 'paused'
  });
}

export async function resumeSimulation(simulationId) {
  return await base44.entities.Simulation.update(simulationId, {
    status: 'running'
  });
}

export async function completeSimulation(simulationId, results) {
  return await base44.entities.Simulation.update(simulationId, {
    status: 'completed',
    end_time: new Date().toISOString(),
    results
  });
}

export async function addAgentToSimulation(simulationId, userEmail, agentData) {
  const agent = {
    simulation_id: simulationId,
    user_email: userEmail,
    agent_name: agentData.name,
    agent_type: agentData.type,
    personality: agentData.personality || {},
    goals: agentData.goals || [],
    interactions: [],
    performance_metrics: {
      tasks_completed: 0,
      success_rate: 0,
      efficiency_score: 0
    }
  };

  return await base44.entities.SimulationAgent.create(agent);
}

export async function updateAgentPosition(agentId, position) {
  return await base44.entities.SimulationAgent.update(agentId, { position });
}

export async function recordAgentInteraction(agentId, interaction) {
  const agent = await base44.entities.SimulationAgent.filter({ id: agentId });
  if (agent.length > 0) {
    const updatedInteractions = [...(agent[0].interactions || []), interaction];
    return await base44.entities.SimulationAgent.update(agentId, {
      interactions: updatedInteractions
    });
  }
}

export async function updateAgentMetrics(agentId, metrics) {
  return await base44.entities.SimulationAgent.update(agentId, {
    performance_metrics: metrics
  });
}

export async function getSimulationAgents(simulationId) {
  return await base44.entities.SimulationAgent.filter({ simulation_id: simulationId });
}

export async function analyzeAgentCollaboration(simulationId) {
  const agents = await getSimulationAgents(simulationId);
  
  let totalInteractions = 0;
  let successfulInteractions = 0;

  agents.forEach(agent => {
    totalInteractions += agent.interactions?.length || 0;
    successfulInteractions += agent.interactions?.filter(i => i.success).length || 0;
  });

  const collaborationScore = totalInteractions > 0 
    ? (successfulInteractions / totalInteractions) * 100 
    : 0;

  return {
    agent_count: agents.length,
    total_interactions: totalInteractions,
    successful_interactions: successfulInteractions,
    collaboration_score: collaborationScore
  };
}