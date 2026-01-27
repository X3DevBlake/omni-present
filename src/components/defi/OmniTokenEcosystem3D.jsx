import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Torus, Sphere, Text, Float } from '@react-three/drei';

function TokenOrb({ position, price }) {
    const mesh = useRef();
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y += 0.01;
            mesh.current.rotation.x += 0.005;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={position}>
                <mesh ref={mesh}>
                    <torusGeometry args={[2, 0.5, 16, 100]} />
                    <meshStandardMaterial color="#00ffff" emissive="#0088aa" emissiveIntensity={0.5} wireframe />
                </mesh>
                <mesh>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={1} />
                </mesh>
                <Text position={[0, -3.5, 0]} fontSize={0.5} color="white" anchorX="center">
                    OMNI TOKEN
                </Text>
                <Text position={[0, -4.2, 0]} fontSize={0.3} color="#00ffff" anchorX="center">
                    ${price?.toFixed(2)}
                </Text>
            </group>
        </Float>
    );
}

export default function OmniTokenEcosystem3D({ price }) {
    return (
        <div className="w-full h-[500px] bg-black/90 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                <TokenOrb position={[0, 0, 0]} price={price || 124.50} />
                <OrbitControls autoRotate enableZoom={false} />
                <gridHelper args={[20, 20, 0x111111, 0x050505]} position={[0, -5, 0]} />
            </Canvas>
        </div>
    );
}