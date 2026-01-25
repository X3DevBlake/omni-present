import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { course_id, final_grade } = await req.json();

    if (!course_id || !final_grade) {
      return Response.json({ 
        error: 'course_id and final_grade required' 
      }, { status: 400 });
    }

    // Fetch course
    const courses = await base44.entities.Course.filter({ id: course_id });
    const course = courses[0];

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Determine certification tier based on grade
    let tier = 'beginner';
    if (final_grade >= 95) tier = 'expert';
    else if (final_grade >= 85) tier = 'advanced';
    else if (final_grade >= 75) tier = 'intermediate';

    // Create certificate
    const certificate = await base44.asServiceRole.entities.Certification.create({
      user_email: user.email,
      course_id,
      name: `${course.title} - ${tier.toUpperCase()}`,
      tier,
      final_grade,
      issued_date: new Date().toISOString(),
      credential_id: `CERT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      blockchain_hash: `0x${Math.random().toString(16).substr(2, 64)}`
    });

    // Award certification XP
    const xpMap = { beginner: 100, intermediate: 200, advanced: 300, expert: 500 };
    await base44.functions.invoke('awardAchievement', {
      user_email: user.email,
      achievement_type: 'certificate_earned',
      xp: xpMap[tier]
    });

    return Response.json({
      success: true,
      certificate,
      xp_awarded: xpMap[tier],
      message: `Certificate generated: ${certificate.credential_id}`
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});