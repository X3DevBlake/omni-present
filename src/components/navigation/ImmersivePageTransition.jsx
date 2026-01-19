import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import AgentHubTransition from './transitions/AgentHubTransition';
import BankingHubTransition from './transitions/BankingHubTransition';
import AILabsTransition from './transitions/AILabsTransition';
import SimulationHubTransition from './transitions/SimulationHubTransition';
import HomeTransition from './transitions/HomeTransition';

export default function ImmersivePageTransition({ children }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState(null);
  const [previousPath, setPreviousPath] = useState(null);

  // Check if transitions are enabled (can be controlled via user settings)
  const transitionsEnabled = localStorage.getItem('immersive-transitions') !== 'false';

  useEffect(() => {
    // Skip if same page or transitions disabled
    if (!transitionsEnabled || previousPath === location.pathname) {
      setPreviousPath(location.pathname);
      return;
    }

    // Only transition if we have a previous path (not initial load)
    if (!previousPath) {
      setPreviousPath(location.pathname);
      return;
    }

    // Determine transition type based on path
    const path = location.pathname.toLowerCase();
    let type = 'default';

    if (path.includes('home') || path === '/') {
      type = 'home';
    } else if (path.includes('agent') || path.includes('aimanagement')) {
      type = 'agents';
    } else if (path.includes('bank') || path.includes('defi') || path.includes('wallet')) {
      type = 'banking';
    } else if (path.includes('ailab') || path.includes('training')) {
      type = 'ailab';
    } else if (path.includes('simulation')) {
      type = 'simulation';
    }

    if (type !== 'default') {
      setTransitionType(type);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setTransitionType(null);
        setPreviousPath(location.pathname);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setPreviousPath(location.pathname);
    }
  }, [location.pathname, transitionsEnabled]);

  const renderTransition = () => {
    switch (transitionType) {
      case 'home':
        return <HomeTransition />;
      case 'agents':
        return <AgentHubTransition />;
      case 'banking':
        return <BankingHubTransition />;
      case 'ailab':
        return <AILabsTransition />;
      case 'simulation':
        return <SimulationHubTransition />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && transitionsEnabled && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] pointer-events-none"
          >
            <Canvas className="w-full h-full">
              {renderTransition()}
            </Canvas>
            
            {/* Overlay Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-white text-4xl font-bold text-center"
              >
                <div className="bg-black/50 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20">
                  Entering {transitionType?.charAt(0).toUpperCase() + transitionType?.slice(1)}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}