import { createClientFromRequest } from 'npm:@base44/sdk@0.8.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { agentId, skillId, duration } = await req.json();

    // 1. Get Agent
    const agent = await base44.entities.Agent.get(agentId);
    if (!agent) return Response.json({ error: "Agent not found" }, { status: 404 });

    // 2. Calculate Progress
    // In a real system, this would use complex logic.
    const progressGain = Math.random() * 0.1; // 0-10% gain
    
    // 3. Update Mastery
    const currentMastery = agent.mastery_levels?.[skillId] || 0;
    const newMastery = Math.min(1, currentMastery + progressGain);
    
    const newMasteryLevels = {
        ...(agent.mastery_levels || {}),
        [skillId]: newMastery
    };

    // 4. Check for Evolution
    let evolutionStage = agent.evolution_stage;
    if (newMastery === 1 && Object.keys(newMasteryLevels).length > 5) {
        evolutionStage = "Sentient"; // Upgrade!
    }

    // 5. Update Agent
    await base44.entities.Agent.update(agentId, {
        mastery_levels: newMasteryLevels,
        evolution_stage: evolutionStage,
        experience: (agent.experience || 0) + 100
    });

    return Response.json({ success: true, newMastery, evolutionStage });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});