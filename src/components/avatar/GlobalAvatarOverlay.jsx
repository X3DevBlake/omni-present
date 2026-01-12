import React, { useEffect, useState } from 'react';
import { useAvatar } from './AvatarContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import OptimizedAvatarModel from './OptimizedAvatarModel';
import AgentGestureSystem from './AgentGestureSystem';

export default function GlobalAvatarOverlay() {
  const { avatarData, isVisible, position, updatePosition, toggleVisibility, currentAnimation } = useAvatar();
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        updatePosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, updatePosition]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  if (!avatarData || !isVisible) return null;

  const size = isExpanded ? { width: 600, height: 800 } : { width: 300, height: 400 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      className="bg-black/80 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
    >
      <div
        className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-3 flex items-center justify-between cursor-move border-b border-cyan-500/20"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-sm font-bold">
            {avatarData.avatar_name || avatarData.base?.name || 'Avatar'}
          </span>
          {avatarData.isAgent && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">AI Agent</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleVisibility}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative w-full h-[calc(100%-60px)]">
        <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <spotLight position={[-5, 5, 5]} intensity={0.5} angle={0.3} penumbra={1} />
          
          <OptimizedAvatarModel
            base={avatarData.base}
            components={avatarData.components || []}
            componentProperties={avatarData.component_properties || {}}
            animation={currentAnimation}
            isExpanded={isExpanded}
          />

          {avatarData.isAgent && (
            <AgentGestureSystem
              agentId={avatarData.agent_id}
              gestureQueue={avatarData.gesture_queue || []}
            />
          )}

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={6}
            target={[0, 1, 0]}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 flex justify-center gap-2">
        <div className="text-xs text-cyan-400 font-mono">
          Animation: {currentAnimation}
        </div>
      </div>
    </motion.div>
  );
}