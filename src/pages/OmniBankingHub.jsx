import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedBankingDashboard3D from '../components/banking/EnhancedBankingDashboard3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowRightLeft, CreditCard } from 'lucide-react';

export default function OmniBankingHub() {
    return (
        <AuroraBackground className="min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">Omni Wallet Hub</h1>
                        <p className="text-blue-200/60">Decentralized Financial Command Center</p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Wallet className="w-4 h-4 mr-2" /> Connect External Wallet
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <EnhancedBankingDashboard3D />
                    </div>
                    
                    <div className="space-y-6">
                        <Card className="bg-black/60 border-blue-500/30 backdrop-blur-xl">
                            <CardHeader>
                                <CardTitle className="text-blue-400">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="border-blue-500/30 text-blue-200 h-24 flex-col gap-2 hover:bg-blue-900/20">
                                    <ArrowRightLeft className="w-6 h-6" /> Transfer
                                </Button>
                                <Button variant="outline" className="border-blue-500/30 text-blue-200 h-24 flex-col gap-2 hover:bg-blue-900/20">
                                    <CreditCard className="w-6 h-6" /> Cards
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuroraBackground>
    );
}