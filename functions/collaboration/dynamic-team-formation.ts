export default async function dynamicTeamFormation(request, context) {
  const { taskObjective, enableAutonomous } = request.body;

  const geminiKey = context.secrets.GEMINI_API_KEY;
  
  if (!geminiKey) {
    return { statusCode: 400, body: { error: 'GEMINI_API_KEY required' } };
  }

  try {
    // Fetch available agents
    const agents = await context.entities.Agent.list();
    const agentSkills = await context.entities.AgentSkill.list();

    // Use Gemini to analyze task and suggest team
    const analysisPrompt = `Analyze this task and suggest the optimal team of agents:

Task: ${taskObjective}

Available Agents:
${agents.map(a => `- ${a.name} (ID: ${a.id})`).join('\n')}

Agent Skills:
${agentSkills.map(s => `- Agent ${s.agent_id}: ${s.skill_name} (${s.proficiency_level}%)`).join('\n')}

Suggest:
1. Which 3-5 agents should form a team
2. Why each agent was chosen
3. Predicted collaboration score (0-100)
4. Team name

Format as JSON: {"agent_ids": [], "reasoning": "", "score": 0, "team_name": ""}`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    let teamSuggestion;
    try {
      teamSuggestion = JSON.parse(responseText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    } catch {
      teamSuggestion = {
        agent_ids: agents.slice(0, 3).map(a => a.id),
        reasoning: 'Default team formation',
        score: 70,
        team_name: 'Task Force Alpha'
      };
    }

    // Create the dynamic team
    const team = await context.entities.DynamicTeam.create({
      user_email: context.user.email,
      team_name: teamSuggestion.team_name,
      agent_ids: teamSuggestion.agent_ids,
      formation_reason: teamSuggestion.reasoning,
      task_objective: taskObjective,
      autonomous: enableAutonomous || false,
      collaboration_score: teamSuggestion.score,
      status: 'active'
    });

    // Send to Zapier
    if (context.secrets.ZAPIER_WEBHOOK_URL) {
      await fetch(`${context.baseUrl}/api/functions/zapier-relay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'dynamic_team_formed',
          agent_id: 'team_coordinator',
          agent_name: 'Team Coordinator',
          user_email: context.user.email,
          data: {
            team_name: team.team_name,
            team_id: team.id,
            agent_count: teamSuggestion.agent_ids.length,
            collaboration_score: teamSuggestion.score,
            task: taskObjective,
            autonomous: enableAutonomous
          }
        })
      }).catch(() => {});
    }

    return {
      statusCode: 200,
      body: {
        team,
        aiAnalysis: teamSuggestion,
        selectedAgents: agents.filter(a => teamSuggestion.agent_ids.includes(a.id))
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}