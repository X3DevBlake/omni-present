export default async function handler(req, res) {
  const { agentId, taskRequirements, userEmail } = req.body;

  try {
    const agent = await req.base44.entities.Agent.findOne({ id: agentId });
    const currentSkills = agent.skills || [];

    // AI analyzes skill gap
    const analysisPrompt = `
    Agent Current Skills: ${currentSkills.join(', ')}
    Task Requirements: ${JSON.stringify(taskRequirements)}
    
    Identify:
    1. Missing skills needed for task
    2. How to acquire each skill (training data, examples, practice)
    3. Estimated training time
    4. Skill dependencies
    5. Alternative skills that could substitute
    
    Return as JSON with actionable learning plan.
    `;

    const skillAnalysis = await req.base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          missing_skills: { type: "array", items: { type: "string" } },
          learning_plan: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                acquisition_method: { type: "string" },
                training_examples: { type: "array", items: { type: "string" } },
                estimated_hours: { type: "number" },
                dependencies: { type: "array", items: { type: "string" } }
              }
            }
          },
          alternatives: { type: "array", items: { type: "string" } },
          readiness_score: { type: "number" }
        }
      }
    });

    // Generate synthetic training data for new skills
    const trainingData = [];
    for (const skill of skillAnalysis.missing_skills.slice(0, 3)) {
      const dataPrompt = `Generate 5 training examples for the skill: ${skill}. 
      Return as array of {input, expected_output, explanation} objects.`;
      
      const examples = await req.base44.integrations.Core.InvokeLLM({
        prompt: dataPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  input: { type: "string" },
                  expected_output: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      trainingData.push({ skill, examples: examples.examples });
    }

    // Create skill acquisition records
    for (const plan of skillAnalysis.learning_plan) {
      await req.base44.entities.AgentSkill.create({
        agent_id: agentId,
        user_email: userEmail,
        skill_name: plan.skill_name,
        proficiency: 0,
        acquisition_method: plan.acquisition_method,
        training_examples: trainingData.find(t => t.skill === plan.skill_name)?.examples || [],
        status: 'learning'
      });
    }

    return res.json({
      success: true,
      skill_analysis: skillAnalysis,
      training_data: trainingData,
      next_steps: skillAnalysis.learning_plan.map(p => p.skill_name)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}