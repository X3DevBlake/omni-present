import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { GuidelineIcon3D } from '../components/3d/CommunityGuidelines3D';
import { useNavigate } from 'react-router-dom';

export default function CommunityGuidelinesEnhanced() {
  const navigate = useNavigate();

  const guidelines = [
    {
      title: 'Be Respectful',
      icon: 'heart',
      description: 'Treat all community members with dignity and kindness. Value different perspectives and create an inclusive environment where everyone feels welcome.',
      points: [
        'Listen actively to others',
        'Acknowledge different viewpoints',
        'Use constructive language',
        'Avoid personal attacks'
      ]
    },
    {
      title: 'Stay Safe',
      icon: 'shield',
      description: 'Protect yourself and others by following security best practices and respecting privacy boundaries.',
      points: [
        'Never share personal information',
        'Use strong passwords',
        'Report suspicious activity',
        'Verify before clicking links'
      ]
    },
    {
      title: 'Collaborate',
      icon: 'humans',
      description: 'Work together toward common goals. Share knowledge, support each other, and build something great as a team.',
      points: [
        'Share your expertise',
        'Help others learn',
        'Provide constructive feedback',
        'Celebrate team wins'
      ]
    }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Community <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Guidelines</span>
            </h1>
            <p className="text-white/60">Our values and principles for a thriving community</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Guidelines Cards with 3D Icons */}
        <div className="space-y-12">
          {guidelines.map((guideline, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              {/* 3D Icon */}
              <motion.div whileHover={{ scale: 1.05 }} className="bg-black/40 rounded-2xl border border-white/10 p-8">
                <GuidelineIcon3D type={guideline.icon} />
              </motion.div>

              {/* Content */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">{guideline.title}</h2>
                <p className="text-white/70 mb-6">{guideline.description}</p>
                <ul className="space-y-3">
                  {guideline.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 + j * 0.05 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mt-1 flex-shrink-0"
                      >
                        <span className="text-white text-sm font-bold">✓</span>
                      </motion.div>
                      <span className="text-white/80">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Code of Conduct */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Code of Conduct</h3>
          <div className="space-y-4 text-white/70">
            <p>• Be respectful and inclusive in all interactions</p>
            <p>• Avoid harassment, discrimination, or hate speech</p>
            <p>• Report violations to our moderation team</p>
            <p>• Respect intellectual property and copyrights</p>
            <p>• Follow platform-specific rules and guidelines</p>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}