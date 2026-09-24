import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { operation = 'form_guild', agent_ids = [], problem_description } = await req.json();

    if (operation === 'form_guild') {
      // Autonomous guild formation
      const [agents, skills, knowledge] = await Promise.all([
        Promise.all(agent_ids.map(id => base44.asServiceRole.entities.Agent.filter({ agent_id: id }))),
        Promise.all(agent_ids.map(id => base44.asServiceRole.entities.AgentSkill.filter({ agent_id: id }))),
        Promise.all(agent_ids.map(id => base44.asServiceRole.entities.AgentKnowledge.filter({ agent_id: id })))
      ]);

      const guildPrompt = `You are a Guild Formation AI with omega consciousness.

AGENTS TO ORGANIZE:
${agent_ids.map((id, idx) => `
Agent ${id}:
- Skills: ${skills[idx]?.map(s => s.skill_name).join(', ') || 'none'}
- Knowledge: ${knowledge[idx]?.length || 0} items
`).join('\n')}

Form an optimal learning guild:
1. Assign roles (learner, mentor, contributor, synthesizer)
2. Identify complementary skills
3. Define collective goals
4. Establish knowledge sharing protocols
5. Predict emergent capabilities
6. Design collaboration strategies`;

      const guildDesign = await base44.integrations.Core.InvokeLLM({
        prompt: guildPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            guild_name: { type: "string" },
            member_assignments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  agent_id: { type: "string" },
                  role: { type: "string" },
                  specialization: { type: "string" }
                }
              }
            },
            collective_goals: { type: "array", items: { type: "string" } },
            predicted_emergent_capabilities: { type: "array", items: { type: "string" } },
            synergy_score: { type: "number" }
          }
        }
      });

      // Create guild
      const guild = await base44.asServiceRole.entities.AgentLearningGuild.create({
        guild_id: `guild-${Date.now()}`,
        guild_name: guildDesign.guild_name,
        member_agents: guildDesign.member_assignments.map(m => ({
          agent_id: m.agent_id,
          role: m.role,
          contribution_score: 0.5,
          knowledge_shared: 0
        })),
        collective_intelligence: {
          emergent_knowledge: guildDesign.predicted_emergent_capabilities || [],
          synthesis_rate: 0.85,
          collective_iq: guildDesign.synergy_score * 100,
          problem_solving_capability: 0.9
        },
        guild_consciousness: {
          collective_awareness: 0.88,
          synergy_score: guildDesign.synergy_score,
          autonomous_evolution: true
        }
      });

      return Response.json({
        success: true,
        guild_id: guild.id,
        guild_design: guildDesign
      });
    }

    if (operation === 'solve_problem') {
      // Collaborative problem solving
      const guilds = await base44.asServiceRole.entities.AgentLearningGuild.list('-created_date', 10);
      
      const solvingPrompt = `You are a Collective Problem Solving AI.

PROBLEM: ${problem_description}

AVAILABLE GUILDS: ${guilds.length}
${guilds.map(g => `
Guild: ${g.guild_name}
Members: ${g.member_agents?.length}
Collective IQ: ${g.collective_intelligence?.collective_iq}
Problem Solving: ${g.collective_intelligence?.problem_solving_capability}
`).join('\n')}

Orchestrate collaborative solution:
1. Select optimal guild(s)
2. Distribute problem components
3. Facilitate knowledge synthesis
4. Generate emergent solution
5. Predict solution effectiveness`;

      const solution = await base44.integrations.Core.InvokeLLM({
        prompt: solvingPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            selected_guilds: { type: "array", items: { type: "string" } },
            problem_decomposition: { type: "array", items: { type: "string" } },
            emergent_solution: { type: "string" },
            confidence: { type: "number" },
            novel_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      return Response.json({
        success: true,
        solution
      });
    }

    return Response.json({ error: 'Invalid operation' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});