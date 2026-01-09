import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) throw new Error('useGamification must be used within GamificationProvider');
  return context;
};

export const GamificationProvider = ({ children }) => {
  const [userStats, setUserStats] = useState({
    xp: 0,
    level: 1,
    badges: [],
    achievements: [],
    streak: 0,
    rank: null
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const user = await base44.auth.me();
      setUserStats({
        xp: user.gamification_xp || 0,
        level: calculateLevel(user.gamification_xp || 0),
        badges: user.gamification_badges || [],
        achievements: user.gamification_achievements || [],
        streak: user.gamification_streak || 0,
        rank: user.gamification_rank || null
      });
    } catch (error) {
      console.error('Failed to load gamification stats:', error);
    }
  };

  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  const addXP = async (amount, reason) => {
    try {
      const user = await base44.auth.me();
      const newXP = (user.gamification_xp || 0) + amount;
      const newLevel = calculateLevel(newXP);
      const oldLevel = userStats.level;

      await base44.auth.updateMe({
        gamification_xp: newXP
      });

      setUserStats(prev => ({
        ...prev,
        xp: newXP,
        level: newLevel
      }));

      // Check for level up
      if (newLevel > oldLevel) {
        return { levelUp: true, newLevel };
      }

      return { levelUp: false };
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  };

  const unlockBadge = async (badgeId, badgeData) => {
    try {
      const user = await base44.auth.me();
      const badges = user.gamification_badges || [];
      
      if (badges.find(b => b.id === badgeId)) return;

      const newBadges = [...badges, { ...badgeData, id: badgeId, unlockedAt: new Date().toISOString() }];
      
      await base44.auth.updateMe({
        gamification_badges: newBadges
      });

      setUserStats(prev => ({
        ...prev,
        badges: newBadges
      }));

      return true;
    } catch (error) {
      console.error('Failed to unlock badge:', error);
      return false;
    }
  };

  const unlockAchievement = async (achievementId, achievementData) => {
    try {
      const user = await base44.auth.me();
      const achievements = user.gamification_achievements || [];
      
      if (achievements.find(a => a.id === achievementId)) return;

      const newAchievements = [...achievements, { ...achievementData, id: achievementId, unlockedAt: new Date().toISOString() }];
      
      await base44.auth.updateMe({
        gamification_achievements: newAchievements
      });

      setUserStats(prev => ({
        ...prev,
        achievements: newAchievements
      }));

      // Award XP for achievement
      if (achievementData.xpReward) {
        await addXP(achievementData.xpReward, `Achievement: ${achievementData.name}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      return false;
    }
  };

  const updateStreak = async () => {
    try {
      const user = await base44.auth.me();
      const lastActive = user.gamification_last_active ? new Date(user.gamification_last_active) : null;
      const today = new Date();
      
      let newStreak = user.gamification_streak || 0;
      
      if (lastActive) {
        const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await base44.auth.updateMe({
        gamification_streak: newStreak,
        gamification_last_active: today.toISOString()
      });

      setUserStats(prev => ({
        ...prev,
        streak: newStreak
      }));
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  return (
    <GamificationContext.Provider value={{
      userStats,
      addXP,
      unlockBadge,
      unlockAchievement,
      updateStreak,
      loadUserStats
    }}>
      {children}
    </GamificationContext.Provider>
  );
};