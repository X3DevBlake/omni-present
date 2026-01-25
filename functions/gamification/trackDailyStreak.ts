import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's achievement profile
    const profiles = await base44.entities.OmniAchievement.filter({ 
      user_email: user.email,
      achievement_type: 'daily_login'
    });

    const today = new Date().toISOString().split('T')[0];
    let streakProfile = profiles[0];

    if (!streakProfile) {
      // Create new streak profile
      streakProfile = await base44.asServiceRole.entities.OmniAchievement.create({
        user_email: user.email,
        achievement_type: 'daily_login',
        current_streak: 1,
        longest_streak: 1,
        last_login_date: today,
        total_logins: 1
      });
    } else {
      const lastLogin = streakProfile.last_login_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = streakProfile.current_streak || 0;
      
      if (lastLogin === today) {
        // Already logged in today
        return Response.json({
          success: true,
          current_streak: newStreak,
          bonus_xp: 0,
          message: 'Already logged in today'
        });
      } else if (lastLogin === yesterdayStr) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streakProfile.longest_streak || 0);
      const bonusXP = newStreak * 10;

      // Update profile
      await base44.asServiceRole.entities.OmniAchievement.update(streakProfile.id, {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_login_date: today,
        total_logins: (streakProfile.total_logins || 0) + 1
      });

      // Award streak bonus XP
      if (bonusXP > 0) {
        await base44.functions.invoke('awardAchievement', {
          user_email: user.email,
          achievement_type: 'daily_login_bonus',
          xp: bonusXP
        });
      }

      // Unlock milestone achievements
      const milestones = [
        { days: 7, name: 'Week Warrior', xp: 100 },
        { days: 30, name: 'Month Master', xp: 500 },
        { days: 100, name: 'Century Streak', xp: 2000 }
      ];

      for (const milestone of milestones) {
        if (newStreak === milestone.days) {
          await base44.asServiceRole.entities.OmniAchievement.create({
            user_email: user.email,
            achievement_type: 'streak_milestone',
            name: milestone.name,
            xp: milestone.xp,
            unlocked_at: new Date().toISOString()
          });
        }
      }

      return Response.json({
        success: true,
        current_streak: newStreak,
        longest_streak: longestStreak,
        bonus_xp: bonusXP,
        message: `${newStreak} day streak! +${bonusXP} XP`
      });
    }
  } catch (error) {
    console.error('Streak tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});