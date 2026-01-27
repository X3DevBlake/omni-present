import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scenarioId, agentIds } = await req.json();

    // In a real system, this would trigger a heavy compute job or external sim engine
    // Here we simulate the outcome based on scenario difficulty vs agent stats (mocked)

    const scenario = await base44.entities.SimulationScenario.get(scenarioId);
    
    const steps = [];
    const interactions = 20;
    let accumulatedDamage = 0;
    let objectivesMet = 0;

    for (let i = 0; i < interactions; i++) {
        const threatRoll = Math.random();
        const defenseRoll = Math.random() + (0.2); // Agents have base competency
        
        const event = {
            step: i,
            timestamp: new Date().toISOString(),
            threat_action: threatRoll > 0.7 ? "Adversarial Attack" : "Environmental Shift",
            agent_response: defenseRoll > threatRoll ? "Counter-measure Successful" : "Defense Breached",
            impact: defenseRoll > threatRoll ? "None" : "System Integrity -5%"
        };
        
        if (defenseRoll <= threatRoll) accumulatedDamage += 5;
        else objectivesMet++;
        
        steps.push(event);
    }

    const outcome = accumulatedDamage > 50 ? "Failed" : "Success";
    const score = Math.max(0, 100 - accumulatedDamage);

    return Response.json({ 
        success: true, 
        result: {
            outcome,
            score,
            damage_sustained: accumulatedDamage,
            simulation_log: steps,
            scenario_name: scenario.name
        }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});