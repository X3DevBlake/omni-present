import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Scale } from 'lucide-react';

function PrincipleNode({ position, principle, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
            const scale = 0.5 + principle.weight * 0.5;
            meshRef.current.scale.setScalar(scale);
        }
    });

    const color = new THREE.Color().setHSL(index * 0.2, 0.8, 0.5);

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[1, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            <Text position={[0, -2, 0]} fontSize={0.4} color="white">
                {principle.principle_name}
            </Text>
            <Text position={[0, -2.5, 0]} fontSize={0.3} color="#aaa">
                {(principle.weight * 100).toFixed(0)}%
            </Text>
        </group>
    );
}

function EthicalNetworkScene({ frameworks }) {
    if (!frameworks || frameworks.length === 0) return null;

    const framework = frameworks[0];
    const principles = framework.core_principles || [];

    const positions = principles.map((_, index) => {
        const angle = (index / principles.length) * Math.PI * 2;
        const radius = 5;
        return [
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.5,
            Math.sin(angle) * radius
        ];
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Center core */}
            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
            </Sphere>

            {/* Principles */}
            {principles.map((principle, index) => (
                <React.Fragment key={index}>
                    <PrincipleNode
                        position={positions[index]}
                        principle={principle}
                        index={index}
                    />
                    <Line
                        points={[[0, 0, 0], positions[index]]}
                        color="#ffffff"
                        lineWidth={2}
                        transparent
                        opacity={0.3}
                    />
                </React.Fragment>
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </>
    );
}

export default function EthicalReasoningVisualizer3D() {
    const { data: frameworks = [] } = useQuery({
        queryKey: ['ethical-frameworks'],
        queryFn: () => base44.entities.EthicalFrameworkEvolution.list(),
        refetchInterval: 5000
    });

    const totalDilemmas = frameworks.reduce(
        (sum, f) => sum + (f.ethical_dilemmas_encountered?.length || 0),
        0
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Ethical Reasoning Framework
                    <Badge variant="outline">{totalDilemmas} Dilemmas Processed</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <EthicalNetworkScene frameworks={frameworks} />
                    </Canvas>
                </div>

                {frameworks[0] && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-slate-300">
                                Moral Reasoning Patterns
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400 mb-1">Consequentialist</div>
                                <div className="text-lg font-bold text-white">
                                    {(frameworks[0].moral_reasoning_patterns?.consequentialist_weight * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400 mb-1">Deontological</div>
                                <div className="text-lg font-bold text-white">
                                    {(frameworks[0].moral_reasoning_patterns?.deontological_weight * 100).toFixed(0)}%
                                </div>
                            </div>
                            <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400 mb-1">Virtue Ethics</div>
                                <div className="text-lg font-bold text-white">
                                    {(frameworks[0].moral_reasoning_patterns?.virtue_ethics_weight * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}