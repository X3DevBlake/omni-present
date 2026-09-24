import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { access_policy_name, policy_type } = await req.json();

    const roles = [
      { role_id: 'admin', role_name: 'Administrator', permissions: ['read', 'write', 'delete', 'admin'], members_count: 3 },
      { role_id: 'developer', role_name: 'Developer', permissions: ['read', 'write', 'execute'], members_count: 12 },
      { role_id: 'analyst', role_name: 'Analyst', permissions: ['read'], members_count: 8 },
      { role_id: 'viewer', role_name: 'Viewer', permissions: ['read'], members_count: 25 }
    ];

    const accessRules = [
      { rule_id: 'rule_1', resource: 'models', action: 'read', allowed_roles: ['admin', 'developer', 'analyst'], conditions: {} },
      { rule_id: 'rule_2', resource: 'models', action: 'write', allowed_roles: ['admin', 'developer'], conditions: {} },
      { rule_id: 'rule_3', resource: 'agents', action: 'execute', allowed_roles: ['admin', 'developer'], conditions: {} }
    ];

    const accessControl = await base44.entities.AccessControl.create({
      access_policy_name,
      policy_type,
      roles,
      access_rules: accessRules,
      access_logs: [],
      anomalous_access_detected: 0,
      mfa_required: true,
      session_timeout_minutes: 30
    });

    return Response.json({
      success: true,
      policy_id: accessControl.id,
      accessControl,
      roles_count: roles.length,
      rules_count: accessRules.length,
      message: `Access control policy configured with ${policy_type} model`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});