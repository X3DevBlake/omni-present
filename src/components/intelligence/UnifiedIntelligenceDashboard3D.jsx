import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

function InsightNode({ position, domain, risk, label }) {
    const color = risk === 'Critical' ? '#ff0000' : (risk === 'High' ? '#ff8800' : '#00ff00');
    
    return (
        <group position={position}>
            <Sphere args={[0.3, 16, 16]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </Sphere>
            <Html distanceFactor={10}>
                <div className="bg-black/80 p-1 rounded text-white text-xs whitespace-nowrap border border-white/20">
                    {domain}
                </div>
            </Html>
        </group>
    );
}

function ConnectionLine({ start, end }) {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    return <Line points={points} color="white" opacity={0.1} transparent />;
}

export default function UnifiedIntelligenceDashboard3D({ insights }) {
    // Map domains to positions in a circle
    const domains = ["Sentience", "Maintenance", "Ethics", "Orchestration", "Marketplace", "Simulation"];
    const radius = 4;
    
    const domainPositions = domains.reduce((acc, domain, i) => {
        const angle = (i / domains.length) * Math.PI * 2;
        acc[domain] = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
        return acc;
    }, {});

    return (
        <div className="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
            <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                <ambientLight intensity={0.5} />
                
                {/* Domain Nodes */}
                {domains.map(d => (
                    <InsightNode key={d} position={domainPositions[d]} domain={d} risk="Low" />
                ))}

                {/* Insight Connections */}
                {insights?.map((insight, i) => {
                    const start = domainPositions[insight.primary_domain];
                    const end = domainPositions[insight.secondary_domain];
                    if (start && end) {
                        return <ConnectionLine key={i} start={start} end={end} />;
                    }
                    return null;
                })}

                <OrbitControls autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute top-4 left-0 w-full text-center pointer-events-none">
                <div className="text-white/20 text-4xl font-bold uppercase tracking-widest">Unified AI Core</div>
            </div>
        </div>
    );
}