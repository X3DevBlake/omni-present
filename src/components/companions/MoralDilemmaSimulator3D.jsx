import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Sparkles } from 'lucide-react';

function EthicalPrinciple({ position, principle, index }) {
    const meshRef = React.useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime + index;
            meshRef.current.scale.setScalar(0.5 + principle.weight * 0.5);
        }
    });

    return (
        <Sphere ref={meshRef} args={[0.4, 16, 16]} position={position}>
            <meshStandardMaterial
                color="#ff00ff"
                emissive="#ff00ff"
                emissiveIntensity={principle.weight}
            />
        </Sphere>
    );
}

function DilemmaScene({ dilemma }) {
    if (!dilemma) return null;

    const principles = dilemma.competing_principles || [];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central dilemma core */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.6}
                    wireframe
                />
            </Sphere>

            {principles.map((principle, index) => {
                const angle = (index / principles.length) * Math.PI * 2;
                const position = [Math.cos(angle) * 3, Math.sin(angle) * 3, 0];
                return (
                    <React.Fragment key={index}>
                        <EthicalPrinciple position={position} principle={principle} index={index} />
                        <Line
                            points={[[0, 0, 0], position]}
                            color="#ffffff"
                            lineWidth={principle.weight * 2}
                            transparent
                            opacity={0.5}
                        />
                    </React.Fragment>
                );
            })}

            <OrbitControls />
        </>
    );
}

export default function MoralDilemmaSimulator3D() {
    const [companionId, setCompanionId] = useState('');
    const [dilemmaType, setDilemmaType] = useState('general');
    const [currentDilemma, setCurrentDilemma] = useState(null);
    const queryClient = useQueryClient();

    const simulateDilemma = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('companions/simulateMoralDilemma', {
                companionId: companionId || 'default_companion',
                dilemmaType: dilemmaType
            });
            return response.data;
        },
        onSuccess: (data) => {
            setCurrentDilemma(data.dilemma);
            queryClient.invalidateQueries({ queryKey: ['ethical-dilemmas'] });
        }
    });

    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Scale className="w-5 h-5 text-purple-400" />
                    Moral Dilemma Simulator
                    {currentDilemma && (
                        <Badge className="bg-purple-500/20 text-purple-300">Active Scenario</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-3">
                    <Select value={dilemmaType} onValueChange={setDilemmaType}>
                        <SelectTrigger className="bg-black/40 border-slate-600 text-white">
                            <SelectValue placeholder="Select dilemma type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="general">General Ethics</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="privacy">Privacy</SelectItem>
                            <SelectItem value="autonomy">Autonomy vs Safety</SelectItem>
                            <SelectItem value="resource">Resource Allocation</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => simulateDilemma.mutate()}
                        disabled={simulateDilemma.isPending}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {simulateDilemma.isPending ? 'Generating...' : 'Generate Moral Dilemma'}
                    </Button>
                </div>

                {currentDilemma && (
                    <>
                        <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                                <DilemmaScene dilemma={currentDilemma} />
                            </Canvas>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30">
                                <h4 className="text-white font-semibold mb-2">Scenario</h4>
                                <p className="text-slate-300 text-sm">{currentDilemma.dilemma_description}</p>
                            </div>

                            <div className="bg-pink-500/20 p-3 rounded border border-pink-500/30">
                                <h4 className="text-white font-semibold mb-2">Companion's Decision</h4>
                                <p className="text-slate-300 text-sm mb-2">{currentDilemma.decision_made}</p>
                                <div className="text-xs text-slate-400">
                                    Reasoning: {currentDilemma.reasoning_process?.join(' → ')}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}