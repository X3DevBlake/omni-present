export default async function awardAchievement(data, context) {
  const { user_email, achievement_type, metadata } = data;
  
  const existingAchievement = await context.entities.OmniAchievement.filter({
    user_email,
    achievement_type
  });
  
  if (existingAchievement.length > 0) {
    return { awarded: false, reason: 'Already earned' };
  }
  
  const achievementConfig = {
    'first_agent': { xp: 100, title: 'Agent Creator', description: 'Created your first agent' },
    'first_workflow': { xp: 150, title: 'Workflow Master', description: 'Created your first workflow' },
    'simulation_expert': { xp: 200, title: 'Simulation Expert', description: 'Ran 10 simulations' },
    'collaboration_pro': { xp: 250, title: 'Team Player', description: 'Formed 5 agent teams' },
    'defi_trader': { xp: 300, title: 'DeFi Trader', description: 'Executed 10 DeFi transactions' }
  };
  
  const config = achievementConfig[achievement_type] || { xp: 50, title: 'Achievement', description: 'Unlocked' };
  
  const achievement = await context.entities.OmniAchievement.create({
    user_email,
    achievement_type,
    title: config.title,
    description: config.description,
    xp_earned: config.xp,
    metadata
  });
  
  return { awarded: true, achievement, xp_earned: config.xp };
}