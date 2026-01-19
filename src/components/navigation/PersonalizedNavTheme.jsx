import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Personalized Navigation Theme Provider
 * Adapts navigation experience based on user role and preferences
 */
export function usePersonalizedNavTheme() {
  const [theme, setTheme] = useState({
    primaryColor: '#00f5ff',
    secondaryColor: '#a855f7',
    visualStyle: 'modern',
    density: 'normal',
  });

  const { data: user } = useQuery({
    queryKey: ['user-nav-theme'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return user;
    },
  });

  useEffect(() => {
    if (!user) return;

    // Customize based on user role
    if (user.role === 'admin') {
      setTheme({
        primaryColor: '#ff6b00',
        secondaryColor: '#ff0066',
        visualStyle: 'advanced',
        density: 'dense',
      });
    } else {
      // Check user preferences from User entity
      const savedTheme = user.nav_theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [user]);

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    await base44.auth.updateMe({ nav_theme: newTheme });
  };

  return { theme, updateTheme };
}

export function NavThemeSelector({ onThemeChange }) {
  const themes = [
    { name: 'Cyber Blue', primary: '#00f5ff', secondary: '#a855f7' },
    { name: 'Neon Purple', primary: '#a855f7', secondary: '#ec4899' },
    { name: 'Matrix Green', primary: '#00ff88', secondary: '#00ffff' },
    { name: 'Fire Orange', primary: '#ff6b00', secondary: '#ff0066' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {themes.map((theme) => (
        <button
          key={theme.name}
          onClick={() => onThemeChange({ primaryColor: theme.primary, secondaryColor: theme.secondary })}
          className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`,
          }}
        >
          <div className="text-white text-xs font-medium">{theme.name}</div>
          <div className="flex gap-1 mt-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.primary }} />
            <div className="w-3 h-3 rounded" style={{ backgroundColor: theme.secondary }} />
          </div>
        </button>
      ))}
    </div>
  );
}