import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, learning_path_id } = await req.json();

    // Get learning path and academic profile
    const paths = await base44.asServiceRole.entities.LearningPath.filter({ path_id: learning_path_id });
    const path = paths[0];

    const profiles = await base44.asServiceRole.entities.AcademicProfile.filter({ user_id });
    const profile = profiles[0];

    if (!path) {
      return Response.json({ error: 'Learning path not found' }, { status: 404 });
    }

    // Analyze skill gaps using AI
    const analysisPrompt = `Analyze skill gaps for this learning path:
    
    Goal: ${path.goal}
    Current Progress: ${path.progress_percentage}%
    
    Skill Targets:
    ${path.skill_targets?.map(s => `- ${s.skill_name}: Current ${s.current_level}/${s.target_level}`).join('\n')}
    
    Student's Background:
    - Role: ${profile?.academic_role}
    - Research Interests: ${profile?.research_interests?.join(', ')}
    - Completed Courses: ${profile?.completed_courses?.length || 0}
    
    Provide:
    1. Identified skill gaps with gap size
    2. Priority ranking (which gaps to address first)
    3. Specific course/module recommendations
    4. Optimal learning sequence
    5. Estimated time to close each gap
    6. Prerequisites that need to be met`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                gap_size: { type: "number" },
                priority: { type: "string" },
                estimated_time_weeks: { type: "number" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          },
          optimal_sequence: {
            type: "array",
            items: { type: "string" }
          },
          prerequisite_analysis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                missing_prerequisites: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      }
    });

    // Create skill gap analysis record
    await base44.asServiceRole.entities.SkillGapAnalysis.create({
      analysis_id: `gap_${Date.now()}`,
      user_id,
      learning_path_id,
      identified_gaps: analysis.gaps,
      recommendations: analysis.recommendations,
      optimal_sequence: analysis.optimal_sequence,
      analysis_date: new Date().toISOString(),
      ai_confidence: 0.87
    });

    return Response.json({ success: true, ...analysis });
  } catch (error) {
    console.error('Skill gap analyzer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});