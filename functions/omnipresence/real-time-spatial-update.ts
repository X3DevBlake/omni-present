import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { spatial_map_id, detected_changes = [] } = await req.json();

    // Get current spatial data
    const [spatialZones, presences, detections] = await Promise.all([
      base44.entities.SpatialZone.filter({ spatial_map_id }).limit(100),
      base44.entities.AgentPhysicalPresence.filter({}).limit(50),
      base44.entities.DynamicObjectDetection.filter({}).limit(200)
    ]);

    // Update zone occupancy in real-time
    for (const zone of spatialZones) {
      const bounds = zone.boundaries || {};
      const agentsInZone = presences.filter(p => {
        const loc = p.current_location || {};
        return loc.x >= bounds.min_x && loc.x <= bounds.max_x &&
               loc.z >= bounds.min_z && loc.z <= bounds.max_z;
      });

      await base44.entities.SpatialZone.update(zone.id, {
        real_time_occupancy: agentsInZone.length,
        activity_heat_score: Math.min(100, (zone.activity_heat_score || 0) + agentsInZone.length * 5)
      });
    }

    // Analyze activity patterns
    const hotZones = spatialZones
      .filter(z => (z.activity_heat_score || 0) > 60)
      .sort((a, b) => (b.activity_heat_score || 0) - (a.activity_heat_score || 0));

    return Response.json({
      success: true,
      zones_updated: spatialZones.length,
      hot_zones: hotZones.slice(0, 5).map(z => ({
        zone_name: z.zone_name,
        heat_score: z.activity_heat_score,
        occupancy: z.real_time_occupancy
      })),
      total_agents: presences.length,
      total_detections: detections.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});