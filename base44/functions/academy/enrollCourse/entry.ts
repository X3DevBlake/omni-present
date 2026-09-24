import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id } = await req.json();

    if (!course_id) {
      return Response.json({ error: 'course_id required' }, { status: 400 });
    }

    // Fetch course
    const courses = await base44.entities.Course.filter({ id: course_id });
    const course = courses[0];

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Create enrollment record
    const enrollment = {
      course_id,
      user_email: user.email,
      enrolled_at: new Date().toISOString(),
      progress: 0,
      completed_modules: [],
      status: 'active'
    };

    // Update user's enrolled courses
    await base44.asServiceRole.entities.Course.update(course_id, {
      enrolled: true,
      started: true
    });

    // Award enrollment XP
    await base44.functions.invoke('awardAchievement', {
      user_email: user.email,
      achievement_type: 'course_enrolled',
      xp: 25
    });

    return Response.json({
      success: true,
      enrollment,
      xp_awarded: 25,
      message: `Successfully enrolled in ${course.title}`
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});