import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_path') {
      const { agent_id, learning_goal, current_level, target_level } = await req.json();

      // AI-generated curriculum
      const curriculum = await base44.integrations.Core.InvokeLLM({
        prompt: `Create an adaptive learning curriculum for an AI agent going from skill level ${current_level} to ${target_level} for: "${learning_goal}". Generate 8-12 learning modules with progressive difficulty.`,
        response_json_schema: {
          type: 'object',
          properties: {
            modules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  module_name: { type: 'string' },
                  difficulty: { type: 'number' },
                  estimated_hours: { type: 'number' }
                }
              }
            },
            learning_style: { type: 'string' }
          }
        }
      });

      const learningModules = curriculum.modules.map(m => ({
        module_name: m.module_name,
        difficulty: m.difficulty,
        completion_status: 'not_started',
        mastery_score: 0,
        time_spent_hours: 0
      }));

      const path = await base44.entities.AdaptiveLearningPath.create({
        agent_id: agent_id,
        user_id: user.id,
        learning_goal: learning_goal,
        current_level: current_level,
        target_level: target_level,
        learning_modules: learningModules,
        ai_personalization: {
          learning_style: curriculum.learning_style,
          pace_preference: 'adaptive',
          content_difficulty_adjustment: 0,
          focus_areas: [learning_goal]
        },
        progress_metrics: {
          completion_percent: 0,
          retention_rate: 0.85,
          application_success_rate: 0,
          learning_efficiency: 0.8
        },
        adaptive_adjustments: [],
        skill_gaps_identified: [],
        predicted_completion_date: new Date(Date.now() + curriculum.modules.length * 3600000 * 10).toISOString(),
        path_status: 'active'
      });

      return Response.json({
        success: true,
        learning_path: path,
        total_modules: learningModules.length
      });
    }

    if (action === 'update_progress') {
      const { path_id, module_name, mastery_score, time_spent } = await req.json();

      const paths = await base44.entities.AdaptiveLearningPath.filter({ path_id });
      const path = paths[0];

      if (!path) {
        return Response.json({ error: 'Learning path not found' }, { status: 404 });
      }

      // Update module progress
      const updatedModules = path.learning_modules.map(m => {
        if (m.module_name === module_name) {
          return {
            ...m,
            mastery_score: mastery_score,
            time_spent_hours: (m.time_spent_hours || 0) + time_spent,
            completion_status: mastery_score >= 0.8 ? 'completed' : 
                             mastery_score >= 0.5 ? 'in_progress' : 
                             'not_started'
          };
        }
        return m;
      });

      const completedCount = updatedModules.filter(m => m.completion_status === 'completed').length;
      const completionPercent = (completedCount / updatedModules.length) * 100;

      // AI adaptive adjustment
      let adjustments = [...path.adaptive_adjustments];
      if (mastery_score < 0.6) {
        adjustments.push({
          timestamp: new Date().toISOString(),
          adjustment_type: 'difficulty_reduction',
          reason: 'Low mastery score detected',
          impact: -0.1
        });
      }

      await base44.entities.AdaptiveLearningPath.update(path.id, {
        learning_modules: updatedModules,
        progress_metrics: {
          completion_percent: completionPercent,
          retention_rate: 0.8 + Math.random() * 0.2,
          application_success_rate: mastery_score,
          learning_efficiency: 0.75 + Math.random() * 0.25
        },
        adaptive_adjustments: adjustments,
        path_status: completionPercent >= 100 ? 'completed' : 'active'
      });

      return Response.json({
        success: true,
        completion_percent: completionPercent,
        modules_completed: completedCount
      });
    }

    if (action === 'identify_skill_gaps') {
      const { path_id } = await req.json();

      const paths = await base44.entities.AdaptiveLearningPath.filter({ path_id });
      const path = paths[0];

      if (!path) {
        return Response.json({ error: 'Learning path not found' }, { status: 404 });
      }

      // AI skill gap analysis
      const gapAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze learning progress for goal "${path.learning_goal}". Current level: ${path.current_level}, Target: ${path.target_level}. Identify 3-5 critical skill gaps that need focus.`,
        response_json_schema: {
          type: 'object',
          properties: {
            skill_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  gap_size: { type: 'number' },
                  priority: { type: 'string' }
                }
              }
            }
          }
        }
      });

      await base44.entities.AdaptiveLearningPath.update(path.id, {
        skill_gaps_identified: gapAnalysis.skill_gaps
      });

      return Response.json({
        success: true,
        skill_gaps: gapAnalysis.skill_gaps
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});