import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, PieChart, BarChart as BarIcon, Table as TableIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Pie, PieChart as RePieChart, Cell } from 'recharts';

export default function DataAnalysis() {
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState('table'); // table, chart, graph

    // Mock Data
    const results = [
        { id: 'LOG-001', source: 'Hub-Alpha', event: 'Anomaly Detected', severity: 'High', timestamp: '2026-01-26 10:42:00' },
        { id: 'LOG-002', source: 'Agent-X', event: 'Task Completed', severity: 'Low', timestamp: '2026-01-26 10:45:15' },
        { id: 'LOG-003', source: 'Network-Gateway', event: 'Traffic Spike', severity: 'Medium', timestamp: '2026-01-26 10:48:30' },
        { id: 'LOG-004', source: 'Hub-Beta', event: 'Update Applied', severity: 'Low', timestamp: '2026-01-26 10:50:00' },
        { id: 'LOG-005', source: 'Security-Node', event: 'Login Attempt', severity: 'High', timestamp: '2026-01-26 10:55:22' },
    ];

    const chartData = [
        { name: 'High Severity', value: 35, color: '#ef4444' },
        { name: 'Medium Severity', value: 45, color: '#f59e0b' },
        { name: 'Low Severity', value: 20, color: '#10b981' },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-6">
                
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            Data Query & Analysis
                        </h1>
                        <p className="text-gray-400">Deep dive into system logs, agent activities, and hub metrics</p>
                    </div>
                    <Button variant="outline" className="border-white/20"><Download className="w-4 h-4 mr-2" /> Export Results</Button>
                </div>

                {/* Query Builder */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Query Builder</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input 
                                    placeholder="SELECT * FROM logs WHERE severity = 'high'..." 
                                    className="bg-black/50 border-white/10 font-mono text-sm"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <Button className="bg-purple-600 hover:bg-purple-700">Run Query</Button>
                        </div>
                        <div className="flex gap-4">
                            <Select defaultValue="logs">
                                <SelectTrigger className="w-[180px] bg-black/50 border-white/10">
                                    <SelectValue placeholder="Data Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="logs">System Logs</SelectItem>
                                    <SelectItem value="agents">Agent Activity</SelectItem>
                                    <SelectItem value="network">Network Traffic</SelectItem>
                                    <SelectItem value="hubs">Hub Metadata</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="24h">
                                <SelectTrigger className="w-[180px] bg-black/50 border-white/10">
                                    <SelectValue placeholder="Time Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1h">Last Hour</SelectItem>
                                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                                    <SelectItem value="7d">Last 7 Days</SelectItem>
                                    <SelectItem value="30d">Last 30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Visualization Controls */}
                <div className="flex justify-end gap-2">
                    <Button 
                        variant={viewMode === 'table' ? 'default' : 'ghost'} 
                        size="sm" onClick={() => setViewMode('table')}
                    >
                        <TableIcon className="w-4 h-4 mr-2" /> Table
                    </Button>
                    <Button 
                        variant={viewMode === 'chart' ? 'default' : 'ghost'} 
                        size="sm" onClick={() => setViewMode('chart')}
                    >
                        <BarIcon className="w-4 h-4 mr-2" /> Charts
                    </Button>
                    <Button 
                        variant={viewMode === 'pie' ? 'default' : 'ghost'} 
                        size="sm" onClick={() => setViewMode('pie')}
                    >
                        <PieChart className="w-4 h-4 mr-2" /> Distribution
                    </Button>
                </div>

                {/* Results Area */}
                <Card className="bg-white/5 border-white/10 min-h-[400px]">
                    <CardContent className="p-6">
                        {viewMode === 'table' && (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="text-gray-400">ID</TableHead>
                                        <TableHead className="text-gray-400">Source</TableHead>
                                        <TableHead className="text-gray-400">Event</TableHead>
                                        <TableHead className="text-gray-400">Severity</TableHead>
                                        <TableHead className="text-gray-400">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.map((row) => (
                                        <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-mono text-xs">{row.id}</TableCell>
                                            <TableCell>{row.source}</TableCell>
                                            <TableCell>{row.event}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    row.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                                                    row.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {row.severity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-400 text-sm">{row.timestamp}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        {viewMode === 'chart' && (
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                        <Bar dataKey="value" fill="#8884d8">
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {viewMode === 'pie' && (
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}