import { base44 } from '@/api/base44Client';

export async function acquireSkill(agentId, userEmail, skillData) {
  const skill = {
    agent_id: agentId,
    user_email: userEmail,
    skill_name: skillData.name,
    skill_category: skillData.category,
    proficiency: 0.1,
    experience_points: 0,
    execution_logic: skillData.logic || {},
    prerequisites: skillData.prerequisites || [],
    performance_metrics: {
      success_count: 0,
      failure_count: 0,
      avg_execution_time: 0
    },
    learned_from: skillData.source || 'manual',
    last_used: null
  };

  return await base44.entities.AgentSkill.create(skill);
}

export async function practiceSkill(skillId, outcome) {
  const skill = await base44.entities.AgentSkill.filter({ id: skillId });
  if (skill.length === 0) return null;

  const skillData = skill[0];
  const metrics = skillData.performance_metrics || {};

  // Update metrics
  if (outcome.success) {
    metrics.success_count = (metrics.success_count || 0) + 1;
  } else {
    metrics.failure_count = (metrics.failure_count || 0) + 1;
  }

  const totalAttempts = (metrics.success_count || 0) + (metrics.failure_count || 0);
  const successRate = metrics.success_count / totalAttempts;

  // Increase proficiency
  const xpGain = outcome.success ? 10 : 3;
  const newXP = (skillData.experience_points || 0) + xpGain;
  const newProficiency = Math.min(1, (newXP / 1000)); // Cap at 1.0

  return await base44.entities.AgentSkill.update(skillId, {
    experience_points: newXP,
    proficiency: newProficiency,
    performance_metrics: metrics,
    last_used: new Date().toISOString()
  });
}

export async function getAgentSkills(agentId) {
  return await base44.entities.AgentSkill.filter(
    { agent_id: agentId },
    '-proficiency'
  );
}

export async function recommendSkills(agentId) {
  const currentSkills = await getAgentSkills(agentId);
  const skillNames = new Set(currentSkills.map(s => s.skill_name));

  // Recommend skills based on prerequisites
  const recommendations = [];
  const allSkillCategories = ['trading', 'communication', 'problem_solving', 'learning', 'negotiation'];

  for (const category of allSkillCategories) {
    if (!skillNames.has(category)) {
      const canLearn = checkPrerequisites(category, currentSkills);
      if (canLearn) {
        recommendations.push({
          skill: category,
          reason: `Prerequisites met for ${category}`,
          priority: calculateSkillPriority(category, currentSkills)
        });
      }
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

export async function accelerateSkillLearning(skillId, multiplier = 2) {
  const skill = await base44.entities.AgentSkill.filter({ id: skillId });
  if (skill.length === 0) return null;

  const skillData = skill[0];
  const boostedXP = (skillData.experience_points || 0) + (50 * multiplier);
  const newProficiency = Math.min(1, (boostedXP / 1000));

  return await base44.entities.AgentSkill.update(skillId, {
    experience_points: boostedXP,
    proficiency: newProficiency
  });
}

function checkPrerequisites(skillName, currentSkills) {
  const prerequisites = {
    'trading': [],
    'communication': [],
    'problem_solving': ['learning'],
    'learning': [],
    'negotiation': ['communication']
  };

  const required = prerequisites[skillName] || [];
  const learned = new Set(currentSkills.map(s => s.skill_category));

  return required.every(req => learned.has(req));
}

function calculateSkillPriority(skillName, currentSkills) {
  const avgProficiency = currentSkills.length > 0
    ? currentSkills.reduce((sum, s) => sum + s.proficiency, 0) / currentSkills.length
    : 0;

  // Prioritize complementary skills
  const complementary = {
    'trading': currentSkills.some(s => s.skill_category === 'problem_solving') ? 0.8 : 0.5,
    'communication': currentSkills.some(s => s.skill_category === 'negotiation') ? 0.7 : 0.4,
    'problem_solving': 0.9,
    'learning': 1.0,
    'negotiation': currentSkills.some(s => s.skill_category === 'communication') ? 0.8 : 0.3
  };

  return complementary[skillName] || 0.5;
}