import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RecommendationEngine({ userProfile, context = 'general' }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    generateRecommendations();
  }, [userProfile, context]);

  const generateRecommendations = () => {
    // Smart recommendation logic based on user activity and context
    const allRecommendations = [
      {
        id: 1,
        type: 'course',
        title: 'Advanced Multi-Agent Systems',
        description: 'Based on your recent agent creations',
        icon: '🎓',
        page: 'CurriculumCourses',
        relevance: 95
      },
      {
        id: 2,
        type: 'device',
        title: 'Neural Sensor Array Pro',
        description: 'Complements your Omni-Core setup',
        icon: '🔬',
        page: 'DeviceShop',
        relevance: 88
      },
      {
        id: 3,
        type: 'event',
        title: 'AI Summit 2026',
        description: 'Connect with other AI developers',
        icon: '🎪',
        page: 'EventsCalendar',
        relevance: 82
      },
      {
        id: 4,
        type: 'blueprint',
        title: 'Vision System Template',
        description: 'Popular in your skill level',
        icon: '🏗️',
        page: 'BlueprintGallery',
        relevance: 78
      },
      {
        id: 5,
        type: 'mentor',
        title: 'Dr. Sarah Chen',
        description: 'Expert in neural networks',
        icon: '👩‍🏫',
        page: 'MentorshipProgramsPage',
        relevance: 85
      }
    ];

    // Sort by relevance and take top 3
    const sorted = allRecommendations.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
    setRecommendations(sorted);
  };

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Recommended For You</h3>
          <p className="text-white/60 text-xs">Personalized suggestions</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <Link key={rec.id} to={createPageUrl(rec.page)}>
            <motion.div
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-black/50 transition-all cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{rec.icon}</div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                  <p className="text-white/60 text-xs mb-2">{rec.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${rec.relevance}%` }}
                      />
                    </div>
                    <span className="text-xs text-purple-400 font-semibold">{rec.relevance}% match</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}