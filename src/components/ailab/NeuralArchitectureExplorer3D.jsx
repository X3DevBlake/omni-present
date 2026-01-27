import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

function NeuralWeb({ training }) {
    const count = 300; // Increased count
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            p[i*3] = (Math.random() - 0.5) * 12;
            p[i*3+1] = (Math.random() - 0.5) * 12;
            p[i*3+2] = (Math.random() - 0.5) * 12;
        }
        return p;
    }, []);

    const mesh = useRef();
    
    useFrame((state) => {
        if(mesh.current) {
            // Spin faster when training
            mesh.current.rotation.y += training ? 0.02 : 0.002;
            mesh.current.rotation.x += training ? 0.01 : 0.001;
            
            // Pulse effect if training
            if(training) {
                const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
                mesh.current.scale.setScalar(scale);
            }
        }
    });

    return (
        <group ref={mesh}>
            <Points positions={positions} stride={3}>
                <PointMaterial 
                    transparent 
                    color={training ? "#ff00ff" : "#8b5cf6"} 
                    size={0.15} 
                    sizeAttenuation={true} 
                    depthWrite={false} 
                    opacity={0.8}
                />
            </Points>
            {/* Connection lines visualized as a wireframe box for style, simulating network structure */}
            <mesh>
                <icosahedronGeometry args={[4, 2]} />
                <meshBasicMaterial color={training ? "#ff00ff" : "#4c1d95"} wireframe transparent opacity={0.1} />
            </mesh>
        </group>
    );
}

export default function NeuralArchitectureExplorer3D({ training }) {
    return (
        <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-purple-500/30 relative">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
                <NeuralWeb training={training} />
                <OrbitControls autoRotate autoRotateSpeed={training ? 2.0 : 0.5} />
            </Canvas>
            <div className="absolute top-4 left-4 p-4 pointer-events-none">
                <h3 className="text-3xl font-black text-white tracking-tight">NEURAL ARCHITECTURE</h3>
                <div className={`text-sm font-mono mt-1 ${training ? 'text-green-400 animate-pulse' : 'text-purple-400'}`}>
                    STATUS: {training ? 'TRAINING IN PROGRESS...' : 'IDLE'}
                </div>
            </div>
        </div>
    );
}