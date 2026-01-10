import { base44 } from '@/api/base44Client';

export async function createScenario(userEmail, scenarioData) {
  const scenario = {
    user_email: userEmail,
    ...scenarioData,
    initial_conditions: scenarioData.initialConditions || {},
    success_criteria: scenarioData.successCriteria || {},
    tags: scenarioData.tags || []
  };

  return await base44.entities.SimulationScenario.create(scenario);
}

export async function duplicateScenario(scenarioId) {
  const scenario = await base44.entities.SimulationScenario.filter({ id: scenarioId });
  if (scenario.length === 0) return null;

  const duplicated = { ...scenario[0] };
  delete duplicated.id;
  delete duplicated.created_date;
  delete duplicated.updated_date;
  duplicated.name = `${duplicated.name} (Copy)`;

  return await base44.entities.SimulationScenario.create(duplicated);
}

export async function saveScenario(scenarioId, updates) {
  return await base44.entities.SimulationScenario.update(scenarioId, updates);
}

export async function getScenarios(userEmail) {
  return await base44.entities.SimulationScenario.filter({ user_email: userEmail });
}

export async function deleteScenario(scenarioId) {
  return await base44.entities.SimulationScenario.filter({ id: scenarioId }).then(result => {
    if (result.length > 0) {
      // Mark as deleted rather than physical delete
      return base44.entities.SimulationScenario.update(scenarioId, { status: 'archived' });
    }
  });
}