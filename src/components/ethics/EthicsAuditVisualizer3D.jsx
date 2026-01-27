import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Torus, Text, Float } from '@react-three/drei';

function AuditRing({ score, label, position }) {
    const color = score > 90 ? "#00ff00" : "#ff0000";
    
    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Torus args={[1, 0.1, 16, 100]}>
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                </Torus>
                <Text position={[0, 0, 0]} fontSize={0.3} color="white">
                    {score}%
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.15} color="white">
                    {label}
                </Text>
            </Float>
        </group>
    );
}

export default function EthicsAuditVisualizer3D({ reports }) {
    return (
        <div className="w-full h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                {reports?.map((report, i) => (
                    <AuditRing 
                        key={i}
                        position={[(i - 1) * 3, 0, 0]}
                        score={report.compliance_score}
                        label={report.target_id}
                    />
                ))}

                <OrbitControls />
            </Canvas>
            <div className="absolute bottom-4 w-full text-center pointer-events-none">
                <div className="text-white/30 text-xs tracking-[0.5em]">ETHICAL COMPLIANCE AUDIT</div>
            </div>
        </div>
    );
}