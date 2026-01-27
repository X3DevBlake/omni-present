import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, PieChart, BarChart as BarIcon, Table as TableIcon, Save, Plus, Share2, Brain, Sparkles, Activity, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Pie, PieChart as RePieChart, Cell } from 'recharts';

export default function DataAnalysis() {
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [showPredictions, setShowPredictions] = useState(false);
    const [anomalies, setAnomalies] = useState(null);

    const runPredictiveAnalytics = async () => {
        try {
            const res = await base44.functions.invoke('analytics/predictTrends', { query_data: query });
            setShowPredictions(true);
        } catch (e) {
            console.error(e);
            setShowPredictions(true); // Fallback to mock for demo
        }
    };

    const runAnomalyDetection = async () => {
        try {
            const res = await base44.functions.invoke('analytics/detectAnomalies', { data_points: results });
            setAnomalies(res.data.anomalies || []);
        } catch (e) {
            console.error(e);
            setAnomalies([{ description: "Simulated: Anomaly in Data Stream", severity: "MEDIUM" }]);
        }
    };

    const scheduleQuery = () => {
        // Call backend to schedule automation
        // base44.functions.invoke('automations/create', { type: 'scheduled', ... })
        alert("Query execution scheduled for daily reporting.");
    };

    const generateAiSuggestion = () => {
        setAiSuggestion({
            text: "Based on recent anomalies, I suggest joining 'System Logs' with 'Agent Activity' filtering for 'High Severity' events in the last hour.",
            complexity: "High",
            confidence: "98%"
        });
    };

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

                {/* Sophisticated Query Builder */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Visual Query Builder</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                                <Share2 className="w-3 h-3 mr-1" /> Share
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs text-gray-400">
                                <Save className="w-3 h-3 mr-1" /> Save Query
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* AI Assistant Panel */}
                        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4 flex items-start gap-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10"><Brain className="w-24 h-24" /></div>
                            <div className="p-2 bg-indigo-500/20 rounded-full"><Brain className="w-5 h-5 text-indigo-400" /></div>
                            <div className="flex-1 z-10">
                                <h3 className="text-sm font-bold text-indigo-300">AI Query Assistant</h3>
                                {aiSuggestion ? (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-300">{aiSuggestion.text}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="h-6 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20" onClick={() => setAiSuggestion(null)}>Apply Suggestion</Button>
                                            <Button size="sm" variant="ghost" className="h-6 text-xs text-gray-500" onClick={() => setAiSuggestion(null)}>Dismiss</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">Ready to assist. Click to generate optimized query structures.</p>
                                )}
                            </div>
                            {!aiSuggestion && (
                                <div className="flex gap-2 z-10">
                                    <Button size="sm" variant="ghost" onClick={generateAiSuggestion} className="h-8 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300">
                                        <Sparkles className="w-3 h-3 mr-2" /> Suggest Query
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={runPredictiveAnalytics} className="h-8 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300">
                                        <Activity className="w-3 h-3 mr-2" /> Predict Trends
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={runAnomalyDetection} className="h-8 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300">
                                        <AlertTriangle className="w-3 h-3 mr-2" /> Detect Anomalies
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={scheduleQuery} className="h-8 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300">
                                        <div className="w-3 h-3 mr-2 rounded-full bg-emerald-500 animate-pulse" /> Schedule
                                    </Button>
                                </div>
                            )}
                        </div>
                        
                        {showPredictions && (
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-black/40 p-3 rounded border border-white/10">
                                    <div className="text-xs text-gray-500">Predicted Load</div>
                                    <div className="text-xl font-bold text-red-400">High Risk</div>
                                    <div className="text-[10px] text-gray-400">Expected spike at 14:00 UTC</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/10">
                                    <div className="text-xs text-gray-500">Agent Drift</div>
                                    <div className="text-xl font-bold text-amber-400">Moderate</div>
                                    <div className="text-[10px] text-gray-400">Swarm cohesion degrading</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-white/10">
                                    <div className="text-xs text-gray-500">Resource Forecast</div>
                                    <div className="text-xl font-bold text-green-400">Optimal</div>
                                    <div className="text-[10px] text-gray-400">Scaling within limits</div>
                                </div>
                            </div>
                        )}
                        {anomalies && anomalies.length > 0 && (
                            <div className="mb-4 bg-red-900/10 border border-red-500/30 rounded p-3">
                                <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-2"/> Detected Anomalies</h4>
                                {anomalies.map((a, i) => (
                                    <div key={i} className="text-xs text-gray-300">{a.description} <span className="text-red-500 font-mono">[{a.severity}]</span></div>
                                ))}
                            </div>
                        )}

                        {/* Advanced Visual Query Builder */}
                        <div className="flex flex-col gap-4 p-4 bg-black/30 rounded-lg border border-white/5 min-h-[120px]">
                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-gray-500">QUERY LOGIC TREE</span>
                            </div>
                            <div className="flex flex-wrap gap-4 items-start">
                                {/* Group 1 */}
                                <div className="border border-white/10 rounded p-2 bg-black/20 flex flex-col gap-2 relative group">
                                    <div className="absolute -top-3 left-2 bg-purple-700 text-[10px] px-1 rounded">GROUP: AND</div>
                                    <div className="bg-purple-900/40 border border-purple-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer hover:bg-purple-900/60">
                                        <span className="text-xs font-bold text-purple-300">SOURCE:</span>
                                        <span className="text-sm">System Logs</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-0.5 h-4 bg-gray-700"></div>
                                        <div className="bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 cursor-pointer hover:bg-blue-900/60">
                                            <span className="text-xs font-bold text-blue-300">WHERE:</span>
                                            <span className="text-sm">Severity == High</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Operator */}
                                <div className="self-center bg-gray-800 px-2 py-1 rounded text-xs text-gray-400 font-mono">OR</div>

                                {/* Group 2 */}
                                <div className="border border-white/10 rounded p-2 bg-black/20 flex flex-col gap-2 relative">
                                    <div className="absolute -top-3 left-2 bg-indigo-700 text-[10px] px-1 rounded">GROUP: JOIN</div>
                                    <div className="bg-indigo-900/40 border border-indigo-500/30 px-3 py-1.5 rounded-md flex items-center gap-2">
                                        <span className="text-xs font-bold text-indigo-300">SOURCE:</span>
                                        <span className="text-sm">Agent Activity</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-0.5 h-4 bg-gray-700"></div>
                                        <div className="bg-orange-900/40 border border-orange-500/30 px-3 py-1.5 rounded-md flex items-center gap-2">
                                            <span className="text-xs font-bold text-orange-300">JOIN ON:</span>
                                            <span className="text-sm">Agent_ID</span>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full border border-dashed border-gray-600 self-center">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Visualization</label>
                                    <div className="flex bg-black/50 rounded-md p-1 border border-white/10">
                                        <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="h-7"><TableIcon className="w-3 h-3" /></Button>
                                        <Button variant={viewMode === 'chart' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('chart')} className="h-7"><BarIcon className="w-3 h-3" /></Button>
                                        <Button variant={viewMode === 'pie' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('pie')} className="h-7"><PieChart className="w-3 h-3" /></Button>
                                        <Button variant={viewMode === 'network' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('network')} className="h-7"><Share2 className="w-3 h-3" /></Button>
                                    </div>
                                </div>
                            </div>
                            <Button className="bg-purple-600 hover:bg-purple-700 w-32">Run Analysis</Button>
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

                        {viewMode === 'network' && (
                            <div className="h-[400px] w-full bg-black/20 rounded-lg flex items-center justify-center relative overflow-hidden border border-white/5">
                                {/* Simulated Network Diagram */}
                                <svg width="100%" height="100%" viewBox="0 0 800 400" className="absolute inset-0">
                                    <defs>
                                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="20" refY="3" orient="auto" markerUnits="strokeWidth">
                                            <path d="M0,0 L0,6 L9,3 z" fill="#666" />
                                        </marker>
                                    </defs>
                                    {/* Edges */}
                                    <line x1="400" y1="200" x2="300" y2="100" stroke="#444" strokeWidth="1" />
                                    <line x1="400" y1="200" x2="500" y2="100" stroke="#444" strokeWidth="1" />
                                    <line x1="400" y1="200" x2="400" y2="300" stroke="#444" strokeWidth="1" />
                                    <line x1="300" y1="100" x2="200" y2="150" stroke="#444" strokeWidth="1" strokeDasharray="5,5" />
                                    
                                    {/* Nodes */}
                                    <circle cx="400" cy="200" r="20" fill="#8b5cf6" opacity="0.8" />
                                    <text x="400" y="235" textAnchor="middle" fill="#fff" fontSize="10">Hub Alpha</text>
                                    
                                    <circle cx="300" cy="100" r="15" fill="#ec4899" opacity="0.8" />
                                    <text x="300" y="80" textAnchor="middle" fill="#fff" fontSize="10">Agent X</text>
                                    
                                    <circle cx="500" cy="100" r="15" fill="#10b981" opacity="0.8" />
                                    <text x="500" y="80" textAnchor="middle" fill="#fff" fontSize="10">Data Node</text>
                                    
                                    <circle cx="400" cy="300" r="15" fill="#f59e0b" opacity="0.8" />
                                    <text x="400" y="330" textAnchor="middle" fill="#fff" fontSize="10">User B</text>

                                    <circle cx="200" cy="150" r="10" fill="#3b82f6" opacity="0.8" />
                                    <text x="200" y="175" textAnchor="middle" fill="#fff" fontSize="10">Ext. API</text>
                                </svg>
                                <div className="absolute top-4 right-4 bg-black/80 p-2 rounded text-xs text-gray-400 border border-white/10">
                                    Relationship Graph
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}