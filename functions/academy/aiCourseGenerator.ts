import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { field, title, difficulty_level } = await req.json();

  if (!field || !title) {
    return Response.json({ error: 'Field and title are required' }, { status: 400 });
  }

  // Generate comprehensive course outline and content
  const courseOutlinePrompt = `You are an expert curriculum designer for advanced AI and consciousness engineering.

Generate a comprehensive, detailed course for: "${title}" in the field of ${field}.

Create a complete course outline with:
1. 6-10 modules with clear progression
2. Each module should have 3-5 specific topics
3. Learning objectives for the entire course
4. Prerequisites needed
5. Estimated duration for each module
6. Difficulty assessment (${difficulty_level || 'intermediate'})

Make it cutting-edge, scientifically rigorous, and practically applicable.`;

  const outline = await base44.integrations.Core.InvokeLLM({
    prompt: courseOutlinePrompt,
    response_json_schema: {
      type: "object",
      properties: {
        modules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              module_number: { type: "integer" },
              title: { type: "string" },
              topics: { type: "array", items: { type: "string" } },
              duration_hours: { type: "number" },
              difficulty: { type: "string" }
            }
          }
        },
        learning_objectives: { type: "array", items: { type: "string" } },
        prerequisites: { type: "array", items: { type: "string" } },
        total_estimated_hours: { type: "number" }
      }
    }
  });

  // Generate detailed content for first module
  const contentPrompt = `Create detailed lecture content for the first module: "${outline.modules[0].title}"

Topics to cover: ${outline.modules[0].topics.join(', ')}

Generate:
1. Detailed lecture notes (2000+ words)
2. 3 interactive exercises with solutions
3. 1 assessment quiz with 5 questions

Make it engaging, scientifically accurate, and include real-world examples.`;

  const firstModuleContent = await base44.integrations.Core.InvokeLLM({
    prompt: contentPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        lecture_notes: { type: "string" },
        exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              solution: { type: "string" },
              difficulty: { type: "string" }
            }
          }
        },
        assessment: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  });

  // Create course in database
  const course = await base44.asServiceRole.entities.AIGeneratedCourse.create({
    course_id: `course_${Date.now()}`,
    title,
    field,
    outline: {
      modules: outline.modules,
      learning_objectives: outline.learning_objectives,
      prerequisites: outline.prerequisites
    },
    content: {
      lectures: [firstModuleContent.lecture_notes],
      exercises: firstModuleContent.exercises,
      assessments: [firstModuleContent.assessment]
    },
    difficulty_level: difficulty_level || 'intermediate',
    estimated_hours: outline.total_estimated_hours || 40,
    ai_tutor_enabled: true,
    ai_quality_score: 0.85,
    status: 'published'
  });

  return Response.json({
    success: true,
    course,
    message: `Successfully generated course: ${title}`
  });
});