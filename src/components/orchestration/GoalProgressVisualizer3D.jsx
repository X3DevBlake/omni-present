import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Line, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock } from 'lucide-react';

function TaskNode({ position, task, index }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
        }
    });

    const statusColor = task.status === 'completed' ? '#00ff00' :
                       task.status === 'in_progress' ? '#00ffff' :
                       task.status === 'blocked' ? '#ff0000' : '#888888';

    const progress = task.progress_percentage || 0;

    return (
        <group position={position}>
            <Box
                ref={meshRef}
                args={[0.5, 0.5, 0.5]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.8}
                />
            </Box>
            
            {/* Progress ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
                <ringGeometry args={[0.3, 0.35, 32, 1, 0, (progress / 100) * Math.PI * 2]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
            </mesh>

            {hovered && (
                <Html distanceFactor={10}>
                    <div className="bg-black/90 text-white px-3 py-2 rounded text-xs w-48">
                        <div className="font-bold mb-1">{task.task_name}</div>
                        <div className="text-slate-400 text-xs">{task.description}</div>
                        <div className="mt-2 text-cyan-400">{progress.toFixed(0)}% Complete</div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function useState(arg0) {
    return [arg0, () => {}];
}

function GoalProgressScene({ plans }) {
    const allTasks = plans.flatMap(plan => plan.sub_tasks || []);
    
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {allTasks.map((task, index) => {
                const x = (index % 5) * 2 - 4;
                const z = Math.floor(index / 5) * 2 - 2;
                return (
                    <TaskNode
                        key={task.task_id}
                        position={[x, 0, z]}
                        task={task}
                        index={index}
                    />
                );
            })}

            <Text position={[0, 4, 0]} fontSize={0.5} color="white">
                Autonomous Goal Orchestration
            </Text>

            <OrbitControls />
        </>
    );
}

export default function GoalProgressVisualizer3D() {
    const { data: plans = [] } = useQuery({
        queryKey: ['autonomous-plans'],
        queryFn: () => base44.entities.AutonomousTaskPlan.list(),
        refetchInterval: 5000
    });

    const activePlans = plans.filter(p => p.plan_status === 'executing' || p.plan_status === 'ready');
    const allTasks = plans.flatMap(p => p.sub_tasks || []);
    const completedTasks = allTasks.filter(t => t.status === 'completed');

    return (
        <Card className="w-full bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 border-indigo-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Goal Orchestration Dashboard
                    <Badge variant="outline">{activePlans.length} Active</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
                        <GoalProgressScene plans={activePlans} />
                    </Canvas>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-indigo-500/20 p-3 rounded border border-indigo-500/30 text-center">
                        <Target className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{plans.length}</div>
                        <div className="text-xs text-slate-400">Total Goals</div>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{completedTasks.length}</div>
                        <div className="text-xs text-slate-400">Completed</div>
                    </div>
                    <div className="bg-cyan-500/20 p-3 rounded border border-cyan-500/30 text-center">
                        <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{allTasks.length}</div>
                        <div className="text-xs text-slate-400">Total Tasks</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}