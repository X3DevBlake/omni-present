import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_email, xp_amount, reason, source_type, source_id } = await req.json();

    if (!xp_amount) {
      return Response.json({ error: 'xp_amount required' }, { status: 400 });
    }

    const targetEmail = user_email || user.email;

    // Get or create user XP profile
    const profiles = await base44.entities.OmniAchievement.filter({
      user_email: targetEmail,
      achievement_type: 'xp_profile'
    });

    let profile = profiles[0];
    const currentXP = (profile?.xp || 0) + xp_amount;
    const currentLevel = Math.floor(currentXP / 500) + 1;

    if (profile) {
      await base44.asServiceRole.entities.OmniAchievement.update(profile.id, {
        xp: currentXP,
        level: currentLevel
      });
    } else {
      profile = await base44.asServiceRole.entities.OmniAchievement.create({
        user_email: targetEmail,
        achievement_type: 'xp_profile',
        xp: currentXP,
        level: currentLevel
      });
    }

    // Log XP transaction
    await base44.asServiceRole.entities.UserActivity.create({
      user_email: targetEmail,
      activity_type: 'xp_earned',
      details: {
        amount: xp_amount,
        reason,
        source_type,
        source_id,
        new_total: currentXP,
        new_level: currentLevel
      }
    });

    // Check for level up achievements
    const levelMilestones = [5, 10, 20, 30, 50];
    if (levelMilestones.includes(currentLevel)) {
      await base44.asServiceRole.entities.OmniAchievement.create({
        user_email: targetEmail,
        achievement_type: 'level_milestone',
        name: `Level ${currentLevel} Reached`,
        xp: currentLevel * 50,
        unlocked_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      xp_awarded: xp_amount,
      total_xp: currentXP,
      current_level: currentLevel,
      message: reason || `Awarded ${xp_amount} XP`
    });
  } catch (error) {
    console.error('XP award error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});