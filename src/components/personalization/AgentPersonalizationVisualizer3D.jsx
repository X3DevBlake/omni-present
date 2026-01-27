import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Icosahedron, TorusKnot, Float } from '@react-three/drei';

function ProfileNode({ trait, value, position, color }) {
    const mesh = useRef();
    
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.5;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.3;
            const scale = 0.5 + (value / 150);
            mesh.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh ref={mesh}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={color} wireframe />
                </mesh>
                <mesh scale={0.5}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color={color} opacity={0.3} transparent />
                </mesh>
                <Text position={[0, 1.5, 0]} fontSize={0.2} color="white" anchorX="center">
                    {trait}
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.2} color={color} anchorX="center">
                    {Math.round(value)}%
                </Text>
            </Float>
        </group>
    );
}

export default function AgentPersonalizationVisualizer3D({ profile }) {
    const traits = profile?.traits || { adaptability: 50, empathy: 50, risk_tolerance: 50, creativity: 50 };
    
    return (
        <div className="w-full h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />
                
                <ProfileNode trait="Adaptability" value={traits.adaptability} position={[-2, 2, 0]} color="#00ffff" />
                <ProfileNode trait="Empathy" value={traits.empathy} position={[2, 2, 0]} color="#ff00ff" />
                <ProfileNode trait="Risk" value={traits.risk_tolerance} position={[-2, -2, 0]} color="#ff0000" />
                <ProfileNode trait="Creativity" value={traits.creativity} position={[2, -2, 0]} color="#ffff00" />
                
                <OrbitControls autoRotate />
            </Canvas>
            <div className="absolute top-4 left-4 p-4">
                <h3 className="text-2xl font-bold text-white mb-1">{profile?.agent_id || "Select Agent"}</h3>
                <div className="text-sm text-cyan-400 font-mono tracking-widest uppercase">{profile?.archetype || "Analyzing..."}</div>
            </div>
        </div>
    );
}