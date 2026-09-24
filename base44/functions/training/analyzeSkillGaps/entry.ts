import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();
    
    // Get agent data
    const [profiles, tasks, specializations] = await Promise.all([
      base44.entities.AgentMarketplaceProfile.filter({ agent_id }),
      base44.entities.AgentTaskAssignment.filter({ agent_id }),
      base44.entities.AgentSpecialization.filter({ agent_id })
    ]);
    
    const profile = profiles[0];
    const spec = specializations[0];
    
    if (!profile) {
      return Response.json({ error: 'Agent profile not found' }, { status: 404 });
    }
    
    // AI skill gap analysis
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze skill gaps for this AI agent:
      
      Current Skills: ${JSON.stringify(profile.skills_profile)}
      Performance History: Success rate ${profile.performance_history?.success_rate}%
      Specialization: ${spec?.primary_specialization || 'None'}
      Recent Tasks: ${tasks.length} assignments
      
      Identify skill gaps, market demand for missing skills, and create personalized training recommendations.`,
      response_json_schema: {
        type: "object",
        properties: {
          identified_gaps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill_name: { type: "string" },
                current_level: { type: "number" },
                required_level: { type: "number" },
                gap_severity: { type: "string" },
                market_priority: { type: "number" }
              }
            }
          },
          recommended_training: {
            type: "array",
            items: {
              type: "object",
              properties: {
                skill: { type: "string" },
                priority: { type: "string" },
                estimated_time_hours: { type: "number" },
                exercises: { type: "array", items: { type: "string" } }
              }
            }
          },
          opportunity_cost: { type: "number" },
          improvement_potential: { type: "number" }
        }
      }
    });
    
    // Store skill gap analysis
    const gapAnalysis = await base44.entities.SkillGapAnalysis.create({
      agent_id,
      analysis_date: new Date().toISOString(),
      identified_gaps: analysis.identified_gaps,
      recommended_training: analysis.recommended_training,
      opportunity_cost: analysis.opportunity_cost,
      improvement_potential: analysis.improvement_potential
    });
    
    // Generate training exercises
    const exercises = [];
    for (const training of analysis.recommended_training.slice(0, 3)) {
      const exercise = await base44.entities.TrainingExercise.create({
        exercise_name: `${training.skill} Mastery Challenge`,
        skill_target: training.skill,
        difficulty_level: Math.ceil(training.estimated_time_hours / 2),
        exercise_type: 'problem_solving',
        scenario_config: { skill: training.skill },
        success_criteria: { proficiency_gain: 10 },
        estimated_duration_minutes: training.estimated_time_hours * 60
      });
      exercises.push(exercise);
    }
    
    return Response.json({
      gap_analysis: gapAnalysis,
      exercises_generated: exercises,
      priority_skills: analysis.identified_gaps.slice(0, 5)
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});