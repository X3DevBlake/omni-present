import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threat_name, threat_type, severity_level } = await req.json();

    const iocs = [
      { ioc_type: 'ip_address', value: '192.168.1.100', confidence: 0.92 },
      { ioc_type: 'domain', value: 'malicious-domain.com', confidence: 0.88 },
      { ioc_type: 'file_hash', value: 'a1b2c3d4e5f6...', confidence: 0.95 }
    ];

    const mitigation = [
      { step: 'Block suspicious IP addresses', status: 'completed', automated: true },
      { step: 'Quarantine affected systems', status: 'in_progress', automated: true },
      { step: 'Notify security team', status: 'completed', automated: true },
      { step: 'Initiate forensic analysis', status: 'pending', automated: false }
    ];

    const threat = await base44.entities.ThreatIntelligence.create({
      threat_name,
      threat_type,
      severity_level,
      detection_source: 'ml_model',
      affected_assets: [
        { asset_id: 'server_001', asset_type: 'compute', impact_level: 'medium' },
        { asset_id: 'db_main', asset_type: 'database', impact_level: 'high' }
      ],
      indicators_of_compromise: iocs,
      mitigation_steps: mitigation,
      threat_status: 'mitigating',
      risk_score: 75 + Math.random() * 20,
      auto_response_enabled: true
    });

    return Response.json({
      success: true,
      threat_id: threat.id,
      threat,
      iocs_count: iocs.length,
      risk_score: threat.risk_score,
      message: `Threat detected: ${threat_name} (${severity_level} severity)`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});