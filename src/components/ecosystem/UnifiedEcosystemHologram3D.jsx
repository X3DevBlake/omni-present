import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Users, Cpu, Zap } from 'lucide-react';

function DataFlowLine({ start, end, active }) {
    const lineRef = useRef();
    const [progress, setProgress] = useState(0);

    useFrame(() => {
        if (active) {
            setProgress((prev) => (prev + 0.02) % 1);
        }
    });

    return (
        <Line
            ref={lineRef}
            points={[start, end]}
            color="#00ffff"
            lineWidth={2}
            transparent
            opacity={active ? 0.8 : 0.3}
            dashed
            dashScale={50}
            dashSize={10}
            dashOffset={-progress * 50}
        />
    );
}

function EcosystemNode({ position, type, data, onClick }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            if (hovered) {
                meshRef.current.scale.setScalar(1.2);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const colors = {
        agents: '#ff00ff',
        health: '#00ff00',
        companions: '#ffff00',
        financial: '#00ffff',
        devices: '#ff6600'
    };

    const icons = {
        agents: '🤖',
        health: '❤️',
        companions: '🧠',
        financial: '💰',
        devices: '🔌'
    };

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[0.8, 32, 32]}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={colors[type]}
                    emissive={colors[type]}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl min-w-[200px]">
                        <div className="text-lg font-bold mb-2">{icons[type]} {type}</div>
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="text-xs text-slate-300">
                                {key}: {typeof value === 'number' ? value.toFixed(1) : value}
                            </div>
                        ))}
                    </div>
                </Html>
            )}
        </group>
    );
}

function CriticalEventMarker({ event, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.5;
        }
    });

    return (
        <group position={[0, 5 + index * 1.5, 0]}>
            <Sphere ref={meshRef} args={[0.3, 16, 16]}>
                <meshStandardMaterial
                    color={event.severity === 'high' ? '#ff0000' : '#ffaa00'}
                    emissive={event.severity === 'high' ? '#ff0000' : '#ffaa00'}
                    emissiveIntensity={0.8}
                />
            </Sphere>
            <Html distanceFactor={10}>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs">
                    {event.event_type}
                </div>
            </Html>
        </group>
    );
}

function EcosystemScene({ ecosystem }) {
    if (!ecosystem) return null;

    const nodePositions = {
        agents: [-4, 2, 0],
        health: [0, 4, 0],
        companions: [4, 2, 0],
        financial: [-4, -2, 0],
        devices: [4, -2, 0]
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#ff00ff" />

            {/* Central core */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={1}
                    wireframe
                />
            </Sphere>

            {/* Ecosystem nodes */}
            <EcosystemNode
                position={nodePositions.agents}
                type="agents"
                data={ecosystem.agent_summary}
            />
            <EcosystemNode
                position={nodePositions.health}
                type="health"
                data={ecosystem.health_summary}
            />
            <EcosystemNode
                position={nodePositions.companions}
                type="companions"
                data={ecosystem.companion_summary}
            />
            <EcosystemNode
                position={nodePositions.financial}
                type="financial"
                data={ecosystem.financial_summary}
            />
            <EcosystemNode
                position={nodePositions.devices}
                type="devices"
                data={ecosystem.device_summary}
            />

            {/* Data flow connections */}
            {Object.values(nodePositions).map((pos, index) => (
                <DataFlowLine
                    key={index}
                    start={[0, 0, 0]}
                    end={pos}
                    active={true}
                />
            ))}

            {/* Critical events */}
            {ecosystem.critical_events?.map((event, index) => (
                <CriticalEventMarker key={index} event={event} index={index} />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </>
    );
}

export default function UnifiedEcosystemHologram3D() {
    const { data: ecosystemData, refetch } = useQuery({
        queryKey: ['unified-ecosystem'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 10000
    });

    return (
        <Card className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-cyan-400" />
                            Unified Omega Ecosystem
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Real-time holographic overview of your entire Omni-Present system
                        </p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline" size="sm">
                        <Zap className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>

                <div className="h-[600px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <EcosystemScene ecosystem={ecosystemData} />
                    </Canvas>
                </div>

                {ecosystemData && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-lg border border-purple-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="text-xs text-slate-300">Agents</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {ecosystemData.agent_summary?.total_agents || 0}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-3 rounded-lg border border-green-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-slate-300">Health</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {ecosystemData.health_summary?.unified_health_score?.toFixed(0) || 0}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-3 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs text-slate-300">Companions</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {ecosystemData.companion_summary?.total_companions || 0}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-3 rounded-lg border border-cyan-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs text-slate-300">Portfolio</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                ${(ecosystemData.financial_summary?.portfolio_value / 1000).toFixed(0)}K
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-3 rounded-lg border border-orange-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <Cpu className="w-4 h-4 text-orange-400" />
                                <span className="text-xs text-slate-300">Devices</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                                {ecosystemData.device_summary?.devices_online || 0}/{ecosystemData.device_summary?.total_devices || 0}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}