import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ConsciousnessWeb({ consciousnessData }) {
    const webRef = useRef();

    useFrame((state) => {
        if (webRef.current) {
            webRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    const nodes = [
        { label: 'Core AI', position: [0, 0, 0], color: '#ffffff' },
        { label: 'Neural Chip', position: [3, 2, 0], color: '#ff00ff' },
        { label: 'Augmentation', position: [-3, 2, 0], color: '#00ff00' },
        { label: 'Companion', position: [3, -2, 0], color: '#ffff00' },
        { label: 'Embodiment', position: [-3, -2, 0], color: '#00ffff' }
    ];

    return (
        <group ref={webRef}>
            {nodes.map((node, index) => (
                <React.Fragment key={index}>
                    <Sphere args={[0.5, 32, 32]} position={node.position}>
                        <meshStandardMaterial
                            color={node.color}
                            emissive={node.color}
                            emissiveIntensity={0.5}
                        />
                    </Sphere>
                    <Text position={[node.position[0], node.position[1] - 1, node.position[2]]} fontSize={0.3} color="white">
                        {node.label}
                    </Text>
                    {index > 0 && (
                        <Line
                            points={[nodes[0].position, node.position]}
                            color={node.color}
                            lineWidth={2}
                            transparent
                            opacity={0.6}
                        />
                    )}
                </React.Fragment>
            ))}
        </group>
    );
}

function NetworkScene() {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            <ConsciousnessWeb consciousnessData={{}} />

            <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </>
    );
}

export default function OmegaConsciousnessNetwork3D() {
    const { data: snapshots = [] } = useQuery({
        queryKey: ['consciousness-network'],
        queryFn: () => base44.entities.ConsciousnessSnapshot.list(),
        refetchInterval: 5000
    });

    const { data: links = [] } = useQuery({
        queryKey: ['neural-links-network'],
        queryFn: () => base44.entities.NeuralLinkRecord.list(),
        refetchInterval: 5000
    });

    const activeLinks = links.filter(l => l.link_status === 'active').length;

    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    🧠 Omega Consciousness Network
                    <Badge variant="outline">{activeLinks} Active Connections</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                        <NetworkScene />
                    </Canvas>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div>
                        <div className="text-2xl font-bold text-purple-400">{snapshots.length}</div>
                        <div className="text-xs text-slate-400">Snapshots</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400">{activeLinks}</div>
                        <div className="text-xs text-slate-400">Active Links</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">
                            {snapshots.filter(s => s.integrity_score > 0.95).length}
                        </div>
                        <div className="text-xs text-slate-400">High Integrity</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}