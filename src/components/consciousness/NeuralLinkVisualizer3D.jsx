import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function NeuralPulse({ link }) {
    const pulseRef = useRef();
    const [phase, setPhase] = useState(0);

    useFrame((state) => {
        if (pulseRef.current && link.link_status === 'active') {
            setPhase((prev) => (prev + 0.05) % (Math.PI * 2));
            pulseRef.current.scale.setScalar(1 + Math.sin(phase) * 0.3);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            <Sphere ref={pulseRef} args={[2, 32, 32]}>
                <meshStandardMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.2}
                    wireframe
                />
            </Sphere>
        </group>
    );
}

function LinkNode({ position, label, type, active }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current && active) {
            meshRef.current.rotation.y += 0.02;
        }
    });

    const color = type === 'human' ? '#ff00ff' : '#00ff00';

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[0.8, 32, 32]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={active ? 0.5 : 0.2}
                />
            </Sphere>
            <Text position={[0, -1.5, 0]} fontSize={0.4} color="white">
                {label}
            </Text>
        </group>
    );
}

function DataStream({ link }) {
    const points = [];
    const segments = 50;
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = (t - 0.5) * 10;
        const y = Math.sin(t * Math.PI * 2) * 2;
        const z = Math.cos(t * Math.PI * 2) * 2;
        points.push([x, y, z]);
    }

    return (
        <Line
            points={points}
            color="#00ffff"
            lineWidth={3}
            transparent
            opacity={link.link_status === 'active' ? 0.8 : 0.3}
        />
    );
}

function NeuralLinkScene({ links }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            {links.map((link, index) => {
                const yOffset = index * 5;
                return (
                    <group key={link.id} position={[0, yOffset, 0]}>
                        <LinkNode
                            position={[-5, 0, 0]}
                            label="Human"
                            type="human"
                            active={link.link_status === 'active'}
                        />
                        <LinkNode
                            position={[5, 0, 0]}
                            label="AI"
                            type="ai"
                            active={link.link_status === 'active'}
                        />
                        <NeuralPulse link={link} />
                        <DataStream link={link} />
                        <Html position={[0, 2, 0]} distanceFactor={10}>
                            <div className="bg-black/80 text-white px-3 py-2 rounded text-sm">
                                {link.link_type} - {link.bandwidth_mbps.toFixed(0)} Mbps
                            </div>
                        </Html>
                    </group>
                );
            })}

            <OrbitControls enableZoom={true} />
        </>
    );
}

export default function NeuralLinkVisualizer3D() {
    const { data: links = [] } = useQuery({
        queryKey: ['neural-links'],
        queryFn: () => base44.entities.NeuralLinkRecord.list(),
        refetchInterval: 2000
    });

    const activeLinks = links.filter(l => l.link_status === 'active');

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🔗 Neural Link Visualizer
                    <Badge variant="outline">{activeLinks.length} Active Links</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[600px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
                        <NeuralLinkScene links={links} />
                    </Canvas>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {links.slice(0, 3).map((link) => (
                        <div key={link.id} className="bg-slate-800 p-3 rounded">
                            <div className="text-sm text-white mb-2">{link.link_type}</div>
                            <div className="text-xs text-slate-400">
                                Bandwidth: {link.bandwidth_mbps.toFixed(0)} Mbps
                            </div>
                            <div className="text-xs text-slate-400">
                                Latency: {link.latency_ms.toFixed(1)} ms
                            </div>
                            <div className="text-xs text-slate-400">
                                Amplification: {link.cognitive_amplification.toFixed(1)}x
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}