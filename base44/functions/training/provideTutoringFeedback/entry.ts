import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, exercise_id, performance_data } = await req.json();

    // Get tutoring session
    const session = await base44.asServiceRole.entities.AgentTutoringSession.filter(
      { id: session_id },
      '',
      1
    );
    const sessionData = session[0];

    // Find the exercise
    const exercise = sessionData.training_exercises?.find(ex => ex.exercise_id === exercise_id);

    // Generate AI feedback
    const feedback = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Provide tutoring feedback for an agent's exercise performance:

Exercise: ${JSON.stringify(exercise, null, 2)}
Performance Data: ${JSON.stringify(performance_data, null, 2)}

Provide:
1. Performance score (0-100)
2. Specific feedback on strengths and weaknesses
3. Improvement suggestions
4. Whether difficulty should be adjusted
5. Next recommended exercise
6. Learning journal entry`,
      response_json_schema: {
        type: 'object',
        properties: {
          performance_score: { type: 'number' },
          feedback: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          improvement_suggestions: { type: 'array', items: { type: 'string' } },
          adjust_difficulty: { type: 'string' },
          next_exercise_recommendation: { type: 'string' },
          journal_entry: { type: 'string' }
        }
      }
    });

    // Update exercise status
    const updatedExercises = sessionData.training_exercises.map(ex => {
      if (ex.exercise_id === exercise_id) {
        return {
          ...ex,
          completion_status: 'completed',
          score: feedback.performance_score,
          attempts: (ex.attempts || 0) + 1,
          time_spent_seconds: (ex.time_spent_seconds || 0) + (performance_data.time_spent || 0)
        };
      }
      return ex;
    });

    // Add feedback to loop
    const updatedFeedbackLoop = [
      ...(sessionData.feedback_loop || []),
      {
        timestamp: new Date().toISOString(),
        exercise_id,
        performance_score: feedback.performance_score,
        ai_feedback: feedback.feedback,
        improvement_suggestions: feedback.improvement_suggestions,
        adaptation_applied: feedback.adjust_difficulty !== 'none'
      }
    ];

    // Add journal entry
    const updatedJournal = [
      ...(sessionData.learning_journal_entries || []),
      {
        entry_date: new Date().toISOString(),
        skills_practiced: [exercise.skill_targeted],
        achievements: feedback.strengths,
        challenges_faced: feedback.weaknesses,
        agent_reflection: feedback.journal_entry,
        progress_metrics: {
          exercise_score: feedback.performance_score,
          time_spent: performance_data.time_spent
        }
      }
    ];

    // Calculate progress
    const completedCount = updatedExercises.filter(ex => ex.completion_status === 'completed').length;
    const progress = (completedCount / updatedExercises.length) * 100;

    // Update session
    await base44.asServiceRole.entities.AgentTutoringSession.update(session_id, {
      training_exercises: updatedExercises,
      feedback_loop: updatedFeedbackLoop,
      learning_journal_entries: updatedJournal,
      progress_percentage: progress,
      session_status: progress === 100 ? 'completed' : 'active'
    });

    return Response.json({
      success: true,
      feedback,
      progress_percentage: progress,
      session_status: progress === 100 ? 'completed' : 'active'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});