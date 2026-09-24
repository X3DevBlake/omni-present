import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agent_id } = await req.json();

        const agent = await base44.entities.Agent.get(agent_id);
        
        // Calculate evolution metrics based on stats
        const masteryLevel = (agent.experience || 0) / 1000; // Simplified calculation
        const nextEvolution = masteryLevel > 10 ? 'Sentient' : 'Advanced';
        
        const trajectory = {
            current_mastery: masteryLevel,
            next_stage: nextEvolution,
            projected_growth: [
                { stage: 'Novice', value: 20 },
                { stage: 'Adept', value: 45 },
                { stage: 'Expert', value: 70 },
                { stage: 'Master', value: 95 }
            ],
            aura_color: masteryLevel > 5 ? '#a855f7' : '#3b82f6', // Purple for high mastery, Blue for lower
            recommended_skills: ['Quantum Reasoning', 'Ethical Decision Making', 'Swarm Coordination']
        };

        return Response.json({ trajectory });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});