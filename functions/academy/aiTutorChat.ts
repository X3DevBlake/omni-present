import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { session_id, course_id, student_message, conversation_history } = await req.json();

  if (!course_id || !student_message) {
    return Response.json({ error: 'Course ID and message are required' }, { status: 400 });
  }

  // Fetch course details
  const courses = await base44.entities.AIGeneratedCourse.filter({ course_id });
  const course = courses[0];

  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }

  // Build context for AI tutor
  const tutorContext = `You are an expert AI tutor for the course: "${course.title}" in ${course.field}.

Course Learning Objectives:
${course.outline?.learning_objectives?.join('\n- ') || 'Advanced understanding of the subject'}

Your role:
1. Answer student questions with clear, pedagogical explanations
2. Provide personalized feedback based on student's understanding level
3. Suggest practice problems when appropriate
4. Use analogies and real-world examples
5. Encourage critical thinking
6. Adapt your teaching style to the student's learning pattern

Previous conversation:
${conversation_history?.map(m => `${m.role}: ${m.message}`).join('\n') || 'None'}

Student Question: ${student_message}

Provide a helpful, educational response.`;

  const tutorResponse = await base44.integrations.Core.InvokeLLM({
    prompt: tutorContext
  });

  // Update or create tutor session
  let session;
  if (session_id) {
    const sessions = await base44.entities.AITutorSession.filter({ session_id });
    if (sessions[0]) {
      const updatedConversation = [
        ...(sessions[0].conversation || []),
        {
          role: 'student',
          message: student_message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'tutor',
          message: tutorResponse,
          timestamp: new Date().toISOString()
        }
      ];

      session = await base44.asServiceRole.entities.AITutorSession.update(sessions[0].id, {
        conversation: updatedConversation,
        topic_focus: course.title,
        session_duration_minutes: (sessions[0].session_duration_minutes || 0) + 5
      });
    }
  } else {
    session = await base44.asServiceRole.entities.AITutorSession.create({
      session_id: `session_${Date.now()}`,
      course_id,
      student_email: user.email,
      conversation: [
        {
          role: 'student',
          message: student_message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'tutor',
          message: tutorResponse,
          timestamp: new Date().toISOString()
        }
      ],
      topic_focus: course.title,
      student_understanding_level: 0.7,
      learning_style_detected: 'mixed',
      session_duration_minutes: 5,
      status: 'active'
    });
  }

  return Response.json({
    success: true,
    tutor_response: tutorResponse,
    session_id: session.session_id || session_id,
    session
  });
});