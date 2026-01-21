import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Smile, Frown, Meh } from 'lucide-react';

function EmotionalAura({ emotion, intensity }) {
    const auraRef = useRef();
    const [scale, setScale] = useState(1);

    useFrame((state) => {
        if (auraRef.current) {
            const newScale = 1 + Math.sin(state.clock.elapsedTime * 2) * intensity * 0.3;
            setScale(newScale);
            auraRef.current.scale.setScalar(newScale);
        }
    });

    const emotionColors = {
        happy: '#ffff00',
        sad: '#0088ff',
        anxious: '#ff6600',
        calm: '#00ff88',
        excited: '#ff00ff',
        neutral: '#ffffff'
    };

    return (
        <Sphere ref={auraRef} args={[2, 32, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial
                color={emotionColors[emotion] || '#ffffff'}
                transparent
                opacity={0.3}
                emissive={emotionColors[emotion] || '#ffffff'}
                emissiveIntensity={intensity * 0.5}
            />
        </Sphere>
    );
}

function SupportStrategy({ position, strategy, active }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current && active) {
            meshRef.current.rotation.y += 0.02;
        }
    });

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[0.4, 16, 16]}>
                <meshStandardMaterial
                    color={active ? "#00ff00" : "#666666"}
                    emissive={active ? "#00ff00" : "#333333"}
                    emissiveIntensity={active ? 0.6 : 0.1}
                />
            </Sphere>
            <Text position={[0, -0.8, 0]} fontSize={0.25} color="white">
                {strategy}
            </Text>
        </group>
    );
}

function EmotionalSupportScene({ companions }) {
    const strategies = [
        { name: 'Empathy', position: [3, 2, 0] },
        { name: 'Validation', position: [-3, 2, 0] },
        { name: 'Guidance', position: [3, -2, 0] },
        { name: 'Comfort', position: [-3, -2, 0] },
        { name: 'Insight', position: [0, 3, 0] }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central companion */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ff00ff"
                    emissive="#ff00ff"
                    emissiveIntensity={0.5}
                />
            </Sphere>

            <EmotionalAura emotion="calm" intensity={0.7} />

            {strategies.map((strategy, index) => (
                <React.Fragment key={index}>
                    <SupportStrategy
                        position={strategy.position}
                        strategy={strategy.name}
                        active={Math.random() > 0.5}
                    />
                    <Line
                        points={[[0, 0, 0], strategy.position]}
                        color="#ffffff"
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                    />
                </React.Fragment>
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </>
    );
}

export default function ProactiveEmotionalSupport3D() {
    const { data: companions = [] } = useQuery({
        queryKey: ['emotional-companions'],
        queryFn: () => base44.entities.SentientAICompanion.list(),
        refetchInterval: 5000
    });

    const { data: bonds = [] } = useQuery({
        queryKey: ['emotional-bonds'],
        queryFn: () => base44.entities.CompanionEmotionalBond.list(),
        refetchInterval: 5000
    });

    const avgBondStrength = bonds.length > 0
        ? bonds.reduce((sum, b) => sum + (b.bond_strength || 0), 0) / bonds.length
        : 0;

    return (
        <Card className="w-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Proactive Emotional Support System
                    <Badge variant="outline">{companions.length} Companions</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <EmotionalSupportScene companions={companions} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-pink-500/20 p-3 rounded border border-pink-500/30 text-center">
                        <Heart className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">
                            {(avgBondStrength * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-400">Bond Strength</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <Smile className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">{companions.length}</div>
                        <div className="text-xs text-slate-400">Active</div>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30 text-center">
                        <Meh className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">
                            {bonds.reduce((sum, b) => sum + (b.interaction_history?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-400">Interactions</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Heart className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-lg font-bold text-white">
                            {bonds.reduce((sum, b) => sum + (b.emotional_support_patterns?.length || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-400">Support Patterns</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}