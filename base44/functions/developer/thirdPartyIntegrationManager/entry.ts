import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'register_integration') {
      const { integration_name, integration_type, capabilities } = await req.json();

      // AI security audit
      const securityAudit = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform security audit for third-party integration: ${integration_name} of type ${integration_type}. Provide security score (0-1), identify potential vulnerabilities, and recommend security measures.`,
        response_json_schema: {
          type: 'object',
          properties: {
            security_score: { type: 'number' },
            vulnerabilities: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      const integration = await base44.entities.ThirdPartyIntegration.create({
        developer_id: user.id,
        integration_name: integration_name,
        integration_type: integration_type,
        capabilities: capabilities || [],
        security_audit: {
          audited: true,
          audit_date: new Date().toISOString(),
          security_score: securityAudit.security_score,
          vulnerabilities_found: securityAudit.vulnerabilities
        },
        performance_metrics: {
          avg_response_time_ms: 0,
          success_rate: 0,
          uptime_percent: 0
        },
        installation_count: 0,
        rating: 0,
        status: securityAudit.security_score > 0.7 ? 'approved' : 'pending_review'
      });

      return Response.json({
        success: true,
        integration: integration,
        security_audit: securityAudit,
        message: `Integration registered with ${securityAudit.security_score > 0.7 ? 'approved' : 'pending review'} status`
      });
    }

    if (action === 'install_integration') {
      const { integration_id } = await req.json();

      const integrations = await base44.entities.ThirdPartyIntegration.filter({ integration_id });
      const integration = integrations[0];

      if (!integration) {
        return Response.json({ error: 'Integration not found' }, { status: 404 });
      }

      if (integration.status !== 'approved' && integration.status !== 'active') {
        return Response.json({ error: 'Integration not approved' }, { status: 403 });
      }

      await base44.entities.ThirdPartyIntegration.update(integration.id, {
        installation_count: (integration.installation_count || 0) + 1,
        status: 'active'
      });

      return Response.json({
        success: true,
        integration: integration,
        message: 'Integration installed successfully'
      });
    }

    if (action === 'get_integrations') {
      const { integration_type, approved_only } = await req.json();

      let query = {};
      if (integration_type) query.integration_type = integration_type;
      if (approved_only) query.status = 'approved';

      const integrations = await base44.entities.ThirdPartyIntegration.filter(query);

      return Response.json({
        success: true,
        integrations: integrations,
        total: integrations.length
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});