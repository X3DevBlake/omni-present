import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

function DataParticle({ path, speed, color }) {
    const particleRef = useRef();
    const [progress, setProgress] = React.useState(0);

    useFrame(() => {
        setProgress((prev) => (prev + speed) % 1);
        if (particleRef.current && path.length > 1) {
            const index = Math.floor(progress * (path.length - 1));
            const nextIndex = Math.min(index + 1, path.length - 1);
            const t = (progress * (path.length - 1)) - index;
            
            const current = new THREE.Vector3(...path[index]);
            const next = new THREE.Vector3(...path[nextIndex]);
            particleRef.current.position.lerpVectors(current, next, t);
        }
    });

    return (
        <Sphere ref={particleRef} args={[0.1, 16, 16]}>
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </Sphere>
    );
}

function DataFlowNetwork() {
    const paths = [
        { points: [[-5, 2, 0], [0, 0, 0], [5, 2, 0]], color: '#ff00ff', label: 'Agents' },
        { points: [[0, 5, 0], [0, 0, 0], [0, -5, 0]], color: '#00ff00', label: 'Health' },
        { points: [[-5, -2, 0], [0, 0, 0], [5, -2, 0]], color: '#00ffff', label: 'Devices' },
        { points: [[-3, 3, -2], [0, 0, 0], [3, -3, 2]], color: '#ffff00', label: 'Financial' }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central hub */}
            <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={1}
                />
            </Sphere>

            {paths.map((path, index) => (
                <group key={index}>
                    <Line
                        points={path.points}
                        color={path.color}
                        lineWidth={2}
                        transparent
                        opacity={0.5}
                    />
                    <DataParticle
                        path={path.points}
                        speed={0.01 + Math.random() * 0.01}
                        color={path.color}
                    />
                    <Text
                        position={path.points[path.points.length - 1]}
                        fontSize={0.4}
                        color={path.color}
                    >
                        {path.label}
                    </Text>
                </group>
            ))}
        </>
    );
}

export default function RealTimeDataFlowAnimation() {
    return (
        <div className="h-[400px] bg-black rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <DataFlowNetwork />
            </Canvas>
        </div>
    );
}