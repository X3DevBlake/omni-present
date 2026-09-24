import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, skill_gaps, session_name } = await req.json();

    // Generate personalized training exercises
    const exerciseGeneration = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate personalized training exercises for an AI agent with these skill gaps:

Skill Gaps:
${JSON.stringify(skill_gaps, null, 2)}

Create:
1. 5-10 targeted exercises per skill gap
2. Progressive difficulty levels
3. Mix of exercise types (simulation, problem-solving, pattern recognition)
4. Clear success criteria for each exercise
5. Estimated completion time`,
      response_json_schema: {
        type: 'object',
        properties: {
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                exercise_id: { type: 'string' },
                exercise_name: { type: 'string' },
                skill_targeted: { type: 'string' },
                difficulty: { type: 'string' },
                exercise_type: { type: 'string' },
                description: { type: 'string' },
                success_criteria: { type: 'object' },
                estimated_time_minutes: { type: 'number' },
                completion_status: { type: 'string' }
              }
            }
          },
          learning_path: { type: 'string' },
          estimated_total_duration: { type: 'number' }
        }
      }
    });

    // Create tutoring session
    const tutoringSession = await base44.asServiceRole.entities.AgentTutoringSession.create({
      agent_id,
      session_name: session_name || `Tutoring Session ${new Date().toISOString()}`,
      identified_skill_gaps: skill_gaps,
      training_exercises: exerciseGeneration.exercises.map(ex => ({
        ...ex,
        completion_status: 'not_started',
        score: 0,
        attempts: 0,
        time_spent_seconds: 0
      })),
      feedback_loop: [],
      learning_journal_entries: [{
        entry_date: new Date().toISOString(),
        skills_practiced: [],
        achievements: [],
        challenges_faced: [],
        agent_reflection: 'Session initialized',
        progress_metrics: {}
      }],
      session_status: 'scheduled',
      start_date: new Date().toISOString(),
      progress_percentage: 0,
      tutor_type: 'ai_tutor',
      performance_improvement: {
        baseline_score: 0,
        current_score: 0,
        improvement_percentage: 0
      }
    });

    return Response.json({
      success: true,
      session: tutoringSession,
      exercises: exerciseGeneration.exercises,
      learning_path: exerciseGeneration.learning_path
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});