import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, analysis_type = 'comprehensive' } = await req.json();

    // Fetch all learning-related data for the agent
    const [feedbacks, thoughts, skills, memories, goals, knowledge] = await Promise.all([
      base44.asServiceRole.entities.AgentLearningFeedback.filter({ agent_id }),
      base44.asServiceRole.entities.AgentThoughtProcess.filter({ agent_id }),
      base44.asServiceRole.entities.AgentSkill.filter({ agent_id }),
      base44.asServiceRole.entities.AgentMemory.filter({ agent_id }),
      base44.asServiceRole.entities.AgentGoal.filter({ agent_id }),
      base44.asServiceRole.entities.AgentKnowledge.filter({ agent_id })
    ]);

    // Calculate learning metrics
    const totalFeedbacks = feedbacks.length;
    const successRate = feedbacks.filter(f => f.outcome_data?.success).length / (totalFeedbacks || 1);
    const totalPatternsLearned = feedbacks.reduce((sum, f) => sum + (f.learned_patterns?.length || 0), 0);
    const totalAdjustments = feedbacks.reduce((sum, f) => sum + (f.behavioral_adjustments?.length || 0), 0);

    // Calculate confidence progression
    const confidenceOverTime = thoughts
      .filter(t => t.confidence_level !== undefined)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(t => ({
        timestamp: t.timestamp,
        confidence: t.confidence_level,
        thought_type: t.thought_type
      }));

    // Skill acquisition timeline
    const skillTimeline = skills.map(s => ({
      skill_name: s.skill_name,
      current_level: s.current_level,
      xp_progress: s.xp_progress,
      acquired_at: s.created_date,
      practice_hours: s.practice_hours || 0
    }));

    // Thought process graph (causal links)
    const thoughtGraph = {
      nodes: thoughts.slice(0, 30).map(t => ({
        id: t.thought_id,
        type: t.thought_type,
        content: t.thought_content?.main_thought,
        confidence: t.confidence_level,
        timestamp: t.timestamp
      })),
      edges: [] // Build causal connections based on related_entities
    };

    thoughts.forEach(thought => {
      thought.related_entities?.forEach(rel => {
        const targetThought = thoughts.find(t => t.thought_id === rel.entity_id);
        if (targetThought) {
          thoughtGraph.edges.push({
            from: thought.thought_id,
            to: targetThought.thought_id,
            relationship: rel.relationship
          });
        }
      });
    });

    // Learning efficiency score
    const learningEfficiency = {
      patterns_per_feedback: totalPatternsLearned / (totalFeedbacks || 1),
      adjustments_per_feedback: totalAdjustments / (totalFeedbacks || 1),
      success_improvement_rate: successRate,
      avg_confidence: confidenceOverTime.reduce((sum, c) => sum + c.confidence, 0) / (confidenceOverTime.length || 1)
    };

    // Knowledge growth trajectory
    const knowledgeGrowth = knowledge.map(k => ({
      topic: k.knowledge_topic,
      confidence: k.confidence_score,
      source: k.knowledge_source,
      acquired_at: k.created_date
    }));

    return Response.json({
      success: true,
      agent_id,
      learning_metrics: {
        total_feedbacks: totalFeedbacks,
        success_rate: successRate,
        patterns_learned: totalPatternsLearned,
        behavioral_adjustments: totalAdjustments,
        active_skills: skills.length,
        total_memories: memories.length,
        knowledge_items: knowledge.length
      },
      confidence_progression: confidenceOverTime,
      skill_timeline: skillTimeline,
      thought_graph: thoughtGraph,
      learning_efficiency: learningEfficiency,
      knowledge_growth: knowledgeGrowth,
      recent_thoughts: thoughts.slice(0, 10).map(t => ({
        type: t.thought_type,
        content: t.thought_content?.main_thought,
        confidence: t.confidence_level,
        timestamp: t.timestamp
      }))
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});