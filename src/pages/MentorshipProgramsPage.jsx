import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, MessageCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function MentorshipProgramsPage() {
  const mentors = [
    { id: 1, name: 'Dr. Sarah Chen', expertise: 'Neural Networks', students: 8, rating: 4.9 },
    { id: 2, name: 'Alex Kumar', expertise: 'Blueprint Design', students: 12, rating: 4.8 },
    { id: 3, name: 'Maria Garcia', expertise: 'Device Integration', students: 6, rating: 5.0 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Mentorship Programs</h1>
          <p className="text-white/60">Learn from experienced professionals</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {mentors.map((mentor, i) => (
            <motion.div key={mentor.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{mentor.name}</h3>
              <p className="text-white/60 text-sm mb-3">{mentor.expertise}</p>
              <div className="flex items-center justify-center gap-3 text-sm mb-4">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {mentor.rating}
                </span>
                <span className="text-white/60">{mentor.students} mentees</span>
              </div>
              <button className="w-full py-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg hover:bg-purple-500/30 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Request Mentor
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}