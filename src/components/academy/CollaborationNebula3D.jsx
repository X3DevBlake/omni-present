import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const AIAgentNode = ({ position, agent, isActive, onSelect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      const scale = isActive ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={isActive ? 0.9 : 0.5}
        />
      </Sphere>

      {(hovered || isActive) && (
        <Html distanceFactor={10}>
          <div className="bg-black/90 backdrop-blur-xl text-white px-4 py-2 rounded-lg border border-blue-400/50 whitespace-nowrap">
            <div className="font-bold">{agent.name}</div>
            <div className="text-xs text-gray-400">Findings: {agent.findings_count || 0}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const KnowledgeStream = ({ start, end, dataFlow, active }) => {
  const lineRef = useRef();

  useFrame((state) => {
    if (lineRef.current && active) {
      const opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      lineRef.current.material.opacity = opacity;
    }
  });

  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];

  return (
    <Line
      ref={lineRef}
      points={points}
      color={active ? '#10b981' : '#6b7280'}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.2}
    />
  );
};

const SharedFinding = ({ position, finding }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      meshRef.current.rotation.y += 0.03;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.7}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export default function CollaborationNebula3D({ projectId }) {
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.ResearchProject.filter({ project_id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  const { data: aiAgents = [] } = useQuery({
    queryKey: ['research-agents', projectId],
    queryFn: async () => {
      const agents = [];
      for (const agentId of project?.ai_assistants || []) {
        const result = await base44.entities.Agent.filter({ agent_id: agentId });
        if (result[0]) {
          agents.push({ ...result[0], findings_count: Math.floor(Math.random() * 20) });
        }
      }
      return agents;
    },
    enabled: !!project?.ai_assistants?.length
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['agent-collaborations', projectId],
    queryFn: () => base44.entities.AgentCollaboration.filter({ project_id: projectId }),
    enabled: !!projectId,
    refetchInterval: 5000
  });

  const agentPositions = aiAgents.map((_, index) => {
    const angle = (index / aiAgents.length) * Math.PI * 2;
    const radius = 6;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });

  const findingPositions = collaborations.map((_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 2];
  });

  // Vault connections for data sharing visualization
  const { data: vaultConnections = [] } = useQuery({
    queryKey: ['vault-connections', projectId],
    queryFn: async () => {
      const connections = [];
      for (let i = 0; i < aiAgents.length - 1; i++) {
        connections.push({
          from: i,
          to: i + 1,
          dataFlow: Math.random() > 0.5
        });
      }
      return connections;
    },
    enabled: aiAgents.length > 1
  });

  return (
    <div className="w-full h-[700px] relative">
      <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <fog attach="fog" args={['#000000', 10, 30]} />

        {/* Central Research Core */}
        <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.6}
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>

        <Text position={[0, 0, 0]} fontSize={0.4} color="white" anchorX="center">
          {project?.title?.substring(0, 15) || 'Research'}
        </Text>

        {/* AI Agent Nodes */}
        {aiAgents.map((agent, index) => (
          <AIAgentNode
            key={agent.id}
            position={agentPositions[index]}
            agent={agent}
            isActive={selectedAgent?.id === agent.id}
            onSelect={() => setSelectedAgent(agent)}
          />
        ))}

        {/* Knowledge Streams */}
        {aiAgents.map((agent, i) => (
          <React.Fragment key={`stream-${i}`}>
            <KnowledgeStream
              start={agentPositions[i]}
              end={[0, 0, 0]}
              dataFlow={true}
              active={selectedAgent?.id === agent.id}
            />
            {i < aiAgents.length - 1 && (
              <KnowledgeStream
                start={agentPositions[i]}
                end={agentPositions[i + 1]}
                dataFlow={true}
                active={false}
              />
            )}
          </React.Fragment>
        ))}

        {/* Shared Findings */}
        {collaborations.map((finding, index) => (
          <SharedFinding
            key={index}
            position={findingPositions[index]}
            finding={finding}
          />
        ))}

        {/* Data vault sharing visualization */}
        {vaultConnections.map((conn, idx) => {
          if (agentPositions[conn.from] && agentPositions[conn.to]) {
            return (
              <group key={`vault-${idx}`}>
                <KnowledgeStream
                  start={agentPositions[conn.from]}
                  end={agentPositions[conn.to]}
                  dataFlow={conn.dataFlow}
                  active={conn.dataFlow}
                />
                {conn.dataFlow && (
                  <mesh position={[
                    (agentPositions[conn.from][0] + agentPositions[conn.to][0]) / 2,
                    (agentPositions[conn.from][1] + agentPositions[conn.to][1]) / 2,
                    0
                  ]}>
                    <sphereGeometry args={[0.1, 16, 16]} />
                    <meshStandardMaterial
                      color="#10b981"
                      emissive="#10b981"
                      emissiveIntensity={1}
                    />
                  </mesh>
                )}
              </group>
            );
          }
          return null;
        })}

        <OrbitControls enableZoom enablePan />
      </Canvas>

      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute bottom-6 right-6 w-96 z-10"
        >
          <Card className="bg-black/80 backdrop-blur-xl border-white/20 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{selectedAgent.name}</h3>
                <Badge className="mt-2 bg-purple-500">
                  Specialization: {selectedAgent.specialization}
                </Badge>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Research Findings:</span>
                <span className="font-semibold">{selectedAgent.findings_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Shared:</span>
                <span className="font-semibold">12 datasets</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hypotheses Refined:</span>
                <span className="font-semibold">8 iterations</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="absolute top-6 left-6 z-10">
        <Card className="bg-black/60 backdrop-blur-xl border-white/20 p-4 text-white">
          <h3 className="font-bold mb-2">Multi-Agent Research Collaboration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Active AI Agents: {aiAgents.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Shared Findings: {collaborations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Knowledge Streams: Active</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}