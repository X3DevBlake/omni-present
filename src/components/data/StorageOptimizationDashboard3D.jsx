import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, TrendingDown, Zap } from 'lucide-react';

function StorageTierVisualization({ tier, count, position }) {
    const meshRef = useRef();

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    const tierColors = {
        hot: '#ff0000',
        warm: '#ff9900',
        cold: '#0099ff',
        archive: '#666666'
    };

    const height = 1 + count * 0.1;

    return (
        <group position={position}>
            <Box ref={meshRef} args={[1, height, 1]}>
                <meshStandardMaterial
                    color={tierColors[tier] || '#ffffff'}
                    emissive={tierColors[tier] || '#ffffff'}
                    emissiveIntensity={0.4}
                />
            </Box>
            <Text position={[0, -height/2 - 0.5, 0]} fontSize={0.3} color="white">
                {tier.toUpperCase()}
            </Text>
            <Text position={[0, height/2 + 0.5, 0]} fontSize={0.25} color="#00ffff">
                {count} items
            </Text>
        </group>
    );
}

function StorageScene({ logs }) {
    const tierCounts = {
        hot: logs.filter(l => l.storage_tier === 'hot').length,
        warm: logs.filter(l => l.storage_tier === 'warm').length,
        cold: logs.filter(l => l.storage_tier === 'cold').length,
        archive: logs.filter(l => l.storage_tier === 'archive').length
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            <StorageTierVisualization tier="hot" count={tierCounts.hot} position={[-4, 0, 0]} />
            <StorageTierVisualization tier="warm" count={tierCounts.warm} position={[-1.5, 0, 0]} />
            <StorageTierVisualization tier="cold" count={tierCounts.cold} position={[1.5, 0, 0]} />
            <StorageTierVisualization tier="archive" count={tierCounts.archive} position={[4, 0, 0]} />

            <OrbitControls />
        </>
    );
}

export default function StorageOptimizationDashboard3D() {
    const queryClient = useQueryClient();

    const { data: logs = [] } = useQuery({
        queryKey: ['storage-logs'],
        queryFn: () => base44.entities.StorageAccessLog.list(),
        refetchInterval: 30000
    });

    const optimizeStorage = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('data/predictiveStorageOptimizer', {});
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storage-logs'] });
        }
    });

    const totalSize = logs.reduce((sum, log) => sum + (log.data_size_bytes || 0), 0);

    return (
        <Card className="w-full bg-gradient-to-br from-slate-900/20 to-blue-900/20 border-slate-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Database className="w-5 h-5 text-blue-400" />
                    Predictive Storage Optimization
                    <Badge variant="outline">{logs.length} Items</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 3, 12], fov: 60 }}>
                        <StorageScene logs={logs} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30 text-center">
                        <Database className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{(totalSize / 1024 / 1024).toFixed(1)} MB</div>
                        <div className="text-xs text-slate-400">Total Size</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {optimizeStorage.data?.projectedCostSavings?.toFixed(0) || 0}$
                        </div>
                        <div className="text-xs text-slate-400">Savings Potential</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {optimizeStorage.data?.optimizationsFound || 0}
                        </div>
                        <div className="text-xs text-slate-400">Optimizations</div>
                    </div>
                </div>
                <Button
                    onClick={() => optimizeStorage.mutate()}
                    disabled={optimizeStorage.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {optimizeStorage.isPending ? 'Optimizing...' : 'Run Storage Optimization'}
                </Button>
            </CardContent>
        </Card>
    );
}