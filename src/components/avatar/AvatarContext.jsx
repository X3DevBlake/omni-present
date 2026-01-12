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

export const AvatarProvider = ({ children }) => {
  const [activeAvatarId, setActiveAvatarId] = useState(null);
  const [avatarData, setAvatarData] = useState(null);
  const [agentAppearances, setAgentAppearances] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [position, setPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    if (activeAvatarId) {
      loadAvatarData(activeAvatarId);
    }
  }, [activeAvatarId]);

  useEffect(() => {
    // Subscribe to agent appearance updates
    const unsubscribe = base44.entities.AgentAppearance.subscribe((event) => {
      if (event.type === 'create' || event.type === 'update') {
        setAgentAppearances(prev => {
          const filtered = prev.filter(a => a.id !== event.data.id);
          return [...filtered, event.data];
        });
      }
    });

    return unsubscribe;
  }, []);

  const loadAvatarData = async (avatarId) => {
    try {
      const avatar = await base44.entities.UserAvatar.list();
      const found = avatar.find(a => a.id === avatarId);
      if (found) {
        setAvatarData(found);
        const [baseData, components] = await Promise.all([
          base44.entities.AvatarBase.list(),
          base44.entities.CustomComponent.list()
        ]);
        const avatarBase = baseData.find(b => b.id === found.avatar_base_id);
        const selectedComps = components.filter(c => found.selected_components?.includes(c.id));
        setAvatarData({ ...found, base: avatarBase, components: selectedComps });
      }
    } catch (error) {
      console.error('Error loading avatar:', error);
    }
  };

  const setActiveAvatar = (avatarId) => {
    setActiveAvatarId(avatarId);
    setIsVisible(true);
  };

  const loadAgentAppearance = async (agentId) => {
    try {
      const appearances = await base44.entities.AgentAppearance.filter({ agent_id: agentId });
      if (appearances.length > 0) {
        const appearance = appearances[0];
        const [baseData, components] = await Promise.all([
          base44.entities.AvatarBase.list(),
          base44.entities.CustomComponent.list()
        ]);
        const avatarBase = baseData.find(b => b.id === appearance.avatar_base_id);
        const selectedComps = components.filter(c => appearance.selected_components?.includes(c.id));
        setAvatarData({ ...appearance, base: avatarBase, components: selectedComps, isAgent: true });
        setActiveAvatarId(appearance.id);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error loading agent appearance:', error);
    }
  };

  const triggerGesture = async (gestureType, agentId, reason) => {
    if (agentId) {
      const appearances = await base44.entities.AgentAppearance.filter({ agent_id: agentId });
      if (appearances.length > 0) {
        const appearance = appearances[0];
        const newGesture = {
          gesture_type: gestureType,
          timestamp: new Date().toISOString(),
          trigger_reason: reason
        };
        const updatedQueue = [...(appearance.gesture_queue || []), newGesture];
        await base44.entities.AgentAppearance.update(appearance.id, {
          gesture_queue: updatedQueue
        });
      }
    }
  };

  const setAnimation = (animationType) => {
    setCurrentAnimation(animationType);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const updatePosition = (newPosition) => {
    setPosition(newPosition);
  };

  return (
    <AvatarContext.Provider
      value={{
        activeAvatarId,
        avatarData,
        agentAppearances,
        isVisible,
        currentAnimation,
        position,
        setActiveAvatar,
        loadAgentAppearance,
        triggerGesture,
        setAnimation,
        toggleVisibility,
        updatePosition,
        loadAvatarData
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};