import React from 'react';
import EnhancedRedCommBlueprint3D from '../components/redcomm/EnhancedRedCommBlueprint3D';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RedCommBlueprints() {
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">RedComm Device Blueprints</h1>
                            <p className="text-gray-400 text-sm">Technical schematics for XG-series hardware</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
                        <Button><Download className="w-4 h-4 mr-2" /> Export CAD</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <EnhancedRedCommBlueprint3D />
                    </div>
                    <div className="space-y-6">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="font-bold text-lg">Component List</h3>
                                <div className="space-y-2">
                                    {[
                                        { name: "THz Antenna Array", id: "ANT-99X", status: "In Stock" },
                                        { name: "Neural Processing Unit", id: "NPU-V5", status: "Low Stock" },
                                        { name: "Quantum Battery Cell", id: "QBAT-200", status: "In Stock" },
                                        { name: "Encryption Module", id: "ENC-Q4", status: "In Stock" },
                                        { name: "Environmental Sensors", id: "SENS-MULTI", status: "In Stock" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 bg-black/40 rounded border border-white/5">
                                            <div>
                                                <div className="text-sm font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.id}</div>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded ${item.status === 'In Stock' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-2">Fabrication Notes</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Requires Class-100 Clean Room for assembly. Neural Processor must be calibrated 
                                    within 0.001K of absolute zero during initialization.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}