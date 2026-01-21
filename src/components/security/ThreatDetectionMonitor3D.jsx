import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

function ThreatNode({ position, threat, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            const intensity = threat.severity === 'critical' ? 2 : 
                            threat.severity === 'high' ? 1.5 : 1;
            meshRef.current.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * intensity + index) * 0.2);
        }
    });

    const severityColor = threat.severity === 'critical' ? '#ff0000' :
                         threat.severity === 'high' ? '#ff6600' :
                         threat.severity === 'medium' ? '#ffaa00' : '#ffff00';

    return (
        <Sphere ref={meshRef} args={[0.4, 16, 16]} position={position}>
            <meshStandardMaterial
                color={severityColor}
                emissive={severityColor}
                emissiveIntensity={0.8}
            />
        </Sphere>
    );
}

function SecurityScene({ threats }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central security core */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#00ff00"
                    emissive="#00ff00"
                    emissiveIntensity={0.5}
                    wireframe
                />
            </Sphere>

            {threats.map((threat, index) => {
                const angle = (index / threats.length) * Math.PI * 2;
                const radius = 4;
                const position = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
                
                return (
                    <React.Fragment key={threat.id}>
                        <ThreatNode position={position} threat={threat} index={index} />
                        <Line
                            points={[[0, 0, 0], position]}
                            color="#ff0000"
                            lineWidth={1}
                            transparent
                            opacity={0.3}
                        />
                    </React.Fragment>
                );
            })}

            <Text position={[0, -4, 0]} fontSize={0.4} color="white">
                Active Threat Monitoring
            </Text>

            <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </>
    );
}

export default function ThreatDetectionMonitor3D() {
    const queryClient = useQueryClient();

    const { data: threats = [] } = useQuery({
        queryKey: ['threat-logs'],
        queryFn: () => base44.entities.ThreatLog.list('-created_date', 50),
        refetchInterval: 10000
    });

    const scanThreats = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('security/threatDetectionEngine', {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['threat-logs'] });
        }
    });

    const activeThreats = threats.filter(t => 
        t.mitigation_status === 'detected' || t.mitigation_status === 'analyzing' || t.mitigation_status === 'mitigating'
    );

    const criticalThreats = threats.filter(t => t.severity === 'critical');

    return (
        <Card className="w-full bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-red-400" />
                    AI Threat Detection System
                    {criticalThreats.length > 0 && (
                        <Badge className="bg-red-500/30 text-red-300 animate-pulse">
                            {criticalThreats.length} Critical
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <SecurityScene threats={activeThreats} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-red-500/20 p-3 rounded border border-red-500/30 text-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{activeThreats.length}</div>
                        <div className="text-xs text-slate-400">Active</div>
                    </div>
                    <div className="bg-orange-500/20 p-3 rounded border border-orange-500/30 text-center">
                        <Shield className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {threats.filter(t => t.mitigation_status === 'resolved').length}
                        </div>
                        <div className="text-xs text-slate-400">Resolved</div>
                    </div>
                    <div className="bg-yellow-500/20 p-3 rounded border border-yellow-500/30 text-center">
                        <Activity className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {threats.filter(t => t.automated_response_taken?.success).length}
                        </div>
                        <div className="text-xs text-slate-400">Auto-Mitigated</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {(((threats.length - activeThreats.length) / (threats.length || 1)) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-400">Security Score</div>
                    </div>
                </div>
                <Button
                    onClick={() => scanThreats.mutate()}
                    disabled={scanThreats.isPending}
                    className="w-full bg-red-600 hover:bg-red-700"
                >
                    {scanThreats.isPending ? 'Scanning...' : 'Run Security Scan'}
                </Button>
            </CardContent>
        </Card>
    );
}

function useState(arg0) {
    return [arg0, () => {}];
}