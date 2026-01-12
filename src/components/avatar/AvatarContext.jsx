import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AvatarContext = createContext();

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within AvatarProvider');
  }
  return context;
};

export function AvatarProvider({ children }) {
  const [activeAvatarId, setActiveAvatarId] = useState(null);
  const [activeAvatar, setActiveAvatar] = useState(null);
  const [agentAvatars, setAgentAvatars] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [currentHub, setCurrentHub] = useState('home');
  const [animationState, setAnimationState] = useState('idle');

  // Load active user avatar
  useEffect(() => {
    if (activeAvatarId) {
      base44.entities.UserAvatar.list()
        .then(avatars => {
          const avatar = avatars.find(a => a.id === activeAvatarId);
          if (avatar) setActiveAvatar(avatar);
        })
        .catch(console.error);
    }
  }, [activeAvatarId]);

  // Load agent avatars for current context
  const loadAgentAvatars = async (agentIds = []) => {
    try {
      const appearances = await base44.entities.AgentAppearance.list();
      const filtered = appearances.filter(a => agentIds.includes(a.agent_id));
      setAgentAvatars(filtered);
    } catch (error) {
      console.error('Failed to load agent avatars:', error);
    }
  };

  // Trigger gesture/emote
  const triggerGesture = async (avatarId, gestureType) => {
    try {
      const appearance = agentAvatars.find(a => a.id === avatarId);
      if (appearance) {
        const updatedQueue = [
          ...(appearance.gesture_queue || []),
          { gesture_type: gestureType, trigger_time: new Date().toISOString() }
        ];
        await base44.entities.AgentAppearance.update(avatarId, {
          gesture_queue: updatedQueue
        });
        loadAgentAvatars(agentAvatars.map(a => a.agent_id));
      }
    } catch (error) {
      console.error('Failed to trigger gesture:', error);
    }
  };

  // Update animation based on hub transition
  const updateAnimationForHub = (hubName) => {
    setCurrentHub(hubName);
    setAnimationState('walking');
    setTimeout(() => setAnimationState('idle'), 2000);
  };

  return (
    <AvatarContext.Provider
      value={{
        activeAvatarId,
        setActiveAvatarId,
        activeAvatar,
        agentAvatars,
        loadAgentAvatars,
        isVisible,
        setIsVisible,
        currentHub,
        updateAnimationForHub,
        animationState,
        setAnimationState,
        triggerGesture
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}