import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { achievement_id, achievement_name, achievement_type, xp_reward } = await req.json();

    // Check if already unlocked
    const existing = await base44.entities.OmniAchievement.filter({
      user_email: user.email,
      achievement_type,
      name: achievement_name
    });

    if (existing.length > 0) {
      return Response.json({
        success: false,
        message: 'Achievement already unlocked'
      });
    }

    // Unlock achievement
    const achievement = await base44.asServiceRole.entities.OmniAchievement.create({
      user_email: user.email,
      achievement_type,
      name: achievement_name,
      xp: xp_reward,
      unlocked_at: new Date().toISOString()
    });

    // Award XP
    await base44.functions.invoke('awardAchievement', {
      user_email: user.email,
      achievement_type: 'achievement_unlocked',
      xp: xp_reward
    });

    return Response.json({
      success: true,
      achievement,
      xp_awarded: xp_reward,
      message: `Achievement unlocked: ${achievement_name}!`
    });
  } catch (error) {
    console.error('Achievement unlock error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});