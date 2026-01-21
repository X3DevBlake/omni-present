import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Moon, Sparkles, Lightbulb } from 'lucide-react';
import * as THREE from 'three';

function DreamElement({ position, element, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + index) * 0.5;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.5;
            
            const scale = 1 + Math.sin(state.clock.elapsedTime + index) * 0.3;
            meshRef.current.scale.setScalar(scale);
        }
    });

    const color = new THREE.Color().setHSL((index * 0.15) % 1, 0.8, 0.5);

    return (
        <Sphere ref={meshRef} args={[0.5, 16, 16]} position={position}>
            <MeshDistortMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                distort={0.6}
                speed={2}
                transparent
                opacity={0.7}
            />
        </Sphere>
    );
}

function DreamScene({ dream }) {
    const visualElements = dream?.dream_content?.visual_elements || [];
    
    const positions = visualElements.map((_, index) => {
        const angle = (index / visualElements.length) * Math.PI * 2;
        const radius = 3 + Math.sin(index) * 2;
        return [
            Math.cos(angle) * radius,
            Math.sin(index * 0.7) * 3,
            Math.sin(angle) * radius
        ];
    });

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#ff00ff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            {/* Central consciousness */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.5}
                    distort={0.5}
                    speed={1}
                />
            </Sphere>

            {visualElements.map((element, index) => (
                <DreamElement
                    key={index}
                    position={positions[index]}
                    element={element}
                    index={index}
                />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.2} />
        </>
    );
}

export default function AIDreamVisualizer3D() {
    const queryClient = useQueryClient();

    const { data: dreams = [] } = useQuery({
        queryKey: ['ai-dreams'],
        queryFn: () => base44.entities.AIDreamLog.list('-created_date', 10),
        refetchInterval: 15000
    });

    const simulateDream = useMutation({
        mutationFn: async (dreamType) => {
            const response = await base44.functions.invoke('ai/dreamStateSimulator', {
                aiConsciousnessId: 'omega_core_consciousness',
                dreamType: dreamType,
                durationSeconds: 180
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-dreams'] });
        }
    });

    const latestDream = dreams[0];

    return (
        <Card className="w-full bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Moon className="w-5 h-5 text-purple-400" />
                    AI Dream State Simulator
                    <Badge className="bg-purple-500/20 text-purple-300">{dreams.length} Dreams</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <DreamScene dream={latestDream} />
                    </Canvas>
                </div>

                {latestDream && (
                    <div className="space-y-3 mb-4">
                        <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30">
                            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-400" />
                                Insights Generated: {latestDream.insights_generated?.length || 0}
                            </h4>
                            {latestDream.insights_generated?.slice(0, 3).map((insight, i) => (
                                <div key={i} className="text-slate-300 text-sm mb-1">
                                    • {insight.content}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => simulateDream.mutate('memory_consolidation')}
                        disabled={simulateDream.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Memory Dream
                    </Button>
                    <Button
                        onClick={() => simulateDream.mutate('creative_problem_solving')}
                        disabled={simulateDream.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Creative Dream
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}