import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Wifi, Zap, Activity } from 'lucide-react';

const DeviceComponent = ({ position, color, type }) => {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (hovered && meshRef.current) {
            meshRef.current.scale.setScalar(1.1);
        } else if (meshRef.current) {
            meshRef.current.scale.setScalar(1);
        }
    });

    return (
        <group position={position}>
            <mesh 
                ref={meshRef}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} emissive={hovered ? color : '#000'} emissiveIntensity={0.5} />
            </mesh>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 p-2 rounded border border-white/20 text-xs w-32 backdrop-blur-md">
                        <div className="font-bold text-white mb-1">{type} Module</div>
                        <div className="text-gray-400">Status: Operational</div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const EnhancedDeviceModel = ({ exploded }) => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    const gap = exploded ? 1.5 : 0.6;

    return (
        <group ref={groupRef}>
            {/* Core Chassis */}
            <mesh>
                <boxGeometry args={[2, 3, 1]} />
                <meshStandardMaterial color="#333" metalness={0.5} transparent opacity={0.8} />
            </mesh>

            {/* Antenna Array */}
            <DeviceComponent position={[0, exploded ? 2.5 : 1.6, 0]} color="#ef4444" type="THz Antenna" />
            
            {/* Processing Unit */}
            <DeviceComponent position={[0, 0, exploded ? 1.5 : 0.6]} color="#3b82f6" type="Neural Processor" />
            
            {/* Power Cell */}
            <DeviceComponent position={[0, exploded ? -2.5 : -1.6, 0]} color="#10b981" type="Quantum Battery" />
            
            {/* Side Modules */}
            <DeviceComponent position={[exploded ? 1.5 : 1.1, 0, 0]} color="#f59e0b" type="Sensor Array" />
            <DeviceComponent position={[exploded ? -1.5 : -1.1, 0, 0]} color="#8b5cf6" type="Encryption Core" />

            {/* Connection Lines (only visible when exploded) */}
            {exploded && (
                <group>
                    <line>
                        <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,2.5,0)])} />
                        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.2} />
                    </line>
                    <line>
                        <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,-2.5,0)])} />
                        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.2} />
                    </line>
                    <line>
                        <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,1.5)])} />
                        <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.2} />
                    </line>
                </group>
            )}
        </group>
    );
};

import * as THREE from 'three';

export default function EnhancedRedCommBlueprint3D() {
    const [exploded, setExploded] = useState(false);

    return (
        <div className="w-full h-full min-h-[600px] bg-black rounded-3xl relative overflow-hidden border border-white/10">
            <div className="absolute top-6 left-6 z-10">
                <Badge className="bg-red-600 mb-2">RedComm XG-9000</Badge>
                <h2 className="text-3xl font-bold text-white mb-1">Device Blueprint</h2>
                <p className="text-gray-400 text-sm">Interplanetary THz Relay Node</p>
            </div>

            <div className="absolute bottom-6 left-6 z-10 space-y-4 w-64">
                <Card className="bg-black/60 backdrop-blur-xl border-white/10">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Bandwidth</span>
                            <span className="text-white font-mono">140 Tbps</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Latency</span>
                            <span className="text-white font-mono">0.004 ms</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Encryption</span>
                            <span className="text-white font-mono">Quantum-256</span>
                        </div>
                    </CardContent>
                </Card>
                <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => setExploded(!exploded)}
                >
                    {exploded ? "Assemble Device" : "Explode View"}
                </Button>
            </div>

            <Canvas camera={{ position: [4, 2, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
                
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <EnhancedDeviceModel exploded={exploded} />
                </Float>

                <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -3, 0]} />
                <OrbitControls autoRotate={!exploded} autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}