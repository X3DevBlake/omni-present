import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievement_id, user_id_override } = await req.json();
    const target_user_id = user_id_override || user.id;
    
    // Check if already unlocked
    const existing = await base44.entities.UserAchievement.filter({
      user_id: target_user_id,
      achievement_id,
      is_unlocked: true
    });
    
    if (existing.length > 0) {
      return Response.json({
        message: 'Achievement already unlocked',
        achievement: existing[0]
      });
    }
    
    // Achievement definitions
    const achievementDefs = {
      'first_agent_hire': {
        name: 'First Agent Hired',
        description: 'Hired your first AI agent',
        category: 'milestone',
        rarity: 'common',
        xp_reward: 100
      },
      'marketplace_expert': {
        name: 'Marketplace Expert',
        description: 'Completed 10 agent transactions',
        category: 'performance',
        rarity: 'rare',
        xp_reward: 500
      },
      'collaboration_master': {
        name: 'Collaboration Master',
        description: 'Successfully coordinated 5+ agents',
        category: 'collaboration',
        rarity: 'epic',
        xp_reward: 1000
      },
      'defi_pioneer': {
        name: 'DeFi Pioneer',
        description: 'Executed first DeFi strategy',
        category: 'special',
        rarity: 'legendary',
        xp_reward: 2000
      }
    };
    
    const achievementDef = achievementDefs[achievement_id];
    
    if (!achievementDef) {
      return Response.json({ error: 'Achievement not found' }, { status: 404 });
    }
    
    // Create achievement
    const achievement = await base44.entities.UserAchievement.create({
      user_id: target_user_id,
      achievement_id,
      achievement_name: achievementDef.name,
      achievement_description: achievementDef.description,
      category: achievementDef.category,
      rarity: achievementDef.rarity,
      xp_reward: achievementDef.xp_reward,
      unlocked_at: new Date().toISOString(),
      progress: 100,
      is_unlocked: true
    });
    
    // Send notification
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `🎉 Achievement Unlocked: ${achievementDef.name}`,
      body: `Congratulations! You've earned the "${achievementDef.name}" achievement!\n\n${achievementDef.description}\n\nXP Reward: ${achievementDef.xp_reward}`
    });
    
    return Response.json({
      achievement,
      message: `Achievement "${achievementDef.name}" unlocked!`,
      xp_earned: achievementDef.xp_reward
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});