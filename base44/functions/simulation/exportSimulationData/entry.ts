import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { simulation_id, export_format, export_scope, custom_filters } = await req.json();

    const simulation = await base44.entities.Simulation.filter({ id: simulation_id });
    if (simulation.length === 0) {
      return Response.json({ error: 'Simulation not found' }, { status: 404 });
    }

    const simulationData = simulation[0];
    let exportData = {};

    if (export_scope === 'full' || export_scope === 'metrics_only') {
      exportData.metrics = simulationData.metrics || {};
    }

    if (export_scope === 'full' || export_scope === 'events_only') {
      const events = await base44.entities.SimulationEvent.filter({ simulation_id });
      exportData.events = events;
    }

    if (export_scope === 'full' || export_scope === 'agent_data') {
      const agentData = await base44.entities.SimulationAgent.filter({ simulation_id });
      exportData.agents = agentData;
    }

    exportData.metadata = {
      simulation_name: simulationData.scenario_name,
      created_date: simulationData.created_date,
      export_date: new Date().toISOString(),
      exported_by: user.email
    };

    let fileContent = '';
    let contentType = 'application/json';

    if (export_format === 'json') {
      fileContent = JSON.stringify(exportData, null, 2);
      contentType = 'application/json';
    } else if (export_format === 'csv') {
      const csvRows = [
        ['Timestamp', 'Event Type', 'Agent ID', 'Metric', 'Value'].join(',')
      ];
      (exportData.events || []).forEach(event => {
        csvRows.push([
          event.timestamp,
          event.event_type,
          event.agent_id || '',
          '',
          ''
        ].join(','));
      });
      fileContent = csvRows.join('\n');
      contentType = 'text/csv';
    }

    const blob = new Blob([fileContent], { type: contentType });
    const buffer = await blob.arrayBuffer();

    const uploadResult = await base44.integrations.Core.UploadFile({
      file: new Uint8Array(buffer)
    });

    const exportRecord = await base44.entities.SimulationExport.create({
      simulation_id,
      export_format,
      export_scope,
      custom_filters,
      file_url: uploadResult.file_url,
      file_size_bytes: buffer.byteLength,
      export_status: 'completed',
      rows_exported: exportData.events?.length || 0,
      processing_time_ms: Date.now()
    });

    return Response.json({
      success: true,
      export: exportRecord,
      download_url: uploadResult.file_url,
      message: `Simulation data exported as ${export_format}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});