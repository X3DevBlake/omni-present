import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Linkedin, Twitter } from 'lucide-react';
import GlassCard from './GlassCard';

export default function CTASection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassCard className="p-10 md:p-16 text-center relative overflow-hidden" glow glowColor="purple">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-purple-500/20 to-transparent blur-[80px]" />
            </div>

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <span className="text-sm text-white/60">Ready to Transform Your Workflow?</span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Step Into the
                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Future of AI
                </span>
              </h2>

              {/* Description */}
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
                Join the next generation of enterprises embracing omnipresent intelligence. 
                Technology that doesn't just serve—it anticipates.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <motion.button
                  className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Request Early Access
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  className="px-8 py-4 rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Schedule Demo
                </motion.button>
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/30 text-sm mr-2">Connect with us</span>
                {[
                  { icon: Mail, label: 'Email' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Twitter, label: 'Twitter' },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.button
                      key={index}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.footer
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </span>
          </div>
          <p className="text-white/30 text-sm mb-4">
            Intelligence Everywhere. Friction Nowhere.
          </p>
          <p className="text-white/20 text-xs">
            © 2025 Omni-Present. Pioneering the omnipresent AI paradigm.
          </p>
        </motion.footer>
      </div>
    </section>
  );
}