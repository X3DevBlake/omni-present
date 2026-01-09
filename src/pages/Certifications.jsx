import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Certifications() {
  const certifications = [
    { id: 1, title: 'AI Agent Developer', level: 'Professional', duration: '40 hours', completed: false, progress: 65 },
    { id: 2, title: 'Blueprint Architect', level: 'Expert', duration: '60 hours', completed: false, progress: 30 },
    { id: 3, title: 'Simulation Engineer', level: 'Professional', duration: '50 hours', completed: true, progress: 100 },
    { id: 4, title: 'Device Integration Specialist', level: 'Advanced', duration: '35 hours', completed: false, progress: 80 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Professional Certifications</h1>
          <p className="text-white/60">Earn industry-recognized credentials</p>
        </motion.div>

        <div className="grid gap-6">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.id}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                    cert.completed ? 'bg-green-500/20' : 'bg-purple-500/20'
                  }`}>
                    {cert.completed ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <Award className="w-8 h-8 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-1">{cert.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-1 rounded-full ${
                        cert.level === 'Expert' ? 'bg-purple-500/20 text-purple-400' :
                        cert.level === 'Professional' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {cert.level}
                      </span>
                      <span className="text-white/60 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {cert.duration}
                      </span>
                    </div>
                  </div>
                </div>
                {cert.completed && (
                  <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 border border-blue-500/40">
                    View Certificate
                  </button>
                )}
              </div>
              {!cert.completed && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white font-semibold">{cert.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${cert.progress}%` }}
                    />
                  </div>
                  <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90">
                    Continue Learning
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}