import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Brain, Zap, TrendingUp } from 'lucide-react';

function BioSignalWave({ signal, position, color }) {
    const lineRef = useRef();
    const points = useRef([]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        const newPoints = [];
        for (let i = 0; i < 50; i++) {
            const x = (i / 50) * 10 - 5;
            const y = Math.sin(time * 2 + i * 0.2) * signal.intensity * 0.5;
            newPoints.push([x + position[0], y + position[1], position[2]]);
        }
        points.current = newPoints;
    });

    return points.current.length > 0 ? (
        <Line points={points.current} color={color} lineWidth={2} />
    ) : null;
}

function AdaptiveAugmentationModel({ profile }) {
    const meshRef = useRef();
    const [rotation, setRotation] = useState(0);

    useFrame(() => {
        if (meshRef.current) {
            setRotation((prev) => prev + 0.01);
            meshRef.current.rotation.y = rotation;
        }
    });

    const adjustmentCount = profile?.real_time_adjustments?.length || 0;
    const adjustmentIntensity = Math.min(adjustmentCount / 10, 1);

    return (
        <group>
            <Sphere ref={meshRef} args={[2, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ff00ff"
                    emissive="#ff00ff"
                    emissiveIntensity={0.3 + adjustmentIntensity * 0.4}
                    wireframe
                />
            </Sphere>
            
            {/* Inner core representing optimal state */}
            <Sphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#00ffff"
                    transparent
                    opacity={0.3}
                />
            </Sphere>

            <Text position={[0, -3, 0]} fontSize={0.5} color="white">
                {adjustmentCount} Real-Time Adjustments
            </Text>
        </group>
    );
}

function BioSignalMonitor({ signals }) {
    return (
        <>
            <BioSignalWave signal={{ intensity: signals.heart_rate / 100 }} position={[0, 4, 0]} color="#ff0000" />
            <BioSignalWave signal={{ intensity: signals.blood_oxygen / 100 }} position={[0, 2, 0]} color="#00ff00" />
            <BioSignalWave signal={{ intensity: signals.neural_activity / 100 }} position={[0, 0, 0]} color="#0000ff" />
            <BioSignalWave signal={{ intensity: signals.stress_hormones / 100 }} position={[0, -2, 0]} color="#ffff00" />

            <Html position={[-6, 4, 0]} distanceFactor={10}>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-xs">
                    Heart Rate: {signals.heart_rate?.toFixed(0)} bpm
                </div>
            </Html>
            <Html position={[-6, 2, 0]} distanceFactor={10}>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-xs">
                    Blood O₂: {signals.blood_oxygen?.toFixed(1)}%
                </div>
            </Html>
            <Html position={[-6, 0, 0]} distanceFactor={10}>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-xs">
                    Neural: {signals.neural_activity?.toFixed(0)}%
                </div>
            </Html>
            <Html position={[-6, -2, 0]} distanceFactor={10}>
                <div className="bg-black/80 text-white px-3 py-1 rounded text-xs">
                    Stress: {signals.stress_hormones?.toFixed(0)}%
                </div>
            </Html>
        </>
    );
}

function AdaptiveScene({ profile, bioSignals }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

            <AdaptiveAugmentationModel profile={profile} />
            <BioSignalMonitor signals={bioSignals} />

            <OrbitControls autoRotate autoRotateSpeed={0.3} />
        </>
    );
}

export default function BiometricAdaptiveVisualizer3D() {
    const queryClient = useQueryClient();
    const [bioSignals, setBioSignals] = useState({
        heart_rate: 75,
        blood_oxygen: 98,
        neural_activity: 65,
        stress_hormones: 30,
        skin_temperature: 36.5
    });

    const { data: profiles = [] } = useQuery({
        queryKey: ['adaptive-profiles'],
        queryFn: () => base44.entities.AdaptiveAugmentationProfile.list(),
        refetchInterval: 3000
    });

    const monitorMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('monitorBioSignals', data),
        onSuccess: (response) => {
            if (response.data.bio_signals) {
                setBioSignals(response.data.bio_signals);
            }
            queryClient.invalidateQueries(['adaptive-profiles']);
        }
    });

    const optimizeMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('optimizeAugmentationParameters', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adaptive-profiles']);
        }
    });

    const handleMonitor = () => {
        if (profiles.length > 0) {
            monitorMutation.mutate({
                augmentation_id: profiles[0].augmentation_id,
                user_id: profiles[0].user_id
            });
        }
    };

    const handleOptimize = () => {
        if (profiles.length > 0) {
            optimizeMutation.mutate({
                augmentation_id: profiles[0].augmentation_id,
                user_id: profiles[0].user_id,
                biosignal_data: bioSignals
            });
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Biometric Adaptive Augmentation System
                    <Badge variant="outline">{profiles.length} Active Profiles</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Button
                        onClick={handleMonitor}
                        disabled={monitorMutation.isPending || profiles.length === 0}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500"
                    >
                        <Heart className="w-4 h-4 mr-2" />
                        Monitor Bio-Signals
                    </Button>
                    <Button
                        onClick={handleOptimize}
                        disabled={optimizeMutation.isPending || profiles.length === 0}
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Optimize Parameters
                    </Button>
                </div>

                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <AdaptiveScene profile={profiles[0]} bioSignals={bioSignals} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-red-500/20 p-3 rounded border border-red-500/30">
                        <Heart className="w-4 h-4 text-red-400 mb-1" />
                        <div className="text-xs text-slate-400">Heart Rate</div>
                        <div className="text-lg font-bold text-white">{bioSignals.heart_rate.toFixed(0)}</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30">
                        <Activity className="w-4 h-4 text-green-400 mb-1" />
                        <div className="text-xs text-slate-400">Blood O₂</div>
                        <div className="text-lg font-bold text-white">{bioSignals.blood_oxygen.toFixed(1)}%</div>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30">
                        <Brain className="w-4 h-4 text-blue-400 mb-1" />
                        <div className="text-xs text-slate-400">Neural</div>
                        <div className="text-lg font-bold text-white">{bioSignals.neural_activity.toFixed(0)}%</div>
                    </div>
                    <div className="bg-yellow-500/20 p-3 rounded border border-yellow-500/30">
                        <Zap className="w-4 h-4 text-yellow-400 mb-1" />
                        <div className="text-xs text-slate-400">Stress</div>
                        <div className="text-lg font-bold text-white">{bioSignals.stress_hormones.toFixed(0)}%</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30">
                        <Activity className="w-4 h-4 text-purple-400 mb-1" />
                        <div className="text-xs text-slate-400">Temp</div>
                        <div className="text-lg font-bold text-white">{bioSignals.skin_temperature.toFixed(1)}°C</div>
                    </div>
                </div>

                {profiles[0] && profiles[0].real_time_adjustments?.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold text-slate-300">Recent Adjustments</h4>
                        {profiles[0].real_time_adjustments.slice(-3).map((adj, index) => (
                            <div key={index} className="bg-slate-800 p-3 rounded text-xs">
                                <div className="text-white font-semibold">{adj.parameter_name}</div>
                                <div className="text-slate-400">
                                    {adj.old_value} → {adj.new_value}
                                </div>
                                <div className="text-slate-500">{adj.trigger_reason}</div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}