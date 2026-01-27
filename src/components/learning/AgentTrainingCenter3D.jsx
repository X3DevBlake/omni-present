import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Star, TrendingUp } from 'lucide-react';

const SkillNode = ({ position, skill, mastery, onClick }) => {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x += 0.01;
            ref.current.rotation.y += 0.01;
            const scale = hovered ? 1.5 : 1 + (mastery * 0.2);
            ref.current.scale.lerp({ x: scale, y: scale, z: scale }, 0.1);
        }
    });

    const getColor = (level) => {
        if (level > 0.8) return "#fbbf24"; // Master - Gold
        if (level > 0.5) return "#a855f7"; // Expert - Purple
        if (level > 0.3) return "#3b82f6"; // Adept - Blue
        return "#9ca3af"; // Novice - Gray
    };

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh 
                    ref={ref}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    onClick={() => onClick(skill)}
                >
                    <icosahedronGeometry args={[0.5, 1]} />
                    <meshStandardMaterial 
                        color={getColor(mastery)} 
                        emissive={getColor(mastery)} 
                        emissiveIntensity={hovered ? 1 : 0.5} 
                        wireframe={mastery < 0.5}
                    />
                </mesh>
                <Text
                    position={[0, 0.8, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {skill}
                </Text>
            </Float>
        </group>
    );
};

export default function AgentTrainingCenter3D({ agents = [] }) {
    const [selectedSkill, setSelectedSkill] = useState(null);

    // Mock data
    const skills = [
        { name: "Negotiation", mastery: 0.9, pos: [-2, 1, 0] },
        { name: "Cyber-Defense", mastery: 0.4, pos: [2, 1, 0] },
        { name: "Pattern Rec", mastery: 0.7, pos: [0, -1, 2] },
        { name: "Resource Mgmt", mastery: 0.2, pos: [0, -1, -2] },
        { name: "Strategy", mastery: 0.6, pos: [0, 2, 0] }
    ];

    return (
        <div className="w-full h-[500px] bg-black rounded-xl overflow-hidden relative border border-white/10">
            <div className="absolute top-4 left-4 z-10 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-pink-400" /> Neural Training Hub
                </h3>
                <p className="text-xs text-gray-400">Visualizing Agent Skill Mastery & Evolution</p>
            </div>

            {selectedSkill && (
                <Card className="absolute bottom-4 right-4 w-64 bg-black/80 backdrop-blur border-pink-500/30 z-10 text-white">
                    <div className="p-4">
                        <div className="font-bold text-lg mb-1">{selectedSkill}</div>
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 mb-2">In Training</Badge>
                        <div className="text-xs text-gray-400 mb-2">
                            Current agent focus. Evolution probable upon completion of next module.
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-400">
                            <TrendingUp className="w-3 h-3" /> +12% Efficiency
                        </div>
                    </div>
                </Card>
            )}

            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                {skills.map((skill, i) => (
                    <React.Fragment key={i}>
                        <SkillNode 
                            position={skill.pos} 
                            skill={skill.name} 
                            mastery={skill.mastery} 
                            onClick={setSelectedSkill} 
                        />
                        {/* Connection lines to center/brain */}
                        <mesh>
                            <boxGeometry args={[0.02, 0.02, 0.02]} /> {/* Placeholder for line logic */}
                        </mesh>
                    </React.Fragment>
                ))}
                
                <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
            </Canvas>
        </div>
    );
}