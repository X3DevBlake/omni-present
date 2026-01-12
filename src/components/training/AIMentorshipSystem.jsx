import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, MessageCircle, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIMentorshipSystem({ agentId }) {
  const [mentors, setMentors] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    const instructors = await base44.entities.AIInstructor.list();
    setMentors(instructors);
  };

  const requestFeedback = async (mentorId) => {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: 'Provide constructive feedback on agent performance with actionable improvement suggestions',
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
          next_steps: { type: 'string' }
        }
      }
    });

    setFeedback([result]);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-400" />
        AI Mentorship
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {mentors.slice(0, 4).map(mentor => (
          <div
            key={mentor.id}
            onClick={() => requestFeedback(mentor.id)}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded p-3 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <p className="text-white text-xs font-semibold">{mentor.instructor_name}</p>
            </div>
            <p className="text-white/60 text-xs">{mentor.specialization}</p>
          </div>
        ))}
      </div>

      {feedback.map((fb, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded p-3"
        >
          <div className="mb-2">
            <p className="text-green-400 text-xs font-semibold mb-1">Strengths:</p>
            {fb.strengths?.map((s, j) => (
              <p key={j} className="text-white/80 text-xs">✓ {s}</p>
            ))}
          </div>
          <div>
            <p className="text-orange-400 text-xs font-semibold mb-1">Areas to Improve:</p>
            {fb.improvements?.map((imp, j) => (
              <p key={j} className="text-white/80 text-xs">• {imp}</p>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}