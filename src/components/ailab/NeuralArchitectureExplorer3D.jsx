import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function NeuralWeb() {
    const count = 200;
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            p[i*3] = (Math.random() - 0.5) * 10;
            p[i*3+1] = (Math.random() - 0.5) * 10;
            p[i*3+2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, []);

    const mesh = useRef();
    useFrame((state) => {
        if(mesh.current) mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    });

    return (
        <group ref={mesh}>
            <Points positions={positions} stride={3}>
                <PointMaterial transparent color="#ff00ff" size={0.1} sizeAttenuation={true} depthWrite={false} />
            </Points>
            {/* Simulated connections - simplified for performance */}
            <mesh>
                <boxGeometry args={[0.1, 0.1, 0.1]} /> 
                {/* Placeholder for complex lines, using Points for visual effect instead */}
            </mesh>
        </group>
    );
}

export default function NeuralArchitectureExplorer3D() {
    return (
        <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-purple-500/30 relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <NeuralWeb />
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute top-4 left-4">
                <h3 className="text-2xl font-bold text-white">Neural Architecture</h3>
                <div className="text-purple-400 text-sm font-mono">LIVE TRAINING VISUALIZATION</div>
            </div>
        </div>
    );
}