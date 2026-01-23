import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from './AnimationContext';
import { Sparkles, CheckCircle, AlertCircle, Zap, TrendingUp } from 'lucide-react';

const animationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Sparkles,
  energy: Zap,
  growth: TrendingUp
};

export default function GlobalAnimationPlayer() {
  const { activeAnimations } = useAnimation();

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {activeAnimations.map((animation) => {
          const Icon = animationIcons[animation.type] || Sparkles;
          
          return (
            <motion.div
              key={animation.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`
                bg-gradient-to-r from-purple-500/80 to-pink-500/80 
                backdrop-blur-lg border border-white/30 
                rounded-xl p-4 shadow-2xl
                pointer-events-auto
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-white animate-pulse" />
                <div>
                  <div className="text-white font-bold text-sm">
                    {animation.parameters?.message || 'Animation Triggered'}
                  </div>
                  <div className="text-white/70 text-xs">
                    {animation.event}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}