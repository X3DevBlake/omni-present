export default async function crossModuleTrigger(data, context) {
  const { integration_id, event_data } = data;
  
  const integration = await context.entities.CrossModuleIntegration.get(integration_id);
  if (!integration || !integration.is_active) return { executed: false };
  
  await context.entities.CrossModuleIntegration.update(integration_id, {
    execution_count: (integration.execution_count || 0) + 1,
    last_executed: new Date().toISOString()
  });
  
  let result = null;
  
  if (integration.source_module === 'monitoring' && integration.target_module === 'defi') {
    if (integration.trigger_event === 'anomaly_detected') {
      result = await context.functions['defi/analyze-portfolio-risk']({
        user_email: event_data.user_email
      });
    }
  }
  
  if (integration.source_module === 'marketplace' && integration.target_module === 'orchestration') {
    if (integration.trigger_event === 'agent_deployed') {
      result = await context.functions['collaboration/form-dynamic-team']({
        task_description: 'Integrate new agent',
        required_skills: ['integration'],
        user_email: event_data.user_email
      });
    }
  }
  
  return { executed: true, result };
}