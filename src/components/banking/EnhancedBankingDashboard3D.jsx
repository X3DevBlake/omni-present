import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, RoundedBox, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function OmniWalletCard({ address, balance }) {
    const mesh = useRef();
    
    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
            mesh.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={mesh}>
                {/* Holographic Card Body */}
                <RoundedBox args={[3.2, 2, 0.1]} radius={0.1} smoothness={4}>
                    <MeshTransmissionMaterial 
                        backside
                        samples={16}
                        thickness={0.2}
                        chromaticAberration={1}
                        anisotropy={0.3}
                        distortion={0.5}
                        distortionScale={0.5}
                        temporalDistortion={0.1}
                        color="#8b5cf6"
                        bg="#000000"
                    />
                </RoundedBox>
                
                {/* Chip */}
                <RoundedBox args={[0.5, 0.4, 0.02]} radius={0.05} position={[-1.2, 0.2, 0.06]}>
                    <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
                </RoundedBox>

                {/* Logo */}
                <Text position={[1.1, 0.6, 0.06]} fontSize={0.2} color="#fff" anchorX="center" anchorY="middle">
                    OMNI
                </Text>

                {/* Balance */}
                <Text position={[-1.2, -0.2, 0.06]} fontSize={0.15} color="#aaa" anchorX="left" anchorY="middle">
                    BALANCE
                </Text>
                <Text position={[-1.2, -0.5, 0.06]} fontSize={0.35} color="#fff" anchorX="left" anchorY="middle" font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff">
                    {balance ? parseFloat(balance).toFixed(2) : '0.00'} OMNI
                </Text>

                {/* Address */}
                <Text position={[0, -0.8, 0.06]} fontSize={0.1} color="#ffffff80" anchorX="center" anchorY="middle" font="https://fonts.gstatic.com/s/sharetechmono/v10/J7aHnp1uDWRy69leyei5RbA.woff">
                    {address || "0x..."}
                </Text>
            </group>
        </Float>
    );
}

function TransactionStream({ count = 20 }) {
    const points = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4 - 2),
            speed: Math.random() * 0.05 + 0.02
        }));
    }, [count]);

    return (
        <group>
            {points.map((p, i) => (
                <TransactionParticle key={i} {...p} />
            ))}
        </group>
    );
}

function TransactionParticle({ position, speed }) {
    const ref = useRef();
    useFrame(() => {
        if(ref.current) {
            ref.current.position.x -= speed;
            if(ref.current.position.x < -6) ref.current.position.x = 6;
        }
    });
    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#4ade80" transparent opacity={0.6} />
        </mesh>
    );
}

export default function EnhancedBankingDashboard3D() {
    const { data: wallets } = useQuery({
        queryKey: ['user-wallet'],
        queryFn: () => base44.entities.UserWallet.list({ limit: 1 }),
        initialData: []
    });

    const userWallet = wallets[0] || {};

    return (
        <div className="w-full h-[500px] bg-gradient-to-b from-slate-950 to-black rounded-2xl overflow-hidden border border-purple-500/30 relative shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                    OMNI WALLET LIVE
                </h3>
            </div>
            
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={['#050505']} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#a855f7" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
                
                <OmniWalletCard address={userWallet.address} balance={userWallet.balance} />
                <TransactionStream />
                
                <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
            </Canvas>
        </div>
    );
}