import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Server, Laptop, Smartphone, Monitor, Trash2, RefreshCw } from 'lucide-react';
import OmniTerminal from '../components/os/OmniTerminal';
import SystemVisualizer3D from '../components/os/SystemVisualizer3D';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function OmniOS() {
    const queryClient = useQueryClient();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', os: 'linux', ip: '127.0.0.1' });

    const { data: devices = [], isLoading } = useQuery({
        queryKey: ['connected-devices'],
        queryFn: () => base44.entities.ConnectedDevice.list(),
        initialData: [] // Mock data if empty
    });

    const createDevice = useMutation({
        mutationFn: (data) => base44.entities.ConnectedDevice.create({
            ...data,
            status: 'online',
            last_active: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connected-devices'] });
            setIsAddOpen(false);
            setNewDevice({ name: '', os: 'linux', ip: '127.0.0.1' });
            toast.success('System Connected Successfully');
        }
    });

    const deleteDevice = useMutation({
        mutationFn: (id) => base44.entities.ConnectedDevice.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connected-devices'] });
            setSelectedDevice(null);
            toast.success('System Disconnected');
        }
    });

    const getIcon = (os) => {
        switch(os) {
            case 'android': return <Smartphone className="w-4 h-4" />;
            case 'macos': return <Laptop className="w-4 h-4" />;
            case 'linux': return <Server className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1),transparent_70%)]" />
            
            <div className="max-w-[1600px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
                
                {/* Left Panel: Device List & Visualizer */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Visualizer Card */}
                    <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl h-[400px] overflow-hidden relative">
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/50 animate-pulse">
                                OMNI_NET ACTIVE
                            </Badge>
                        </div>
                        <SystemVisualizer3D 
                            devices={devices} 
                            onSelectDevice={setSelectedDevice}
                            selectedDeviceId={selectedDevice?.id}
                        />
                    </Card>

                    {/* Devices List */}
                    <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-xl flex-1 overflow-hidden flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
                            <CardTitle className="text-cyan-400 text-lg font-mono">CONNECTED_NODES</CardTitle>
                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50">
                                        <Plus className="w-4 h-4 mr-2" /> LINK_NODE
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black/90 border-cyan-500 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Establish New Neural Link</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <Input 
                                            placeholder="System Name" 
                                            value={newDevice.name}
                                            onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                                            className="bg-black border-cyan-500/50"
                                        />
                                        <Select 
                                            value={newDevice.os} 
                                            onValueChange={(v) => setNewDevice({...newDevice, os: v})}
                                        >
                                            <SelectTrigger className="bg-black border-cyan-500/50">
                                                <SelectValue placeholder="OS Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-black border-cyan-500">
                                                <SelectItem value="linux">Linux Kernel</SelectItem>
                                                <SelectItem value="android">Android Core</SelectItem>
                                                <SelectItem value="macos">macOS Unix</SelectItem>
                                                <SelectItem value="windows">Windows NT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input 
                                            placeholder="IP Address / Host" 
                                            value={newDevice.ip}
                                            onChange={(e) => setNewDevice({...newDevice, ip: e.target.value})}
                                            className="bg-black border-cyan-500/50"
                                        />
                                        <Button 
                                            onClick={() => createDevice.mutate(newDevice)}
                                            className="w-full bg-cyan-600 hover:bg-cyan-700"
                                        >
                                            Initialize Link
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-4 space-y-2">
                            {isLoading ? (
                                <div className="text-center text-cyan-500/50 animate-pulse mt-10">Scanning Network...</div>
                            ) : devices.length === 0 ? (
                                <div className="text-center text-gray-500 mt-10 font-mono">No Active Links Found</div>
                            ) : (
                                devices.map(device => (
                                    <motion.div
                                        key={device.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setSelectedDevice(device)}
                                        className={`
                                            p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group
                                            ${selectedDevice?.id === device.id 
                                                ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(0,245,255,0.2)]' 
                                                : 'bg-white/5 border-white/5 hover:border-cyan-500/30 hover:bg-white/10'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-md ${device.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {getIcon(device.os)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{device.name}</div>
                                                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {device.ip_address || '127.0.0.1'}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteDevice.mutate(device.id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </motion.div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Terminal */}
                <div className="lg:col-span-8 h-full">
                    <OmniTerminal selectedDevice={selectedDevice} />
                </div>
            </div>
        </div>
    );
}