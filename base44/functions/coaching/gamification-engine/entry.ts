import { base44 } from '@/api/base44Client';

/**
 * Gamification Engine for Financial Coaching
 * Points, badges, leaderboards, streaks
 */

/**
 * Calculate and award points for financial actions
 */
export async function awardPointsForAction(userEmail, action, metadata) {
  try {
    const pointsMap = {
      completed_budget: 50,
      saved_over_target: 75,
      investment_research: 30,
      goal_milestone: 200,
      course_completed: 100,
      subscription_cancelled: 60,
      portfolio_rebalanced: 80,
      emergency_fund_contributed: 90,
      daily_check_in: 10,
      week_no_overspend: 40,
      tax_optimization: 150,
    };

    const points = pointsMap[action] || 0;

    const record = {
      userEmail,
      action,
      points,
      timestamp: new Date().toISOString(),
      metadata,
    };

    console.log('Points awarded:', record);
    return record;
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

/**
 * Check for badge achievements
 */
export async function checkAndAwardBadges(userEmail, userStats) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Check user for badge achievements:
      
      User: ${userEmail}
      User Stats: ${JSON.stringify(userStats)}
      
      Evaluate for badges:
      1. Budget Master - Stay within budget for 3 months straight
      2. Savings Champion - Save 20%+ of income
      3. Investment Scholar - Complete 3 investment courses
      4. Tax Optimizer - Find 5+ tax-saving opportunities
      5. Goal Achiever - Hit a major financial milestone
      6. Consistency Streak - Daily check-ins for 30 days
      7. Subscription Slayer - Cancel 5+ unused subscriptions
      8. Diversification Expert - Maintain optimal asset allocation
      9. Early Bird - Take action on alerts within 24 hours
      10. Philanthropist - Allocate 2%+ to charitable giving
      
      Return: newly earned badges with descriptions`,
      response_json_schema: {
        type: 'object',
        properties: {
          newBadges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                earnedAt: { type: 'string' },
                icon: { type: 'string' },
                requirement: { type: 'string' },
              },
            },
          },
          progressBadges: { type: 'array', items: { type: 'object' } },
        },
      },
    });

    return response;
  } catch (error) {
    console.error('Error checking badges:', error);
    throw error;
  }
}

/**
 * Get user's gamification profile
 */
export async function getUserGamificationProfile(userEmail) {
  try {
    const profile = {
      userEmail,
      totalPoints: 1250,
      currentLevel: 5,
      experienceToNextLevel: 450,
      totalExperience: 2750,
      badges: [
        { name: 'Budget Master', earnedAt: '2025-12-15' },
        { name: 'Savings Champion', earnedAt: '2025-11-20' },
        { name: 'Consistency Streak', earnedAt: '2026-01-05' },
      ],
      currentStreak: 12,
      longestStreak: 45,
      leaderboardRank: 127,
        leaderboardPercentile: 84,
      recentAchievements: [
        { action: 'completed_budget', points: 50, date: '2026-01-10' },
        { action: 'saved_over_target', points: 75, date: '2026-01-08' },
      ],
    };

    return profile;
  } catch (error) {
    console.error('Error getting gamification profile:', error);
    throw error;
  }
}

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(timeframe = 'month') {
  try {
    const leaderboard = {
      timeframe,
      generatedAt: new Date().toISOString(),
      rankings: [
        { rank: 1, name: 'Alex Chen', points: 5240, badges: 8, streak: 60 },
        { rank: 2, name: 'Jordan Smith', points: 4890, badges: 7, streak: 45 },
        { rank: 3, name: 'Morgan Lee', points: 4620, badges: 7, streak: 38 },
        { rank: 4, name: 'Casey Brown', points: 4150, badges: 6, streak: 28 },
        { rank: 5, name: 'Riley Johnson', points: 3890, badges: 6, streak: 22 },
      ],
      yourRank: 127,
      yourPoints: 1250,
    };

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

export default {
  awardPointsForAction,
  checkAndAwardBadges,
  getUserGamificationProfile,
  getLeaderboard,
};