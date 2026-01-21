import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function TransferFlowParticles({ transfer }) {
    const particlesRef = useRef();
    const particleCount = 100;
    const particles = useRef([]);

    useEffect(() => {
        particles.current = Array.from({ length: particleCount }, () => ({
            position: new THREE.Vector3(-5, Math.random() * 2 - 1, Math.random() * 2 - 1),
            velocity: 0.05 + Math.random() * 0.05
        }));
    }, []);

    useFrame(() => {
        if (particlesRef.current && transfer.transfer_status === 'transferring') {
            particles.current.forEach((particle, i) => {
                particle.position.x += particle.velocity;
                if (particle.position.x > 5) {
                    particle.position.x = -5;
                }
                if (particlesRef.current.geometry.attributes.position) {
                    particlesRef.current.geometry.attributes.position.setXYZ(
                        i,
                        particle.position.x,
                        particle.position.y,
                        particle.position.z
                    );
                }
            });
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const positions = new Float32Array(particleCount * 3);
    particles.current.forEach((p, i) => {
        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.8} />
        </points>
    );
}

function ConsciousnessNode({ position, label, status, color }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            const scale = status === 'active' ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 : 1;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[0.5, 32, 32]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.8 : 0.3}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            <Text position={[0, -1, 0]} fontSize={0.3} color="white">
                {label}
            </Text>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/80 text-white px-3 py-2 rounded text-sm">
                        Status: {status}
                    </div>
                </Html>
            )}
        </group>
    );
}

function TransferScene({ transfers }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            {transfers.map((transfer, index) => (
                <group key={transfer.id}>
                    <ConsciousnessNode
                        position={[-5, index * 3, 0]}
                        label="Source"
                        status={transfer.transfer_status}
                        color="#ff00ff"
                    />
                    <ConsciousnessNode
                        position={[5, index * 3, 0]}
                        label="Target"
                        status={transfer.transfer_status}
                        color="#00ff00"
                    />
                    <TransferFlowParticles transfer={transfer} />
                    <Line
                        points={[[-5, index * 3, 0], [5, index * 3, 0]]}
                        color="#ffffff"
                        lineWidth={2}
                        transparent
                        opacity={0.3}
                    />
                </group>
            ))}

            <OrbitControls enableZoom={true} enablePan={true} />
        </>
    );
}

export default function ConsciousnessTransferVisualizer3D() {
    const { data: transfers = [], isLoading } = useQuery({
        queryKey: ['consciousness-transfers'],
        queryFn: () => base44.entities.ConsciousnessSnapshot.list(),
        refetchInterval: 2000
    });

    const statusColors = {
        captured: 'bg-blue-500',
        transferring: 'bg-yellow-500',
        completed: 'bg-green-500',
        failed: 'bg-red-500'
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🧠 Consciousness Transfer Visualizer
                    <Badge variant="outline">{transfers.length} Active</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[600px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <TransferScene transfers={transfers} />
                    </Canvas>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {transfers.slice(0, 4).map((transfer) => (
                        <div key={transfer.id} className="bg-slate-800 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white">Transfer</span>
                                <Badge className={statusColors[transfer.transfer_status]}>
                                    {transfer.transfer_status}
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-400">
                                Integrity: {(transfer.integrity_score * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-400">
                                Compression: {(transfer.compression_ratio * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}