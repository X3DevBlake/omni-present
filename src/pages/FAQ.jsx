import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function FAQ() {
  const faqs = [
    { q: 'What is Omni-Present?', a: 'Omni-Present is a comprehensive AI platform for building, training, and deploying intelligent agents with physical device integration.' },
    { q: 'How do I get started?', a: 'Sign up for a free account, explore the Labs hub to create your first agent, or browse the Campus to learn fundamentals.' },
    { q: 'What devices are compatible?', a: 'All Omni-Present certified devices work seamlessly. Check the Device Shop for our complete hardware catalog.' },
    { q: 'Can I integrate with my existing systems?', a: 'Yes! We offer 500+ integrations and support custom API connections through the Developer hub.' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Frequently Asked Questions</h1>
          <p className="text-white/60">Find answers to common questions</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{faq.q}</h3>
                  <p className="text-white/70">{faq.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}