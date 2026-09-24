import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_goal } = await req.json();

    const patterns = await base44.entities.NavigationPattern.filter(
      { user_id: user.id },
      '-created_date',
      20
    );

    const allSequences = patterns.flatMap(p => p.navigation_sequence || []);
    
    const pageGraph = {};
    allSequences.forEach((seq, i) => {
      if (i === 0) return;
      const from = allSequences[i - 1].page_name;
      const to = seq.page_name;
      
      if (!pageGraph[from]) pageGraph[from] = {};
      pageGraph[from][to] = (pageGraph[from][to] || 0) + 1;
    });

    const goalMapping = {
      'create_agent': ['AgentCustomization', 'AgentTraining', 'AgentDeployment'],
      'analyze_data': ['AnalyticsIntelligenceHub', 'UnifiedIntelligenceDashboard'],
      'collaborate': ['CollaborationOrchestrationHub', 'AICollaborationHub'],
      'secure_system': ['SecurityComplianceHub', 'ThreatIntelligence'],
      'train_model': ['NextGenMLHub', 'ModelTraining', 'AILabsAdvanced']
    };

    const recommendedPath = goalMapping[target_goal] || ['HomeEnhanced'];

    const optimizations = [];
    
    if (allSequences.length > 50) {
      const inefficientPatterns = Object.entries(pageGraph)
        .filter(([from, tos]) => Object.keys(tos).length > 5)
        .map(([from]) => from);
      
      if (inefficientPatterns.length > 0) {
        optimizations.push({
          type: 'reduce_navigation_complexity',
          message: `You navigate from ${inefficientPatterns[0]} to many pages. Consider bookmarking your most visited destinations.`,
          impact: 'high'
        });
      }
    }

    const avgDuration = allSequences.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / allSequences.length;
    if (avgDuration < 30) {
      optimizations.push({
        type: 'quick_exits',
        message: 'You tend to leave pages quickly. Try using deep links or quick actions to get to content faster.',
        impact: 'medium'
      });
    }

    return Response.json({
      success: true,
      recommended_path: recommendedPath,
      current_efficiency: patterns[0]?.navigation_efficiency_score || 0.5,
      optimizations,
      estimated_improvement: optimizations.length * 0.15,
      message: `Generated optimized path for: ${target_goal}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});