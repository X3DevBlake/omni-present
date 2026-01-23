import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Cone } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, MessageSquare, TrendingUp } from 'lucide-react';
import * as THREE from 'three';

function CollaborativeAgent({ agent, position, isLead }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
      glowRef.current.scale.setScalar(pulse * 1.4);
      
      if (isLead) {
        meshRef.current.rotation.y = clock.elapsedTime * 2;
      }
    }
  });

  const color = isLead ? '#ffaa00' : '#00ffff';
  const size = isLead ? 0.5 : 0.35;

  return (
    <group position={position}>
      <Sphere ref={glowRef} args={[size * 1.5, 32, 32]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </Sphere>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isLead ? 1 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, size + 0.5, 0]}
        fontSize={0.12}
        color="white"
        anchorX="center"
      >
        {agent.role?.toUpperCase() || 'AGENT'}
      </Text>
      <Text
        position={[0, -size - 0.4, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
      >
        {(agent.performance_score * 100).toFixed(0)}%
      </Text>
    </group>
  );
}

function CommunicationBeam({ from, to, messageType }) {
  const lineRef = useRef();

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.4 + Math.sin(clock.elapsedTime * 4) * 0.2;
    }
  });

  const color = messageType === 'task_update' ? '#00ff00' :
                messageType === 'knowledge_share' ? '#ffaa00' :
                '#00aaff';

  return (
    <Line
      ref={lineRef}
      points={[from, to]}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.5}
    />
  );
}

function TaskIndicator({ task, position }) {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.elapsedTime * 2;
      const scale = 0.15 + task.progress_percent * 0.003;
      meshRef.current.scale.setScalar(scale);
    }
  });

  const color = task.status === 'completed' ? '#00ff00' :
                task.status === 'in_progress' ? '#ffaa00' :
                '#0088ff';

  return (
    <group position={position}>
      <Cone ref={meshRef} args={[0.2, 0.4, 4]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Cone>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
      >
        {task.progress_percent}%
      </Text>
    </group>
  );
}

function CollaborationScene({ collaboration }) {
  const participants = collaboration?.participating_agents || [];
  const tasks = collaboration?.task_allocation || [];
  const communications = collaboration?.communication_log?.slice(-5) || [];

  const agentPositions = useMemo(() => {
    return participants.map((_, idx) => {
      const angle = (idx / participants.length) * Math.PI * 2;
      const radius = 4;
      return [
        Math.cos(angle) * radius,
        Math.sin(idx * 0.5) * 1.5,
        Math.sin(angle) * radius
      ];
    });
  }, [participants]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[-10, 0, -10]} intensity={1} color="#ffaa00" />
      
      <Text
        position={[0, 5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
      >
        AUTONOMOUS COLLABORATION
      </Text>

      {/* Central Goal */}
      <group position={[0, 0, 0]}>
        <Sphere args={[0.6, 64, 64]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.8}
          />
        </Sphere>
        <Text
          position={[0, 0, 0]}
          fontSize={0.15}
          color="#000000"
          anchorX="center"
        >
          GOAL
        </Text>
      </group>

      {/* Agents */}
      {participants.map((agent, idx) => (
        <CollaborativeAgent
          key={agent.agent_id || idx}
          agent={agent}
          position={agentPositions[idx]}
          isLead={idx === 0}
        />
      ))}

      {/* Communication Beams */}
      {communications.map((comm, idx) => {
        const fromIdx = participants.findIndex(a => a.agent_id === comm.from_agent);
        const toIdx = participants.findIndex(a => a.agent_id === comm.to_agent);
        
        if (fromIdx >= 0 && toIdx >= 0) {
          return (
            <CommunicationBeam
              key={idx}
              from={agentPositions[fromIdx]}
              to={agentPositions[toIdx]}
              messageType={comm.message_type}
            />
          );
        }
        return null;
      })}

      {/* Tasks */}
      {tasks.slice(0, 6).map((task, idx) => {
        const angle = (idx / tasks.length) * Math.PI * 2;
        return (
          <TaskIndicator
            key={idx}
            task={task}
            position={[Math.cos(angle) * 2, 0, Math.sin(angle) * 2]}
          />
        );
      })}

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        autoRotate
        autoRotateSpeed={1}
      />
    </>
  );
}

export default function AutonomousAgentCollaboration3D({ collaboration }) {
  const participants = collaboration?.participating_agents?.length || 0;
  const tasksCompleted = (collaboration?.task_allocation || []).filter(t => t.status === 'completed').length;
  const synergy = collaboration?.synergy_metrics?.coordination_quality || 0;

  return (
    <Card className="bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3 text-2xl">
          <Users className="w-8 h-8 text-cyan-400 animate-pulse" />
          Autonomous Multi-Agent Collaboration
          <Badge className="bg-cyan-500/30 text-cyan-300">
            SYNERGY: {(synergy * 100).toFixed(0)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-black/40 p-3 rounded-lg border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-white/60 text-xs">Agents</span>
            </div>
            <div className="text-white text-lg font-bold">{participants}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-white/60 text-xs">Tasks Done</span>
            </div>
            <div className="text-white text-lg font-bold">{tasksCompleted}</div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-white/60 text-xs">Messages</span>
            </div>
            <div className="text-white text-lg font-bold">
              {collaboration?.communication_log?.length || 0}
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-white/60 text-xs">Performance</span>
            </div>
            <div className="text-white text-lg font-bold">
              {(collaboration?.synergy_metrics?.collective_performance * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="h-[600px] bg-black/20 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
            <color attach="background" args={['#000511']} />
            <fog attach="fog" args={['#000511', 5, 35]} />
            <CollaborationScene collaboration={collaboration || {}} />
          </Canvas>
        </div>

        {collaboration?.collaborative_goal && (
          <div className="mt-4 bg-black/40 p-4 rounded-lg border border-cyan-500/30">
            <div className="text-cyan-400 font-bold mb-2">Collaborative Goal:</div>
            <div className="text-white/80 text-sm">{collaboration.collaborative_goal.goal_description}</div>
            <div className="text-white/60 text-xs mt-2">
              Complexity: {collaboration.collaborative_goal.complexity_level?.toFixed(1)} | 
              Est. Time: {collaboration.collaborative_goal.estimated_duration_hours}h
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}