import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

function AssetNode({ position, asset, onClick }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            if (hovered) {
                meshRef.current.scale.setScalar(1.3);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const value = asset.value || 1000;
    const size = Math.log(value) / 10;

    return (
        <group position={position}>
            <Sphere
                ref={meshRef}
                args={[size, 32, 32]}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={asset.trend === 'up' ? '#00ff00' : asset.trend === 'down' ? '#ff0000' : '#ffaa00'}
                    emissive={asset.trend === 'up' ? '#00ff00' : asset.trend === 'down' ? '#ff0000' : '#ffaa00'}
                    emissiveIntensity={hovered ? 0.8 : 0.4}
                />
            </Sphere>
            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded">
                        <div className="font-bold">{asset.name}</div>
                        <div className="text-sm">${value.toFixed(2)}</div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function WealthOrchestratorScene() {
    const assets = [
        { name: 'Stocks', value: 25000, trend: 'up', position: [4, 2, 0] },
        { name: 'Crypto', value: 15000, trend: 'up', position: [-4, 2, 0] },
        { name: 'DeFi', value: 10000, trend: 'neutral', position: [4, -2, 0] },
        { name: 'Savings', value: 30000, trend: 'up', position: [-4, -2, 0] },
        { name: 'Real Estate', value: 50000, trend: 'up', position: [0, 4, 0] }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central AI orchestrator */}
            <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={0.8}
                    wireframe
                />
            </Sphere>

            {assets.map((asset, index) => (
                <React.Fragment key={index}>
                    <AssetNode position={asset.position} asset={asset} />
                    <Line
                        points={[[0, 0, 0], asset.position]}
                        color="#00ffff"
                        lineWidth={2}
                        transparent
                        opacity={0.4}
                    />
                </React.Fragment>
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.4} />
        </>
    );
}

function useState(arg0) {
    return [arg0, () => {}];
}

export default function AutonomousWealthOrchestrator3D() {
    const { data: ecosystem } = useQuery({
        queryKey: ['wealth-ecosystem'],
        queryFn: async () => {
            const response = await base44.functions.invoke('ecosystem/getUnifiedEcosystemSnapshot', {});
            return response.data.ecosystem;
        },
        refetchInterval: 10000
    });

    const portfolioValue = ecosystem?.financial_summary?.portfolio_value || 0;
    const predictedReturns = ecosystem?.financial_summary?.predicted_returns || 0;

    return (
        <Card className="w-full bg-gradient-to-br from-green-900/20 to-cyan-900/20 border-green-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Autonomous Wealth Orchestrator
                    <Badge className="bg-green-500/20 text-green-400">AI-Optimized</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                        <WealthOrchestratorScene />
                    </Canvas>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-500/20 p-4 rounded border border-green-500/30 text-center">
                        <PieChart className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">
                            ${(portfolioValue / 1000).toFixed(1)}K
                        </div>
                        <div className="text-xs text-slate-400">Total Portfolio</div>
                    </div>
                    <div className="bg-cyan-500/20 p-4 rounded border border-cyan-500/30 text-center">
                        <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">
                            +{predictedReturns.toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-400">Predicted Returns</div>
                    </div>
                    <div className="bg-purple-500/20 p-4 rounded border border-purple-500/30 text-center">
                        <DollarSign className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">
                            {ecosystem?.financial_summary?.active_strategies || 0}
                        </div>
                        <div className="text-xs text-slate-400">Active Strategies</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}