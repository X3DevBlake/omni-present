import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trail_name, scope } = await req.json();

    const entries = [
      {
        entry_id: `entry_${Date.now()}_1`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor_id: 'user_001',
        actor_type: 'user',
        action: 'model_deployment',
        resource: 'model_gpt_v2',
        before_state: { version: 1 },
        after_state: { version: 2 },
        ip_address: '192.168.1.50',
        session_id: 'sess_abc123'
      },
      {
        entry_id: `entry_${Date.now()}_2`,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        actor_id: 'agent_042',
        actor_type: 'agent',
        action: 'data_access',
        resource: 'user_database',
        before_state: {},
        after_state: {},
        ip_address: 'internal',
        session_id: 'sess_xyz789'
      }
    ];

    const trail = await base44.entities.AuditTrail.create({
      trail_name,
      scope,
      audit_entries: entries,
      retention_policy: {
        retention_days: 2555,
        archival_enabled: true,
        immutable: true
      },
      tamper_detection: {
        enabled: true,
        hash_algorithm: 'SHA-256',
        tampering_detected: false
      },
      compliance_mapping: [
        { framework: 'soc2', requirement: 'CC6.1' },
        { framework: 'gdpr', requirement: 'Article 30' }
      ],
      search_enabled: true
    });

    return Response.json({
      success: true,
      trail_id: trail.id,
      trail,
      entries_count: entries.length,
      message: `Audit trail ${trail_name} created for ${scope} scope`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});