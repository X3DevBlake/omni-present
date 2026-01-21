import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Html, Sphere } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function FloatingContextElement({ position, data, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[0.3, 16, 16]}>
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.7}
                />
            </Sphere>
            <Html distanceFactor={10}>
                <div className="bg-black/80 text-white px-3 py-2 rounded text-xs whitespace-nowrap">
                    {data.label}: {data.value}
                </div>
            </Html>
        </group>
    );
}

function ContextScene({ contextData }) {
    const contextElements = [
        { label: 'Cognitive Load', value: `${((contextData?.cognitive_load || 0) * 100).toFixed(0)}%`, position: [-3, 2, 0] },
        { label: 'Active Tasks', value: contextData?.active_tasks?.length || 0, position: [3, 2, 0] },
        { label: 'Emotion', value: contextData?.emotional_state?.primary_emotion || 'calm', position: [-3, -2, 0] },
        { label: 'Devices', value: contextData?.active_devices?.length || 0, position: [3, -2, 0] },
        { label: 'Agents', value: contextData?.active_agents?.length || 0, position: [0, 3, 0] }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {contextElements.map((element, index) => (
                <FloatingContextElement
                    key={index}
                    position={element.position}
                    data={element}
                    index={index}
                />
            ))}
        </>
    );
}

export default function ContextualInfoDisplay() {
    const { data: contexts = [] } = useQuery({
        queryKey: ['omni-context'],
        queryFn: async () => {
            const user = await base44.auth.me();
            return await base44.entities.OmniContext.filter({ user_id: user.id }, '-created_date', 1);
        },
        refetchInterval: 5000
    });

    const currentContext = contexts[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-24 right-4 w-96 h-64 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-lg border border-cyan-500/30 backdrop-blur-sm overflow-hidden"
        >
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ContextScene contextData={currentContext} />
            </Canvas>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-white text-xs">
                <div className="flex justify-between">
                    <span>Predicted Action:</span>
                    <span className="text-cyan-400">{currentContext?.predicted_next_action || 'Analyzing...'}</span>
                </div>
            </div>
        </motion.div>
    );
}