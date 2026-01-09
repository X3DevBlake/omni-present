import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, Users, Play } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function CurriculumCourses() {
  const courses = [
    { id: 1, title: 'Introduction to AI Agents', level: 'Beginner', duration: '8 hours', students: 2400, rating: 4.9 },
    { id: 2, title: 'Advanced Blueprint Design', level: 'Advanced', duration: '12 hours', students: 890, rating: 4.8 },
    { id: 3, title: 'Multi-Agent Systems', level: 'Intermediate', duration: '10 hours', students: 1200, rating: 4.7 },
    { id: 4, title: 'Physical Device Integration', level: 'Intermediate', duration: '6 hours', students: 1500, rating: 4.9 },
    { id: 5, title: 'Simulation World Building', level: 'Advanced', duration: '15 hours', students: 650, rating: 4.8 },
    { id: 6, title: 'Agent Voice Design', level: 'Beginner', duration: '4 hours', students: 1800, rating: 4.6 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Curriculum & Courses</h1>
          <p className="text-white/60">Comprehensive learning paths for Omni-Present technology</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                  course.level === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {course.level}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">{course.rating}</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-3">{course.title}</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-4 h-4" />
                  {course.students.toLocaleString()} students
                </div>
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Start Course
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}