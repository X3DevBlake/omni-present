import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, BookOpen } from 'lucide-react';

function MemoryOrb({ position, experience, index }) {
    const meshRef = useRef();
    const [hovered, setHovered] = React.useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            const floatY = Math.sin(state.clock.elapsedTime + index) * 0.2;
            meshRef.current.position.y = position[1] + floatY;
        }
    });

    const size = 0.2 + (experience.emotional_significance / 10) * 0.5;
    const color = `hsl(${(experience.memory_vividness || 50) * 3.6}, 100%, 50%)`;

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[size, 16, 16]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 1 : 0.5}
                    transparent
                    opacity={0.8}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded text-xs max-w-xs">
                        <div className="font-bold mb-1">{experience.experience_type}</div>
                        <div className="text-slate-400">{experience.experience_description}</div>
                        <div className="mt-2 text-pink-400">
                            Significance: {experience.emotional_significance}/10
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function SharedMemoryScene({ experiences }) {
    const timelinePoints = experiences.map((_, index) => [
        index * 3 - ((experiences.length - 1) * 3) / 2,
        0,
        0
    ]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />

            {timelinePoints.length > 1 && (
                <Line
                    points={timelinePoints}
                    color="#ffffff"
                    lineWidth={2}
                    transparent
                    opacity={0.3}
                />
            )}

            {experiences.map((exp, index) => (
                <MemoryOrb
                    key={exp.id}
                    position={timelinePoints[index]}
                    experience={exp}
                    index={index}
                />
            ))}

            <OrbitControls />
        </>
    );
}

export default function SharedMemoryTimeline3D() {
    const { data: experiences = [] } = useQuery({
        queryKey: ['shared-experiences'],
        queryFn: () => base44.entities.SharedExperienceLog.list('-created_date', 30),
        refetchInterval: 10000
    });

    const avgSignificance = experiences.reduce((sum, e) => sum + (e.emotional_significance || 0), 0) / (experiences.length || 1);

    return (
        <Card className="w-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 border-pink-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Shared Memory Timeline
                    <Badge variant="outline">{experiences.length} Memories</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
                        <SharedMemoryScene experiences={experiences} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-pink-500/20 p-3 rounded border border-pink-500/30 text-center">
                        <BookOpen className="w-5 h-5 text-pink-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{experiences.length}</div>
                        <div className="text-xs text-slate-400">Total Memories</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <Heart className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{avgSignificance.toFixed(1)}/10</div>
                        <div className="text-xs text-slate-400">Avg Significance</div>
                    </div>
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {experiences.reduce((sum, e) => sum + (e.recalled_count || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-400">Recalls</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}