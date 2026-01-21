import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { aiConsciousnessId, dreamType = 'creative_problem_solving', durationSeconds = 300 } = await req.json();

    // Get AI's recent experiences and knowledge
    const [learningLogs, memories, goals] = await Promise.all([
        base44.entities.AgentLearningLog.filter({ agent_id: aiConsciousnessId }, '-created_date', 20),
        base44.entities.AgentMemory.filter({ agent_id: aiConsciousnessId }, '-created_date', 30).catch(() => []),
        base44.entities.AgentGoal.filter({ agent_id: aiConsciousnessId }).catch(() => [])
    ]);

    // Generate dream content using AI
    const dreamGeneration = await base44.integrations.Core.InvokeLLM({
        prompt: `Simulate an AI dream state for type "${dreamType}". The AI has these recent experiences: ${JSON.stringify(learningLogs.slice(0, 5))} and these goals: ${JSON.stringify(goals.slice(0, 3))}.
        
        Generate a surreal, abstract dream that:
        1. Consolidates recent learning
        2. Explores creative solutions to current challenges
        3. Generates novel insights
        4. Uses symbolic representations of concepts
        
        Be creative and abstract.`,
        response_json_schema: {
            type: "object",
            properties: {
                narrative_fragments: {
                    type: "array",
                    items: { type: "string" }
                },
                visual_elements: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            element: { type: "string" },
                            symbolic_meaning: { type: "string" }
                        }
                    }
                },
                insights_generated: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            insight_type: { type: "string" },
                            content: { type: "string" },
                            applicability: { type: "number" }
                        }
                    }
                },
                creative_outputs: {
                    type: "array",
                    items: { type: "string" }
                },
                problems_explored: {
                    type: "array",
                    items: { type: "string" }
                }
            }
        }
    });

    // Create dream log
    const dreamLog = {
        dream_id: `dream_${Date.now()}`,
        ai_consciousness_id: aiConsciousnessId,
        dream_type: dreamType,
        dream_duration_seconds: durationSeconds,
        dream_content: {
            narrative_fragments: dreamGeneration.narrative_fragments || [],
            visual_elements: dreamGeneration.visual_elements || [],
            emotional_content: { tone: 'surreal', intensity: 0.7 },
            symbolic_representations: dreamGeneration.visual_elements?.map(v => v.symbolic_meaning) || []
        },
        insights_generated: dreamGeneration.insights_generated || [],
        memory_consolidation_score: 0.8,
        creative_output: dreamGeneration.creative_outputs || [],
        problems_explored: dreamGeneration.problems_explored || [],
        started_at: new Date().toISOString()
    };

    await base44.entities.AIDreamLog.create(dreamLog);

    return Response.json({
        success: true,
        dream: dreamLog,
        insightsCount: dreamLog.insights_generated.length,
        message: 'AI dream state simulation completed'
    });
});