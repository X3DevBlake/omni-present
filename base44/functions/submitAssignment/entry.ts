import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignment_id, user_email, content, submitted_at } = await req.json();

    if (!assignment_id || !content) {
      return Response.json({ 
        error: 'assignment_id and content required' 
      }, { status: 400 });
    }

    // Create submission record
    const submission = await base44.asServiceRole.entities.Submission.create({
      assignment_id,
      user_email: user_email || user.email,
      content,
      submitted_at: submitted_at || new Date().toISOString(),
      status: 'submitted',
      grade: null
    });

    // Update assignment status
    const assignments = await base44.entities.Assignment.filter({ id: assignment_id });
    if (assignments.length > 0) {
      await base44.asServiceRole.entities.Assignment.update(assignment_id, {
        submitted: true,
        submission_id: submission.id
      });
    }

    // Award XP for submission
    const xpAwarded = 50;
    await base44.functions.invoke('awardAchievement', {
      user_email: user.email,
      achievement_type: 'assignment_submitted',
      xp: xpAwarded
    });

    return Response.json({
      success: true,
      submission_id: submission.id,
      xp_awarded: xpAwarded,
      message: 'Assignment submitted successfully'
    });
  } catch (error) {
    console.error('Submission error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});