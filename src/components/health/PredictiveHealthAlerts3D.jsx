import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Activity } from 'lucide-react';

function RiskIndicator({ position, risk, index }) {
    const meshRef = useRef();
    const [hovered, setHovered] = React.useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            const pulseSpeed = risk.severity === 'critical' ? 4 : risk.severity === 'high' ? 2 : 1;
            const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed + index) * 0.3;
            meshRef.current.scale.setScalar(scale);
        }
    });

    const severityColor = risk.severity === 'critical' ? '#ff0000' :
                         risk.severity === 'high' ? '#ff6600' :
                         risk.severity === 'medium' ? '#ffaa00' : '#ffff00';

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[0.4, 16, 16]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={severityColor}
                    emissive={severityColor}
                    emissiveIntensity={1}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded text-xs max-w-xs">
                        <div className="font-bold text-red-400">{risk.risk_type}</div>
                        <div className="text-slate-400">{risk.mitigation_strategy}</div>
                        <div className="mt-1 text-yellow-400">
                            Probability: {(risk.probability * 100).toFixed(0)}%
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function HealthRiskScene({ scenarios }) {
    const allRisks = scenarios.flatMap(s => s.risk_factors || []);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central health core */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={0.5}
                    wireframe
                />
            </Sphere>

            {allRisks.slice(0, 12).map((risk, index) => {
                const angle = (index / 12) * Math.PI * 2;
                const radius = 4;
                const position = [
                    Math.cos(angle) * radius,
                    Math.sin(index * 0.5) * 2,
                    Math.sin(angle) * radius
                ];

                return (
                    <RiskIndicator
                        key={index}
                        position={position}
                        risk={risk}
                        index={index}
                    />
                );
            })}

            <OrbitControls autoRotate autoRotateSpeed={0.4} />
        </>
    );
}

export default function PredictiveHealthAlerts3D() {
    const { data: scenarios = [] } = useQuery({
        queryKey: ['health-scenarios'],
        queryFn: () => base44.entities.HealthScenarioSimulation.list('-created_date', 10),
        refetchInterval: 20000
    });

    const allRisks = scenarios.flatMap(s => s.risk_factors || []);
    const criticalRisks = allRisks.filter(r => r.severity === 'critical');
    const highRisks = allRisks.filter(r => r.severity === 'high');

    return (
        <Card className="w-full bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Predictive Health Risk Monitor
                    {criticalRisks.length > 0 && (
                        <Badge className="bg-red-500/30 text-red-300 animate-pulse">
                            {criticalRisks.length} Critical
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <HealthRiskScene scenarios={scenarios} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-500/20 p-3 rounded border border-red-500/30 text-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{criticalRisks.length}</div>
                        <div className="text-xs text-slate-400">Critical</div>
                    </div>
                    <div className="bg-orange-500/20 p-3 rounded border border-orange-500/30 text-center">
                        <Activity className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{highRisks.length}</div>
                        <div className="text-xs text-slate-400">High Risk</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Heart className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{allRisks.length}</div>
                        <div className="text-xs text-slate-400">Total Risks</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}