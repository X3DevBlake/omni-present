import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

function Portal({ page, isActive, onClick }) {
    const portalRef = useRef();
    const ringsRef = useRef([]);

    useFrame((state) => {
        if (portalRef.current) {
            portalRef.current.rotation.z = state.clock.elapsedTime * 0.3;
        }

        ringsRef.current.forEach((ring, i) => {
            if (ring) {
                ring.rotation.y = state.clock.elapsedTime * (0.5 + i * 0.1);
                ring.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.05);
            }
        });
    });

    return (
        <group onClick={onClick}>
            <Sphere ref={portalRef} args={[0.5, 64, 64]}>
                <MeshDistortMaterial
                    color={isActive ? "#00ffff" : "#ff00ff"}
                    attach="material"
                    distort={isActive ? 0.6 : 0.3}
                    speed={2}
                    roughness={0}
                />
            </Sphere>

            {[1.2, 1.6, 2].map((radius, i) => (
                <mesh
                    key={i}
                    ref={(el) => (ringsRef.current[i] = el)}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <torusGeometry args={[radius, 0.05, 16, 100]} />
                    <meshStandardMaterial
                        color={isActive ? "#00ffff" : "#ff00ff"}
                        emissive={isActive ? "#00ffff" : "#ff00ff"}
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.3 - i * 0.1}
                    />
                </mesh>
            ))}

            <Text position={[0, -1.5, 0]} fontSize={0.3} color="white">
                {page.name}
            </Text>
        </group>
    );
}

export default function HolographicNavPortal3D({ pages, activePage, onNavigate }) {
    return (
        <div className="h-[300px] bg-gradient-to-br from-black via-purple-900/20 to-black rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

                {pages.map((page, index) => {
                    const angle = (index / pages.length) * Math.PI * 2;
                    const radius = 4;
                    const x = Math.cos(angle) * radius;
                    const z = Math.sin(angle) * radius;

                    return (
                        <group key={page.page} position={[x, 0, z]}>
                            <Portal
                                page={page}
                                isActive={activePage === page.page}
                                onClick={() => onNavigate && onNavigate(page.page)}
                            />
                        </group>
                    );
                })}
            </Canvas>
        </div>
    );
}