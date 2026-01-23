import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function HolographicAnimationController({ projectionId, children }) {
  const [animationState, setAnimationState] = useState('idle');

  const { data: animations = [] } = useQuery({
    queryKey: ['holographic-animations', projectionId],
    queryFn: async () => {
      if (!projectionId) return [];
      return await base44.entities.HolographicAnimation.filter({ 
        target_projection_id: projectionId 
      });
    },
    enabled: !!projectionId
  });

  const activeAnimation = animations.find(a => 
    a.triggers?.some(t => t.trigger_type === 'on_create')
  );

  useEffect(() => {
    if (activeAnimation && animationState === 'idle') {
      setAnimationState('playing');
      setTimeout(() => {
        setAnimationState('complete');
      }, activeAnimation.duration_ms || 1000);
    }
  }, [activeAnimation]);

  const getAnimationVariants = () => {
    if (!activeAnimation) {
      return {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      };
    }

    const keyframes = activeAnimation.keyframes || [];
    if (keyframes.length === 0) {
      return {
        initial: { opacity: 1, scale: 1 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      };
    }

    return {
      initial: {
        opacity: keyframes[0]?.properties?.opacity || 0,
        scale: keyframes[0]?.properties?.scale || 0.1,
        rotate: 0
      },
      animate: {
        opacity: keyframes.map(k => k.properties?.opacity || 1),
        scale: keyframes.map(k => k.properties?.scale || 1),
        rotate: activeAnimation.animation_type === 'rotate' ? 360 : 0
      },
      transition: {
        duration: (activeAnimation.duration_ms || 1000) / 1000,
        times: keyframes.map(k => k.time),
        ease: keyframes[0]?.easing || 'easeInOut',
        repeat: activeAnimation.loop ? Infinity : 0
      }
    };
  };

  const variants = getAnimationVariants();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={projectionId || 'default'}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={variants.transition}
        className="relative"
      >
        {children}
        
        {animationState === 'playing' && activeAnimation?.particle_effects?.enabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(activeAnimation.particle_effects.particle_count || 20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: activeAnimation.particle_effects.particle_color || '#00FFFF',
                  boxShadow: `0 0 10px ${activeAnimation.particle_effects.particle_color || '#00FFFF'}`
                }}
                initial={{
                  x: '50%',
                  y: '50%',
                  opacity: 1
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  opacity: 0
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}