import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Award } from 'lucide-react';

export default function DynamicSkillLearner({ agent, taskRequirements = [] }) {
  const [learnedSkills, setLearnedSkills] = useState([]);
  const [learningProgress, setLearningProgress] = useState({});

  useEffect(() => {
    // Auto-detect required skills from tasks
    const requiredSkills = taskRequirements.flatMap(task => task.requiredSkills || []);
    const uniqueSkills = [...new Set(requiredSkills)];
    
    uniqueSkills.forEach(skill => {
      if (!learnedSkills.find(s => s.name === skill)) {
        setTimeout(() => {
          setLearningProgress(prev => ({ ...prev, [skill]: 0 }));
          
          const interval = setInterval(() => {
            setLearningProgress(prev => {
              const current = prev[skill] || 0;
              if (current >= 100) {
                clearInterval(interval);
                setLearnedSkills(ls => [...ls, {
                  name: skill,
                  proficiency: 100,
                  learnedAt: new Date(),
                }]);
                return prev;
              }
              return { ...prev, [skill]: current + 10 };
            });
          }, 500);
        }, Math.random() * 2000);
      }
    });
  }, [taskRequirements]);

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Zap className="w-6 h-6 text-green-400" />
        Dynamic Skill Learning
      </h3>

      {Object.keys(learningProgress).length > 0 && (
        <div className="mb-6">
          <h4 className="text-white/60 text-sm mb-3">Currently Learning</h4>
          {Object.entries(learningProgress).map(([skill, progress]) => (
            progress < 100 && (
              <div key={skill} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm">{skill}</span>
                  <span className="text-green-400 text-sm">{progress}%</span>
                </div>
                <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div>
        <h4 className="text-white/60 text-sm mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Learned Skills ({learnedSkills.length})
        </h4>
        <div className="space-y-2">
          {learnedSkills.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/20 rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-medium">{skill.name}</div>
                <div className="text-white/40 text-xs">
                  Learned {new Date(skill.learnedAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div className="text-green-400 font-bold">{skill.proficiency}%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}