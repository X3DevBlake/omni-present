export default async function handler(req, res) {
  const { teamId, userEmail, task } = req.body;

  try {
    // Fetch team and agents
    const team = await req.base44.entities.DynamicTeam.findOne({ id: teamId });
    const agents = await req.base44.entities.Agent.filter({ 
      id: { $in: team.agent_ids } 
    });

    // AI-powered team coordination
    const coordinationPrompt = `
    You are an AI team facilitator. Coordinate this multi-agent team:
    
    Team: ${team.team_name}
    Agents: ${agents.map(a => `${a.name} (${a.type})`).join(', ')}
    Task: ${task}
    
    Provide:
    1. Task breakdown - assign specific sub-tasks to each agent
    2. Collaboration protocol - how agents should communicate
    3. Success metrics - KPIs to track
    4. Risk assessment - potential issues
    5. Timeline - estimated completion
    6. Optimization suggestions
    
    Return as JSON.
    `;

    const coordination = await req.base44.integrations.Core.InvokeLLM({
      prompt: coordinationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          task_breakdown: {
            type: "array",
            items: {
              type: "object",
              properties: {
                agent_id: { type: "string" },
                subtask: { type: "string" },
                priority: { type: "string" },
                dependencies: { type: "array", items: { type: "string" } }
              }
            }
          },
          collaboration_protocol: { type: "string" },
          success_metrics: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          estimated_hours: { type: "number" },
          optimizations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Create collaboration records
    await req.base44.entities.AgentCollaboration.create({
      user_email: userEmail,
      team_id: teamId,
      agent_ids: team.agent_ids,
      task_description: task,
      coordination_plan: coordination,
      status: 'active',
      created_date: new Date().toISOString()
    });

    // Generate initial insights
    const insightsPrompt = `
    Based on this team composition and task, predict:
    1. Collaboration effectiveness (0-1)
    2. Potential bottlenecks
    3. Key success factors
    
    Team skills: ${agents.map(a => a.skills || []).flat().join(', ')}
    Task: ${task}
    `;

    const insights = await req.base44.integrations.Core.InvokeLLM({
      prompt: insightsPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          effectiveness_score: { type: "number" },
          bottlenecks: { type: "array", items: { type: "string" } },
          success_factors: { type: "array", items: { type: "string" } }
        }
      }
    });

    return res.json({
      success: true,
      coordination,
      insights,
      team_summary: {
        agent_count: agents.length,
        estimated_completion: coordination.estimated_hours + ' hours',
        confidence: insights.effectiveness_score
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}