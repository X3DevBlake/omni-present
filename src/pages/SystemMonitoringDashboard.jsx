import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import InteractiveHubNetwork3D from '../components/home/InteractiveHubNetwork3D';
import { Activity, Server, AlertTriangle, Shield, Cpu, Database, RefreshCw, Plus, Layout } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

// Mock Data Generators
const generateHistoryData = (points = 20) => {
    return Array.from({ length: points }, (_, i) => ({
        time: `${i}:00`,
        traffic: Math.floor(Math.random() * 5000) + 1000,
        latency: Math.floor(Math.random() * 50) + 10,
        agents: Math.floor(Math.random() * 100) + 20,
    }));
};

const MonitoringWidget = ({ title, value, subtext, icon: Icon, color }) => (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400`}>
                    LIVE
                </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-gray-400">{subtext}</div>
        </CardContent>
    </Card>
);

const AlertItem = ({ type, message, time }) => {
    const colors = {
        critical: 'text-red-400 border-red-500/30 bg-red-500/10',
        warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
        info: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    };
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[type]} mb-2`}>
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
                <div className="text-sm font-bold">{message}</div>
                <div className="text-xs opacity-70">{time}</div>
            </div>
        </div>
    );
};

export default function SystemMonitoringDashboard() {
    const [data, setData] = useState(generateHistoryData());
    const [alerts, setAlerts] = useState([
        { id: 1, type: 'critical', message: 'Unauthorized access attempt detected in Sector 7', time: '2 mins ago' },
        { id: 2, type: 'warning', message: 'Hub latency spike in "Quantum Consciousness"', time: '15 mins ago' },
        { id: 3, type: 'info', message: 'New agent swarm deployed successfully', time: '1 hour ago' },
    ]);

    // Simulate Live Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const next = [...prev.slice(1), {
                    time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
                    traffic: Math.floor(Math.random() * 5000) + 1000,
                    latency: Math.floor(Math.random() * 50) + 10,
                    agents: Math.floor(Math.random() * 100) + 20,
                }];
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20">
            <div className="max-w-[1600px] mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                            System Monitoring Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time ecosystem metrics and threat intelligence</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-white/20"><Layout className="w-4 h-4 mr-2" /> Customize</Button>
                        <Button className="bg-cyan-600 hover:bg-cyan-700"><RefreshCw className="w-4 h-4 mr-2" /> Refresh Data</Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left Column: Live 3D View */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* 3D Visualizer Container */}
                        <Card className="bg-black/50 border-white/10 overflow-hidden h-[500px] relative">
                            <InteractiveHubNetwork3D />
                            <div className="absolute top-4 left-4 bg-black/80 p-2 rounded text-xs text-green-400 border border-green-500/30 animate-pulse">
                                ● Live Data Stream Active
                            </div>
                        </Card>

                        {/* Metrics Widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <MonitoringWidget title="Active Agents" value="1,248" subtext="+12% from last hour" icon={Users} color="green" />
                            <MonitoringWidget title="Network Load" value="84 TB/s" subtext="Peak capacity at 65%" icon={Activity} color="purple" />
                            <MonitoringWidget title="Threat Level" value="LOW" subtext="0 Critical Incidents" icon={Shield} color="blue" />
                            <MonitoringWidget title="CPU Usage" value="42%" subtext="15,000 Cores Active" icon={Cpu} color="amber" />
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="bg-black/40 border-white/10 p-4">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> Network Traffic</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="time" stroke="#666" fontSize={10} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                                            <Area type="monotone" dataKey="traffic" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTraffic)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="bg-black/40 border-white/10 p-4">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-purple-400" /> Agent Activity</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="time" stroke="#666" fontSize={10} />
                                            <YAxis stroke="#666" fontSize={10} />
                                            <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                                            <Bar dataKey="agents" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Alerts & Control */}
                    <div className="space-y-6">
                        <Card className="bg-black/40 border-white/10 h-full max-h-[850px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                    System Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
                                {alerts.map(alert => (
                                    <AlertItem key={alert.id} {...alert} />
                                ))}
                                <Button variant="ghost" className="w-full mt-2 text-xs text-gray-500">View All History</Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-300 justify-start">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Lockdown Sector
                                </Button>
                                <Button className="w-full bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 justify-start">
                                    <Database className="w-4 h-4 mr-2" />
                                    Flush Cache
                                </Button>
                                <Button className="w-full bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-300 justify-start">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Deploy Agent Swarm
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}