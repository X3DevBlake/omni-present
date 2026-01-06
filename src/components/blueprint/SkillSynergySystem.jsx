import React from 'react';
import { Zap, Users } from 'lucide-react';

const SKILL_SYNERGIES = {
  'engineering_construction': { skills: ['engineering', 'construction'], bonus: 1.5, name: 'Master Builder', description: 'Building speed +50%' },
  'leadership_coordination': { skills: ['leadership', 'coordination'], bonus: 1.4, name: 'Commander', description: 'Team efficiency +40%' },
  'combat_tactics': { skills: ['combat', 'tactics'], bonus: 1.6, name: 'Warrior Elite', description: 'Combat effectiveness +60%' },
  'gathering_exploration': { skills: ['gathering', 'exploration'], bonus: 1.3, name: 'Scout Master', description: 'Resource finding +30%' },
  'negotiation_diplomacy': { skills: ['negotiation', 'diplomacy'], bonus: 1.4, name: 'Diplomat', description: 'Conflict resolution +40%' },
  'medicine_biology': { skills: ['medicine', 'biology'], bonus: 1.5, name: 'Healer', description: 'Recovery rate +50%' },
  'crafting_engineering': { skills: ['crafting', 'engineering'], bonus: 1.4, name: 'Artificer', description: 'Tool quality +40%' },
  'stealth_observation': { skills: ['stealth', 'observation'], bonus: 1.5, name: 'Shadow', description: 'Detection avoidance +50%' }
};

export function calculateSynergy(agents) {
  const allSkills = agents.flatMap(a => a.skills || []);
  const activeSynergies = [];

  Object.entries(SKILL_SYNERGIES).forEach(([id, synergy]) => {
    const hasAllSkills = synergy.skills.every(skill => allSkills.includes(skill));
    if (hasAllSkills) {
      activeSynergies.push({ id, ...synergy });
    }
  });

  const totalBonus = activeSynergies.reduce((sum, s) => sum + (s.bonus - 1), 0);
  return { activeSynergies, totalBonus, multiplier: 1 + totalBonus };
}

export function SynergyIndicator({ agents }) {
  const { activeSynergies, multiplier } = calculateSynergy(agents);

  if (activeSynergies.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 font-semibold text-sm">Skill Synergies Active</span>
        <span className="ml-auto text-yellow-400 font-bold">×{multiplier.toFixed(2)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {activeSynergies.map(synergy => (
          <div key={synergy.id} className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300 text-xs">
            {synergy.name} (+{((synergy.bonus - 1) * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamworkSkill({ agent, level = 1 }) {
  const teamworkBonus = level * 0.15;
  
  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-blue-400" />
        <span className="text-blue-400 font-semibold text-sm">Teamwork Level {level}</span>
      </div>
      <div className="text-white/80 text-xs mb-2">
        Boosts group performance by {(teamworkBonus * 100).toFixed(0)}%
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full" style={{ width: `${(level / 5) * 100}%` }} />
      </div>
    </div>
  );
}