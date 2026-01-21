import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Activity, CheckCircle } from 'lucide-react';

function NanobotSwarm({ active, position }) {
    const swarmsRef = useRef();
    const nanobots = useRef([]);

    React.useEffect(() => {
        nanobots.current = Array.from({ length: 20 }, () => ({
            position: new THREE.Vector3(
                position[0] + (Math.random() - 0.5) * 2,
                position[1] + (Math.random() - 0.5) * 2,
                position[2] + (Math.random() - 0.5) * 2
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            )
        }));
    }, []);

    useFrame(() => {
        if (active && swarmsRef.current) {
            nanobots.current.forEach((bot, i) => {
                bot.position.add(bot.velocity);
                
                // Keep within bounds
                if (Math.abs(bot.position.x - position[0]) > 1) bot.velocity.x *= -1;
                if (Math.abs(bot.position.y - position[1]) > 1) bot.velocity.y *= -1;
                if (Math.abs(bot.position.z - position[2]) > 1) bot.velocity.z *= -1;

                if (swarmsRef.current.geometry.attributes.position) {
                    swarmsRef.current.geometry.attributes.position.setXYZ(
                        i,
                        bot.position.x,
                        bot.position.y,
                        bot.position.z
                    );
                }
            });
            if (swarmsRef.current.geometry.attributes.position) {
                swarmsRef.current.geometry.attributes.position.needsUpdate = true;
            }
        }
    });

    const positions = new Float32Array(20 * 3);
    nanobots.current.forEach((bot, i) => {
        positions[i * 3] = bot.position.x;
        positions[i * 3 + 1] = bot.position.y;
        positions[i * 3 + 2] = bot.position.z;
    });

    return (
        <points ref={swarmsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={20}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#00ff00"
                emissive="#00ff00"
                emissiveIntensity={0.5}
            />
        </points>
    );
}

function DeviceComponent({ position, health, label, isRepairing }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            if (isRepairing) {
                meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
            }
        }
    });

    const healthColor = health > 80 ? '#00ff00' : health > 50 ? '#ffaa00' : '#ff0000';

    return (
        <group position={position}>
            <Box ref={meshRef} args={[0.8, 0.8, 0.8]}>
                <meshStandardMaterial
                    color={healthColor}
                    emissive={healthColor}
                    emissiveIntensity={isRepairing ? 0.6 : 0.2}
                />
            </Box>
            <Text position={[0, -1, 0]} fontSize={0.3} color="white">
                {label}
            </Text>
            {isRepairing && <NanobotSwarm active={true} position={position} />}
        </group>
    );
}

function SelfHealingScene({ devices }) {
    const components = [
        { label: 'Processor', position: [0, 2, 0] },
        { label: 'Memory', position: [2, 0, 0] },
        { label: 'Storage', position: [0, -2, 0] },
        { label: 'Network', position: [-2, 0, 0] }
    ];

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {components.map((comp, index) => (
                <DeviceComponent
                    key={index}
                    position={comp.position}
                    health={70 + Math.random() * 30}
                    label={comp.label}
                    isRepairing={Math.random() > 0.7}
                />
            ))}

            <OrbitControls />
        </>
    );
}

export default function SelfHealingDeviceVisualizer3D() {
    const queryClient = useQueryClient();

    const { data: devices = [] } = useQuery({
        queryKey: ['smart-devices'],
        queryFn: () => base44.entities.SmartDeviceIntegration.list(),
        refetchInterval: 5000
    });

    const { data: metrics = [] } = useQuery({
        queryKey: ['device-metrics'],
        queryFn: () => base44.entities.DeviceOptimizationMetrics.list(),
        refetchInterval: 5000
    });

    const predictMutation = useMutation({
        mutationFn: (device_id) => base44.functions.invoke('predictDeviceFailure', { device_id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['device-metrics']);
        }
    });

    const totalRepairs = metrics.reduce((sum, m) => sum + (m.self_repair_logs?.length || 0), 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-green-400" />
                    Self-Healing Device Network
                    <Badge variant="outline">{totalRepairs} Repairs Completed</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                        <SelfHealingScene devices={devices} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {devices.slice(0, 4).map((device) => (
                        <div key={device.id} className="bg-slate-800 p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-white">{device.device_name}</span>
                                <CheckCircle className="w-3 h-3 text-green-400" />
                            </div>
                            <Button
                                size="sm"
                                onClick={() => predictMutation.mutate(device.integration_id)}
                                disabled={predictMutation.isPending}
                                className="w-full text-xs"
                                variant="outline"
                            >
                                <Activity className="w-3 h-3 mr-1" />
                                Predict
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}