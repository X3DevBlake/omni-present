import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agentId, feedbackData } = await req.json();

        const agent = await base44.entities.Agent.get(agentId);
        if (!agent) {
             return Response.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Analyze interaction logs (mocked for this function, in real app would fetch from logs)
        const recentInteractions = await base44.entities.AgentInteractionLog.list({ 
            limit: 20, 
            sort: { timestamp: -1 },
            filter: { agent_id: agentId }
        });

        // Determine learning needs
        const recommendations = [];
        
        // Logic: If negative feedback in marketplace
        if (feedbackData && feedbackData.rating < 3) {
            recommendations.push({
                type: "MICRO_MODULE",
                title: "Customer Service Empathy Refinement",
                reason: "Recent negative marketplace feedback detected.",
                priority: "HIGH"
            });
        }

        // Logic: If failed negotiations
        const failedNegotiations = recentInteractions.filter(i => i.interaction_type === 'negotiation' && i.outcome === 'failed');
        if (failedNegotiations.length > 2) {
             recommendations.push({
                type: "SIMULATION_CHALLENGE",
                title: "High-Stakes Negotiation Simulator v4",
                reason: "Repeated negotiation failures in logs.",
                priority: "MEDIUM"
            });
        }

        // Logic: Specialization progression
        const currentSpecialization = agent.specialization || 'Generalist';
        recommendations.push({
            type: "COMPETITIVE_TASK",
            title: `${currentSpecialization} Mastery Gauntlet`,
            reason: "To advance to next mastery tier.",
            priority: "LOW"
        });

        return Response.json({
            agent_id: agentId,
            learning_path_update: {
                recommendations,
                progression_tracker: {
                    current_level: agent.level,
                    xp_to_next: 1000 - (agent.experience % 1000),
                    specialization_tier: "Adept", // Mocked
                    visual_data: {
                        nodes_unlocked: 12,
                        total_nodes: 50,
                        path_color: "#8b5cf6"
                    }
                }
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});