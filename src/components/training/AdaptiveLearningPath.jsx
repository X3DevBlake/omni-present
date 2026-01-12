import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdaptiveLearningPath({ agentId }) {
  const [curriculum, setCurriculum] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadCurriculum();
  }, [agentId]);

  const loadCurriculum = async () => {
    const curr = await base44.entities.TrainingCurriculum.list({ agent_id: agentId });
    if (curr[0]) setCurriculum(curr[0]);
  };

  const adjustDifficulty = async (newDifficulty) => {
    await base44.entities.TrainingCurriculum.update(curriculum.id, {
      current_difficulty: newDifficulty
    });
    loadCurriculum();
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-cyan-400" />
        Adaptive Learning Path
      </h3>

      {curriculum ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-sm">Current Level:</p>
            <span className={`px-3 py-1 rounded font-bold ${
              curriculum.current_difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              curriculum.current_difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              curriculum.current_difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {curriculum.current_difficulty}
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/60">Overall Progress</span>
              <span className="text-cyan-400">{curriculum.completion_rate}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${curriculum.completion_rate}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {curriculum.learning_modules?.map((module, i) => {
              const completed = progress[module.module_name] || false;
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded"
                  whileHover={{ scale: 1.02 }}
                >
                  {completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-white/40" />
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{module.module_name}</p>
                    <p className="text-white/60 text-xs">{module.estimated_duration}h</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => adjustDifficulty('beginner')}
              className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded text-xs"
            >
              Easy
            </button>
            <button 
              onClick={() => adjustDifficulty('intermediate')}
              className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded text-xs"
            >
              Medium
            </button>
            <button 
              onClick={() => adjustDifficulty('expert')}
              className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded text-xs"
            >
              Hard
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white/60 text-sm">No curriculum generated yet</p>
      )}
    </div>
  );
}