import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function ComplianceDashboard() {
  const standards = [
    { id: 1, name: 'GDPR', status: 'compliant', score: 98 },
    { id: 2, name: 'SOC 2', status: 'compliant', score: 95 },
    { id: 3, name: 'ISO 27001', status: 'in-progress', score: 87 },
    { id: 4, name: 'HIPAA', status: 'compliant', score: 100 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Compliance Dashboard</h1>
          <p className="text-white/60">Monitor regulatory adherence</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {standards.map((standard, i) => (
            <motion.div key={standard.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-bold text-xl">{standard.name}</h3>
                {standard.status === 'compliant' ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Compliance Score</span>
                  <span className="text-white font-bold">{standard.score}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${standard.score === 100 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${standard.score}%` }} />
                </div>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                standard.status === 'compliant' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {standard.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}