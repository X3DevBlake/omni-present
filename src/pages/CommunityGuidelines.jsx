import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function CommunityGuidelines() {
  const guidelines = [
    { title: 'Be Respectful', description: 'Treat all community members with kindness and respect', icon: Heart },
    { title: 'Stay Safe', description: 'Protect your privacy and report suspicious activity', icon: Shield },
    { title: 'Collaborate', description: 'Share knowledge and help others learn', icon: Users }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Community Guidelines</h1>
          <p className="text-white/60">Our code of conduct for a positive community</p>
        </motion.div>

        <div className="space-y-6">
          {guidelines.map((guideline, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <guideline.icon className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">{guideline.title}</h3>
                  <p className="text-white/70">{guideline.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}