import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Globe, Save, Palette, Monitor } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Settings() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false,
  });
  const [customBlueprints, setCustomBlueprints] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load settings from user data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = await base44.auth.me();
        if (user.settings) {
          setTheme(user.settings.theme || 'dark');
          setLanguage(user.settings.language || 'en');
          setNotifications(user.settings.notifications || notifications);
          setCustomBlueprints(user.settings.customBlueprints || []);
        }
      } catch (error) {
        console.log('User not logged in or settings not found');
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        settings: {
          theme,
          language,
          notifications,
          customBlueprints,
        }
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { value: 'dark', label: 'Dark', icon: Moon, gradient: 'from-gray-900 to-gray-800' },
    { value: 'light', label: 'Light', icon: Sun, gradient: 'from-gray-100 to-white' },
    { value: 'auto', label: 'Auto', icon: Monitor, gradient: 'from-gray-600 to-gray-400' },
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Settings
            </h1>
            <p className="text-white/50 text-lg">
              Customize your Omni-Present experience
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Theme</h2>
                  <p className="text-white/50 text-sm">Choose your preferred color scheme</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = theme === themeOption.value;
                  return (
                    <motion.button
                      key={themeOption.value}
                      onClick={() => setTheme(themeOption.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${themeOption.gradient} mb-3`} />
                      <div className="flex items-center justify-center gap-2">
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-white font-medium">{themeOption.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Language Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Language</h2>
                  <p className="text-white/50 text-sm">Select your preferred language</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {languages.map((lang) => {
                  const isSelected = language === lang.value;
                  return (
                    <motion.button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-3xl mb-2">{lang.flag}</div>
                      <div className="text-white text-sm font-medium">{lang.label}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Notification Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Notifications</h2>
                  <p className="text-white/50 text-sm">Manage your notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-white/50 text-sm">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Enable browser push notifications'}
                        {key === 'updates' && 'Get updates about new features'}
                        {key === 'marketing' && 'Receive promotional content'}
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !value })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        value ? 'bg-cyan-500' : 'bg-white/20'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
                        animate={{ x: value ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Custom Blueprints */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                  <Save className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Custom Blueprints</h2>
                  <p className="text-white/50 text-sm">Your saved configurations</p>
                </div>
              </div>

              {customBlueprints.length > 0 ? (
                <div className="space-y-3">
                  {customBlueprints.map((blueprint, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
                    >
                      <div className="text-white font-medium">{blueprint.name}</div>
                      <div className="text-white/50 text-sm mt-1">{blueprint.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/50">
                  <p>No custom blueprints saved yet</p>
                  <p className="text-sm mt-2">Create blueprints in Build Mode to save them here</p>
                </div>
              )}
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end"
            >
              <motion.button
                onClick={saveSettings}
                disabled={saving}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: saving ? 1 : 1.05 }}
                whileTap={{ scale: saving ? 1 : 0.95 }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}