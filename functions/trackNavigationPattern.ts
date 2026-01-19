import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from_page, to_page, interaction_type } = await req.json();

    // Track navigation event
    await base44.asServiceRole.entities.ActivityLog.create({
      user_email: user.email,
      activity_type: 'navigation',
      details: {
        from: from_page,
        to: to_page,
        interaction: interaction_type || 'click',
      },
      timestamp: new Date().toISOString(),
    });

    // Analyze pattern and update user preferences
    const recentNavigation = await base44.asServiceRole.entities.ActivityLog.filter({
      user_email: user.email,
      activity_type: 'navigation',
    });

    // Calculate most visited pages
    const pageFrequency = {};
    recentNavigation.forEach(nav => {
      const page = nav.details?.to;
      if (page) {
        pageFrequency[page] = (pageFrequency[page] || 0) + 1;
      }
    });

    const favoritePages = Object.entries(pageFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page]) => page);

    // Update user profile with navigation insights
    await base44.asServiceRole.entities.User.update(user.id, {
      favorite_pages: favoritePages,
      last_navigation: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      favorites: favoritePages,
      total_navigations: recentNavigation.length,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});