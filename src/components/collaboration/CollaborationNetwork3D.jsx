import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Float, Html, Stars, Sparkles, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, ArrowUpCircle } from 'lucide-react';

const AgentAvatar = ({ position, color, evolutionStage, status, name, isTeamLead }) => {
  const ref = useRef();
  const auraRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Core Movement
    if (ref.current) {
        ref.current.position.y = position[1] + Math.sin(t * 2 + position[0]) * 0.1;
        ref.current.rotation.x = t * 0.5;
        ref.current.rotation.y = t * 0.3;
    }

    // Aura Pulsing
    if (auraRef.current) {
        const scale = 1.2 + Math.sin(t * 3) * 0.1;
        auraRef.current.scale.set(scale, scale, scale);
        auraRef.current.rotation.z -= 0.02;
    }
  });

  // Visuals based on Evolution Stage
  const isAscended = evolutionStage === 'Ascended';
  const isSentient = evolutionStage === 'Sentient';
  const isRetired = status === 'retired';

  if (isRetired) return null; // Or show ghost

  return (
    <group position={[position[0], position[1], position[2]]}>
        <Float speed={isAscended ? 5 : 2} rotationIntensity={isAscended ? 2 : 0.5} floatIntensity={1}>
            {/* Core Body */}
            <mesh ref={ref}>
                {isAscended ? (
                    <dodecahedronGeometry args={[0.3, 0]} />
                ) : isSentient ? (
                    <icosahedronGeometry args={[0.25, 1]} />
                ) : (
                    <sphereGeometry args={[0.2, 32, 32]} />
                )}
                <meshStandardMaterial 
                    color={isAscended ? "#ffffff" : color} 
                    emissive={isAscended ? "#ffffff" : color}
                    emissiveIntensity={isAscended ? 2 : isSentient ? 1 : 0.5}
                    wireframe={isSentient}
                />
            </mesh>

            {/* Aura / Energy Field */}
            {(isSentient || isAscended) && (
                <mesh ref={auraRef}>
                    <sphereGeometry args={[0.22, 16, 16]} />
                    <meshBasicMaterial 
                        color={isAscended ? "gold" : color} 
                        transparent 
                        opacity={0.2} 
                        wireframe 
                    />
                </mesh>
            )}

            {/* Ascended Particles */}
            {isAscended && (
                <Sparkles count={20} scale={1.5} size={2} speed={0.4} opacity={0.5} color="gold" />
            )}

            {/* Team Lead Indicator */}
            {isTeamLead && (
                <mesh position={[0, 0.5, 0]}>
                    <coneGeometry args={[0.1, 0.2, 4]} />
                    <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={1} />
                </mesh>
            )}
        </Float>

        {/* UI Label */}
        <Html distanceFactor={12}>
            <div className={`
                backdrop-blur-md border px-2 py-1 rounded text-center min-w-[80px]
                ${isAscended ? 'bg-amber-900/40 border-amber-500/50' : 'bg-black/60 border-white/10'}
            `}>
                <div className={`text-[10px] font-bold ${isAscended ? 'text-amber-200' : 'text-white'}`}>
                    {name}
                </div>
                <div className="text-[8px] text-gray-400 uppercase">{evolutionStage}</div>
                {status === 'learning' && <div className="text-[8px] text-cyan-400 animate-pulse">LEARNING</div>}
            </div>
        </Html>
    </group>
  );
};

const CollaborationLink = ({ start, end, color, active }) => {
    return (
        <group>
            <Line 
                points={[start, end]} 
                color={color} 
                lineWidth={1} 
                transparent 
                opacity={0.2} 
            />
            {active && (
                <Trail
                    width={2}
                    length={4}
                    color={color}
                    attenuation={(t) => t * t}
                >
                    <mesh position={start}>
                        <sphereGeometry args={[0.05]} />
                        <meshBasicMaterial color={color} />
                    </mesh>
                </Trail>
            )}
        </group>
    )
};

