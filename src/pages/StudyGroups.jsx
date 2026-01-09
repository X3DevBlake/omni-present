import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Calendar } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function StudyGroups() {
  const groups = [
    { id: 1, name: 'AI Fundamentals Study Group', members: 12, nextMeeting: '2026-01-10 18:00', topic: 'Neural Networks' },
    { id: 2, name: 'Advanced Blueprint Designers', members: 8, nextMeeting: '2026-01-11 19:00', topic: 'Multi-Agent Systems' },
    { id: 3, name: 'Device Integration Learners', members: 15, nextMeeting: '2026-01-12 17:00', topic: 'Sensor Calibration' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Study Groups</h1>
            <p className="text-white/60">Collaborate with fellow learners</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </motion.div>

        <div className="grid gap-6">
          {groups.map((group, i) => (
            <motion.div key={group.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-black/50 transition-all cursor-pointer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{group.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.members} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {group.nextMeeting}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full inline-block text-sm">
                    Next topic: {group.topic}
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-400 rounded-lg hover:bg-purple-500/30">
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}