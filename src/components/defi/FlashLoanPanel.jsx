import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle } from 'lucide-react';

export default function FlashLoanPanel() {
    return (
        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Omni Flash Loans
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-black/40 p-3 rounded-lg border border-orange-500/20 mb-4">
                    <p className="text-xs text-gray-300 mb-2">
                        Borrow uncollateralized assets for one block transaction. Must be repaid within the same transaction.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                        <AlertTriangle className="w-3 h-3" /> Advanced Users Only
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-[10px] text-gray-400">Fee</div>
                        <div className="text-lg font-bold text-white">0.09%</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded text-center">
                        <div className="text-[10px] text-gray-400">Pool Depth</div>
                        <div className="text-lg font-bold text-white">$150M</div>
                    </div>
                </div>

                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold">
                    Initiate Flash Loan
                </Button>
            </CardContent>
        </Card>
    );
}