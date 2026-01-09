import React from 'react';
import { motion } from 'framer-motion';
import { Video, Users, Clock, Play } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function VirtualClassrooms() {
  const sessions = [
    { id: 1, title: 'Advanced AI Architecture', instructor: 'Dr. Sarah Chen', time: 'Live Now', attendees: 45, status: 'live' },
    { id: 2, title: 'Multi-Agent Coordination', instructor: 'Prof. James Wilson', time: 'Today 3:00 PM', attendees: 32, status: 'upcoming' },
    { id: 3, title: 'Blueprint Design Patterns', instructor: 'Emily Rodriguez', time: 'Tomorrow 10:00 AM', attendees: 28, status: 'upcoming' }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Virtual Classrooms</h1>
          <p className="text-white/60">Join live interactive learning sessions</p>
        </motion.div>

        <div className="grid gap-6">
          {sessions.map((session, i) => (
            <motion.div key={session.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    session.status === 'live' ? 'bg-red-500/20 animate-pulse' : 'bg-blue-500/20'
                  }`}>
                    <Video className={`w-8 h-8 ${session.status === 'live' ? 'text-red-400' : 'text-blue-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{session.title}</h3>
                    <p className="text-white/60 text-sm mb-1">{session.instructor}</p>
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session.attendees} attending
                      </span>
                    </div>
                  </div>
                </div>
                <button className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                  session.status === 'live' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                    : 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                }`}>
                  <Play className="w-5 h-5" />
                  {session.status === 'live' ? 'Join Now' : 'Register'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}