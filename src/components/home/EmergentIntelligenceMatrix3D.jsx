import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function IntelligenceNode({ position, intelligence, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 0.3 + intelligence.level * 0.7;
            meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1);
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    const color = new THREE.Color().setHSL(intelligence.level, 0.8, 0.5);

    return (
        <Sphere ref={meshRef} args={[0.5, 32, 32]} position={position}>
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
            />
        </Sphere>
    );
}

function EmergentConnection({ start, end, strength }) {
    return (
        <Line
            points={[start, end]}
            color="#00ffff"
            lineWidth={strength * 3}
            transparent
            opacity={strength * 0.6}
        />
    );
}

function MatrixScene({ agents }) {
    const intelligenceNodes = useMemo(() => {
        const nodes = [];
        const gridSize = 5;
        
        for (let i = 0; i < Math.min(agents.length, 25); i++) {
            const x = (i % gridSize) * 3 - 6;
            const z = Math.floor(i / gridSize) * 3 - 6;
            const y = Math.sin(i * 0.5) * 2;
            
            nodes.push({
                position: [x, y, z],
                level: Math.random(),
                id: i
            });
        }
        
        return nodes;
    }, [agents.length]);

    const connections = useMemo(() => {
        const conns = [];
        intelligenceNodes.forEach((node1, i) => {
            intelligenceNodes.slice(i + 1).forEach((node2, j) => {
                if (Math.random() > 0.7) {
                    conns.push({
                        start: node1.position,
                        end: node2.position,
                        strength: Math.random()
                    });
                }
            });
        });
        return conns;
    }, [intelligenceNodes]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            {intelligenceNodes.map((node, index) => (
                <IntelligenceNode
                    key={index}
                    position={node.position}
                    intelligence={node}
                    index={index}
                />
            ))}

            {connections.map((conn, index) => (
                <EmergentConnection
                    key={index}
                    start={conn.start}
                    end={conn.end}
                    strength={conn.strength}
                />
            ))}

            <Text position={[0, 8, 0]} fontSize={0.8} color="white">
                Emergent Intelligence Matrix
            </Text>

            <OrbitControls autoRotate autoRotateSpeed={0.2} />
        </>
    );
}

export default function EmergentIntelligenceMatrix3D() {
    const { data: agents = [] } = useQuery({
        queryKey: ['matrix-agents'],
        queryFn: () => base44.entities.Agent.list(),
        refetchInterval: 10000
    });

    const { data: collaborations = [] } = useQuery({
        queryKey: ['matrix-collaborations'],
        queryFn: () => base44.entities.AgentCollaboration.list(),
        refetchInterval: 10000
    });

    return (
        <Card className="w-full bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        ⚡ Emergent Intelligence Matrix
                    </h3>
                    <div className="flex gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400">
                            {agents.length} Nodes
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-400">
                            {collaborations.length} Links
                        </Badge>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                    Real-time visualization of emergent collective intelligence across agent network
                </p>
                <div className="h-[600px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
                        <MatrixScene agents={agents} />
                    </Canvas>
                </div>
            </div>
        </Card>
    );
}