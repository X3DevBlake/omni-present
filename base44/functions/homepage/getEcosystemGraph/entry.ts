import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filters = {}, time_snapshot } = await req.json();

    const nodes = [];
    const edges = [];

    const agents = await base44.entities.Agent.list('-updated_date', 20);
    agents.forEach((agent, i) => {
      nodes.push({
        node_id: `agent_${agent.id}`,
        node_type: 'agent',
        entity_reference: { entity_name: 'Agent', entity_id: agent.id },
        position_3d: {
          x: Math.cos(i * 0.5) * 5,
          y: Math.sin(i * 0.5) * 3,
          z: (Math.random() - 0.5) * 2
        },
        health_status: agent.status === 'active' ? 'healthy' : 'offline',
        metrics: {
          activity_score: 85 + Math.random() * 15,
          performance_score: 80 + Math.random() * 20,
          last_activity: new Date().toISOString()
        },
        visual_properties: {
          color: '#a855f7',
          size: 0.8 + Math.random() * 0.4,
          glow_intensity: 0.7
        },
        label: agent.agent_name || 'Agent'
      });
    });

    const models = await base44.entities.ModelDeployment.list('-updated_date', 15);
    models.forEach((model, i) => {
      const nodeId = `model_${model.id}`;
      nodes.push({
        node_id: nodeId,
        node_type: 'model',
        entity_reference: { entity_name: 'ModelDeployment', entity_id: model.id },
        position_3d: {
          x: Math.cos(i * 0.7 + 2) * 4,
          y: Math.sin(i * 0.7 + 2) * 2,
          z: (Math.random() - 0.5) * 3
        },
        health_status: 'healthy',
        metrics: {
          activity_score: 70 + Math.random() * 30,
          performance_score: 75 + Math.random() * 25
        },
        visual_properties: {
          color: '#00f5ff',
          size: 0.6 + Math.random() * 0.3,
          glow_intensity: 0.5
        },
        label: model.model_name || 'Model'
      });

      if (i % 2 === 0 && nodes[i]) {
        edges.push({
          source: nodes[i].node_id,
          target: nodeId,
          connection_type: 'data_flow',
          strength: 0.5 + Math.random() * 0.5,
          active: true
        });
      }
    });

    const pipelines = await base44.entities.DataPipeline.list('-updated_date', 10);
    pipelines.forEach((pipeline, i) => {
      nodes.push({
        node_id: `pipeline_${pipeline.id}`,
        node_type: 'pipeline',
        entity_reference: { entity_name: 'DataPipeline', entity_id: pipeline.id },
        position_3d: {
          x: Math.cos(i * 0.9 + 4) * 6,
          y: Math.sin(i * 0.9 + 4) * 2.5,
          z: (Math.random() - 0.5) * 2
        },
        health_status: pipeline.status === 'running' ? 'healthy' : 'warning',
        metrics: {
          activity_score: 60 + Math.random() * 40,
          performance_score: pipeline.throughput?.records_per_second || 50
        },
        visual_properties: {
          color: '#44ff44',
          size: 0.5 + Math.random() * 0.3,
          glow_intensity: 0.6
        },
        label: pipeline.pipeline_name || 'Pipeline'
      });
    });

    const threats = await base44.entities.ThreatIntelligence.filter({ threat_status: { $ne: 'resolved' } }, '-created_date', 5);
    threats.forEach((threat, i) => {
      nodes.push({
        node_id: `threat_${threat.id}`,
        node_type: 'security',
        entity_reference: { entity_name: 'ThreatIntelligence', entity_id: threat.id },
        position_3d: {
          x: Math.cos(i * 1.2 + 6) * 3,
          y: Math.sin(i * 1.2 + 6) * 3,
          z: (Math.random() - 0.5) * 2
        },
        health_status: threat.severity_level === 'critical' ? 'critical' : 'warning',
        metrics: {
          activity_score: threat.risk_score || 50
        },
        visual_properties: {
          color: '#ff4444',
          size: 0.4 + (threat.risk_score / 100) * 0.5,
          glow_intensity: 0.9
        },
        label: threat.threat_name || 'Threat'
      });
    });

    return Response.json({
      success: true,
      graph: {
        nodes,
        edges,
        metadata: {
          total_nodes: nodes.length,
          total_edges: edges.length,
          health_summary: {
            healthy: nodes.filter(n => n.health_status === 'healthy').length,
            warning: nodes.filter(n => n.health_status === 'warning').length,
            critical: nodes.filter(n => n.health_status === 'critical').length
          }
        }
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});