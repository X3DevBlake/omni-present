import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Line } from '@react-three/drei';
import * as THREE from 'three';

const AgentNode = ({ position, color, label }) => {
    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh>
                    <sphereGeometry args={[0.2, 32, 32]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                </mesh>
                <Text
                    position={[0, 0.3, 0]}
                    fontSize={0.1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            </Float>
        </group>
    );
};

const ConnectionLines = ({ nodes }) => {
    const lines = useMemo(() => {
        const l = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() > 0.8) { // Random connections
                    l.push([nodes[i].position, nodes[j].position]);
                }
            }
        }
        return l;
    }, [nodes]);

    return (
        <group>
            {lines.map((line, i) => (
                <Line
                    key={i}
                    points={line}
                    color="#4c1d95"
                    transparent
                    opacity={0.2}
                    lineWidth={1}
                />
            ))}
        </group>
    );
};

export default function OmegaMarketplace3D() {
    const nodes = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6
            ],
            color: Math.random() > 0.5 ? "#a855f7" : "#22d3ee",
            label: `Agent ${i + 1}`
        }));
    }, []);

    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden bg-black/40 border border-white/10">
            <Canvas camera={{ position: [0, 0, 8] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <AgentNode position={[0, 0, 0]} color="#ffffff" label="You" />
                {nodes.map((node, i) => (
                    <AgentNode key={i} {...node} />
                ))}
                <ConnectionLines nodes={nodes} />
                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
            </Canvas>
            <div className="absolute bottom-4 left-4 text-xs text-white/50 pointer-events-none">
                Decentralized Agent Mesh Network
            </div>
        </div>
    );
}