import { base44 } from '@/api/base44Client';

export async function generateTrainingDataDocumentation(datasetId, userEmail) {
  const dataset = await base44.entities.TrainingDataset.filter({ id: datasetId });
  if (dataset.length === 0) return null;

  const doc = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate comprehensive training data documentation for "${dataset[0].dataset_name}". Include: overview, data structure, features, labels, usage examples, preprocessing steps, validation methodology. Dataset: ${JSON.stringify(dataset[0])}`,
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        overview: { type: 'string' },
        structure: { type: 'object' },
        usage_guide: { type: 'string' },
        examples: { type: 'array', items: { type: 'object' } }
      }
    }
  });

  const report = await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'training-docs',
    user_email: userEmail,
    report_type: 'summary',
    google_doc_id: `training_${Date.now()}`,
    google_doc_url: `https://docs.google.com/document/d/${Date.now()}`,
    content: doc,
    status: 'completed'
  });

  return { report, download_url: report.google_doc_url };
}

export async function generateSimulationResultsReport(simulationId, userEmail) {
  const sim = await base44.entities.SandboxSimulation.filter({ id: simulationId });
  if (sim.length === 0) return null;

  const report = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate detailed simulation results report for "${sim[0].simulation_name}". Include: executive summary, performance metrics, agent behaviors, failure analysis, optimization recommendations, deployment readiness. Data: ${JSON.stringify(sim[0])}`,
    response_json_schema: {
      type: 'object',
      properties: {
        executive_summary: { type: 'string' },
        metrics_analysis: { type: 'object' },
        agent_performance: { type: 'array', items: { type: 'object' } },
        failure_analysis: { type: 'object' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  const docReport = await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'simulation-results',
    user_email: userEmail,
    report_type: 'summary',
    google_doc_id: `sim_${Date.now()}`,
    google_doc_url: `https://docs.google.com/document/d/${Date.now()}`,
    content: report,
    status: 'completed'
  });

  return { report: docReport, download_url: docReport.google_doc_url };
}

export async function generateAgentConfigurationGuide(agentId, userEmail) {
  const agent = await base44.entities.AutonomousTradingAgent.filter({ id: agentId });
  if (agent.length === 0) return null;

  const guide = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate agent configuration guide for "${agent[0].agent_name}". Include: overview, authorized actions, trading limits, strategy details, permissions, setup instructions, monitoring guidelines. Data: ${JSON.stringify(agent[0])}`,
    response_json_schema: {
      type: 'object',
      properties: {
        overview: { type: 'string' },
        configuration: { type: 'object' },
        setup_steps: { type: 'array', items: { type: 'string' } },
        monitoring: { type: 'string' }
      }
    }
  });

  const docReport = await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'agent-config',
    user_email: userEmail,
    report_type: 'summary',
    google_doc_id: `config_${Date.now()}`,
    google_doc_url: `https://docs.google.com/document/d/${Date.now()}`,
    content: guide,
    status: 'completed'
  });

  return { report: docReport, download_url: docReport.google_doc_url };
}

export async function generateApiDocumentation(integrationType, userEmail) {
  const apiDoc = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate comprehensive API documentation for ${integrationType} integration. Include: authentication, endpoints, request/response formats, error codes, rate limits, code examples (JavaScript, Python), best practices.`,
    response_json_schema: {
      type: 'object',
      properties: {
        authentication: { type: 'string' },
        endpoints: { type: 'array', items: { type: 'object' } },
        examples: { type: 'object' },
        error_handling: { type: 'string' }
      }
    }
  });

  const docReport = await base44.entities.AIFacilitatorReport.create({
    collaboration_id: 'api-docs',
    user_email: userEmail,
    report_type: 'summary',
    google_doc_id: `api_${Date.now()}`,
    google_doc_url: `https://docs.google.com/document/d/${Date.now()}`,
    content: apiDoc,
    status: 'completed'
  });

  return { report: docReport, download_url: docReport.google_doc_url };
}