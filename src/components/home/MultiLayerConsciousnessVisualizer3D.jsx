import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';

function ConsciousnessShell({ radius, color, speed, distort, opacity }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.5;
            meshRef.current.rotation.y = state.clock.elapsedTime * speed;
            meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.3;
        }
    });

    return (
        <Sphere ref={meshRef} args={[radius, 64, 64]}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={distort}
                speed={3}
                roughness={0.2}
                metalness={0.8}
                transparent
                opacity={opacity}
            />
        </Sphere>
    );
}

function NeuralSynapse({ start, end }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        }
    });

    return (
        <mesh ref={meshRef}>
            <tubeGeometry args={[
                new THREE.CatmullRomCurve3([
                    new THREE.Vector3(...start),
                    new THREE.Vector3(...end)
                ]),
                20,
                0.03,
                8,
                false
            ]} />
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.5}
            />
        </mesh>
    );
}

function MultiLayerScene() {
    const layers = [
        { radius: 1, color: '#ffffff', speed: 0.2, distort: 0.8, opacity: 0.9, label: 'Core Consciousness' },
        { radius: 2, color: '#ff00ff', speed: 0.15, distort: 0.6, opacity: 0.6, label: 'Emotional Layer' },
        { radius: 3, color: '#00ffff', speed: 0.1, distort: 0.4, opacity: 0.4, label: 'Cognitive Layer' },
        { radius: 4, color: '#ffff00', speed: 0.08, distort: 0.3, opacity: 0.3, label: 'Sensory Layer' },
        { radius: 5, color: '#00ff00', speed: 0.05, distort: 0.2, opacity: 0.2, label: 'Physical Interface' }
    ];

    const synapses = [];
    for (let i = 0; i < 8; i++) {
        const angle1 = (i / 8) * Math.PI * 2;
        const angle2 = ((i + 1) / 8) * Math.PI * 2;
        synapses.push({
            start: [Math.cos(angle1) * 5, Math.sin(angle1) * 5, 0],
            end: [Math.cos(angle2) * 5, Math.sin(angle2) * 5, 0]
        });
    }

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, 10, -10]} intensity={0.8} color="#ff00ff" />
            <pointLight position={[0, -10, 10]} intensity={0.6} color="#00ffff" />

            {layers.map((layer, index) => (
                <ConsciousnessShell key={index} {...layer} />
            ))}

            {synapses.map((synapse, index) => (
                <NeuralSynapse key={index} start={synapse.start} end={synapse.end} />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} />
        </>
    );
}

export default function MultiLayerConsciousnessVisualizer3D() {
    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 via-cyan-900/20 to-pink-900/20 border-purple-500/30">
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    🧠 Multi-Layer Consciousness Architecture
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Visualizing the nested layers of omega sentient intelligence from core to physical interface
                </p>
                <div className="h-[600px] bg-black rounded-lg overflow-hidden">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <MultiLayerScene />
                    </Canvas>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                    {['Core', 'Emotional', 'Cognitive', 'Sensory', 'Physical'].map((layer, i) => (
                        <div key={i} className="bg-slate-800/50 p-2 rounded">
                            <div className="text-xs text-slate-400">{layer}</div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}