import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Sphere, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, Activity, Zap, AlertTriangle } from 'lucide-react';

const SystemNode = ({ position, type, health, label, onClick }) => {
    const mesh = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y += 0.01;
            const scale = hovered ? 1.5 : 1;
            mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        }
    });

    const color = health > 80 ? '#10b981' : health > 50 ? '#f59e0b' : '#ef4444';

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh 
                    ref={mesh} 
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <dodecahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} wireframe />
                </mesh>
                <mesh>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {hovered && (
                    <Html distanceFactor={10}>
                        <div className="bg-black/90 p-2 rounded border border-white/20 backdrop-blur-md min-w-[120px]">
                            <div className="text-xs font-bold text-white">{label}</div>
                            <div className="text-[10px] text-gray-300">Health: {health}%</div>
                            <div className="text-[10px] text-gray-400">{type}</div>
                        </div>
                    </Html>
                )}
            </Float>
        </group>
    );
};

const ThreatMarker = ({ position, severity }) => {
    const ref = useRef();
    useFrame(({ clock }) => {
        ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.3);
    });
    const color = severity === 'critical' ? '#ef4444' : '#f97316';
    
    return (
        <mesh ref={ref} position={position}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshBasicMaterial color={color} wireframe />
        </mesh>
    );
};

const DataStream = ({ start, end, color }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    return (
        <Line points={points} color={color} transparent opacity={0.2} lineWidth={1} dashed dashScale={2} dashSize={1} gapSize={1} />
    );
};

export default function EcosystemGalaxy3D() {
    // Fetch real data
    const { data: metrics = [] } = useQuery({
        queryKey: ['ecosystem-metrics'],
        queryFn: () => base44.entities.EcosystemHealthMetrics.list({ limit: 20 }),
        initialData: []
    });

    const { data: threats = [] } = useQuery({
        queryKey: ['security-threats'],
        queryFn: () => base44.entities.SecurityThreatIntelligence.filter({ status: 'detected' }),
        initialData: []
    });

    // Mock data if empty
    const displayNodes = useMemo(() => {
        if (metrics.length > 0) return metrics.map((m, i) => ({
            ...m,
            position: [Math.cos(i) * 5, Math.sin(i * 0.5) * 2, Math.sin(i) * 5]
        }));
        
        return Array.from({ length: 12 }).map((_, i) => ({
            node_id: `node-${i}`,
            health_score: 80 + Math.random() * 20,
            active_agents: Math.floor(Math.random() * 50),
            position: [Math.cos(i/2) * 6, (Math.random()-0.5)*4, Math.sin(i/2) * 6]
        }));
    }, [metrics]);

    const displayThreats = useMemo(() => {
        if (threats.length > 0) return threats.map((t, i) => ({
            ...t,
            position: [Math.random()*4, Math.random()*4, Math.random()*4]
        }));
        return []; // No mock threats by default to keep it clean unless requested
    }, [threats]);

    return (
        <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-purple-500/20 relative">
            <div className="absolute top-4 left-4 z-10 space-y-2 pointer-events-none">
                <div className="flex items-center gap-2 text-white">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="font-bold">Ecosystem Health</span>
                </div>
                <div className="text-xs text-gray-400">
                    Active Nodes: {displayNodes.length} | Threats: {displayThreats.length}
                </div>
            </div>

            <Canvas camera={{ position: [0, 5, 12], fov: 50 }}>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                
                {/* Central Hub */}
                <Float speed={1}>
                    <mesh>
                        <sphereGeometry args={[1, 32, 32]} />
                        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1} wireframe />
                    </mesh>
                </Float>

                {displayNodes.map((node, i) => (
                    <group key={i}>
                        <SystemNode 
                            position={node.position} 
                            health={node.health_score} 
                            label={node.node_id}
                            type={node.threat_level || 'Stable'}
                            onClick={() => console.log('Clicked node', node.node_id)}
                        />
                        <DataStream start={[0,0,0]} end={node.position} color="#4ade80" />
                    </group>
                ))}

                {displayThreats.map((threat, i) => (
                    <ThreatMarker key={i} position={threat.position} severity={threat.severity} />
                ))}

                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} maxDistance={30} minDistance={5} />
            </Canvas>
        </div>
    );
}