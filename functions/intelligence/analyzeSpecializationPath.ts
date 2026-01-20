import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agent_id } = await req.json();

    // Get agent performance data
    const agent = await base44.asServiceRole.entities.Agent.filter({ id: agent_id }, '', 1);
    const agentData = agent[0];

    // Get performance metrics
    const performanceMetrics = await base44.asServiceRole.entities.AgentPerformanceMetrics.filter(
      { agent_id },
      '-time_period',
      10
    );

    // Get current specializations
    const specializations = await base44.asServiceRole.entities.AgentSpecialization.filter(
      { agent_id },
      '',
      50
    );

    // Get marketplace profile for demand analysis
    const marketplaceProfile = await base44.asServiceRole.entities.AgentMarketplaceProfile.filter(
      { agent_id },
      '',
      1
    );

    // AI analysis for optimal path
    const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyze agent performance and suggest optimal specialization paths:
      
Agent Performance:
${JSON.stringify(performanceMetrics, null, 2)}

Current Specializations:
${JSON.stringify(specializations, null, 2)}

Marketplace Profile:
${JSON.stringify(marketplaceProfile, null, 2)}

Provide:
1. Top 3 specialization paths with reasoning
2. Identified skill gaps
3. Recommended training modules
4. Estimated time and impact for each path
5. Market demand alignment`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggested_paths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                specialization_name: { type: 'string' },
                current_proficiency: { type: 'number' },
                target_proficiency: { type: 'number' },
                potential_impact: { type: 'number' },
                time_estimate_hours: { type: 'number' },
                prerequisite_skills: { type: 'array', items: { type: 'string' } },
                reasoning: { type: 'string' }
              }
            }
          },
          skill_gaps: { type: 'array', items: { type: 'string' } },
          training_modules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                module_name: { type: 'string' },
                specialization: { type: 'string' },
                difficulty: { type: 'string' },
                estimated_duration: { type: 'number' },
                skills_taught: { type: 'array', items: { type: 'string' } },
                prerequisites: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          market_alignment_score: { type: 'number' },
          confidence_level: { type: 'number' }
        }
      }
    });

    // Create specialization path suggestion
    const suggestion = await base44.asServiceRole.entities.SpecializationPathSuggestion.create({
      agent_id,
      suggested_specializations: aiAnalysis.suggested_paths,
      analysis_basis: {
        performance_history: performanceMetrics,
        skill_gaps: aiAnalysis.skill_gaps,
        market_demand: { alignment_score: aiAnalysis.market_alignment_score },
        agent_preferences: agentData?.preferences || {}
      },
      training_modules: aiAnalysis.training_modules,
      priority_score: aiAnalysis.potential_impact || 75,
      ai_confidence: aiAnalysis.confidence_level,
      status: 'pending_review'
    });

    return Response.json({
      success: true,
      suggestion,
      ai_analysis: aiAnalysis
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});