import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recentActivities = await base44.entities.UserActivity.filter(
      { user_id: user.id },
      '-timestamp',
      50
    );

    const navPatterns = await base44.entities.NavigationPattern.filter(
      { user_id: user.id },
      '-created_date',
      10
    );

    const userAgents = await base44.entities.Agent.filter({ created_by: user.email }, '-created_date', 10);
    const activeWorkspaces = await base44.entities.CollaborativeWorkspace.filter({ 'participants.participant_id': user.id }, '-created_date', 5);

    const mostVisitedPages = navPatterns[0]?.most_visited_pages || [];
    const recentPages = recentActivities.filter(a => a.activity_type === 'page_view').slice(0, 10);

    const recommendations = [];

    if (userAgents.length === 0) {
      recommendations.push({
        recommendation_type: 'feature_discovery',
        title: 'Create Your First AI Agent',
        description: 'Get started by creating a custom AI agent tailored to your needs',
        priority: 'high',
        confidence_score: 0.95,
        action: {
          action_type: 'navigate',
          target_page: 'AgentCustomization'
        },
        reasoning: 'You haven\'t created any agents yet',
        based_on: ['user_profile', 'agent_count']
      });
    }

    if (activeWorkspaces.length > 0 && userAgents.length > 2) {
      recommendations.push({
        recommendation_type: 'collaboration_opportunity',
        title: 'Form a Multi-Agent Team',
        description: 'Combine your agents into a collaborative team for complex tasks',
        priority: 'medium',
        confidence_score: 0.88,
        action: {
          action_type: 'navigate',
          target_page: 'CollaborationOrchestrationHub'
        },
        reasoning: 'You have multiple agents and are active in collaborative workspaces',
        based_on: ['agent_count', 'workspace_activity']
      });
    }

    const hasVisitedAnalytics = mostVisitedPages.some(p => p.page_name?.includes('Analytics'));
    if (!hasVisitedAnalytics) {
      recommendations.push({
        recommendation_type: 'feature_discovery',
        title: 'Discover Advanced Analytics',
        description: 'Explore predictive analytics and AI-powered insights for your data',
        priority: 'medium',
        confidence_score: 0.82,
        action: {
          action_type: 'navigate',
          target_page: 'AnalyticsIntelligenceHub'
        },
        reasoning: 'Analytics features can help optimize your workflows',
        based_on: ['navigation_pattern', 'feature_usage']
      });
    }

    recommendations.push({
      recommendation_type: 'optimization_tip',
      title: 'Review Security Posture',
      description: 'Check for potential security threats and compliance gaps',
      priority: 'high',
      confidence_score: 0.91,
      action: {
        action_type: 'navigate',
        target_page: 'SecurityComplianceHub'
      },
      reasoning: 'Regular security audits are recommended',
      based_on: ['best_practices', 'time_based']
    });

    const createdRecommendations = [];
    for (const rec of recommendations.slice(0, 5)) {
      const created = await base44.entities.AIRecommendation.create({
        user_id: user.id,
        ...rec,
        expires_at: new Date(Date.now() + 7 * 24 * 3600000).toISOString()
      });
      createdRecommendations.push(created);
    }

    return Response.json({
      success: true,
      recommendations: createdRecommendations,
      count: createdRecommendations.length,
      message: `Generated ${createdRecommendations.length} personalized recommendations`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});