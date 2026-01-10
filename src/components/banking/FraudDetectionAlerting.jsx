import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function FraudDetectionAlerting() {
  const alerts = [
    { type: 'suspicious', desc: 'Unusual transaction pattern detected', time: '2 hours ago', severity: 'high' },
    { type: 'clear', desc: 'Login from new device verified', time: '1 day ago', severity: 'low' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Shield className="w-6 h-6 text-green-400" />
        AI Fraud Detection
      </h3>

      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div className="text-green-400 font-bold">Account Protected</div>
        </div>
        <div className="text-white/60 text-sm mt-1">AI monitoring active • Last scan: 2 minutes ago</div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`border rounded-lg p-3 ${
              alert.type === 'suspicious'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {alert.type === 'suspicious' ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-white font-medium">{alert.desc}</div>
                <div className="text-white/60 text-xs mt-1">{alert.time}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}