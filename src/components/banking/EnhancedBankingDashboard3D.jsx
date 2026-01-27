import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

function DashboardScreen({ position, type }) {
    const mesh = useRef();
    
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
        }
    });

    const color = type === 'Balance' ? '#00ff00' : '#00aaff';

    return (
        <group position={position}>
            <mesh ref={mesh}>
                <boxGeometry args={[3, 2, 0.1]} />
                <meshStandardMaterial color="#111" transparent opacity={0.8} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(3, 2, 0.1)]} />
                    <lineBasicMaterial color={color} />
                </lineSegments>
            </mesh>
            <Text position={[0, 0, 0.1]} fontSize={0.3} color="white">
                {type}
            </Text>
        </group>
    );
}

export default function EnhancedBankingDashboard3D() {
    return (
        <div className="w-full h-[400px] bg-gradient-to-b from-slate-900 to-black rounded-xl overflow-hidden border border-blue-500/30">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[5, 5, 5]} />
                <DashboardScreen position={[-2, 0, 0]} type="Balance" />
                <DashboardScreen position={[2, 0, 0]} type="History" />
                <OrbitControls />
            </Canvas>
        </div>
    );
}