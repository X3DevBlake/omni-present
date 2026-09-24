import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let config = await base44.entities.DynamicUIConfig.filter({ user_id: user.id });
    
    if (config.length === 0) {
      config = await base44.entities.DynamicUIConfig.create({
        user_id: user.id,
        layout_type: 'expanded',
        widget_positions: [],
        theme_preferences: {
          primary_color: '#00f5ff',
          accent_color: '#a855f7',
          animation_speed: 1.0,
          '3d_enabled': true
        },
        adaptive_rules: [
          { condition: 'time_of_day_morning', action: 'show_kpi_dashboard', priority: 1 },
          { condition: 'high_activity', action: 'expand_analytics', priority: 2 },
          { condition: 'collaboration_active', action: 'highlight_team_widgets', priority: 3 }
        ],
        ai_optimizations: {
          auto_arrange: true,
          predictive_layout: true,
          usage_based_adjustment: true
        }
      });
      config = [config];
    }

    const widgets = await base44.entities.HomepageWidget.filter({ user_id: user.id });
    
    const optimizedConfig = {
      ...config[0],
      widget_positions: widgets.map((w, i) => ({
        widget_id: w.widget_type,
        x: w.position?.x || (i % 3 - 1) * 2,
        y: w.position?.y || Math.floor(i / 3) * 2 - 1,
        z: w.position?.z || 0,
        scale: 1 + (w.is_visible ? 0 : -0.5),
        rotation: 0,
        order: w.display_order
      }))
    };

    return Response.json({
      success: true,
      config: optimizedConfig,
      message: 'Dynamic UI configuration retrieved'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});