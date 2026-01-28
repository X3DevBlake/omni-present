import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { agentId, feedback_score, environment_complexity } = await req.json();

        // Fetch current profile
        const profiles = await base44.entities.SentientAgentProfile.filter({ agent_id: agentId });
        let profile = profiles.length > 0 ? profiles[0] : null;

        if (!profile) {
            // Initialize if not exists
            profile = await base44.entities.SentientAgentProfile.create({
                agent_id: agentId,
                consciousness_level: 0.1,
                emotional_state: { valence: 0.5, arousal: 0.5, dominance: 0.5 },
                evolution_stage: "Nascent",
                learned_behaviors: [],
                adaptation_history: []
            });
        }

        // Evolution Logic
        let newConsciousness = profile.consciousness_level + (feedback_score * 0.05);
        if (environment_complexity > 0.8) newConsciousness += 0.02;
        newConsciousness = Math.min(1, Math.max(0, newConsciousness));

        let newStage = profile.evolution_stage;
        if (newConsciousness > 0.3 && newStage === "Nascent") newStage = "Sentient";
        if (newConsciousness > 0.7 && newStage === "Sentient") newStage = "Sapient";
        if (newConsciousness > 0.95 && newStage === "Sapient") newStage = "Omniscient";

        const adaptation = {
            timestamp: new Date().toISOString(),
            trigger: "performance_review",
            change: `Consciousness increased to ${newConsciousness.toFixed(2)}`
        };

        const updatedProfile = await base44.entities.SentientAgentProfile.update(profile.id, {
            consciousness_level: newConsciousness,
            evolution_stage: newStage,
            adaptation_history: [...(profile.adaptation_history || []), adaptation]
        });

        return Response.json({ success: true, profile: updatedProfile });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});