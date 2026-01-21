import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, DollarSign, Award } from 'lucide-react';

function CategoryBar({ position, category, index }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    const height = 1 + (category.ethical_score / 100) * 3;
    const color = category.ethical_score > 80 ? '#00ff00' :
                 category.ethical_score > 50 ? '#ffaa00' : '#ff6600';

    return (
        <group position={position}>
            <Box ref={meshRef} args={[0.8, height, 0.8]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                />
            </Box>
            <Text position={[0, -height/2 - 0.5, 0]} fontSize={0.25} color="white">
                {category.category_name}
            </Text>
            <Text position={[0, height/2 + 0.5, 0]} fontSize={0.3} color="#00ffff">
                {category.ethical_score}
            </Text>
        </group>
    );
}

function EthicalSpendingScene({ categories }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {categories.map((cat, index) => {
                const x = (index - categories.length / 2) * 2;
                return (
                    <CategoryBar
                        key={cat.id}
                        position={[x, 0, 0]}
                        category={cat}
                        index={index}
                    />
                );
            })}

            <OrbitControls />
        </>
    );
}

export default function EthicalSpendingTracker3D() {
    const { data: categories = [] } = useQuery({
        queryKey: ['ethical-spending'],
        queryFn: () => base44.entities.EthicalSpendingCategory.list(),
        refetchInterval: 30000
    });

    const avgEthicalScore = categories.reduce((sum, c) => sum + (c.ethical_score || 0), 0) / (categories.length || 1);
    const highImpactCategories = categories.filter(c => c.ethical_score > 80);

    return (
        <Card className="w-full bg-gradient-to-br from-green-900/20 to-cyan-900/20 border-green-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Leaf className="w-5 h-5 text-green-400" />
                    Ethical Spending Tracker
                    <Badge variant="outline">{categories.length} Categories</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 3, 10], fov: 60 }}>
                        <EthicalSpendingScene categories={categories} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Leaf className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{avgEthicalScore.toFixed(0)}</div>
                        <div className="text-xs text-slate-400">Avg Score</div>
                    </div>
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{highImpactCategories.length}</div>
                        <div className="text-xs text-slate-400">High Impact</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <DollarSign className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{categories.length}</div>
                        <div className="text-xs text-slate-400">Categories</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}