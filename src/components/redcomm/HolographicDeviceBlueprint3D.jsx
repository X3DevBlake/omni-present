import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, useGLTF, Stage } from '@react-three/drei';
import * as THREE from 'three';

const DeviceModel = ({ modules }) => {
    const group = useRef();
    
    useFrame((state) => {
        if(group.current) {
            group.current.rotation.y = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <group ref={group}>
            {/* Core Body */}
            <mesh>
                <boxGeometry args={[2, 3, 0.5]} />
                <meshPhysicalMaterial 
                    color="#334155" 
                    metalness={0.9} 
                    roughness={0.1} 
                    clearcoat={1}
                    transparent
                    opacity={0.9}
                />
            </mesh>
            
            {/* Holographic Inner Circuitry */}
            <mesh>
                <boxGeometry args={[1.8, 2.8, 0.4]} />
                <meshBasicMaterial color="#0ea5e9" wireframe />
            </mesh>

            {/* Modules */}
            {modules && modules.map((mod, i) => (
                <group key={i} position={[1.2, 1 - (i * 0.8), 0]}>
                    <mesh>
                        <boxGeometry args={[0.8, 0.5, 0.2]} />
                        <meshStandardMaterial 
                            color={mod.status === 'optimal' ? '#22c55e' : '#ef4444'} 
                            emissive={mod.status === 'optimal' ? '#22c55e' : '#ef4444'}
                            emissiveIntensity={0.5}
                        />
                    </mesh>
                    <Text position={[0.5, 0, 0]} fontSize={0.15} color="white" anchorX="left">
                        {mod.module_name}
                    </Text>
                </group>
            ))}
        </group>
    );
};

export default function HolographicDeviceBlueprint3D({ blueprint }) {
    if (!blueprint) return <div className="text-white">Select a blueprint to view</div>;

    return (
        <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-slate-900 to-black rounded-xl overflow-hidden relative border border-cyan-500/30">
            <div className="absolute top-6 left-6 z-10">
                <h2 className="text-3xl font-bold text-cyan-400">{blueprint.device_name}</h2>
                <div className="flex gap-4 mt-2">
                    <span className="bg-cyan-900/50 px-2 py-1 rounded text-xs text-cyan-200 border border-cyan-500/30">{blueprint.model_series}</span>
                    <span className="bg-blue-900/50 px-2 py-1 rounded text-xs text-blue-200 border border-blue-500/30">{blueprint.specs?.ai_core_version}</span>
                </div>
            </div>

            <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -5, -10]} color="#0ea5e9" intensity={2} />
                
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <DeviceModel modules={blueprint.modules} />
                </Float>
                
                <gridHelper args={[20, 20, 0x1e293b, 0x1e293b]} position={[0, -2, 0]} />
                
                <OrbitControls autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            
            <div className="absolute bottom-6 right-6 z-10 w-64 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/10">
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Specs</h4>
                <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                        <span>Processing:</span>
                        <span className="text-cyan-400">{blueprint.specs?.processing_power} TFLOPS</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Encryption:</span>
                        <span className="text-purple-400">{blueprint.specs?.encryption_level}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Bandwidth:</span>
                        <span className="text-green-400">{blueprint.specs?.bandwidth_capacity}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}