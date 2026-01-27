import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Wireframe, Text } from '@react-three/drei';

function DeviceModule({ position, name, status }) {
    const color = status === 'Active' ? '#00ffff' : '#555555';
    return (
        <group position={position}>
            <Box args={[1, 0.5, 1]}>
                <meshStandardMaterial color="#1a1a1a" />
                <Wireframe stroke={color} />
            </Box>
            <Text position={[0, 0.4, 0]} fontSize={0.1} color={color} rotation={[-Math.PI/2, 0, 0]}>
                {name}
            </Text>
        </group>
    );
}

function MainUnit() {
    const mesh = useRef();
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y += 0.005;
        }
    });

    return (
        <group ref={mesh}>
            <Cylinder args={[2, 2, 4, 8]} position={[0, 0, 0]}>
                 <meshStandardMaterial color="#000" transparent opacity={0.8} />
                 <Wireframe stroke="#ff0000" strokeWidth={0.05} />
            </Cylinder>
            <DeviceModule position={[0, 1, 2]} name="Antenna Array" status="Active" />
            <DeviceModule position={[1.5, 0, 1.5]} name="AI Core" status="Active" />
            <DeviceModule position={[-1.5, 0, 1.5]} name="Power Cell" status="Active" />
        </group>
    );
}

export default function EnhancedRedCommBlueprint3D({ device }) {
    return (
        <div className="w-full h-full bg-black/90 border border-red-900/50 rounded-xl overflow-hidden relative">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} color="#ff0000" />
                <MainUnit />
                <OrbitControls />
                <gridHelper args={[20, 20, 0x330000, 0x110000]} />
            </Canvas>
            
            {/* Holographic Overlay UI */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-red-500 font-mono">REDCOMM XG-OMEGA</h2>
                        <div className="text-xs text-red-300/60 font-mono">BLUEPRINT VISUALIZATION VER 9.0</div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-mono text-red-500 font-bold">ACTIVE</div>
                        <div className="text-xs text-red-300">SYSTEM OPTIMAL</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-red-950/40 border border-red-500/30 p-2 rounded backdrop-blur-sm">
                        <div className="text-[10px] text-red-400">BANDWIDTH</div>
                        <div className="text-lg font-mono text-white">400 TBps</div>
                    </div>
                    <div className="bg-red-950/40 border border-red-500/30 p-2 rounded backdrop-blur-sm">
                        <div className="text-[10px] text-red-400">LATENCY</div>
                        <div className="text-lg font-mono text-white">0.004 ms</div>
                    </div>
                    <div className="bg-red-950/40 border border-red-500/30 p-2 rounded backdrop-blur-sm">
                        <div className="text-[10px] text-red-400">ENCRYPTION</div>
                        <div className="text-lg font-mono text-white">Q-PROOF</div>
                    </div>
                </div>
            </div>
        </div>
    );
}