import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text, Float, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Network, Share2 } from 'lucide-react';

const HubNode = ({ position, name, color }) => {
    const ref = useRef();
    useFrame((state) => {
        ref.current.rotation.y += 0.01;
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={ref}>
                    <icosahedronGeometry args={[0.8, 0]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} wireframe />
                </mesh>
                <Text position={[0, 1.2, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
                    {name}
                </Text>
            </Float>
        </group>
    );
};

const ConnectionStream = ({ start, end, color }) => {
    return (
        <Line 
            points={[start, end]} 
            color={color} 
            lineWidth={2} 
            transparent 
            opacity={0.3} 
            dashed 
            dashScale={50} 
            dashSize={1} 
            dashOffset={0}
        />
    );
};

export default function CrossHubVisualizer3D() {
    const hubs = [
        { name: "Security Hub", pos: [-4, 2, 0], color: "#ef4444" },
        { name: "Finance Hub", pos: [4, 2, 0], color: "#22c55e" },
        { name: "Academy Hub", pos: [0, -3, 2], color: "#3b82f6" },
        { name: "R&D Hub", pos: [0, 4, -2], color: "#a855f7" }
    ];

    return (
        <div className="w-full h-[400px] bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800">
             <div className="absolute top-4 left-4 z-10">
                <Badge variant="outline" className="bg-slate-900/80 text-cyan-400 border-cyan-500/30">
                    <Share2 className="w-3 h-3 mr-1" /> Inter-Hub Orchestration Active
                </Badge>
            </div>

            <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Stars />

                {hubs.map((hub, i) => (
                    <React.Fragment key={i}>
                        <HubNode position={hub.pos} name={hub.name} color={hub.color} />
                        {hubs.slice(i + 1).map((target, j) => (
                            <ConnectionStream key={`${i}-${j}`} start={hub.pos} end={target.pos} color="#ffffff" />
                        ))}
                    </React.Fragment>
                ))}

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.2} />
            </Canvas>
        </div>
    );
}