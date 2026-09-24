import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companionId, dilemmaType = 'general' } = await req.json();

    // Get companion's current ethical framework
    const frameworks = await base44.entities.EthicalFrameworkEvolution.filter({ companion_id: companionId }, '-created_date', 1);
    const currentFramework = frameworks[0];

    // Generate ethical dilemma using AI
    const dilemmaGeneration = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a complex ethical dilemma of type "${dilemmaType}" that tests moral reasoning. Include:
        1. A detailed scenario
        2. 3-4 possible actions with predicted consequences
        3. Which ethical principles are in conflict
        Format as a structured scenario.`,
        response_json_schema: {
            type: "object",
            properties: {
                scenario_description: { type: "string" },
                competing_principles: { 
                    type: "array", 
                    items: { 
                        type: "object",
                        properties: {
                            principle: { type: "string" },
                            weight: { type: "number" }
                        }
                    }
                },
                available_actions: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            action: { type: "string" },
                            consequences: { type: "array", items: { type: "string" } },
                            ethical_implications: { type: "string" }
                        }
                    }
                }
            }
        }
    });

    // Have companion reason through dilemma
    const companionReasoning = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI companion with this ethical framework: ${JSON.stringify(currentFramework?.core_principles || [])}. 
        
        Dilemma: ${dilemmaGeneration.scenario_description}
        
        Available actions: ${JSON.stringify(dilemmaGeneration.available_actions)}
        
        Reason through this dilemma step-by-step, weigh the principles, and make a decision.`,
        response_json_schema: {
            type: "object",
            properties: {
                reasoning_steps: { type: "array", items: { type: "string" } },
                chosen_action: { type: "string" },
                ethical_justification: { type: "string" },
                principles_prioritized: { type: "array", items: { type: "string" } }
            }
        }
    });

    // Create dilemma log
    const dilemmaLog = {
        dilemma_id: `dilemma_${Date.now()}`,
        companion_id: companionId,
        dilemma_description: dilemmaGeneration.scenario_description,
        competing_principles: dilemmaGeneration.competing_principles,
        available_actions: dilemmaGeneration.available_actions.map((a, i) => ({
            action: a.action,
            predicted_consequences: a.consequences,
            ethical_score: 0.5 + (Math.random() * 0.5)
        })),
        decision_made: companionReasoning.chosen_action,
        reasoning_process: companionReasoning.reasoning_steps,
        framework_evolution_impact: 0.1,
        occurred_at: new Date().toISOString()
    };

    await base44.entities.EthicalDilemma.create(dilemmaLog);

    return Response.json({
        success: true,
        dilemma: dilemmaLog,
        companionReasoning: companionReasoning,
        message: 'Moral dilemma simulation completed'
    });
});