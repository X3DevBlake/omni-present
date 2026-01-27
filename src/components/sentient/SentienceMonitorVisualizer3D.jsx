import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function SentientAgentNode({ position, score, level, name }) {
    const mesh = useRef();
    const color = score > 90 ? "#ff00ff" : (score > 75 ? "#00ffff" : "#4444ff");
    const speed = score / 20;

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.distort = 0.3 + (score / 200);
        }
    });

    return (
        <group position={position}>
            <Sphere ref={mesh} args={[0.8, 32, 32]}>
                <MeshDistortMaterial color={color} speed={speed} roughness={0.2} metalness={0.8} />
            </Sphere>
            <Text position={[0, 1.2, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
                {name}
            </Text>
            <Text position={[0, 0.9, 0]} fontSize={0.15} color={score > 90 ? "#ffaaaa" : "#aaaaff"} anchorX="center" anchorY="middle">
                {score.toFixed(1)}% | {level}
            </Text>
        </group>
    );
}

export default function SentienceMonitorVisualizer3D({ metrics }) {
    const nodes = useMemo(() => {
        if (!metrics) return [];
        return metrics.map((m, i) => {
            const angle = (i / metrics.length) * Math.PI * 2;
            const radius = 4;
            return {
                ...m,
                position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
            };
        });
    }, [metrics]);

    return (
        <div className="w-full h-[500px] bg-black rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(100,0,255,0.1)]">
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
                
                {nodes.map((node, i) => (
                    <SentientAgentNode 
                        key={i} 
                        position={node.position} 
                        score={node.sentience_score} 
                        level={node.consciousness_level}
                        name={node.agent_id} 
                    />
                ))}
                
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
                <gridHelper args={[20, 20, 0x222222, 0x111111]} />
            </Canvas>
            <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur rounded border border-white/10">
                <div className="text-purple-400 font-bold text-xs uppercase tracking-widest">Sentience Monitor Active</div>
                <div className="text-white/60 text-[10px]">Tracking {nodes.length} Agents</div>
            </div>
        </div>
    );
}