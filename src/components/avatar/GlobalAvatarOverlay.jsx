import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { useAvatar } from './AvatarContext';
import OptimizedLive3DViewer from '../3d/OptimizedLive3DViewer';
import AgentInteractionOverlay from './AgentInteractionOverlay';

export default function GlobalAvatarOverlay() {
  const { activeAvatar, isVisible, setIsVisible, agentAvatars, animationState } = useAvatar();
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });

  if (!activeAvatar) return null;

  const overlaySize = isExpanded ? 'w-96 h-96' : 'w-48 h-48';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed z-50 ${overlaySize} rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/40 backdrop-blur-sm`}
          style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
          drag
          dragMomentum={false}
          onDragEnd={(e, info) => {
            setPosition({
              x: Math.max(20, position.x - info.offset.x),
              y: Math.max(20, position.y - info.offset.y)
            });
          }}
        >
          {/* Controls */}
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
            >
              <EyeOff className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Avatar Name */}
          <div className="absolute top-2 left-2 z-10">
            <div className="px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
              <p className="text-white text-xs font-semibold">{activeAvatar.avatar_name || 'My Avatar'}</p>
            </div>
          </div>

          {/* 3D Canvas */}
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 1, 3]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <spotLight position={[-5, 5, 5]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <OptimizedLive3DViewer
                avatarData={activeAvatar}
                animationState={animationState}
                enableLOD={true}
                enableLazyLoading={true}
              />
            </Suspense>
            
            <OrbitControls
              enableZoom={isExpanded}
              enablePan={false}
              minDistance={2}
              maxDistance={5}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>

          {/* Agent Interactions */}
          {agentAvatars.length > 0 && isExpanded && (
            <AgentInteractionOverlay agents={agentAvatars} />
          )}
        </motion.div>
      )}

      {/* Toggle Button (when hidden) */}
      {!isVisible && activeAvatar && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-20 right-6 z-50 p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Eye className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}