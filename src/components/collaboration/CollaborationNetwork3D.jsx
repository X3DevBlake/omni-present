import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Shield, Users, Activity } from 'lucide-react';

const AgentNode = ({ position, color, isTeamLead, name }) => {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y += 0.01;
    ref.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002;
  });

  return (
    <group position={position} ref={ref}>
      <Sphere args={[isTeamLead ? 0.3 : 0.2, 32, 32]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      {isTeamLead && (
        <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshStandardMaterial color="gold" />
        </mesh>
      )}
      <Html distanceFactor={10}>
        <div className="bg-black/50 text-white text-[8px] px-1 rounded backdrop-blur-sm border border-white/10">
            {name}
        </div>
      </Html>
    </group>
  );
};

const DataStream = ({ start, end, color }) => {
    // Simple animated line simulating data transfer
    return (
        <Line points={[start, end]} color={color} lineWidth={1} transparent opacity={0.3} dashed dashSize={0.1} gapSize={0.1} />
    )
}

const TeamCluster = ({ team, center }) => {
    const radius = 2;
    return (
        <group position={center}>
            {/* Team Shield/Zone */}
            <mesh>
                <sphereGeometry args={[radius * 1.5, 32, 32]} />
                <meshBasicMaterial color={team.color} wireframe transparent opacity={0.05} />
            </mesh>
            
            {team.members.map((member, i) => {
                const angle = (i / team.members.length) * Math.PI * 2;
                const pos = [
                    Math.cos(angle) * radius,
                    (Math.random() - 0.5) * 1,
                    Math.sin(angle) * radius
                ];
                return (
                    <React.Fragment key={i}>
                        <AgentNode position={pos} color={team.color} name={member.name} isTeamLead={i === 0} />
                        <DataStream start={[0,0,0]} end={pos} color={team.color} />
                        {/* Inter-agent connections */}
                        {i > 0 && (
                             <DataStream start={pos} end={[Math.cos(((i-1)/team.members.length)*Math.PI*2)*radius, 0, Math.sin(((i-1)/team.members.length)*Math.PI*2)*radius]} color="white" />
                        )}
                    </React.Fragment>
                );
            })}
            <Html position={[0, -2.5, 0]}>
                <div className="bg-black/80 p-2 rounded border border-white/20 text-center min-w-[100px]">
                    <div className="text-xs font-bold text-white">{team.name}</div>
                    <div className="text-[10px] text-green-400">Consensus: {(team.consensus * 100).toFixed(0)}%</div>
                </div>
            </Html>
        </group>
    )
}

export default function CollaborationNetwork3D({ teams = [] }) {
    // Mock data if empty
    const mockTeams = teams.length > 0 ? teams : [
        { 
            name: "Alpha Squad", 
            color: "#3b82f6", 
            consensus: 0.85,
            members: [{name: "Agent X"}, {name: "Agent Y"}, {name: "Agent Z"}] 
        },
        { 
            name: "Data Miners", 
            color: "#10b981", 
            consensus: 0.92,
            members: [{name: "Miner 1"}, {name: "Miner 2"}, {name: "Miner 3"}, {name: "Miner 4"}] 
        },
        { 
            name: "Security Net", 
            color: "#ef4444", 
            consensus: 0.65,
            members: [{name: "SecBot A"}, {name: "SecBot B"}] 
        }
    ];

    return (
        <div className="w-full h-[600px] bg-black rounded-xl overflow-hidden relative border border-white/10">
            <div className="absolute top-4 left-4 z-10">
                <Badge variant="outline" className="bg-black/50 text-white border-white/20 mb-2">
                    <Users className="w-3 h-3 mr-1" /> Active Teams: {mockTeams.length}
                </Badge>
            </div>
            
            <Canvas camera={{ position: [0, 10, 20], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
                
                {mockTeams.map((team, i) => {
                    // Position teams in a triangle or circle around center
                    const angle = (i / mockTeams.length) * Math.PI * 2;
                    const dist = 8;
                    const center = [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
                    
                    return (
                        <React.Fragment key={i}>
                            <TeamCluster team={team} center={center} />
                            {/* Connection between teams */}
                            <Line points={[[0,0,0], center]} color="white" transparent opacity={0.1} />
                        </React.Fragment>
                    )
                })}
                
                {/* Central Hub */}
                <Sphere args={[1, 16, 16]}>
                    <meshStandardMaterial color="#8b5cf6" wireframe />
                </Sphere>
            </Canvas>
        </div>
    );
}