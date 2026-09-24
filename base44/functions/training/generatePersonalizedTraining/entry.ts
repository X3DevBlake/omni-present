import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id, skill_target, current_proficiency } = await req.json();
    
    // AI-generated personalized training curriculum
    const curriculum = await base44.integrations.Core.InvokeLLM({
      prompt: `Create personalized training curriculum for AI agent:
      
      Skill to Learn: ${skill_target}
      Current Proficiency: ${current_proficiency}/100
      
      Generate progressive exercises, realistic scenarios, success metrics, and feedback mechanisms.`,
      response_json_schema: {
        type: "object",
        properties: {
          exercises: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                difficulty: { type: "number" },
                scenario: { type: "string" },
                success_criteria: { type: "object" },
                estimated_minutes: { type: "number" }
              }
            }
          },
          learning_path: { type: "array", items: { type: "string" } },
          expected_proficiency_gain: { type: "number" },
          total_training_hours: { type: "number" }
        }
      }
    });
    
    // Create learning journal entry
    const journal = await base44.entities.AgentLearningJournal.create({
      agent_id,
      session_date: new Date().toISOString(),
      topic: skill_target,
      learning_type: 'skill_acquisition',
      initial_proficiency: current_proficiency,
      final_proficiency: current_proficiency,
      improvement_percentage: 0,
      exercises_completed: 0,
      time_spent_minutes: 0,
      ai_feedback: `Training curriculum generated with ${curriculum.exercises.length} exercises`,
      next_steps: curriculum.learning_path
    });
    
    return Response.json({
      curriculum,
      journal_entry: journal,
      exercises_count: curriculum.exercises.length
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});