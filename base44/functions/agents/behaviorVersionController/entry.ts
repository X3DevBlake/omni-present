import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_version') {
      const { template_id, changes, new_config } = await req.json();

      const versions = await base44.entities.BehaviorTemplateVersion.filter({ template_id });
      const latestVersion = versions.length > 0 
        ? versions.sort((a, b) => b.created_date - a.created_date)[0]
        : null;

      const versionParts = latestVersion?.version_number?.split('.') || ['0', '0', '0'];
      const newVersion = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}.0`;

      // AI diff summary
      const diffSummary = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a concise summary of changes: ${JSON.stringify(changes)}. Be specific about what improved.`,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' }
          }
        }
      });

      const version = await base44.entities.BehaviorTemplateVersion.create({
        template_id: template_id,
        version_number: newVersion,
        forked_from: null,
        changes: changes,
        performance_comparison: {
          vs_previous_version: 0,
          user_satisfaction_delta: 0,
          efficiency_improvement: 0
        },
        ai_diff_summary: diffSummary.summary,
        snapshot_data: new_config
      });

      return Response.json({
        success: true,
        version: version,
        version_number: newVersion
      });
    }

    if (action === 'get_version_history') {
      const { template_id } = await req.json();

      const versions = await base44.entities.BehaviorTemplateVersion.filter({ 
        template_id 
      });

      const sortedVersions = versions.sort((a, b) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );

      return Response.json({
        success: true,
        versions: sortedVersions,
        total_versions: sortedVersions.length
      });
    }

    if (action === 'rollback_version') {
      const { version_id } = await req.json();

      const versions = await base44.entities.BehaviorTemplateVersion.filter({ version_id });
      const version = versions[0];

      if (!version) {
        return Response.json({ error: 'Version not found' }, { status: 404 });
      }

      // Restore template to this version's snapshot
      const templates = await base44.entities.AgentBehaviorTemplate.filter({ 
        template_id: version.template_id 
      });
      const template = templates[0];

      if (template) {
        await base44.entities.AgentBehaviorTemplate.update(template.id, version.snapshot_data);
      }

      return Response.json({
        success: true,
        message: 'Template rolled back to version ' + version.version_number
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});