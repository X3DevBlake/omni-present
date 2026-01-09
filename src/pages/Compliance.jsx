import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, FileText, Lock } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Compliance() {
  const certifications = [
    { name: 'SOC 2 Type II', status: 'Certified', icon: Shield, color: 'green' },
    { name: 'ISO 27001', status: 'Certified', icon: Lock, color: 'blue' },
    { name: 'GDPR Compliant', status: 'Active', icon: FileText, color: 'purple' },
    { name: 'HIPAA Compliant', status: 'Active', icon: Shield, color: 'cyan' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Compliance</h1>
              <p className="text-white/60">Security & regulatory certifications</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {certifications.map((cert, i) => {
            const Icon = cert.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-black/40 backdrop-blur-xl border border-${cert.color}-500/30 rounded-2xl p-6`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${cert.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${cert.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">{cert.name}</h3>
                    <div className={`px-3 py-1 bg-${cert.color}-500/20 border border-${cert.color}-500/40 text-${cert.color}-300 rounded-full text-xs inline-flex items-center gap-1`}>
                      <CheckCircle className="w-3 h-3" />
                      {cert.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Data Protection Measures</h3>
          <div className="space-y-3">
            {[
              'End-to-end encryption for all data in transit',
              'AES-256 encryption for data at rest',
              'Regular third-party security audits',
              'Automated vulnerability scanning',
              'Employee security training programs',
              '24/7 security monitoring and incident response'
            ].map((measure, i) => (
              <div key={i} className="flex items-start gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{measure}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}