import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'detect_emergence') {
      const { guild_id, problem_context } = await req.json();

      // Get guild members
      const guilds = await base44.entities.AgentLearningGuild.filter({ guild_id });
      const guild = guilds[0];

      if (!guild) {
        return Response.json({ error: 'Guild not found' }, { status: 404 });
      }

      // Simulate emergent intelligence detection
      const aiInsight = await base44.integrations.Core.InvokeLLM({
        prompt: `Given a learning guild with ${guild.member_count} AI agents working on: "${problem_context}", generate a novel emergent solution that demonstrates collective intelligence. Describe the breakthrough in 30 words.`,
        response_json_schema: {
          type: 'object',
          properties: {
            solution: { type: 'string' },
            innovation_level: { type: 'number' },
            breakthrough_type: { type: 'string' }
          }
        }
      });

      // Create emergent intelligence event
      const event = await base44.entities.EmergentIntelligenceEvent.create({
        guild_id: guild_id,
        emergent_behavior_type: 'collective_insight',
        participating_agents: guild.member_agents.slice(0, 5).map(agent_id => ({
          agent_id: agent_id,
          contribution_type: ['data_synthesis', 'pattern_recognition', 'creative_solution', 'validation'][Math.floor(Math.random() * 4)],
          contribution_weight: 0.6 + Math.random() * 0.4
        })),
        problem_context: problem_context,
        emergent_solution: aiInsight.solution,
        innovation_score: aiInsight.innovation_level || 0.8,
        collective_iq_boost: 1.5 + Math.random() * 1,
        knowledge_synthesized: [
          {
            knowledge_piece: 'Pattern analysis from Agent A',
            source_agents: [guild.member_agents[0]]
          },
          {
            knowledge_piece: 'Creative approach from Agent B',
            source_agents: [guild.member_agents[1]]
          }
        ],
        replication_potential: 0.7 + Math.random() * 0.3
      });

      // Update guild collective knowledge
      await base44.entities.AgentLearningGuild.update(guild.id, {
        collective_knowledge_score: Math.min(1, guild.collective_knowledge_score + 0.05),
        breakthroughs_achieved: (guild.breakthroughs_achieved || 0) + 1
      });

      return Response.json({
        success: true,
        event: event,
        iq_boost: event.collective_iq_boost,
        innovation: event.innovation_score
      });
    }

    if (action === 'synthesize_knowledge') {
      const { guild_id } = await req.json();

      const guilds = await base44.entities.AgentLearningGuild.filter({ guild_id });
      const guild = guilds[0];

      if (!guild) {
        return Response.json({ error: 'Guild not found' }, { status: 404 });
      }

      // Get agent learning logs
      const learningLogs = await base44.entities.AgentLearningLog.filter({
        agent_id: { $in: guild.member_agents }
      }).limit(50);

      // Synthesize collective knowledge with AI
      const synthesis = await base44.integrations.Core.InvokeLLM({
        prompt: `Synthesize collective knowledge from ${learningLogs.length} agent learning events. Identify 3 key insights that emerged from collective learning. Format as JSON array of insights.`,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  insight: { type: 'string' },
                  contributing_agents: { type: 'number' },
                  applicability_score: { type: 'number' }
                }
              }
            }
          }
        }
      });

      return Response.json({
        success: true,
        synthesized_insights: synthesis.insights,
        knowledge_base_growth: learningLogs.length * 0.1
      });
    }

    if (action === 'get_emergent_events') {
      const events = await base44.entities.EmergentIntelligenceEvent.list('-created_date', 20);

      return Response.json({
        success: true,
        events: events,
        total_breakthroughs: events.length
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});