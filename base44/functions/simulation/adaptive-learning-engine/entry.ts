export default async function handler(req, res) {
  const { agentId, performanceData, learningObjectives, userEmail } = req.body;

  try {
    // AI adapts learning path
    const adaptationPrompt = `
    Create adaptive learning path for agent:
    
    Current Performance: ${JSON.stringify(performanceData)}
    Learning Objectives: ${JSON.stringify(learningObjectives)}
    
    Adapt:
    1. Difficulty level
    2. Training scenarios
    3. Skill focus areas
    4. Practice frequency
    5. Assessment criteria
    
    Return personalized learning plan as JSON.
    `;

    const learningPlan = await req.base44.integrations.Core.InvokeLLM({
      prompt: adaptationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          difficulty_level: { type: "string" },
          training_scenarios: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                difficulty: { type: "number" },
                skills_trained: { type: "array", items: { type: "string" } },
                estimated_duration: { type: "number" }
              }
            }
          },
          focus_areas: { type: "array", items: { type: "string" } },
          practice_schedule: { type: "object" },
          assessment_frequency: { type: "string" },
          expected_improvement: { type: "number" }
        }
      }
    });

    // Create training sessions
    for (const scenario of learningPlan.training_scenarios) {
      await req.base44.entities.AgentTrainingSession.create({
        agent_id: agentId,
        user_email: userEmail,
        scenario_name: scenario.name,
        difficulty: scenario.difficulty,
        skills_targeted: scenario.skills_trained,
        status: 'scheduled'
      });
    }

    return res.json({
      success: true,
      learning_plan: learningPlan,
      sessions_created: learningPlan.training_scenarios.length
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}