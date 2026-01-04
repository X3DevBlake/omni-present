import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitMerge, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

function ConflictVisualization({ conflicts, resolution }) {
  return (
    <group>
      {conflicts.map((conflict, idx) => {
        const basePos = conflict.position || [idx * 2 - 2, 0, 0];
        const resolved = resolution[conflict.id];
        
        return (
          <group key={conflict.id} position={basePos}>
            {/* Current version */}
            <mesh position={[-0.5, 0, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial
                color={resolved === 'current' ? '#00f5ff' : '#666'}
                emissive={resolved === 'current' ? '#00f5ff' : '#000'}
                emissiveIntensity={resolved === 'current' ? 0.5 : 0}
                transparent
                opacity={resolved === 'incoming' ? 0.3 : 0.8}
              />
            </mesh>
            
            {/* Incoming version */}
            <mesh position={[0.5, 0, 0]}>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshStandardMaterial
                color={resolved === 'incoming' ? '#a855f7' : '#666'}
                emissive={resolved === 'incoming' ? '#a855f7' : '#000'}
                emissiveIntensity={resolved === 'incoming' ? 0.5 : 0}
                transparent
                opacity={resolved === 'current' ? 0.3 : 0.8}
              />
            </mesh>
            
            {/* Conflict indicator */}
            {!resolved && (
              <mesh position={[0, 0.6, 0]}>
                <coneGeometry args={[0.1, 0.3, 3]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function MergeConflictResolver({ conflicts, sourceVersion, targetVersion, onResolve, onClose }) {
  const [resolution, setResolution] = useState({});

  const handleResolve = (conflictId, choice) => {
    setResolution(prev => ({ ...prev, [conflictId]: choice }));
  };

  const handleApplyResolution = () => {
    const allResolved = conflicts.every(c => resolution[c.id]);
    if (!allResolved) {
      toast.error('Please resolve all conflicts');
      return;
    }
    
    onResolve(resolution);
    toast.success('Merge conflicts resolved');
  };

  const allResolved = conflicts.every(c => resolution[c.id]);
  const resolvedCount = Object.keys(resolution).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] flex flex-col"
      >
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Resolve Merge Conflicts</h2>
              <span className="text-white/60 text-sm">
                ({resolvedCount}/{conflicts.length} resolved)
              </span>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 3D Visualization */}
          <div className="flex-1 rounded-xl overflow-hidden bg-black/40 mb-4">
            <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
              
              <ConflictVisualization conflicts={conflicts} resolution={resolution} />
              
              <OrbitControls />
            </Canvas>
          </div>

          {/* Conflict List */}
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  {resolution[conflict.id] ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  )}
                  
                  <div className="flex-1">
                    <div className="text-white font-medium mb-2">{conflict.component}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleResolve(conflict.id, 'current')}
                        className={`p-3 rounded-lg border transition-all ${
                          resolution[conflict.id] === 'current'
                            ? 'border-cyan-500 bg-cyan-500/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-cyan-400 text-xs mb-1">Current ({targetVersion})</div>
                        <div className="text-white text-sm">{conflict.current}</div>
                      </button>
                      
                      <button
                        onClick={() => handleResolve(conflict.id, 'incoming')}
                        className={`p-3 rounded-lg border transition-all ${
                          resolution[conflict.id] === 'incoming'
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        <div className="text-purple-400 text-xs mb-1">Incoming ({sourceVersion})</div>
                        <div className="text-white text-sm">{conflict.incoming}</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyResolution}
            disabled={!allResolved}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50"
          >
            <GitMerge className="w-5 h-5" />
            Apply Resolution & Merge
          </button>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}