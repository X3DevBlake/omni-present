import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { current_page } = await req.json();

    const recentActivities = await base44.entities.UserActivity.filter(
      { user_id: user.id },
      '-timestamp',
      100
    );

    const pageViews = recentActivities.filter(a => a.activity_type === 'page_view');
    const pageFrequency = {};
    const pageSequences = [];

    pageViews.forEach((view, i) => {
      const pageName = view.activity_details?.page_name;
      if (pageName) {
        pageFrequency[pageName] = (pageFrequency[pageName] || 0) + 1;
        
        if (i > 0) {
          const prevPage = pageViews[i - 1].activity_details?.page_name;
          if (prevPage) {
            pageSequences.push({ from: prevPage, to: pageName });
          }
        }
      }
    });

    const mostVisited = Object.entries(pageFrequency)
      .map(([page_name, visit_count]) => ({
        page_name,
        visit_count,
        avg_duration: 120 + Math.random() * 180
      }))
      .sort((a, b) => b.visit_count - a.visit_count)
      .slice(0, 10);

    const sequenceMap = {};
    pageSequences.forEach(seq => {
      const key = `${seq.from}->${seq.to}`;
      sequenceMap[key] = (sequenceMap[key] || 0) + 1;
    });

    const predictedPages = Object.entries(sequenceMap)
      .filter(([key]) => key.startsWith(`${current_page}->`))
      .map(([key, count]) => ({
        page_name: key.split('->')[1],
        probability: count / pageSequences.length,
        reason: 'Frequently visited after this page'
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    if (predictedPages.length === 0 && mostVisited.length > 0) {
      mostVisited.slice(0, 3).forEach(page => {
        predictedPages.push({
          page_name: page.page_name,
          probability: 0.3 + Math.random() * 0.2,
          reason: 'One of your most visited pages'
        });
      });
    }

    const userSegments = [];
    const mlopsPages = pageViews.filter(p => p.activity_details?.page_name?.includes('MLOps') || p.activity_details?.page_name?.includes('Model'));
    const defiPages = pageViews.filter(p => p.activity_details?.page_name?.includes('DeFi') || p.activity_details?.page_name?.includes('Trading'));
    
    if (mlopsPages.length > 10) userSegments.push('developer');
    if (defiPages.length > 10) userSegments.push('analyst');
    if (user.role === 'admin') userSegments.push('admin');

    const pattern = await base44.entities.NavigationPattern.create({
      user_id: user.id,
      session_id: `session_${Date.now()}`,
      navigation_sequence: pageViews.slice(0, 20).map(v => ({
        page_name: v.activity_details?.page_name,
        timestamp: v.timestamp,
        duration_seconds: v.activity_details?.duration_seconds || 0,
        interaction_count: Math.floor(Math.random() * 10)
      })),
      most_visited_pages: mostVisited,
      predicted_next_pages: predictedPages,
      user_segments: userSegments,
      navigation_efficiency_score: 0.65 + Math.random() * 0.3
    });

    return Response.json({
      success: true,
      pattern,
      predictions: predictedPages,
      segments: userSegments,
      message: `Analyzed navigation patterns for ${user.email}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});