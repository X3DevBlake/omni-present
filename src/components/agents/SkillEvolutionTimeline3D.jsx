import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Line, Text } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp } from 'lucide-react';

function SkillMilestone({ position, skill, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
        }
    });

    const proficiency = skill.proficiency || 0.5;
    const size = 0.3 + proficiency * 0.5;

    return (
        <group position={position}>
            <Box ref={meshRef} args={[size, size, size]}>
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={proficiency * 0.8}
                />
            </Box>
            <Text position={[0, -1, 0]} fontSize={0.25} color="white">
                {skill.skill_name || 'Skill'}
            </Text>
        </group>
    );
}

function TimelineScene({ skills }) {
    const timelinePoints = skills.map((_, index) => [
        index * 3 - ((skills.length - 1) * 3) / 2,
        0,
        0
    ]);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {timelinePoints.length > 1 && (
                <Line
                    points={timelinePoints}
                    color="#ffffff"
                    lineWidth={2}
                    transparent
                    opacity={0.3}
                />
            )}

            {skills.map((skill, index) => (
                <SkillMilestone
                    key={index}
                    position={timelinePoints[index]}
                    skill={skill}
                    index={index}
                />
            ))}

            <OrbitControls />
        </>
    );
}

export default function SkillEvolutionTimeline3D() {
    const { data: marketplace = [] } = useQuery({
        queryKey: ['skill-timeline'],
        queryFn: () => base44.entities.AgentSkillMarketplace.list(),
        refetchInterval: 10000
    });

    const skills = marketplace.map(item => ({
        skill_name: item.skill_name,
        proficiency: item.skill_proficiency,
        timestamp: item.created_date
    }));

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    Agent Skill Evolution Timeline
                    <Badge variant="outline">{skills.length} Skills Acquired</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
                        <TimelineScene skills={skills} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <GraduationCap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{skills.length}</div>
                        <div className="text-xs text-slate-400">Total Skills</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {skills.filter(s => s.proficiency > 0.8).length}
                        </div>
                        <div className="text-xs text-slate-400">Master Level</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {((skills.reduce((sum, s) => sum + s.proficiency, 0) / skills.length) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-400">Avg Proficiency</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}