import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, Shield } from 'lucide-react';

function OptimizationBar({ position, height, color, label }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={position}>
            <Box ref={meshRef} args={[0.5, height, 0.5]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </Box>
            <Text position={[0, -1, 0]} fontSize={0.3} color="white">
                {label}
            </Text>
        </group>
    );
}

function DeviceOptimizationScene({ metrics }) {
    if (!metrics || metrics.length === 0) return null;

    const metric = metrics[0];
    const baseline = metric.baseline_metrics || {};
    const optimized = metric.optimized_metrics || {};

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Baseline metrics */}
            <OptimizationBar
                position={[-3, baseline.performance_score / 20, 0]}
                height={baseline.performance_score / 10}
                color="#ff6b6b"
                label="Baseline"
            />

            {/* Optimized metrics */}
            <OptimizationBar
                position={[3, optimized.performance_score / 20, 0]}
                height={optimized.performance_score / 10}
                color="#51cf66"
                label="Optimized"
            />

            <Html position={[0, 8, 0]} distanceFactor={10}>
                <div className="bg-black/80 text-white px-4 py-2 rounded">
                    <div className="text-lg font-bold">
                        +{((optimized.performance_score - baseline.performance_score) / baseline.performance_score * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm">Performance Gain</div>
                </div>
            </Html>

            <OrbitControls />
        </>
    );
}

export default function DeviceOptimizationVisualizer3D() {
    const { data: metrics = [] } = useQuery({
        queryKey: ['device-optimization'],
        queryFn: () => base44.entities.DeviceOptimizationMetrics.list(),
        refetchInterval: 5000
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Device Optimization Analytics
                    <Badge variant="outline">{metrics.length} Optimizations</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
                        <DeviceOptimizationScene metrics={metrics} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-slate-300">Performance</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {metrics[0] ? metrics[0].optimized_metrics?.performance_score.toFixed(1) : '0'}%
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">Energy Efficiency</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {metrics[0] ? metrics[0].optimized_metrics?.energy_efficiency.toFixed(1) : '0'}%
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-slate-300">Reliability</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {metrics[0] ? ((1 - metrics[0].optimized_metrics?.failure_probability) * 100).toFixed(1) : '0'}%
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}