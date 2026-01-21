import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Shield, Zap } from 'lucide-react';

function StorageNode({ position, index }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
            meshRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2);
        }
    });

    return (
        <Sphere ref={meshRef} args={[0.3, 16, 16]} position={position}>
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.6}
            />
        </Sphere>
    );
}

function DecentralizedStorageScene({ links }) {
    const nodeCount = Math.min(links.length, 12);
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 5;
        return [Math.cos(angle) * radius, Math.sin(i * 0.5) * 2, Math.sin(angle) * radius];
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* Central data source */}
            <Sphere args={[0.8, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.6}
                />
            </Sphere>

            {nodes.map((position, index) => (
                <React.Fragment key={index}>
                    <StorageNode position={position} index={index} />
                    <Line
                        points={[[0, 0, 0], position]}
                        color="#00ffff"
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                    />
                </React.Fragment>
            ))}

            <OrbitControls autoRotate autoRotateSpeed={0.5} />
        </>
    );
}

export default function DecentralizedStorageVisualizer3D() {
    const { data: links = [] } = useQuery({
        queryKey: ['decentralized-storage'],
        queryFn: () => base44.entities.DecentralizedStorageLink.list(),
        refetchInterval: 20000
    });

    const ipfsLinks = links.filter(l => l.storage_network === 'ipfs');
    const encryptedLinks = links.filter(l => l.encryption_status !== 'none');

    return (
        <Card className="w-full bg-gradient-to-br from-slate-900/20 to-cyan-900/20 border-slate-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <HardDrive className="w-5 h-5 text-cyan-400" />
                    Decentralized Storage Network
                    <Badge variant="outline">{links.length} Files</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                        <DecentralizedStorageScene links={links} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <HardDrive className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{ipfsLinks.length}</div>
                        <div className="text-xs text-slate-400">IPFS</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{encryptedLinks.length}</div>
                        <div className="text-xs text-slate-400">Encrypted</div>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded border border-purple-500/30 text-center">
                        <Zap className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">
                            {links.reduce((sum, l) => sum + (l.replication_count || 0), 0)}
                        </div>
                        <div className="text-xs text-slate-400">Replicas</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}