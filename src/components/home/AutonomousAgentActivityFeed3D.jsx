import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text, Html } from '@react-three/drei';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function ActivityParticle({ position, activity }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.01;
        }
    });

    const statusColor = {
        completed: '#00ff00',
        in_progress: '#ffaa00',
        pending: '#0088ff'
    };

    return (
        <group position={position}>
            <Sphere ref={meshRef} args={[0.2, 16, 16]}>
                <meshStandardMaterial
                    color={statusColor[activity.status] || '#ffffff'}
                    emissive={statusColor[activity.status] || '#ffffff'}
                    emissiveIntensity={0.6}
                />
            </Sphere>
        </group>
    );
}

function ActivityScene({ activities }) {
    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1} />

            {activities.map((activity, index) => (
                <ActivityParticle
                    key={index}
                    position={[
                        (index % 5) * 2 - 4,
                        Math.floor(index / 5) * 2,
                        0
                    ]}
                    activity={activity}
                />
            ))}
        </>
    );
}

export default function AutonomousAgentActivityFeed3D() {
    const { data: teams = [] } = useQuery({
        queryKey: ['agent-teams-activity'],
        queryFn: () => base44.entities.EmbodiedAgentTeam.list(),
        refetchInterval: 3000
    });

    const activities = teams.flatMap(team => 
        (team.task_allocation || []).map(task => ({
            agent: task.assigned_to,
            task: task.subtask,
            status: task.status,
            progress: task.progress
        }))
    ).slice(0, 15);

    const completedTasks = activities.filter(a => a.status === 'completed').length;
    const inProgressTasks = activities.filter(a => a.status === 'in_progress').length;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Autonomous Agent Activity Feed
                    <Badge variant="outline">{activities.length} Live Tasks</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] bg-black rounded-lg overflow-hidden mb-4">
                    <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                        <ActivityScene activities={activities} />
                    </Canvas>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-500/20 p-3 rounded border border-green-500/30 text-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{completedTasks}</div>
                        <div className="text-xs text-slate-400">Completed</div>
                    </div>
                    <div className="bg-yellow-500/20 p-3 rounded border border-yellow-500/30 text-center">
                        <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{inProgressTasks}</div>
                        <div className="text-xs text-slate-400">In Progress</div>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded border border-blue-500/30 text-center">
                        <Activity className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="text-xl font-bold text-white">{activities.length - completedTasks - inProgressTasks}</div>
                        <div className="text-xs text-slate-400">Pending</div>
                    </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activities.slice(0, 5).map((activity, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-slate-800/50 p-3 rounded"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-white font-semibold">{activity.task}</span>
                                <Badge className={
                                    activity.status === 'completed' ? 'bg-green-500' :
                                    activity.status === 'in_progress' ? 'bg-yellow-500' :
                                    'bg-blue-500'
                                }>
                                    {activity.status}
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-400">Agent: {activity.agent}</div>
                            {activity.progress !== undefined && (
                                <div className="mt-2 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-cyan-500 h-full transition-all"
                                        style={{ width: `${activity.progress}%` }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}