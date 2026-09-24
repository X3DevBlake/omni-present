import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hubDefinitions = [
      {
        hub_name: 'ai_labs',
        display_name: 'AI Labs',
        hub_category: 'ai_ml',
        target_page: 'NextGenMLHub',
        icon_config: { icon_type: 'lucide', icon_name: 'Brain' },
        portal_3d_config: {
          geometry_type: 'icosahedron',
          primary_color: '#00f5ff',
          secondary_color: '#a855f7',
          animation_style: 'pulse',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: true,
        display_order: 1
      },
      {
        hub_name: 'analytics',
        display_name: 'Analytics Intelligence',
        hub_category: 'analytics',
        target_page: 'AnalyticsIntelligenceHub',
        icon_config: { icon_type: 'lucide', icon_name: 'BarChart3' },
        portal_3d_config: {
          geometry_type: 'octahedron',
          primary_color: '#44ff44',
          secondary_color: '#00f5ff',
          animation_style: 'rotate',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: true,
        display_order: 2
      },
      {
        hub_name: 'collaboration',
        display_name: 'Collaboration',
        hub_category: 'collaboration',
        target_page: 'CollaborationOrchestrationHub',
        icon_config: { icon_type: 'lucide', icon_name: 'Users' },
        portal_3d_config: {
          geometry_type: 'sphere',
          primary_color: '#a855f7',
          secondary_color: '#ec4899',
          animation_style: 'float',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: true,
        display_order: 3
      },
      {
        hub_name: 'security',
        display_name: 'Security & Compliance',
        hub_category: 'security',
        target_page: 'SecurityComplianceHub',
        icon_config: { icon_type: 'lucide', icon_name: 'Shield' },
        portal_3d_config: {
          geometry_type: 'octahedron',
          primary_color: '#ff4444',
          secondary_color: '#ff8800',
          animation_style: 'shimmer',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: true,
        display_order: 4
      },
      {
        hub_name: 'agents',
        display_name: 'AI Agents',
        hub_category: 'ai_ml',
        target_page: 'AIAgentMarketplace',
        icon_config: { icon_type: 'lucide', icon_name: 'Bot' },
        portal_3d_config: {
          geometry_type: 'torus',
          primary_color: '#a855f7',
          secondary_color: '#00f5ff',
          animation_style: 'rotate',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: true,
        display_order: 5
      },
      {
        hub_name: 'simulation',
        display_name: 'Simulation Lab',
        hub_category: 'ai_ml',
        target_page: 'SimulationHub',
        icon_config: { icon_type: 'lucide', icon_name: 'Boxes' },
        portal_3d_config: {
          geometry_type: 'sphere',
          primary_color: '#3b82f6',
          secondary_color: '#00f5ff',
          animation_style: 'pulse',
          particle_effects: true
        },
        access_requirements: { min_role: 'user' },
        is_featured: false,
        display_order: 6
      }
    ];

    const hubs = [];
    for (const hubDef of hubDefinitions) {
      const existing = await base44.entities.NavigationHub.filter({ hub_name: hubDef.hub_name });
      
      if (existing.length === 0) {
        const created = await base44.entities.NavigationHub.create({
          ...hubDef,
          usage_stats: { total_visits: 0, unique_visitors: 0, avg_session_duration: 0 },
          ai_insights: []
        });
        hubs.push(created);
      } else {
        hubs.push(existing[0]);
      }
    }

    const filteredHubs = hubs.filter(hub => {
      if (hub.access_requirements?.min_role === 'admin' && user.role !== 'admin') {
        return false;
      }
      return true;
    });

    return Response.json({
      success: true,
      hubs: filteredHubs,
      count: filteredHubs.length,
      message: `Retrieved ${filteredHubs.length} navigation hubs`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});