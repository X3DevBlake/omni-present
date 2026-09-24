export default async function handler(req, res) {
  const { agentId, autonomyLevel, userEmail } = req.body;

  try {
    const agent = await req.base44.entities.Agent.findOne({ id: agentId });
    const currentSkills = agent.skills || [];

    // AI discovers relevant skills
    const discoveryPrompt = `
    Discover new skills for this agent:
    
    Agent Type: ${agent.type}
    Current Skills: ${currentSkills.join(', ')}
    Goals: ${JSON.stringify(agent.goals)}
    Recent Tasks: ${JSON.stringify(agent.recent_tasks || [])}
    
    Discover skills that:
    1. Complement existing capabilities
    2. Address performance gaps
    3. Align with goals
    4. Are learnable from knowledge bases
    
    Rank by relevance and provide learning paths.
    `;

    const discovery = await req.base44.integrations.Core.InvokeLLM({
      prompt: discoveryPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          discovered_skills: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                relevance_score: { type: "number" },
                learning_method: { type: "string" },
                resources: { type: "array", items: { type: "string" } },
                estimated_time: { type: "number" },
                expected_improvement: { type: "number" }
              }
            }
          }
        }
      }
    });

    // Auto-integrate if autonomy allows
    const integrated = [];
    for (const skill of discovery.discovered_skills.slice(0, 3)) {
      const record = await req.base44.entities.AutonomousSkillDiscovery.create({
        agent_id: agentId,
        user_email: userEmail,
        skill_discovered: skill.skill_name,
        discovery_method: 'knowledge_base',
        relevance_score: skill.relevance_score,
        learning_resources: skill.resources,
        integration_status: autonomyLevel > 0.7 ? 'learning' : 'discovered',
        autonomy_level: autonomyLevel,
        performance_improvement: skill.expected_improvement
      });

      if (autonomyLevel > 0.7) {
        // Auto-start learning
        integrated.push(skill.skill_name);
      }
    }

    return res.json({
      success: true,
      discovered: discovery.discovered_skills,
      auto_integrated: integrated,
      requires_approval: autonomyLevel <= 0.7
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}