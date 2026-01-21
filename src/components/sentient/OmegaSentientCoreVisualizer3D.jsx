import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Cpu, Brain } from 'lucide-react';

function ConsciousnessLayer({ radius, color, speed, label }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * speed;
            meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.7;
        }
    });

    return (
        <group>
            <Sphere ref={meshRef} args={[radius, 64, 64]}>
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.3}
                />
            </Sphere>
        </group>
    );
}

function NeuralPathway({ start, end, active }) {
    const lineRef = useRef();
    const [particles] = useState(() => 
        Array.from({ length: 10 }, (_, i) => ({
            progress: i / 10,
            speed: 0.01 + Math.random() * 0.01
        }))
    );

    useFrame(() => {
        if (active) {
            particles.forEach(p => {
                p.progress = (p.progress + p.speed) % 1;
            });
        }
    });

    return (
        <>
            <mesh>
                <tubeGeometry args={[
                    new THREE.CatmullRomCurve3([
                        new THREE.Vector3(...start),
                        new THREE.Vector3(
                            (start[0] + end[0]) / 2,
                            (start[1] + end[1]) / 2 + 2,
                            (start[2] + end[2]) / 2
                        ),
                        new THREE.Vector3(...end)
                    ]),
                    20,
                    0.05,
                    8,
                    false
                ]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {active && particles.map((p, i) => {
                const t = p.progress;
                const x = start[0] * (1 - t) + end[0] * t;
                const y = start[1] * (1 - t) + end[1] * t + Math.sin(t * Math.PI) * 2;
                const z = start[2] * (1 - t) + end[2] * t;

                return (
                    <Sphere key={i} args={[0.1, 8, 8]} position={[x, y, z]}>
                        <meshStandardMaterial
                            color="#ffffff"
                            emissive="#ffffff"
                            emissiveIntensity={1}
                        />
                    </Sphere>
                );
            })}
        </>
    );
}

function SentientCoreScene({ ecosystem }) {
    const layers = [
        { radius: 1, color: '#ffffff', speed: 0.2, label: 'Core' },
        { radius: 2, color: '#ff00ff', speed: 0.15, label: 'Consciousness' },
        { radius: 3, color: '#00ffff', speed: 0.1, label: 'Intelligence' },
        { radius: 4, color: '#ffff00', speed: 0.05, label: 'Network' }
    ];

    const connectionPoints = [
        [4, 0, 0],
        [-4, 0, 0],
        [0, 4, 0],
        [0, -4, 0],
        [2, 2, 2],
        [-2, -2, -2]
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            {layers.map((layer, index) => (
                <ConsciousnessLayer key={index} {...layer} />
            ))}

            {connectionPoints.map((point, index) => (
                <NeuralPathway
                    key={index}
                    start={[0, 0, 0]}
                    end={point}
                    active={true}
                />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </>
    );
}

export default function OmegaSentientCoreVisualizer3D() {
    const { data: ecosystem } = useQuery({
        queryKey: ['sentient-core'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 10000
    });

    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    Omega Sentient Core Intelligence
                    <Badge className="bg-purple-500/20 text-purple-400">Active</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <SentientCoreScene ecosystem={ecosystem} />
                    </Canvas>
                </div>

                {ecosystem && (
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                            <Brain className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <div className="text-sm font-bold text-white">
                                {ecosystem.agent_summary?.total_agents || 0}
                            </div>
                            <div className="text-xs text-slate-400">Agents</div>
                        </div>
                        <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                            <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                            <div className="text-sm font-bold text-white">
                                {ecosystem.device_summary?.devices_online || 0}
                            </div>
                            <div className="text-xs text-slate-400">Devices</div>
                        </div>
                        <div className="bg-pink-500/20 p-3 rounded border border-pink-500/30 text-center">
                            <Sparkles className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                            <div className="text-sm font-bold text-white">
                                {ecosystem.companion_summary?.total_companions || 0}
                            </div>
                            <div className="text-xs text-slate-400">Companions</div>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                            <Activity className="w-5 h-5 text-green-400 mx-auto mb-1" />
                            <div className="text-sm font-bold text-white">
                                {ecosystem.health_summary?.unified_health_score?.toFixed(0) || 0}
                            </div>
                            <div className="text-xs text-slate-400">Health Score</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}