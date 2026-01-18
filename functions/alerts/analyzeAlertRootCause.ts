import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ruleId } = await req.json();

    // Get alert history for this rule
    const alerts = await base44.entities.AlertHistory?.filter?.({
      alert_rule_id: ruleId
    }) || [];

    // Analyze patterns
    const timeBetweenAlerts = [];
    for (let i = 1; i < alerts.length; i++) {
      const prev = new Date(alerts[i - 1].created_date).getTime();
      const curr = new Date(alerts[i].created_date).getTime();
      timeBetweenAlerts.push((curr - prev) / 1000 / 60); // minutes
    }

    const avgInterval = timeBetweenAlerts.length > 0
      ? Math.round(timeBetweenAlerts.reduce((a, b) => a + b, 0) / timeBetweenAlerts.length)
      : null;

    const isRecurring = timeBetweenAlerts.some(interval =>
      interval > avgInterval * 0.8 && interval < avgInterval * 1.2
    );

    // Determine root cause based on patterns
    const analysis = {
      primaryCause: isRecurring
        ? 'Recurring system issue with regular pattern'
        : 'Sporadic anomaly detection',
      primaryExplanation: isRecurring
        ? `Alerts occur approximately every ${avgInterval} minutes, indicating a systemic issue that repeats on a schedule.`
        : 'Alerts are irregular, suggesting external factors or occasional threshold violations.',
      confidence: isRecurring ? 0.85 : 0.65,
      factors: [
        {
          name: 'Alert Frequency',
          description: `${alerts.length} alerts in time period`,
          impact: 0.4
        },
        {
          name: 'Time Pattern',
          description: avgInterval ? `Average interval: ${avgInterval} minutes` : 'No clear pattern',
          impact: 0.3
        },
        {
          name: 'Severity Distribution',
          description: `${alerts.filter(a => a.severity === 'critical').length} critical alerts`,
          impact: 0.3
        }
      ],
      recommendations: isRecurring
        ? [
            'Schedule maintenance during off-peak hours to investigate root cause',
            'Implement preventive measures to reduce alert frequency',
            'Consider adjusting alert thresholds if pattern is expected behavior'
          ]
        : [
            'Monitor for external triggers or load spikes',
            'Review metric baselines and adjust sensitivity if needed',
            'Check for deployment or configuration changes around alert times'
          ],
      recurringPattern: isRecurring
        ? `Recurring pattern detected with ${avgInterval} minute intervals`
        : null
    };

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});