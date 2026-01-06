import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const SKILL_TREE = {
  movement: {
    name: 'Movement',
    skills: [
      { id: 'basic_movement', name: 'Basic Movement', cost: 0, unlocked: true, level: 1, maxLevel: 3 },
      { id: 'sprint', name: 'Sprint', cost: 2, requires: ['basic_movement'], level: 0, maxLevel: 3 },
      { id: 'jump', name: 'Jump', cost: 2, requires: ['basic_movement'], level: 0, maxLevel: 2 },
      { id: 'climb', name: 'Climb', cost: 3, requires: ['jump'], level: 0, maxLevel: 2 }
    ]
  },
  interaction: {
    name: 'Interaction',
    skills: [
      { id: 'observation', name: 'Observation', cost: 0, unlocked: true, level: 1, maxLevel: 3 },
      { id: 'manipulation', name: 'Object Manipulation', cost: 2, requires: ['observation'], level: 0, maxLevel: 3 },
      { id: 'construction', name: 'Construction', cost: 3, requires: ['manipulation'], level: 0, maxLevel: 3 },
      { id: 'crafting', name: 'Advanced Crafting', cost: 4, requires: ['construction'], level: 0, maxLevel: 2 }
    ]
  },
  social: {
    name: 'Social',
    skills: [
      { id: 'communication', name: 'Communication', cost: 1, unlocked: true, level: 1, maxLevel: 3 },
      { id: 'negotiation', name: 'Negotiation', cost: 2, requires: ['communication'], level: 0, maxLevel: 3 },
      { id: 'leadership', name: 'Leadership', cost: 3, requires: ['negotiation'], level: 0, maxLevel: 2 },
      { id: 'empathy', name: 'Empathy', cost: 2, requires: ['communication'], level: 0, maxLevel: 3 }
    ]
  },
  combat: {
    name: 'Combat',
    skills: [
      { id: 'basic_defense', name: 'Basic Defense', cost: 1, level: 0, maxLevel: 3 },
      { id: 'tactical_awareness', name: 'Tactical Awareness', cost: 2, requires: ['basic_defense'], level: 0, maxLevel: 3 },
      { id: 'strategy', name: 'Strategy', cost: 3, requires: ['tactical_awareness'], level: 0, maxLevel: 2 }
    ]
  },
  intelligence: {
    name: 'Intelligence',
    skills: [
      { id: 'learning', name: 'Fast Learning', cost: 2, level: 0, maxLevel: 3 },
      { id: 'pattern_recognition', name: 'Pattern Recognition', cost: 3, requires: ['learning'], level: 0, maxLevel: 3 },
      { id: 'problem_solving', name: 'Problem Solving', cost: 3, requires: ['learning'], level: 0, maxLevel: 2 },
      { id: 'creativity', name: 'Creativity', cost: 4, requires: ['pattern_recognition', 'problem_solving'], level: 0, maxLevel: 2 }
    ]
  }
};

export default function AgentSkillTree({ show, onClose, agent, onSkillUnlock }) {
  const [skillTree, setSkillTree] = useState(() => {
    const tree = JSON.parse(JSON.stringify(SKILL_TREE));
    // Initialize agent's current skills
    if (agent?.skills) {
      Object.values(tree).forEach(category => {
        category.skills.forEach(skill => {
          if (agent.skills.includes(skill.id)) {
            skill.unlocked = true;
            skill.level = 1;
          }
        });
      });
    }
    return tree;
  });
  
  const [availablePoints, setAvailablePoints] = useState(agent?.skillPoints || 5);

  const canUnlockSkill = (skill) => {
    if (skill.unlocked && skill.level >= skill.maxLevel) return false;
    if (!skill.unlocked && availablePoints < skill.cost) return false;
    
    if (skill.requires) {
      return skill.requires.every(reqId => {
        const reqSkill = Object.values(skillTree).flatMap(cat => cat.skills).find(s => s.id === reqId);
        return reqSkill?.unlocked;
      });
    }
    
    return true;
  };

  const unlockSkill = (categoryKey, skillIndex) => {
    const skill = skillTree[categoryKey].skills[skillIndex];
    
    if (!canUnlockSkill(skill)) {
      toast.error('Cannot unlock this skill yet');
      return;
    }

    const newTree = { ...skillTree };
    const targetSkill = newTree[categoryKey].skills[skillIndex];
    
    if (!targetSkill.unlocked) {
      targetSkill.unlocked = true;
      targetSkill.level = 1;
      setAvailablePoints(prev => prev - targetSkill.cost);
      toast.success(`Unlocked: ${targetSkill.name}!`);
    } else if (targetSkill.level < targetSkill.maxLevel) {
      targetSkill.level += 1;
      setAvailablePoints(prev => prev - 1);
      toast.success(`${targetSkill.name} upgraded to Level ${targetSkill.level}!`);
    }
    
    setSkillTree(newTree);
    
    if (onSkillUnlock) {
      onSkillUnlock(targetSkill);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Skill Tree: {agent?.name}</h3>
                <p className="text-white/60 text-sm">Available Points: {availablePoints}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(skillTree).map(([categoryKey, category]) => (
                <div key={categoryKey} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold mb-4 text-lg">{category.name}</h4>
                  <div className="space-y-3">
                    {category.skills.map((skill, index) => {
                      const canUnlock = canUnlockSkill(skill);
                      const isMaxLevel = skill.unlocked && skill.level >= skill.maxLevel;
                      
                      return (
                        <div
                          key={skill.id}
                          className={`relative p-3 rounded-lg border transition-all ${
                            skill.unlocked
                              ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/40'
                              : canUnlock
                              ? 'bg-white/5 border-white/20 hover:border-cyan-500/40 cursor-pointer'
                              : 'bg-white/5 border-white/10 opacity-50'
                          }`}
                          onClick={() => canUnlock && unlockSkill(categoryKey, index)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {skill.unlocked ? (
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-white/40 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-medium ${skill.unlocked ? 'text-white' : 'text-white/60'}`}>
                                {skill.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-400">{skill.cost}</span>
                            </div>
                          </div>
                          
                          {skill.unlocked && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-white/60">Level {skill.level}/{skill.maxLevel}</span>
                              </div>
                              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                  style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {skill.requires && !skill.unlocked && (
                            <div className="text-xs text-white/40 mt-1">
                              Requires: {skill.requires.join(', ')}
                            </div>
                          )}
                          
                          {isMaxLevel && (
                            <div className="absolute top-2 right-2">
                              <div className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-yellow-400 text-xs">
                                MAX
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                <span className="font-semibold text-white">Tip:</span> Skills unlock new behaviors and interactions
              </div>
              <div className="text-sm">
                <span className="text-white/60">Experience: </span>
                <span className="text-cyan-400 font-semibold">{agent?.experience || 0} XP</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}