import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function RiskCloud({ riskScore }) {
    const count = 1000;
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360); 
            const phi = THREE.MathUtils.randFloatSpread(360); 
            const r = 5 + Math.random() * 2;
            p[i*3] = r * Math.sin(theta) * Math.cos(phi);
            p[i*3+1] = r * Math.sin(theta) * Math.sin(phi);
            p[i*3+2] = r * Math.cos(theta);
        }
        return p;
    }, []);

    const mesh = useRef();
    
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * (riskScore / 500); // Faster spin on higher risk
            const scale = 1 + Math.sin(state.clock.getElapsedTime()) * (riskScore / 200);
            mesh.current.scale.setScalar(scale);
        }
    });

    const color = riskScore > 75 ? "#ff0000" : (riskScore > 40 ? "#ffa500" : "#00ff00");

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.1} color={color} transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

export default function EmergentRiskVisualizer3D({ forecast }) {
    return (
        <div className="w-full h-full bg-black rounded-xl overflow-hidden border border-red-900/30 shadow-[0_0_30px_rgba(255,0,0,0.1)]">
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <RiskCloud riskScore={forecast?.risk_score || 20} />
                <OrbitControls autoRotate />
            </Canvas>
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="text-xs text-red-400 font-bold uppercase tracking-widest">Risk Forecast</div>
                <div className="text-2xl text-white font-mono">{forecast?.risk_score || 0}%</div>
                <div className="text-[10px] text-white/50 mt-1">Correlation: Sentience ({forecast?.sentience_correlation || 0})</div>
            </div>
        </div>
    );
}