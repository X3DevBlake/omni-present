import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AnimationContext = createContext();

export function AnimationProvider({ children }) {
  const [activeAnimations, setActiveAnimations] = useState([]);
  const [animationQueue, setAnimationQueue] = useState([]);

  const triggerAnimation = (animationConfig) => {
    const animationId = `anim_${Date.now()}_${Math.random()}`;
    
    setActiveAnimations(prev => [...prev, { id: animationId, ...animationConfig }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(a => a.id !== animationId));
    }, animationConfig.duration || 3000);
  };

  const queueAnimation = (animationConfig) => {
    setAnimationQueue(prev => [...prev, animationConfig]);
  };

  useEffect(() => {
    if (animationQueue.length > 0 && activeAnimations.length < 5) {
      const next = animationQueue[0];
      triggerAnimation(next);
      setAnimationQueue(prev => prev.slice(1));
    }
  }, [animationQueue, activeAnimations]);

  return (
    <AnimationContext.Provider value={{ activeAnimations, triggerAnimation, queueAnimation }}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}

export function useAnimationTrigger(eventName) {
  const { triggerAnimation } = useAnimation();

  return (animationType, parameters = {}) => {
    triggerAnimation({
      event: eventName,
      type: animationType,
      parameters,
      timestamp: Date.now()
    });

    // Log to backend for analytics
    base44.functions.invoke('animationManager', {
      action: 'trigger_animation',
      animation_id: animationType,
      target_element: eventName,
      parameters
    }).catch(err => console.warn('Animation logging failed:', err));
  };
}