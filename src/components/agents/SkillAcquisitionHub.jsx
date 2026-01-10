import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, TrendingUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function SkillAcquisitionHub({ agentId }) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const { data: skills = [] } = useQuery({
    queryKey: ['agentSkills', agentId],
    queryFn: () => base44.entities.AgentSkill.filter({ agent_id: agentId }).catch(() => [])
  });

  const allSkillCategories = ['trading', 'communication', 'problem_solving', 'learning', 'negotiation'];
  const learnedCategories = new Set(skills.map(s => s.skill_category));
  const availableSkills = allSkillCategories.filter(cat => !learnedCategories.has(cat));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-bold">Skill Acquisition</h3>
      </div>

      {/* Learned Skills */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs font-bold">LEARNED SKILLS</p>
        {skills.map((skill, idx) => (
          <motion.div
            key={skill.id || idx}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedSkill(skill)}
            className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-pointer hover:border-yellow-500/50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-white font-bold text-sm">{skill.skill_name}</p>
                <p className="text-white/50 text-xs">{skill.skill_category}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-xs">
                  {(skill.proficiency * 100).toFixed(0)}%
                </p>
                <p className="text-white/40 text-xs">{skill.experience_points || 0} XP</p>
              </div>
            </div>
            <Progress value={(skill.proficiency || 0) * 100} className="h-2" />
          </motion.div>
        ))}
      </div>

      {/* Available Skills */}
      {availableSkills.length > 0 && (
        <div className="space-y-2 mt-6">
          <p className="text-white/60 text-xs font-bold">AVAILABLE SKILLS</p>
          {availableSkills.map((category, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 opacity-60"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-sm">{category}</p>
                  <p className="text-white/50 text-xs">Not yet learned</p>
                </div>
                <div className="flex gap-2">
                  <Lock className="w-4 h-4 text-white/40" />
                  <Button size="xs" variant="outline">Learn</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedSkill && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4"
        >
          <h4 className="text-yellow-300 font-bold mb-2">{selectedSkill.skill_name} Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>
              <p className="text-white/50">Category</p>
              <p>{selectedSkill.skill_category}</p>
            </div>
            <div>
              <p className="text-white/50">Proficiency</p>
              <p>{(selectedSkill.proficiency * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-white/50">Total XP</p>
              <p>{selectedSkill.experience_points}</p>
            </div>
            <div>
              <p className="text-white/50">Last Used</p>
              <p>{selectedSkill.last_used ? 'Recently' : 'Never'}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs">
        <p className="text-white/60">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Total XP: {skills.reduce((sum, s) => sum + (s.experience_points || 0), 0)}
        </p>
      </div>
    </motion.div>
  );
}