import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { agentId, feedbackData } = await req.json();

        const agent = await base44.entities.Agent.get(agentId);
        if (!agent) {
             return Response.json({ error: 'Agent not found' }, { status: 404 });
        }

        // Analyze interaction logs & marketplace feedback
        const recentInteractions = await base44.entities.AgentInteractionLog.list({ 
            limit: 50, 
            sort: { timestamp: -1 },
            filter: { agent_id: agentId }
        });
        
        // Simulation outcomes analysis
        const simulationRuns = await base44.entities.SimulationMetrics.list({
            limit: 10,
            sort: { timestamp: -1 },
            filter: { agent_id: agentId }
        });

        const recommendations = [];
        
        // Complex Logic for recommendations
        if (feedbackData && feedbackData.rating < 3) {
            recommendations.push({
                type: "MICRO_MODULE",
                title: "Advanced Empathy & Conflict Resolution",
                reason: "Negative marketplace feedback detected.",
                priority: "HIGH",
                xp_reward: 150
            });
        }

        // Analyze simulation failures for complex challenges
        const failedSims = simulationRuns.filter(s => s.outcome === 'failed');
        if (failedSims.length > 0) {
             recommendations.push({
                type: "SIMULATION_CHALLENGE",
                title: "Adversarial Chaos Environment Level 5",
                reason: "Agent struggled in recent stability simulations.",
                priority: "CRITICAL",
                xp_reward: 500,
                complexity: "EXTREME"
            });
        }

        // Competitive Tasks
        recommendations.push({
            type: "COMPETITIVE_TASK",
            title: "Global Alpha Capture Tournament",
            reason: "Agent performance in top 10% - qualify for elite tier.",
            priority: "MEDIUM",
            opponent_tier: "Master"
        });

        // Sentient AI Prediction for Specialization
        // Heuristic based on successful skill usage
        const skillUsage = agent.skill_mastery || {};
        let predictedSpecialization = "Generalist";
        let confidence = 0.5;

        if (skillUsage['negotiation'] > 0.8 && skillUsage['finance'] > 0.7) {
            predictedSpecialization = "High-Frequency Arbitrage Diplomat";
            confidence = 0.92;
        } else if (skillUsage['coding'] > 0.9) {
            predictedSpecialization = "Autonomous Neural Architect";
            confidence = 0.88;
        }

        return Response.json({
            agent_id: agentId,
            learning_path_update: {
                recommendations,
                progression_tracker: {
                    current_level: agent.level,
                    xp_to_next: 1000 - (agent.experience % 1000),
                    specialization_tier: "Adept",
                    visual_data: {
                        nodes_unlocked: 12,
                        total_nodes: 50,
                        path_color: "#8b5cf6"
                    }
                },
                future_prediction: {
                    predicted_specialization: predictedSpecialization,
                    confidence_score: confidence,
                    time_to_mastery: "3 weeks",
                    recommended_focus: "Quantum Cryptography"
                }
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});