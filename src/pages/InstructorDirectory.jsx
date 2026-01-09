import React from 'react';
import { motion } from 'framer-motion';
import { User, Star, BookOpen, MessageCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function InstructorDirectory() {
  const instructors = [
    { id: 1, name: 'Dr. Sarah Chen', specialty: 'Neural Networks & Deep Learning', rating: 4.9, students: 1240, courses: 8 },
    { id: 2, name: 'Prof. James Wilson', specialty: 'Multi-Agent Systems', rating: 4.8, students: 890, courses: 6 },
    { id: 3, name: 'Emily Rodriguez', specialty: 'Blueprint Architecture', rating: 4.9, students: 1560, courses: 10 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Instructor Directory</h1>
          <p className="text-white/60">Learn from industry experts</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor, i) => (
            <motion.div key={instructor.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:scale-105 transition-all cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white/60" />
              </div>
              <h3 className="text-white font-bold text-center mb-2">{instructor.name}</h3>
              <p className="text-white/60 text-sm text-center mb-3">{instructor.specialty}</p>
              <div className="flex items-center justify-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white">{instructor.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-white">{instructor.courses}</span>
                </div>
              </div>
              <button className="w-full py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}