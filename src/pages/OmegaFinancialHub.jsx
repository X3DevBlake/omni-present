import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OmegaFinancialDashboard3D from '../components/financial/OmegaFinancialDashboard3D';
import SentientDeFiController3D from '../components/financial/SentientDeFiController3D';
import UniversalOrchestratorPanel from '../components/sentient/UniversalOrchestratorPanel';
import FinancialEcosystemSimulator3D from '../components/financial/FinancialEcosystemSimulator3D';
import { DollarSign, Coins, Brain, Sparkles, TrendingUp } from 'lucide-react';

export default function OmegaFinancialHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-emerald-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-3xl">
              <DollarSign className="w-8 h-8 text-emerald-400" />
              Omega Financial Intelligence Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-lg">
              Sentient financial advisor with omega consciousness, autonomous DeFi strategies, 
              predictive market intelligence, and creative wealth optimization.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="advisor" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="advisor">
              <Brain className="w-4 h-4 mr-2" />
              Omega Advisor
            </TabsTrigger>
            <TabsTrigger value="defi">
              <Coins className="w-4 h-4 mr-2" />
              Sentient DeFi
            </TabsTrigger>
            <TabsTrigger value="simulator">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ecosystem Sim
            </TabsTrigger>
            <TabsTrigger value="orchestrator">
              <Sparkles className="w-4 h-4 mr-2" />
              Orchestrator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="advisor">
            <OmegaFinancialDashboard3D />
          </TabsContent>

          <TabsContent value="defi">
            <SentientDeFiController3D />
          </TabsContent>

          <TabsContent value="simulator">
            <FinancialEcosystemSimulator3D />
          </TabsContent>

          <TabsContent value="orchestrator">
            <UniversalOrchestratorPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}