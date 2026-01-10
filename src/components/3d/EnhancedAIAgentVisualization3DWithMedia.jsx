/**
 * Enhanced AI Agent Visualization 3D with Media
 * Displays agents with contextual media (avatars, background images)
 * Shows agent locations on real-world maps
 */

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MapPin, Image as ImageIcon } from 'lucide-react';

function AgentWithMedia({ position, agent, mediaUrl, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (hovered) {
        meshRef.current.scale.setScalar(1.3);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Personality-based color
  const personalityColor = agent.personality?.traits?.curiosity > 70 ? 0x00ffff : 
                          agent.personality?.traits?.confidence > 70 ? 0xffaa00 :
                          0xff00ff;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => onSelect(agent)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={personalityColor}
          emissive={personalityColor}
          emissiveIntensity={hovered ? 1.5 : 0.8}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Aura Ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={personalityColor}
          emissive={personalityColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Personality Indicators */}
      {agent.personality?.traits && (
        <>
          {/* Curiosity spiral */}
          {agent.personality.traits.curiosity > 50 && (
            <mesh position={[1.5, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={0x00ff88} emissive={0x00ff88} emissiveIntensity={0.8} />
            </mesh>
          )}
          {/* Confidence pulse */}
          {agent.personality.traits.confidence > 70 && (
            <mesh position={[-1.5, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={0xffaa00} emissive={0xffaa00} emissiveIntensity={0.8} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}

function AgentSceneWithMedia({ agents = [], onAgentSelect }) {
  const positions = agents.map((_, i) => {
    const angle = (i / Math.max(agents.length, 1)) * Math.PI * 2;
    const radius = 10 + (i % 5) * 2;
    return {
      x: Math.cos(angle) * radius,
      y: (Math.random() - 0.5) * 8,
      z: Math.sin(angle) * radius
    };
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={1} />
      
      {agents.map((agent, i) => (
        <AgentWithMedia
          key={agent.id || i}
          position={[positions[i].x, positions[i].y, positions[i].z]}
          agent={agent}
          onSelect={onAgentSelect}
        />
      ))}

      <OrbitControls autoRotate autoRotateSpeed={0.3} />
    </>
  );
}

export default function EnhancedAIAgentVisualization3DWithMedia({ 
  agents = [], 
  mediaAssets = [],
  locationData = []
}) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const getAgentMedia = (agentId) => {
    return mediaAssets.filter(m => m.associated_entity_id === agentId);
  };

  const getAgentLocation = (agentId) => {
    return locationData.find(l => l.associated_entity_id === agentId && l.location_type === 'agent');
  };

  return (
    <div className="w-full space-y-6">
      {/* 3D Canvas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-[500px] rounded-lg overflow-hidden border border-purple-500/30 bg-black/50"
      >
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <AgentSceneWithMedia agents={agents} onAgentSelect={setSelectedAgent} />
        </Canvas>
      </motion.div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, idx) => {
          const agentMedia = getAgentMedia(agent.id);
          const agentLocation = getAgentLocation(agent.id);

          return (
            <Card
              key={agent.id || idx}
              className="bg-black/40 border-purple-500/30 hover:border-purple-400/60 cursor-pointer transition-colors"
              onClick={() => setSelectedAgent(agent)}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agent Status */}
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {agent.status || 'idle'}
                  </Badge>
                  {agent.knowledge_count && (
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {agent.knowledge_count} items learned
                    </Badge>
                  )}
                </div>

                {/* Media Section */}
                {agentMedia.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      Media ({agentMedia.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {agentMedia.slice(0, 3).map((media, midx) => (
                        <img
                          key={midx}
                          src={media.url}
                          alt={media.title}
                          className="w-12 h-12 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                {agentLocation && (
                  <div className="p-2 bg-cyan-500/10 rounded border border-cyan-500/30">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      {agentLocation.name}
                    </p>
                    <p className="text-xs text-gray-500 ml-6">
                      {agentLocation.city}, {agentLocation.country}
                    </p>
                  </div>
                )}

                {/* Personality Traits */}
                {agent.personality?.traits && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(agent.personality.traits).map(([trait, value]) => (
                      <div key={trait} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{trait}:</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Agent Detail */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30"
        >
          <h3 className="text-xl font-bold text-white mb-4">{selectedAgent.name} - Detailed View</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Agent Properties</p>
              <div className="space-y-1 text-sm">
                <p className="text-white">Status: <span className="text-purple-400">{selectedAgent.status}</span></p>
                <p className="text-white">Budget: <span className="text-cyan-400">${selectedAgent.omni_budget}</span></p>
                <p className="text-white">Spent: <span className="text-orange-400">${selectedAgent.omni_spent}</span></p>
                <p className="text-white">Knowledge Items: <span className="text-green-400">{selectedAgent.knowledge_count}</span></p>
              </div>
            </div>

            {/* Media Gallery for Selected Agent */}
            {getAgentMedia(selectedAgent.id).length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Agent Media</p>
                <div className="grid grid-cols-3 gap-2">
                  {getAgentMedia(selectedAgent.id).map((media, idx) => (
                    <div key={idx} className="rounded overflow-hidden border border-purple-500/30">
                      <img
                        src={media.url}
                        alt={media.title}
                        className="w-full aspect-square object-cover"
                        title={media.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}