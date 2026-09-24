import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, user_id, course_id, topic, academic_level } = await req.json();

    switch (action) {
      case 'generate_learning_path': {
        // Get user's academic profile and cognitive state
        const profiles = await base44.entities.AcademicProfile.filter({ user_id });
        const profile = profiles[0];
        
        const course = await base44.entities.Course.filter({ course_id });
        const courseData = course[0];

        // Use AI to generate personalized learning path
        const prompt = `Generate a personalized learning path for a ${profile?.academic_role || 'student'} 
        enrolled in "${courseData.title}" (${courseData.category}, ${courseData.academic_level} level).
        
        Student's research interests: ${profile?.research_interests?.join(', ') || 'General'}
        Learning pace preference: ${profile?.learning_preferences?.learning_pace || 'adaptive'}
        
        Create a structured learning path with stages, milestones, and adaptive checkpoints.
        Include estimated duration for each stage and skill targets.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              path_name: { type: "string" },
              goal: { type: "string" },
              stages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    stage_order: { type: "number" },
                    stage_name: { type: "string" },
                    estimated_duration_weeks: { type: "number" },
                    learning_outcomes: { type: "array", items: { type: "string" } }
                  }
                }
              },
              skill_targets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    skill_name: { type: "string" },
                    target_level: { type: "number" }
                  }
                }
              }
            }
          }
        });

        // Create learning path entity
        const learningPath = await base44.entities.LearningPath.create({
          path_id: `lp_${Date.now()}`,
          user_id,
          path_name: aiResponse.path_name,
          goal: aiResponse.goal,
          ai_generated: true,
          path_stages: aiResponse.stages.map(s => ({
            ...s,
            courses: [course_id],
            modules: courseData.modules || [],
            completed: false
          })),
          current_stage: 0,
          progress_percentage: 0,
          skill_targets: aiResponse.skill_targets.map(s => ({
            ...s,
            current_level: 0
          })),
          next_recommendations: []
        });

        return Response.json({ success: true, learning_path: learningPath });
      }

      case 'generate_course_content': {
        const prompt = `Create comprehensive course content for the topic: "${topic}"
        Academic level: ${academic_level}
        
        Generate:
        1. Course title and description
        2. 6-8 modules with titles and learning objectives
        3. Holographic visualization suggestions for key concepts
        4. Interactive 3D simulation ideas
        5. Assessment strategies`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              modules: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    order_index: { type: "number" },
                    learning_outcomes: { type: "array", items: { type: "string" } },
                    content_outline: { type: "string" },
                    holographic_visualization: { type: "string" },
                    estimated_duration_minutes: { type: "number" }
                  }
                }
              },
              learning_objectives: { type: "array", items: { type: "string" } }
            }
          }
        });

        // Create course and modules
        const course = await base44.entities.Course.create({
          course_id: `course_${Date.now()}`,
          title: aiResponse.title,
          description: aiResponse.description,
          category: 'ai_fundamentals',
          academic_level: academic_level || 'undergraduate',
          instructor_id: 'ai_instructor_001',
          duration_weeks: Math.ceil(aiResponse.modules.length / 2),
          learning_objectives: aiResponse.learning_objectives,
          modules: [],
          ai_generated: true,
          is_published: false
        });

        const moduleIds = [];
        for (const moduleData of aiResponse.modules) {
          const module = await base44.entities.Module.create({
            module_id: `mod_${Date.now()}_${moduleData.order_index}`,
            course_id: course.course_id,
            title: moduleData.title,
            order_index: moduleData.order_index,
            content_type: 'mixed',
            estimated_duration_minutes: moduleData.estimated_duration_minutes,
            learning_outcomes: moduleData.learning_outcomes,
            ai_summary: moduleData.content_outline
          });
          moduleIds.push(module.module_id);
        }

        await base44.entities.Course.update(course.id, {
          modules: moduleIds
        });

        return Response.json({ success: true, course, modules: aiResponse.modules });
      }

      case 'generate_quiz': {
        const { module_id } = await req.json();
        
        const modules = await base44.entities.Module.filter({ module_id });
        const module = modules[0];

        const prompt = `Generate an interactive quiz for the module: "${module.title}"
        Learning outcomes: ${module.learning_outcomes?.join(', ')}
        
        Create 10 diverse questions including:
        - Multiple choice (5)
        - True/False (3)
        - Short answer (2)
        
        Include questions that test understanding, application, and analysis.`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_text: { type: "string" },
                    question_type: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct_answer: { type: "string" },
                    points: { type: "number" }
                  }
                }
              }
            }
          }
        });

        const quiz = await base44.entities.Quiz.create({
          quiz_id: `quiz_${Date.now()}`,
          module_id,
          title: aiResponse.title,
          questions: aiResponse.questions.map((q, idx) => ({
            question_id: `q_${idx}`,
            ...q
          })),
          time_limit_minutes: 30,
          passing_score: 70,
          ai_generated: true
        });

        return Response.json({ success: true, quiz });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI curriculum generator error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});