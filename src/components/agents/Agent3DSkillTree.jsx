import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Zap, Lock, CheckCircle } from 'lucide-react';

function SkillNode({ position, label, mastery = 0, locked = false, color = '#00f5ff' }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
      meshRef.current.scale.set(
        hovered ? 1.2 : 1,
        hovered ? 1.2 : 1,
        hovered ? 1.2 : 1
      );
    }
  });

  const opacity = locked ? 0.3 : 0.8;
  const emissiveColor = mastery === 100 ? '#10b981' : color;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={emissiveColor}
          emissive={emissiveColor}
          emissiveIntensity={mastery / 100 * 0.8}
          metalness={0.7}
          roughness={0.2}
          transparent={true}
          opacity={opacity}
        />
      </mesh>

      {/* Progress ring for mastery */}
      {mastery > 0 && mastery < 100 && (
        <mesh>
          <torusGeometry args={[0.55, 0.08, 16, 100, 0, (mastery / 100) * Math.PI * 2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
        </mesh>
      )}

      {/* Skill label */}
      {hovered && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

function SkillConnection({ from, to, active = false }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current && active) {
      lineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.3;
    }
  });

  const points = [
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ];

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={active ? '#00f5ff' : '#a855f7'}
        transparent={true}
        opacity={active ? 0.8 : 0.3}
        linewidth={2}
      />
    </line>
  );
}

export default function Agent3DSkillTree({ agent }) {
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    // Mock skill tree data
    const mockSkills = [
      { id: 1, name: 'Data Analysis', level: 0, mastery: 100, color: '#00f5ff', locked: false },
      { id: 2, name: 'Negotiation', level: 1, mastery: 75, color: '#a855f7', locked: false },
      { id: 3, name: 'Pattern Recognition', level: 1, mastery: 90, color: '#ec4899', locked: false },
      { id: 4, name: 'Decision Making', level: 2, mastery: 50, color: '#3b82f6', locked: false },
      { id: 5, name: 'Strategic Planning', level: 2, mastery: 30, color: '#10b981', locked: false },
      { id: 6, name: 'Crisis Management', level: 3, mastery: 0, color: '#f59e0b', locked: true },
      { id: 7, name: 'Autonomous Learning', level: 3, mastery: 0, color: '#06b6d4', locked: true },
    ];
    setSkills(mockSkills);
  }, [agent]);

  const getPositionByLevel = (index, level) => {
    const skills_in_level = skills.filter(s => s.level === level).length;
    const y = -level * 3;
    const x = (index - skills_in_level / 2) * 3;
    return [x, y, 0];
  };

  const skillsByLevel = {};
  skills.forEach((skill, idx) => {
    if (!skillsByLevel[skill.level]) {
      skillsByLevel[skill.level] = [];
    }
    skillsByLevel[skill.level].push({ ...skill, index: skillsByLevel[skill.level].length });
  });

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 3D Skill Tree */}
      <div className="flex-1 h-96 lg:h-full rounded-2xl overflow-hidden border border-purple-500/20 bg-black/40">
        <Canvas camera={{ position: [0, -5, 12], fov: 60 }}>
          <color attach="background" args={['#0a0a0f']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f5ff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

          {/* Skill nodes */}
          {Object.entries(skillsByLevel).map(([level, levelSkills]) => 
            levelSkills.map((skill) => {
              const pos = getPositionByLevel(skill.index, skill.level);
              return (
                <SkillNode
                  key={skill.id}
                  position={pos}
                  label={skill.name}
                  mastery={skill.mastery}
                  locked={skill.locked}
                  color={skill.color}
                />
              );
            })
          )}

          {/* Connections between levels */}
          {Object.keys(skillsByLevel).map((level) => {
            const currentLevel = parseInt(level);
            if (currentLevel === 0) return null;

            return skillsByLevel[currentLevel].map((skill) => {
              const from = getPositionByLevel(skill.index, skill.level);
              const to = getPositionByLevel(0, currentLevel - 1);
              return (
                <SkillConnection
                  key={`conn-${skill.id}`}
                  from={from}
                  to={to}
                  active={skill.mastery > 0}
                />
              );
            });
          })}

          <OrbitControls enableZoom autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      {/* Skill Details */}
      <div className="flex-1 space-y-6 overflow-y-auto">
        <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Skills Tree</h3>
          
          {/* Skill Levels */}
          {Object.entries(skillsByLevel).map(([level, levelSkills]) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <h4 className="text-cyan-400 font-semibold text-sm mb-3 uppercase">
                Level {parseInt(level) + 1}
              </h4>
              <div className="grid gap-2">
                {levelSkills.map((skill) => (
                  <motion.button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      selectedSkill?.id === skill.id
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    } ${skill.locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold text-sm">{skill.name}</span>
                      {skill.locked ? (
                        <Lock className="w-4 h-4 text-white/40" />
                      ) : skill.mastery === 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Zap className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.mastery}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      />
                    </div>
                    <span className="text-xs text-white/50 mt-1 block">{skill.mastery}% Mastery</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Skill Details */}
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold mb-4">{selectedSkill.name}</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/60 mb-1">Current Level</p>
                <p className="text-cyan-400 font-semibold">Level {selectedSkill.level + 1}</p>
              </div>
              <div>
                <p className="text-white/60 mb-1">Mastery</p>
                <p className="text-cyan-400 font-semibold">{selectedSkill.mastery}%</p>
              </div>
              <div>
                <p className="text-white/60 mb-2">Learning Progress</p>
                <div className="bg-black/40 rounded-lg h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSkill.mastery}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}