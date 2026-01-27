import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';

function EditableNode({ position, label, type, active, onClick }) {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (mesh.current && active) {
            mesh.current.rotation.y += 0.01;
        }
    });

    const color = type === 'action' ? '#ff00ff' : (type === 'condition' ? '#00ffff' : '#ffff00');

    return (
        <group position={position} onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <mesh ref={mesh} scale={hovered ? 1.2 : 1}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.8 : 0.2} transparent opacity={0.9} />
            </mesh>
            <Text position={[0, 0.8, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="bottom">
                {label}
            </Text>
            {hovered && (
                <Html position={[0, -0.8, 0]}>
                    <div className="bg-black/80 text-white text-xs p-1 rounded whitespace-nowrap border border-white/20">
                        Click to Edit
                    </div>
                </Html>
            )}
        </group>
    );
}

function Connector({ start, end }) {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    return <Line points={points} color="white" lineWidth={1} opacity={0.2} transparent />;
}

export default function AdaptiveBehaviorTreeEditor3D({ treeData, onNodeEdit }) {
    // Default mock data if not provided
    const nodes = treeData?.nodes || [
        { id: "root", position: [0, 3, 0], type: "selector", label: "Mission Root", active: true },
        { id: "seq1", position: [-2, 1, 0], type: "sequence", label: "Combat Logic", active: false },
        { id: "seq2", position: [2, 1, 0], type: "sequence", label: "Exploration", active: true },
        { id: "act1", position: [-3, -1, 0], type: "action", label: "Engage", active: false },
        { id: "act2", position: [-1, -1, 0], type: "condition", label: "Threat > 50%", active: false },
        { id: "act3", position: [1, -1, 0], type: "action", label: "Scan Sector", active: true },
        { id: "act4", position: [3, -1, 0], type: "action", label: "Move WP", active: false },
    ];

    const connections = [
        { start: [0, 3, 0], end: [-2, 1, 0] },
        { start: [0, 3, 0], end: [2, 1, 0] },
        { start: [-2, 1, 0], end: [-3, -1, 0] },
        { start: [-2, 1, 0], end: [-1, -1, 0] },
        { start: [2, 1, 0], end: [1, -1, 0] },
        { start: [2, 1, 0], end: [3, -1, 0] },
    ];

    return (
        <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative">
            <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <OrbitControls enableZoom={true} />
                
                {nodes.map((node) => (
                    <EditableNode key={node.id} {...node} onClick={() => onNodeEdit && onNodeEdit(node)} />
                ))}
                
                {connections.map((conn, i) => (
                    <Connector key={i} {...conn} />
                ))}
                
                <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -4, 0]} />
            </Canvas>
            <div className="absolute top-4 right-4 text-right pointer-events-none">
                <div className="text-xs text-white/40">MODE</div>
                <div className="text-sm font-bold text-green-400">LIVE EDITING</div>
            </div>
        </div>
    );
}