import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Sparkles, Box, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

const AdversarialAgent = ({ position, type }) => {
    const mesh = useRef();
    useFrame((state) => {
        mesh.current.rotation.x += 0.02;
        mesh.current.rotation.y += 0.03;
        mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    });

    const color = type === 'adversary' ? '#ef4444' : '#22c55e';

    return (
        <group position={position}>
            <Float speed={4} rotationIntensity={1} floatIntensity={2}>
                <mesh ref={mesh}>
                    <octahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={2} />
                </mesh>
                {type === 'adversary' && (
                    <Sparkles count={10} scale={1.2} color="red" speed={2} />
                )}
            </Float>
        </group>
    );
};

const SimulationGrid = () => {
    return (
        <gridHelper args={[20, 20, 0xffffff, 0x222222]} position={[0, -2, 0]} />
    );
};

const ThreatZone = ({ position }) => {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2, 2.1, 32]} />
            <meshBasicMaterial color="red" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
    );
};

export default function AdvancedSimulation3D({ scenario, params }) {
    // Dynamic agents based on params if provided
    const agents = useMemo(() => {
        const count = params?.resources ? Math.floor(params.resources / 10) + 2 : 4;
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4],
            type: Math.random() > 0.6 ? 'adversary' : 'defender'
        }));
    }, [params?.resources]);

    return (
        <div className="w-full h-[500px] bg-black rounded-xl overflow-hidden relative border border-white/10">
            <div className="absolute top-4 left-4 z-10 space-y-2">
                <Badge variant="outline" className="bg-red-900/40 text-red-200 border-red-500/50 backdrop-blur">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Threat Level: {scenario?.threat_level || 'CRITICAL'}
                </Badge>
                <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-500/50 backdrop-blur block">
                    <Activity className="w-3 h-3 mr-1 inline" /> Simulating: {scenario?.name || 'Urban Defense'}
                </Badge>
            </div>

            <Canvas camera={{ position: [5, 5, 10], fov: 50 }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 30]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                <SimulationGrid />

                {agents.map(agent => (
                    <AdversarialAgent key={agent.id} position={agent.pos} type={agent.type} />
                ))}

                <ThreatZone position={[0, -1.9, 0]} />

                <OrbitControls autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}