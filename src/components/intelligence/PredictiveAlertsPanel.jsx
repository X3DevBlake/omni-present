import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const PREDICTIVE_ALERTS = [
  {
    id: 1,
    type: 'risk',
    severity: 'critical',
    title: 'Portfolio Risk Threshold Approaching',
    prediction: 'Based on current correlations, risk exposure will exceed limits in 2.4 hours',
    affectedHubs: ['Banking', 'Simulations'],
    confidence: 96,
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'opportunity',
    severity: 'info',
    title: 'Market Opportunity Detected',
    prediction: 'Cross-correlation analysis suggests arbitrage opportunity in tech sector',
    affectedHubs: ['Banking', 'AI Labs'],
    confidence: 84,
    icon: Info,
  },
  {
    id: 3,
    type: 'warning',
    severity: 'warning',
    title: 'Device Performance Degradation',
    prediction: 'Trend analysis indicates Device-3 will require maintenance within 6 hours',
    affectedHubs: ['Devices', 'AI Labs'],
    confidence: 89,
    icon: AlertCircle,
  },
];

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 border-red-500/30';
    case 'warning':
      return 'bg-yellow-500/20 border-yellow-500/30';
    default:
      return 'bg-blue-500/20 border-blue-500/30';
  }
};

export default function PredictiveAlertsPanel() {
  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <h3 className="text-white font-bold mb-4">Predictive Alerts</h3>
      <div className="space-y-3">
        {PREDICTIVE_ALERTS.map((alert) => {
          const Icon = alert.icon;
          const severityBg = getSeverityColor(alert.severity);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${severityBg}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-white/70 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{alert.title}</p>
                  <p className="text-white/60 text-xs mt-1">{alert.prediction}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {alert.affectedHubs.map((hub) => (
                      <Badge key={hub} className="bg-white/10 text-white text-xs">
                        {hub}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm">{alert.confidence}%</p>
                  <p className="text-white/60 text-xs">confidence</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}