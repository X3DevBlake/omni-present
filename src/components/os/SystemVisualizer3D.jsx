import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls, Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Smartphone, Laptop, Server, Monitor } from 'lucide-react';

const DeviceNode = ({ position, type, name, status, onClick, isSelected }) => {
    const mesh = useRef();
    
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y += 0.01;
            mesh.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
        }
    });

    const color = status === 'online' ? '#00f5ff' : '#ef4444';
    const glow = isSelected ? 2 : 0.5;

    return (
        <group position={position} onClick={onClick}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={mesh}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial 
                        color={color} 
                        wireframe 
                        emissive={color}
                        emissiveIntensity={glow}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
                <Html distanceFactor={15}>
                    <div className={`
                        px-3 py-1 rounded-full border backdrop-blur-md text-xs font-mono whitespace-nowrap
                        ${isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100' : 'bg-black/50 border-white/10 text-gray-400'}
                    `}>
                        {name}
                    </div>
                </Html>
            </Float>
        </group>
    );
};

const ConnectionLines = ({ devices }) => {
    // Connect all devices to a central hub (0,0,0)
    const points = useMemo(() => {
        return devices.map(d => [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(...d.position)
        ]);
    }, [devices]);

    return (
        <group>
            {points.map((p, i) => (
                <Line 
                    key={i} 
                    points={p} 
                    color="#00f5ff" 
                    opacity={0.2} 
                    transparent 
                    lineWidth={1} 
                />
            ))}
        </group>
    );
};

const CentralHub = () => {
    const ref = useRef();
    useFrame((state) => {
        ref.current.rotation.x = state.clock.elapsedTime * 0.2;
        ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    });

    return (
        <group>
            <mesh ref={ref}>
                <icosahedronGeometry args={[1.5, 1]} />
                <meshStandardMaterial 
                    color="#a855f7" 
                    wireframe 
                    emissive="#a855f7" 
                    emissiveIntensity={1} 
                />
            </mesh>
            <pointLight distance={20} intensity={2} color="#a855f7" />
        </group>
    );
};

export default function SystemVisualizer3D({ devices, onSelectDevice, selectedDeviceId }) {
    // Generate positions for devices in a circle
    const devicesWithPositions = useMemo(() => {
        return devices.map((d, i) => {
            const angle = (i / devices.length) * Math.PI * 2;
            const radius = 6;
            return {
                ...d,
                position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
            };
        });
    }, [devices]);

    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                
                <CentralHub />
                <ConnectionLines devices={devicesWithPositions} />
                
                {devicesWithPositions.map((device) => (
                    <DeviceNode
                        key={device.id}
                        {...device}
                        isSelected={selectedDeviceId === device.id}
                        onClick={() => onSelectDevice(device)}
                    />
                ))}

                <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}