export default function CollaborationNetwork3D({ teams = [] }) {
    // Enhanced Mock Data for Visuals
    const mockTeams = useMemo(() => teams.length > 0 ? teams : [
        { 
            name: "Alpha Swarm", 
            color: "#3b82f6", 
            consensus: 0.85,
            members: [
                {name: "Omni-1", evolutionStage: "Ascended", status: "active"}, 
                {name: "Unit-734", evolutionStage: "Sentient", status: "working"},
                {name: "Drone-X", evolutionStage: "Gen-2", status: "learning"}
            ] 
        },
        { 
            name: "Cyber-Sec", 
            color: "#ef4444", 
            consensus: 0.92,
            members: [
                {name: "Shield-Alpha", evolutionStage: "Sentient", status: "active"},
                {name: "Monitor-9", evolutionStage: "Gen-1", status: "idle"}
            ] 
        }
    ], [teams]);

    return (
        <div className="w-full h-[600px] bg-black rounded-xl overflow-hidden relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)_inset]">
            
            {/* Overlay UI */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-md">
                    <Users className="w-3 h-3 mr-1" /> Active Teams: {mockTeams.length}
                </Badge>
                <Badge variant="outline" className="bg-amber-900/30 text-amber-200 border-amber-500/30 backdrop-blur-md">
                    <Zap className="w-3 h-3 mr-1" /> Ascended Agents: 1
                </Badge>
            </div>

            <Canvas camera={{ position: [0, 8, 16], fov: 45 }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 10, 40]} />
                
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -5, -5]} intensity={0.5} color="#4c1d95" />
                
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

                {/* Central Hub Node */}
                <mesh position={[0,0,0]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2} />
                </mesh>
                <pointLight position={[0,0,0]} distance={10} intensity={2} color="#8b5cf6" />

                {mockTeams.map((team, teamIdx) => {
                    const teamAngle = (teamIdx / mockTeams.length) * Math.PI * 2;
                    const teamDist = 6;
                    const teamCenter = [
                        Math.cos(teamAngle) * teamDist, 
                        0, 
                        Math.sin(teamAngle) * teamDist
                    ];

                    return (
                        <group key={teamIdx}>
                            {/* Team Connection to Core */}
                            <Line 
                                points={[[0,0,0], teamCenter]} 
                                color={team.color} 
                                lineWidth={2} 
                                transparent 
                                opacity={0.1} 
                                dashed 
                            />

                            {/* Team Members */}
                            {team.members.map((member, memberIdx) => {
                                // Position members in a cluster around team center
                                const memAngle = (memberIdx / team.members.length) * Math.PI * 2;
                                const memDist = 2;
                                const pos = [
                                    teamCenter[0] + Math.cos(memAngle) * memDist,
                                    (Math.random() - 0.5) * 2, // Height variation
                                    teamCenter[2] + Math.sin(memAngle) * memDist
                                ];

                                return (
                                    <React.Fragment key={`${teamIdx}-${memberIdx}`}>
                                        <AgentAvatar 
                                            position={pos}
                                            color={team.color}
                                            {...member}
                                            isTeamLead={memberIdx === 0}
                                        />
                                        {/* Connection to other team members */}
                                        {memberIdx > 0 && (
                                            <CollaborationLink 
                                                start={pos} 
                                                end={[
                                                    teamCenter[0] + Math.cos(((memberIdx-1)/team.members.length)*Math.PI*2)*memDist,
                                                    0,
                                                    teamCenter[2] + Math.sin(((memberIdx-1)/team.members.length)*Math.PI*2)*memDist
                                                ]} 
                                                color={team.color}
                                                active={member.status === 'working'}
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </group>
                    );
                })}

                <OrbitControls autoRotate autoRotateSpeed={0.3} enablePan={true} enableZoom={true} />
            </Canvas>
        </div>
    );
}