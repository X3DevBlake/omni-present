import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity } from 'lucide-react';

function BrainRegion({ position, activity, label, color }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            const scale = 1 + activity * 0.5;
            meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 3) * 0.1);
        }
    });

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[0.5, 32, 32]}>
                <MeshDistortMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={activity}
                    distort={activity * 0.3}
                    speed={2}
                />
            </Sphere>
        </group>
    );
}

function NeuralScene({ activityRecord }) {
    const regions = [
        { label: 'Prefrontal', activity: activityRecord?.brain_region_activity?.prefrontal_cortex || 0.5, position: [0, 2, 0], color: '#00ffff' },
        { label: 'Hippocampus', activity: activityRecord?.brain_region_activity?.hippocampus || 0.5, position: [-2, 0, 0], color: '#ff00ff' },
        { label: 'Amygdala', activity: activityRecord?.brain_region_activity?.amygdala || 0.5, position: [2, 0, 0], color: '#ffff00' },
        { label: 'Motor', activity: activityRecord?.brain_region_activity?.motor_cortex || 0.5, position: [-1, -2, 0], color: '#00ff00' },
        { label: 'Visual', activity: activityRecord?.brain_region_activity?.visual_cortex || 0.5, position: [1, -2, 0], color: '#ff6600' }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {regions.map((region, index) => (
                <BrainRegion
                    key={index}
                    position={region.position}
                    activity={region.activity}
                    label={region.label}
                    color={region.color}
                />
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.2} />
        </>
    );
}

export default function NeuralActivityVisualizer3D() {
    const { data: neuralRecords = [] } = useQuery({
        queryKey: ['neural-activity'],
        queryFn: () => base44.entities.NeuralActivityRecord.list('-created_date', 1),
        refetchInterval: 5000
    });

    const latestRecord = neuralRecords[0];

    return (
        <Card className="w-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Neural Activity Monitor
                    <Badge className="bg-purple-500/20 text-purple-300">
                        {latestRecord?.cognitive_state || 'Unknown'}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                        <NeuralScene activityRecord={latestRecord} />
                    </Canvas>
                </div>
                <div className="space-y-2">
                    {latestRecord?.detected_thoughts?.map((thought, index) => (
                        <div key={index} className="bg-purple-500/20 p-2 rounded border border-purple-500/30">
                            <div className="flex justify-between items-center">
                                <span className="text-white text-sm">{thought.thought_category}</span>
                                <Badge variant="outline" className="text-xs">
                                    {(thought.confidence * 100).toFixed(0)}% confidence
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {latestRecord?.anomaly_detected && (
                        <div className="bg-red-500/20 p-3 rounded border border-red-500/30 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-red-400" />
                            <span className="text-red-300 text-sm">Anomaly detected - monitoring enhanced</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}