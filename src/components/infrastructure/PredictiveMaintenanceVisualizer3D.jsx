import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Cylinder } from '@react-three/drei';

function InfrastructureNode({ position, type, health, name }) {
    const color = health > 80 ? "#00ff00" : (health > 50 ? "#ffff00" : "#ff0000");
    
    return (
        <group position={position}>
            {type === 'Database' ? (
                <Cylinder args={[0.8, 0.8, 2, 32]}>
                    <meshStandardMaterial color={color} opacity={0.8} transparent />
                </Cylinder>
            ) : (
                <Box args={[1.5, 1.5, 1.5]}>
                    <meshStandardMaterial color={color} opacity={0.8} transparent />
                </Box>
            )}
            <Text position={[0, 1.5, 0]} fontSize={0.2} color="white">
                {name}
            </Text>
            <Text position={[0, 1.2, 0]} fontSize={0.15} color={color}>
                Health: {health}%
            </Text>
        </group>
    );
}

export default function PredictiveMaintenanceVisualizer3D({ predictions }) {
    return (
        <div className="w-full h-[400px] bg-black/90 rounded-xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                
                {predictions?.map((pred, i) => (
                    <InfrastructureNode 
                        key={i}
                        position={[(i - 1.5) * 3, 0, 0]}
                        type={pred.component_type}
                        health={pred.health_score}
                        name={pred.component_id}
                    />
                ))}

                <OrbitControls />
                <gridHelper args={[20, 20, 0x333333, 0x111111]} />
            </Canvas>
            <div className="absolute top-4 right-4 text-right">
                <div className="text-xs text-white/40 font-mono">SYSTEM HEALTH</div>
                <div className="text-xl font-bold text-green-400">OPTIMAL</div>
            </div>
        </div>
    );
}