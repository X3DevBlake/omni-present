import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text, Stars } from '@react-three/drei';

function ScenarioBlock({ position, type, intensity }) {
    const mesh = useRef();
    
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() + position[0]) * 0.2;
        }
    });

    const color = type === 'risk' ? '#ff4444' : (type === 'ethics' ? '#44ff44' : '#4444ff');

    return (
        <mesh ref={mesh} position={position}>
            <boxGeometry args={[1, intensity, 1]} />
            <meshStandardMaterial color={color} opacity={0.8} transparent />
        </mesh>
    );
}

export default function DynamicScenarioGenerator3D({ scenario }) {
    return (
        <div className="w-full h-[400px] bg-black rounded-xl overflow-hidden border border-white/10">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Stars />
                
                {/* Visualizing Generated Parameters */}
                <ScenarioBlock position={[-2, 0, 0]} type="risk" intensity={(scenario?.environment_parameters?.volatility || 0.5) * 4} />
                <Text position={[-2, 2.5, 0]} fontSize={0.3} color="#ff4444">Volatility</Text>
                
                <ScenarioBlock position={[0, 0, 0]} type="ethics" intensity={(scenario?.environment_parameters?.resource_scarcity || 0.5) * 4} />
                <Text position={[0, 2.5, 0]} fontSize={0.3} color="#44ff44">Scarcity</Text>
                
                <ScenarioBlock position={[2, 0, 0]} type="other" intensity={(scenario?.environment_parameters?.adversarial_presence || 0.5) * 4} />
                <Text position={[2, 2.5, 0]} fontSize={0.3} color="#4444ff">Adversity</Text>

                <OrbitControls />
                <gridHelper args={[20, 20, 0x222222, 0x111111]} />
            </Canvas>
            <div className="absolute bottom-4 left-4">
                <div className="text-white font-bold text-xl">{scenario?.name || "Generating Scenario..."}</div>
                <div className="text-white/50 text-sm">Complexity Level: {scenario?.complexity_level || 0}</div>
            </div>
        </div>
    );
}