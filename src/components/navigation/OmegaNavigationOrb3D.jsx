import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function NavigationOrb({ active }) {
    const orbRef = useRef();
    const particlesRef = useRef();

    useFrame((state) => {
        if (orbRef.current) {
            orbRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            orbRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }

        if (particlesRef.current) {
            particlesRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
        }
    });

    // Create particle ring
    const particleCount = 30;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 2;
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = Math.sin(angle) * radius * 0.3;
        particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return (
        <>
            <Sphere ref={orbRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color={active ? "#00ffff" : "#ff00ff"}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0}
                    metalness={0.8}
                />
            </Sphere>

            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={particlePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.1}
                    color="#00ffff"
                    transparent
                    opacity={0.8}
                    sizeAttenuation
                />
            </points>

            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        </>
    );
}

export default function OmegaNavigationOrb3D({ active = false }) {
    return (
        <div className="w-16 h-16">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <NavigationOrb active={active} />
            </Canvas>
        </div>
    );
}