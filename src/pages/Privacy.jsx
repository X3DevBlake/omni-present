import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Privacy() {
  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
              <p className="text-white/60">Last updated: January 9, 2026</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {[
            {
              icon: Eye,
              title: 'Information We Collect',
              content: 'We collect information you provide directly, usage data, device information, and data from connected devices and AI agents. This includes account details, simulation data, and telemetry from physical devices.'
            },
            {
              icon: Database,
              title: 'How We Use Your Data',
              content: 'Your data powers AI agent training, simulation analytics, device management, and platform improvements. We use aggregated data to enhance our services while maintaining individual privacy.'
            },
            {
              icon: Lock,
              title: 'Data Security',
              content: 'We employ industry-standard encryption, secure data centers, regular security audits, and strict access controls. All device communications use end-to-end encryption.'
            },
            {
              icon: Users,
              title: 'Data Sharing',
              content: 'We never sell your data. Information is only shared with your explicit consent, with service providers under strict agreements, or when required by law.'
            },
            {
              icon: FileText,
              title: 'Your Rights',
              content: 'You have the right to access, modify, delete, or export your data at any time. Use the Profile Hub to manage your data preferences and privacy settings.'
            }
          ].map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">{section.title}</h3>
                    <p className="text-white/70 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-cyan-400 font-bold mb-2">Questions?</h3>
          <p className="text-white/70 mb-4">Contact our privacy team at privacy@omnipresent.ai</p>
          <a href="/Contact" className="inline-block px-6 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/30">
            Contact Us
          </a>
        </div>
      </div>
    </AuroraBackground>
  );
}