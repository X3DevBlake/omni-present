import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain } from 'lucide-react';
import * as THREE from 'three';

function LearningCurve({ data }) {
    const points = data.map((point, index) => [
        index * 2 - data.length,
        point.accuracy * 5,
        0
    ]);

    return (
        <Line
            points={points}
            color="#00ffff"
            lineWidth={3}
        />
    );
}

function DataPoint({ position, accuracy, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2);
        }
    });

    return (
        <Sphere ref={meshRef} args={[0.2, 16, 16]} position={position}>
            <meshStandardMaterial
                color={accuracy > 0.8 ? '#00ff00' : accuracy > 0.5 ? '#ffaa00' : '#ff0000'}
                emissive={accuracy > 0.8 ? '#00ff00' : accuracy > 0.5 ? '#ffaa00' : '#ff0000'}
                emissiveIntensity={0.6}
            />
        </Sphere>
    );
}

function LearningScene({ learningLogs }) {
    const accuracyData = learningLogs.map(log => ({
        accuracy: log.performance_metrics?.accuracy_after || 0.5,
        timestamp: log.timestamp
    }));

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <LearningCurve data={accuracyData} />

            {accuracyData.map((point, index) => (
                <DataPoint
                    key={index}
                    position={[index * 2 - accuracyData.length, point.accuracy * 5, 0]}
                    accuracy={point.accuracy}
                    index={index}
                />
            ))}

            <Text position={[0, -3, 0]} fontSize={0.4} color="white">
                Learning Evolution
            </Text>

            <OrbitControls />
        </>
    );
}

export default function LearningProgressVisualizer3D() {
    const { data: learningLogs = [] } = useQuery({
        queryKey: ['learning-logs'],
        queryFn: () => base44.entities.AgentLearningLog.list('-created_date', 20),
        refetchInterval: 10000
    });

    const avgAccuracy = learningLogs.reduce((sum, log) => 
        sum + (log.performance_metrics?.accuracy_after || 0), 0) / (learningLogs.length || 1);

    return (
        <Card className="w-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-5 h-5 text-cyan-400" />
                    Adaptive Learning Engine
                    <Badge className="bg-cyan-500/20 text-cyan-400">{learningLogs.length} Sessions</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <LearningScene learningLogs={learningLogs} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{(avgAccuracy * 100).toFixed(1)}%</div>
                        <div className="text-xs text-slate-400">Avg Accuracy</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Brain className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{learningLogs.length}</div>
                        <div className="text-xs text-slate-400">Learning Events</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {learningLogs.filter(l => l.applied_successfully).length}
                        </div>
                        <div className="text-xs text-slate-400">Applied</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}