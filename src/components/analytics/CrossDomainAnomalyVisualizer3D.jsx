import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnomalyCloud({ anomalies }) {
    const count = 500;
    // Generate random points, but highlight anomalies
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for(let i=0; i<count; i++) {
        positions[i*3] = (Math.random() - 0.5) * 10;
        positions[i*3+1] = (Math.random() - 0.5) * 10;
        positions[i*3+2] = (Math.random() - 0.5) * 10;
        
        // Default color blue
        colors[i*3] = 0;
        colors[i*3+1] = 0.5;
        colors[i*3+2] = 1;
    }

    // Add anomaly points (Red)
    if(anomalies) {
        for(let i=0; i<anomalies.length * 10; i++) {
             positions[i*3] = (Math.random() - 0.5) * 2; // Clustered
             positions[i*3+1] = (Math.random() - 0.5) * 2;
             positions[i*3+2] = (Math.random() - 0.5) * 2;
             
             colors[i*3] = 1;
             colors[i*3+1] = 0;
             colors[i*3+2] = 0;
        }
    }

    const mesh = useRef();
    useFrame((state) => {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.15} vertexColors transparent opacity={0.8} />
        </points>
    );
}

export default function CrossDomainAnomalyVisualizer3D({ anomalies }) {
    return (
        <div className="w-full h-[400px] bg-black rounded-xl overflow-hidden border border-red-500/30 relative">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <AnomalyCloud anomalies={anomalies} />
                <OrbitControls autoRotate />
            </Canvas>
            <div className="absolute bottom-4 left-4 text-red-500 font-mono text-xs">
                REAL-TIME ANOMALY SCANNING
            </div>
        </div>
    );
}