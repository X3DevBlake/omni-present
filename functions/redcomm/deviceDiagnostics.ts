import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, diagnosticType = 'full_diagnostic' } = await req.json();

    // Fetch device
    const devices = await base44.entities.RedCommDevice.filter({ device_id: deviceId });
    
    if (!devices || devices.length === 0) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    const device = devices[0];

    // AI-powered diagnostic analysis
    const diagnosticAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform a comprehensive diagnostic analysis on this RedComm device:

Device ID: ${device.device_id}
Model: ${device.device_model}
Location: ${device.deployment_location?.celestial_body}
Operational Status: ${device.operational_status}
Technical Specs: ${JSON.stringify(device.technical_specs)}
Power System: ${JSON.stringify(device.power_system)}

Diagnostic Type: ${diagnosticType}

Provide a detailed diagnostic report including:
1. Overall health score (0-100)
2. Individual component status (antenna, amplifier, processor, power system)
3. Performance metrics (latency, error rate, thermal status)
4. Detected issues with severity levels
5. Recommended fixes and maintenance actions
6. Firmware analysis and update recommendations
7. Deep sentient analysis of device state and potential`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_health: { type: "number" },
          component_status: {
            type: "object",
            properties: {
              antenna: { type: "string" },
              amplifier: { type: "string" },
              processor: { type: "string" },
              power_system: { type: "string" }
            }
          },
          performance_metrics: {
            type: "object",
            properties: {
              signal_processing_latency_ms: { type: "number" },
              error_rate: { type: "number" },
              thermal_status_k: { type: "number" }
            }
          },
          issues_detected: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue_type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                recommended_fix: { type: "string" }
              }
            }
          },
          firmware_version: { type: "string" },
          recommended_firmware_update: { type: "string" },
          ai_diagnostic_analysis: { type: "string" },
          sentient_device_assessment: { type: "string" }
        }
      }
    });

    // Create diagnostic record
    const diagnostic = await base44.asServiceRole.entities.RedCommDeviceDiagnostic.create({
      diagnostic_id: `DIAG_${deviceId}_${Date.now()}`,
      device_id: deviceId,
      diagnostic_type: diagnosticType,
      test_results: {
        overall_health: diagnosticAnalysis.overall_health,
        component_status: diagnosticAnalysis.component_status,
        performance_metrics: diagnosticAnalysis.performance_metrics
      },
      issues_detected: diagnosticAnalysis.issues_detected,
      ai_diagnostic_analysis: diagnosticAnalysis.ai_diagnostic_analysis,
      firmware_version: diagnosticAnalysis.firmware_version,
      recommended_firmware_update: diagnosticAnalysis.recommended_firmware_update,
      status: "completed"
    });

    // Update device operational status if critical issues found
    const criticalIssues = diagnosticAnalysis.issues_detected.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      await base44.asServiceRole.entities.RedCommDevice.update(device.id, {
        operational_status: "maintenance"
      });
    }

    return Response.json({
      success: true,
      diagnostic: diagnostic,
      device_health: diagnosticAnalysis.overall_health,
      critical_issues: criticalIssues.length,
      sentient_assessment: diagnosticAnalysis.sentient_device_assessment,
      firmware_update_available: diagnosticAnalysis.recommended_firmware_update !== diagnosticAnalysis.firmware_version
    });

  } catch (error) {
    console.error('Device Diagnostics Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});