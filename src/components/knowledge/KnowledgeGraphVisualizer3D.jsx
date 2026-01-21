import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Network, Search } from 'lucide-react';
import * as THREE from 'three';

function KnowledgeNode({ position, node, onClick }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            if (hovered) {
                meshRef.current.scale.setScalar(1.5);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const nodeColor = node.node_type === 'concept' ? '#00ffff' :
                     node.node_type === 'fact' ? '#00ff00' :
                     node.node_type === 'skill' ? '#ff00ff' : '#ffffff';

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[0.3, 16, 16]}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={nodeColor}
                    emissive={nodeColor}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded text-xs max-w-xs">
                        <div className="font-bold">{node.node_label}</div>
                        <div className="text-slate-400">{node.node_content?.substring(0, 100)}</div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function KnowledgeGraphScene({ nodes, edges }) {
    // Position nodes in 3D space
    const positionedNodes = nodes.map((node, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        const radius = 5;
        return {
            ...node,
            position: [
                Math.cos(angle) * radius,
                Math.sin(index * 0.5) * 2,
                Math.sin(angle) * radius
            ]
        };
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {positionedNodes.map((node, index) => (
                <KnowledgeNode
                    key={node.id}
                    position={node.position}
                    node={node}
                />
            ))}

            {edges.map((edge, index) => {
                const sourceNode = positionedNodes.find(n => n.id === edge.source_node_id);
                const targetNode = positionedNodes.find(n => n.id === edge.target_node_id);
                if (sourceNode && targetNode) {
                    return (
                        <Line
                            key={index}
                            points={[sourceNode.position, targetNode.position]}
                            color="#ffffff"
                            lineWidth={edge.strength * 2}
                            transparent
                            opacity={edge.strength * 0.5}
                        />
                    );
                }
                return null;
            })}

            <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </>
    );
}

export default function KnowledgeGraphVisualizer3D() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: nodes = [] } = useQuery({
        queryKey: ['knowledge-nodes'],
        queryFn: () => base44.entities.KnowledgeGraphNode.list(),
        refetchInterval: 15000
    });

    const { data: edges = [] } = useQuery({
        queryKey: ['knowledge-edges'],
        queryFn: () => base44.entities.KnowledgeGraphEdge.list(),
        refetchInterval: 15000
    });

    const filteredNodes = searchQuery ? 
        nodes.filter(n => 
            n.node_label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.node_content?.toLowerCase().includes(searchQuery.toLowerCase())
        ) : nodes;

    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Network className="w-5 h-5 text-purple-400" />
                    Universal Knowledge Graph
                    <Badge variant="outline">{nodes.length} Nodes</Badge>
                    <Badge variant="outline">{edges.length} Connections</Badge>
                </CardTitle>
                <div className="flex items-center gap-2 mt-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search knowledge..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/40 border-slate-600 text-white"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <KnowledgeGraphScene nodes={filteredNodes.slice(0, 50)} edges={edges} />
                    </Canvas>
                </div>
            </CardContent>
        </Card>
    );
}