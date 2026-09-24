import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { mission_id, requirements } = await req.json();

        // Fetch available agents
        const agents = await base44.entities.Agent.filter({ status: 'idle' });

        // Score agents based on requirements
        const scoredAgents = agents.map(agent => {
            let score = 0;
            if (requirements.skills) {
                const matchCount = agent.skills?.filter(skill => requirements.skills.includes(skill)).length || 0;
                score += matchCount * 10;
            }
            score += (agent.level || 1) * 5;
            return { agent, score };
        });

        // Sort and pick top 3
        const optimalAssignments = scoredAgents
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.agent);

        return Response.json({ suggestions: optimalAssignments });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});