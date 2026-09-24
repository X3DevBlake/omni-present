import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { course_id } = await req.json();

  if (!course_id) {
    return Response.json({ error: 'Course ID is required' }, { status: 400 });
  }

  const courses = await base44.entities.AIGeneratedCourse.filter({ course_id });
  const course = courses[0];

  if (!course) {
    return Response.json({ error: 'Course not found' }, { status: 404 });
  }

  // Search for latest research in the field
  const researchPrompt = `Find and summarize the latest breakthrough research (2024-2026) in ${course.field} related to "${course.title}".

Focus on:
1. Recent peer-reviewed papers
2. Novel discoveries or techniques
3. Practical applications
4. Industry developments

Provide 5-10 key findings with:
- Finding summary
- Potential integration points for the course
- Relevance score (0-1)`;

  const researchFindings = await base44.integrations.Core.InvokeLLM({
    prompt: researchPrompt,
    add_context_from_internet: true,
    response_json_schema: {
      type: "object",
      properties: {
        findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              summary: { type: "string" },
              integration_point: { type: "string" },
              relevance_score: { type: "number" },
              source_title: { type: "string" },
              year: { type: "integer" }
            }
          }
        }
      }
    }
  });

  // Update course content with new research
  const updatePrompt = `You are updating the course "${course.title}".

Current course outline:
${JSON.stringify(course.outline, null, 2)}

New research findings:
${JSON.stringify(researchFindings.findings, null, 2)}

Task:
1. Identify which modules should be updated with new research
2. Generate updated lecture content for the most relevant module
3. Create new exercises based on the latest findings
4. Suggest 2-3 new learning objectives

Make updates that seamlessly integrate cutting-edge research while maintaining pedagogical clarity.`;

  const updates = await base44.integrations.Core.InvokeLLM({
    prompt: updatePrompt,
    response_json_schema: {
      type: "object",
      properties: {
        updated_modules: {
          type: "array",
          items: {
            type: "object",
            properties: {
              module_number: { type: "integer" },
              new_content: { type: "string" },
              research_integrated: { type: "array", items: { type: "string" } }
            }
          }
        },
        new_exercises: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              based_on_research: { type: "string" }
            }
          }
        },
        new_learning_objectives: { type: "array", items: { type: "string" } }
      }
    }
  });

  // Update course in database
  const updatedCourse = await base44.asServiceRole.entities.AIGeneratedCourse.update(course.id, {
    last_research_update: new Date().toISOString(),
    research_sources: researchFindings.findings.map(f => ({
      title: f.source_title,
      url: '#',
      relevance_score: f.relevance_score,
      added_date: new Date().toISOString()
    })),
    content: {
      ...course.content,
      lectures: [...(course.content?.lectures || []), ...updates.updated_modules.map(m => m.new_content)],
      exercises: [...(course.content?.exercises || []), ...updates.new_exercises]
    },
    status: 'published'
  });

  return Response.json({
    success: true,
    updated_course: updatedCourse,
    research_findings: researchFindings.findings.length,
    modules_updated: updates.updated_modules.length,
    new_exercises: updates.new_exercises.length
  });
});