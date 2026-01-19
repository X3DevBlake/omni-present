import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import Achievement3DShowcase from '@/components/gamification/Achievement3DShowcase';
import { Trophy, Award, Zap, Target } from 'lucide-react';

export default function EnhancedGamificationHub() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.UserAchievement.filter({ user_id: user.id });
    },
    enabled: !!user
  });

  const awardAchievementMutation = useMutation({
    mutationFn: async (achievementId) => {
      const response = await base44.functions.invoke('awardAchievement', {
        achievement_id: achievementId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-achievements']);
    }
  });

  const unlockedAchievements = achievements.filter(a => a.is_unlocked);
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + (a.xp_reward || 0), 0);
  const level = Math.floor(totalXP / 1000) + 1;
  const xpToNextLevel = ((level * 1000) - totalXP);

  const rarityCount = {
    common: achievements.filter(a => a.rarity === 'common' && a.is_unlocked).length,
    rare: achievements.filter(a => a.rarity === 'rare' && a.is_unlocked).length,
    epic: achievements.filter(a => a.rarity === 'epic' && a.is_unlocked).length,
    legendary: achievements.filter(a => a.rarity === 'legendary' && a.is_unlocked).length
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
            Gamification Hub
          </h1>
          <p className="text-xl text-gray-300">
            Track your progress, unlock achievements, and level up
          </p>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Level</p>
                  <p className="text-4xl font-bold text-white">{level}</p>
                </div>
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total XP</p>
                  <p className="text-3xl font-bold text-white">{totalXP.toLocaleString()}</p>
                </div>
                <Target className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Achievements</p>
                  <p className="text-3xl font-bold text-white">
                    {unlockedAchievements.length}/{achievements.length}
                  </p>
                </div>
                <Award className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">To Next Level</p>
                  <p className="text-3xl font-bold text-white">{xpToNextLevel}</p>
                  <p className="text-xs text-gray-400">XP needed</p>
                </div>
                <Trophy className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rarity Breakdown */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Achievement Rarity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge className="bg-slate-600">Common: {rarityCount.common}</Badge>
              <Badge className="bg-blue-600">Rare: {rarityCount.rare}</Badge>
              <Badge className="bg-purple-600">Epic: {rarityCount.epic}</Badge>
              <Badge className="bg-yellow-600">Legendary: {rarityCount.legendary}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="3d">3D Achievement Showcase</TabsTrigger>
            <TabsTrigger value="list">Achievement List</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <Achievement3DShowcase achievements={achievements} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className={`border-slate-700 ${
                  achievement.is_unlocked
                    ? 'bg-gradient-to-r from-slate-800 to-slate-900'
                    : 'bg-slate-900/30'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${
                            achievement.is_unlocked ? 'text-white' : 'text-gray-500'
                          }`}>
                            {achievement.achievement_name}
                          </h3>
                          <Badge className={
                            achievement.rarity === 'legendary' ? 'bg-yellow-600' :
                            achievement.rarity === 'epic' ? 'bg-purple-600' :
                            achievement.rarity === 'rare' ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {achievement.rarity}
                          </Badge>
                          {achievement.is_unlocked && (
                            <Badge className="bg-green-600">Unlocked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{achievement.achievement_description}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-yellow-400">+{achievement.xp_reward} XP</span>
                          {!achievement.is_unlocked && (
                            <span className="text-sm text-gray-500">Progress: {achievement.progress}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}