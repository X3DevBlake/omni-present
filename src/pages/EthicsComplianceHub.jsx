import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import EthicsAuditVisualizer3D from '../components/ethics/EthicsAuditVisualizer3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EthicsComplianceHub() {
    const { data } = useQuery({
        queryKey: ['ethics-audit'],
        queryFn: async () => {
            const res = await base44.functions.invoke('ethics/auditCompliance', {});
            return res.data;
        },
        refetchInterval: 15000
    });

    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-10 h-10 text-cyan-400" />
                    <div>
                        <h1 className="text-4xl font-bold text-white">AI Ethics & Compliance</h1>
                        <p className="text-white/60">Automated auditing for fairness, transparency, and accountability</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 bg-black/50 border-white/10 p-0 overflow-hidden">
                        <EthicsAuditVisualizer3D reports={data?.reports} />
                    </Card>
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Audit Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded border border-green-500/20">
                                <span className="text-white">Compliant Entities</span>
                                <span className="text-2xl font-bold text-green-400">{data?.compliance_summary?.compliant || 0}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded border border-red-500/20">
                                <span className="text-white">Breaches Found</span>
                                <span className="text-2xl font-bold text-red-400">{data?.compliance_summary?.breaches || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Detailed Audit Logs</h2>
                    {data?.reports?.map((report, i) => (
                        <Card key={i} className={`border ${report.compliance_score > 90 ? 'bg-white/5 border-white/10' : 'bg-red-950/20 border-red-500/30'}`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{report.target_id}</h3>
                                        <div className="text-sm text-white/60">{report.target_type} Audit</div>
                                    </div>
                                    <Badge className={report.compliance_score > 90 ? 'bg-green-600' : 'bg-red-600'}>
                                        Score: {report.compliance_score}%
                                    </Badge>
                                </div>

                                {report.breaches_found?.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <h4 className="text-sm font-semibold text-red-300">Detected Breaches:</h4>
                                        {report.breaches_found.map((breach, j) => (
                                            <div key={j} className="flex items-start gap-2 text-sm text-red-200 bg-red-500/10 p-2 rounded">
                                                <AlertOctagon className="w-4 h-4 mt-0.5 shrink-0" />
                                                <div>
                                                    <span className="font-bold">[{breach.severity}]</span> {breach.description}
                                                    <div className="text-xs opacity-70">Violated: {breach.guideline_violated}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {report.remediation_steps?.length > 0 && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-cyan-300">Suggested Remediation:</h4>
                                        <ul className="list-disc list-inside text-sm text-white/70 pl-2">
                                            {report.remediation_steps.map((step, k) => (
                                                <li key={k}>{step}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AuroraBackground>
    );
}