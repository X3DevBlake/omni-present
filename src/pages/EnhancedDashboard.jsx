import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import ImmersiveFinancialDashboard from '../components/dashboard/ImmersiveFinancialDashboard';
import FinancialPlanningModule from '../components/dashboard/FinancialPlanningModule';
import PredictionDashboard from '../components/predictions/PredictionDashboard';
import AutomatedTradingDashboard from '../components/trading/AutomatedTradingDashboard';
import GoogleSheetsSync from '../components/integrations/GoogleSheetsSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Target, TrendingUp, Zap, Sheet } from 'lucide-react';

export default function EnhancedDashboard() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-cyan-400" />
            Enhanced Dashboard
          </h1>
          <p className="text-white/60">Your complete financial intelligence center</p>
        </motion.div>

        {userEmail ? (
          <Tabs defaultValue="overview" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
              <TabsTrigger value="overview">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="planning">
                <Target className="w-4 h-4 mr-2" />
                Planning
              </TabsTrigger>
              <TabsTrigger value="predictions">
                <TrendingUp className="w-4 h-4 mr-2" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="trading">
                <Zap className="w-4 h-4 mr-2" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="sheets">
                <Sheet className="w-4 h-4 mr-2" />
                Sheets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ImmersiveFinancialDashboard userEmail={userEmail} />
            </TabsContent>

            <TabsContent value="planning">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <FinancialPlanningModule userEmail={userEmail} />
              </div>
            </TabsContent>

            <TabsContent value="predictions">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <PredictionDashboard userEmail={userEmail} />
              </div>
            </TabsContent>

            <TabsContent value="trading">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <AutomatedTradingDashboard userEmail={userEmail} />
              </div>
            </TabsContent>

            <TabsContent value="sheets">
              <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <GoogleSheetsSync userEmail={userEmail} agentId="agent-1" />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-white/40">Please log in</div>
        )}
      </div>
    </AuroraBackground>
  );
}