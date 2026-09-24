import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let widgets = await base44.entities.HomepageWidget.filter({ user_id: user.id });

    if (widgets.length === 0) {
      const defaultWidgets = [
        {
          widget_type: 'kpi_dashboard',
          user_id: user.id,
          position: { x: 0, y: 0, width: 2, height: 1 },
          data_source: { entity_name: 'Agent', refresh_interval_seconds: 60 },
          visualization_config: { color_scheme: 'cyan', animation_enabled: true },
          display_order: 1,
          is_visible: true
        },
        {
          widget_type: 'ecosystem_map',
          user_id: user.id,
          position: { x: 2, y: 0, width: 4, height: 2 },
          data_source: { refresh_interval_seconds: 10 },
          visualization_config: { animation_enabled: true },
          display_order: 2,
          is_visible: true
        },
        {
          widget_type: 'activity_stream',
          user_id: user.id,
          position: { x: 0, y: 1, width: 2, height: 1 },
          data_source: { entity_name: 'UserActivity', refresh_interval_seconds: 5 },
          visualization_config: { animation_enabled: true },
          display_order: 3,
          is_visible: true
        },
        {
          widget_type: 'recommendations',
          user_id: user.id,
          position: { x: 6, y: 0, width: 2, height: 2 },
          data_source: { refresh_interval_seconds: 300 },
          visualization_config: { animation_enabled: true },
          display_order: 4,
          is_visible: true
        }
      ];

      widgets = await Promise.all(
        defaultWidgets.map(w => base44.entities.HomepageWidget.create(w))
      );
    }

    return Response.json({
      success: true,
      widgets: widgets.filter(w => w.is_visible).sort((a, b) => a.display_order - b.display_order),
      count: widgets.length,
      message: `Retrieved ${widgets.length} widgets`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});