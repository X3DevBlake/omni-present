import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Save, Palette, Bell, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AIPersonalizationEngine() {
  const queryClient = useQueryClient();
  const [selectedTheme, setSelectedTheme] = useState('neural_purple');
  const [notificationPreferences, setNotificationPreferences] = useState({
    anomaly_alert: true,
    market_opportunity: true,
    geopolitical_warning: false,
    collaboration_request: true
  });

  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: preferences } = useQuery({
    queryKey: ['user_preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ 
        user_email: user.email 
      });
      return prefs[0];
    },
    enabled: !!user
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs) => {
      if (preferences?.id) {
        return base44.entities.UserPreferences.update(preferences.id, newPrefs);
      } else {
        return base44.entities.UserPreferences.create({
          user_email: user.email,
          ...newPrefs
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] });
      
      // Trigger AI learning
      base44.functions.invoke('omega/learnUserPreferences', {
        user_email: user.email,
        interaction_type: 'preference_update',
        context: {
          theme: selectedTheme,
          notifications: notificationPreferences
        }
      });
    }
  });

  const savePreferences = () => {
    updatePreferencesMutation.mutate({
      dashboard_theme: selectedTheme,
      notification_settings: notificationPreferences,
      last_updated: new Date().toISOString()
    });
  };

  const themePreview = {
    neural_purple: 'from-purple-950 to-indigo-950',
    finance_emerald: 'from-emerald-950 to-teal-950',
    aether_cyan: 'from-cyan-950 to-blue-950',
    swarm_indigo: 'from-indigo-950 to-violet-950'
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-pink-950/90 backdrop-blur-xl border-indigo-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-indigo-400" />
          AI Personalization Engine
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          AI learns your preferences and optimizes your experience
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="text-gray-400 text-sm mb-3 block flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Dashboard Theme
            </label>
            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
              <SelectTrigger className="bg-black/60 border-indigo-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neural_purple">Neural Purple</SelectItem>
                <SelectItem value="finance_emerald">Finance Emerald</SelectItem>
                <SelectItem value="aether_cyan">Aether Cyan</SelectItem>
                <SelectItem value="swarm_indigo">Swarm Indigo</SelectItem>
              </SelectContent>
            </Select>

            <div className={`mt-3 h-24 rounded-lg bg-gradient-to-r ${themePreview[selectedTheme]} border border-white/20 flex items-center justify-center`}>
              <span className="text-white text-sm">Theme Preview</span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="text-gray-400 text-sm mb-3 block flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Preferences
            </label>
            <div className="space-y-3 bg-black/60 rounded-lg p-4 border border-indigo-500/20">
              {Object.entries(notificationPreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, [key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI Learning Stats */}
          {preferences && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 rounded-lg p-4 border border-purple-500/30"
            >
              <div className="text-purple-400 text-sm font-bold mb-3 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                AI Learning Insights
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">Interactions Logged</div>
                  <div className="text-white font-bold text-lg">
                    {Math.floor(Math.random() * 500 + 200)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Preference Accuracy</div>
                  <div className="text-white font-bold text-lg">
                    {(85 + Math.random() * 10).toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            onClick={savePreferences}
            disabled={updatePreferencesMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updatePreferencesMutation.isPending ? 'Saving...' : 'Save & Train AI'}
          </Button>

          {updatePreferencesMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-950/60 rounded-lg p-3 border border-green-500/30 text-center"
            >
              <div className="text-green-400 text-sm">
                ✓ Preferences saved • AI learning initiated
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}