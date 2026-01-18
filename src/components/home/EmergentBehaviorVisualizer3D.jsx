import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import * as THREE from 'three';

function BehaviorNetwork({ behaviors }) {
  const group = useRef();

  useEffect(() => {
    if (!group.current || !behaviors?.length) return;
    
    group.current.rotation.x += 0.0001;
    group.current.rotation.y += 0.0002;
  }, [behaviors]);

  const positions = behaviors.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / behaviors.length);
    const theta = Math.sqrt(behaviors.length * Math.PI) * phi;
    return [
      2 * Math.cos(theta) * Math.sin(phi),
      2 * Math.sin(theta) * Math.sin(phi),
      2 * Math.cos(phi)
    ];
  });

  return (
    <group ref={group}>
      {behaviors.map((behavior, i) => (
        <motion.group key={i} position={positions[i]}>
          <Sphere args={[0.15, 32, 32]}>
            <meshStandardMaterial
              color={
                behavior.behavior_type === 'cooperation' ? '#10b981' :
                behavior.behavior_type === 'competition' ? '#ef4444' :
                behavior.behavior_type === 'specialization' ? '#3b82f6' :
                '#f59e0b'
              }
              emissive={
                behavior.behavior_type === 'cooperation' ? '#059669' :
                behavior.behavior_type === 'competition' ? '#dc2626' :
                behavior.behavior_type === 'specialization' ? '#1d4ed8' :
                '#d97706'
              }
              emissiveIntensity={0.8}
            />
          </Sphere>

          {i < behaviors.length - 1 && (
            <Line
              points={[
                [0, 0, 0],
                [
                  positions[i + 1][0] - positions[i][0],
                  positions[i + 1][1] - positions[i][1],
                  positions[i + 1][2] - positions[i][2]
                ]
              ]}
              color="#a855f7"
              lineWidth={1}
              transparent
              opacity={0.5}
            />
          )}
        </motion.group>
      ))}
    </group>
  );
}

function BehaviorScene({ behaviors }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f5ff" />
      <BehaviorNetwork behaviors={behaviors} />
      <OrbitControls autoRotate autoRotateSpeed={3} enableZoom />
    </Canvas>
  );
}

export default function EmergentBehaviorVisualizer3D() {
  const { data: behaviors = [] } = useQuery({
    queryKey: ['homeEmergentBehaviors'],
    queryFn: () => base44.entities.EmergentBehavior.filter({}).limit(50),
    refetchInterval: 6000
  });

  const behaviorCounts = {
    cooperation: behaviors.filter(b => b.behavior_type === 'cooperation').length,
    competition: behaviors.filter(b => b.behavior_type === 'competition').length,
    specialization: behaviors.filter(b => b.behavior_type === 'specialization').length,
    other: behaviors.filter(b => !['cooperation', 'competition', 'specialization'].includes(b.behavior_type)).length
  };

  const highConfidenceBehaviors = behaviors.filter(b => (b.confidence_score || 0) > 80).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full rounded-xl overflow-hidden"
    >
      <BehaviorScene behaviors={behaviors} />

      {/* Behavior Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700 max-w-sm"
      >
        <h3 className="text-sm font-semibold text-white mb-3">Behavior Distribution</h3>
        <div className="space-y-2">
          {[
            { name: 'Cooperation', count: behaviorCounts.cooperation, color: 'bg-green-500' },
            { name: 'Competition', count: behaviorCounts.competition, color: 'bg-red-500' },
            { name: 'Specialization', count: behaviorCounts.specialization, color: 'bg-blue-500' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-300">{item.name}</span>
                <span className="text-xs font-semibold text-slate-400">{item.count}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / Math.max(...Object.values(behaviorCounts))) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* High Confidence Behaviors */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-lg p-4 rounded-lg border border-slate-700 max-w-xs"
      >
        <h3 className="text-sm font-semibold text-white mb-3">High Confidence</h3>
        <div className="space-y-2">
          {highConfidenceBehaviors.map((behavior, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-xs border-l-2 border-purple-500 pl-2"
            >
              <p className="text-slate-300 font-medium capitalize">{behavior.behavior_type}</p>
              <p className="text-slate-500 text-xs">{behavior.confidence_score || 0}% confidence</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}