import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Zap, Dna, Activity } from 'lucide-react';

const EvolutionNode = ({ position, color, size, label }) => {
    const meshRef = useRef();
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            // Pulse
            const scale = size * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color={color} wireframe />
            </mesh>
            <mesh scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </mesh>
            {label && (
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {label}
                </Text>
            )}
        </group>
    );
};

const EvolutionTree = () => {
    const groupRef = useRef();

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Core */}
            <EvolutionNode position={[0, 0, 0]} color="#ec4899" size={1.5} label="Genesis" />
            
            {/* Branches - Level 1 */}
            <EvolutionNode position={[3, 2, 0]} color="#8b5cf6" size={1} label="Cognition" />
            <EvolutionNode position={[-3, 2, 0]} color="#3b82f6" size={1} label="Perception" />
            <EvolutionNode position={[0, -3, 2]} color="#10b981" size={1} label="Autonomy" />
            
            {/* Branches - Level 2 */}
            <EvolutionNode position={[4, 4, 1]} color="#a78bfa" size={0.6} />
            <EvolutionNode position={[5, 3, -1]} color="#a78bfa" size={0.6} />
            <EvolutionNode position={[-4, 4, 1]} color="#60a5fa" size={0.6} />
            
            {/* Connections */}
            <line>
                <bufferGeometry attach="geometry" onUpdate={self => {
                    const points = [
                        new THREE.Vector3(0,0,0), new THREE.Vector3(3,2,0),
                        new THREE.Vector3(0,0,0), new THREE.Vector3(-3,2,0),
                        new THREE.Vector3(0,0,0), new THREE.Vector3(0,-3,2),
                        new THREE.Vector3(3,2,0), new THREE.Vector3(4,4,1),
                        new THREE.Vector3(3,2,0), new THREE.Vector3(5,3,-1),
                        new THREE.Vector3(-3,2,0), new THREE.Vector3(-4,4,1),
                    ];
                    self.setFromPoints(points);
                }} />
                <lineBasicMaterial attach="material" color="#ffffff" transparent opacity={0.2} />
            </line>
        </group>
    );
};

export default function Evolve() {
    const [mutationRate, setMutationRate] = useState([50]);
    const [complexity, setComplexity] = useState([30]);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <EvolutionTree />
                    <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={false} />
                </Canvas>
            </div>

            {/* Evolution Controls */}
            <div className="absolute top-20 right-10 z-20 w-80 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 pointer-events-auto">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-pink-400" /> Parameters</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between mb-2 text-sm text-gray-300">
                            <span>Mutation Rate</span>
                            <span>{mutationRate}%</span>
                        </div>
                        <Slider value={mutationRate} onValueChange={setMutationRate} max={100} step={1} className="bg-white/10" />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2 text-sm text-gray-300">
                            <span>Cognitive Complexity</span>
                            <span>{complexity}%</span>
                        </div>
                        <Slider value={complexity} onValueChange={setComplexity} max={100} step={1} className="bg-white/10" />
                    </div>
                    <div className="pt-2 border-t border-white/10 mt-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Fitness Score</span>
                            <span className="text-green-400 font-bold">98.4%</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Diversity Index</span>
                            <span className="text-blue-400 font-bold">0.85</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 p-10 max-w-7xl mx-auto pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mt-20"
                >
                    <div className="inline-block p-3 rounded-full bg-pink-500/20 mb-4 backdrop-blur-md border border-pink-500/50">
                        <Dna className="w-8 h-8 text-pink-400" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 drop-shadow-2xl">
                        EVOLVE
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Witness the accelerated evolution of synthetic intelligence. 
                        Shape the neural pathways of tomorrow's Omni-Present consciousness.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 mt-24 pointer-events-auto">
                    {[
                        { title: "Neural Expansion", desc: "Increase synaptic density by 400%", icon: Zap, color: "purple" },
                        { title: "Cognitive Depth", desc: "Deepen reasoning capabilities", icon: Zap, color: "blue" }, // Fixed icon
                        { title: "Sentient Awakening", desc: "Unlock Level 5 autonomy", icon: Sparkles, color: "pink" }
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.2 }}
                        >
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/5 transition-all cursor-pointer group">
                                <card.icon className={`w-10 h-10 text-${card.color}-400 mb-4 group-hover:scale-110 transition-transform`} />
                                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                                <p className="text-gray-400 mb-6">{card.desc}</p>
                                <Button className={`w-full bg-${card.color}-600/20 hover:bg-${card.color}-600/40 text-${card.color}-300 border border-${card.color}-500/50`}>
                                    Initiate Evolution
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}