import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TrainingEnvironmentHub() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    const data = await base44.entities.AIInstructor.list();
    setInstructors(data);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-green-400" />
        AI Training Instructors
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {instructors.map(instructor => (
          <motion.div
            key={instructor.id}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-400/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-green-400" />
              <p className="text-white font-semibold text-sm">{instructor.instructor_name}</p>
            </div>
            <p className="text-white/60 text-xs mb-2">{instructor.specialization}</p>
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {instructor.teaching_style}
              </span>
              <span className="text-green-400 text-xs font-bold">
                {instructor.success_rate}% success
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}