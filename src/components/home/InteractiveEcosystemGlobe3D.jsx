import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function DataNode({ position, data, type, onClick }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
            if (hovered) {
                meshRef.current.scale.setScalar(1.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const colors = {
        agent: '#ff00ff',
        health: '#00ff00',
        companion: '#ffff00',
        financial: '#00ffff',
        device: '#ff6600'
    };

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[0.3, 32, 32]}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={colors[type]}
                    emissive={colors[type]}
                    emissiveIntensity={hovered ? 1 : 0.5}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded shadow-xl">
                        <div className="text-xs font-bold mb-1">{type.toUpperCase()}</div>
                        {Object.entries(data).slice(0, 3).map(([key, value]) => (
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

function Globe() {
    const globeRef = useRef();

    useFrame(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.002;
        }
    });

    return (
        <Sphere ref={globeRef} args={[3, 64, 64]}>
            <meshStandardMaterial
                color="#1a1a2e"
                transparent
                opacity={0.3}
                wireframe
            />
        </Sphere>
    );
}

function InteractiveGlobeScene({ ecosystem }) {
    if (!ecosystem) return <Globe />;

    // Generate node positions on sphere surface
    const generateSpherePosition = (index, total) => {
        const phi = Math.acos(-1 + (2 * index) / total);
        const theta = Math.sqrt(total * Math.PI) * phi;
        const radius = 3.5;

        return [
            radius * Math.cos(theta) * Math.sin(phi),
            radius * Math.sin(theta) * Math.sin(phi),
            radius * Math.cos(phi)
        ];
    };

    const nodes = [];
    let nodeIndex = 0;

    // Add agent nodes
    for (let i = 0; i < (ecosystem.agent_summary?.total_agents || 0); i++) {
        nodes.push({
            position: generateSpherePosition(nodeIndex++, 20),
            type: 'agent',
            data: { id: i, status: 'active' }
        });
    }

    // Add health nodes
    if (ecosystem.health_summary) {
        nodes.push({
            position: generateSpherePosition(nodeIndex++, 20),
            type: 'health',
            data: { score: ecosystem.health_summary.unified_health_score }
        });
    }

    // Add companion nodes
    for (let i = 0; i < (ecosystem.companion_summary?.total_companions || 0); i++) {
        nodes.push({
            position: generateSpherePosition(nodeIndex++, 20),
            type: 'companion',
            data: { id: i, bond: ecosystem.companion_summary.emotional_bond_strength }
        });
    }

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <Globe />

            {nodes.map((node, index) => (
                <React.Fragment key={index}>
                    <DataNode
                        position={node.position}
                        data={node.data}
                        type={node.type}
                    />
                    <Line
                        points={[[0, 0, 0], node.position]}
                        color="#ffffff"
                        lineWidth={1}
                        transparent
                        opacity={0.1}
                    />
                </React.Fragment>
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} />
        </>
    );
}

export default function InteractiveEcosystemGlobe3D() {
    const { data: ecosystem } = useQuery({
        queryKey: ['globe-ecosystem'],
        queryFn: async () => {
            const response = await base44.functions.invoke('getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 15000
    });

    return (
        <div className="h-full bg-black rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <InteractiveGlobeScene ecosystem={ecosystem} />
            </Canvas>
        </div>
    );
}