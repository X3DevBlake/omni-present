import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Award, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdaptiveLearningDashboard({ agentId }) {
  const [curriculum, setCurriculum] = useState(null);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    loadTraining();
  }, [agentId]);

  const loadTraining = async () => {
    const [curriculums, instructorsList] = await Promise.all([
      base44.entities.TrainingCurriculum.list({ agent_id: agentId }),
      base44.entities.AIInstructor.list()
    ]);
    if (curriculums.length > 0) setCurriculum(curriculums[0]);
    setInstructors(instructorsList);
  };

  if (!curriculum) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Adaptive Learning Path
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded p-3">
            <p className="text-white/60 text-xs">Difficulty</p>
            <p className="text-cyan-400 font-bold capitalize">{curriculum.current_difficulty}</p>
          </div>
          <div className="bg-white/10 rounded p-3">
            <p className="text-white/60 text-xs">Progress</p>
            <p className="text-green-400 font-bold">{curriculum.completion_rate}%</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-white/60 text-xs mb-2">Skill Gaps</p>
          <div className="flex flex-wrap gap-1">
            {curriculum.skill_gaps_identified?.map((gap, i) => (
              <span key={i} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                {gap}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/60 text-xs mb-2">Learning Modules</p>
          <div className="space-y-2">
            {curriculum.learning_modules?.slice(0, 3).map((module, i) => (
              <div key={i} className="bg-white/5 rounded p-2">
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm">{module.module_name}</p>
                  <span className="text-xs text-purple-400">{module.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          AI Instructors
        </h3>
        <div className="space-y-2">
          {instructors.slice(0, 3).map(instructor => (
            <div key={instructor.id} className="bg-white/5 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-white font-semibold text-sm">{instructor.instructor_name}</p>
                <span className="text-green-400 text-xs">{instructor.success_rate}% success</span>
              </div>
              <p className="text-white/60 text-xs">{instructor.specialization}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}