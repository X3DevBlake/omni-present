import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import AIBudgetingForecast from '../components/budgeting/AIBudgetingForecast';
import { PieChart, TrendingUp } from 'lucide-react';

export default function BudgetingForecast() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <PieChart className="w-10 h-10 text-cyan-400" />
            AI Budgeting & Forecasting
          </h1>
          <p className="text-white/60">Intelligent spending analysis and personalized recommendations</p>
        </motion.div>

        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="forecast" className="data-[state=active]:bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500/20">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <AIBudgetingForecast userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">
                  Please log in to view your forecast
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <div className="text-center py-12 text-white/40">
                Advanced analytics coming soon
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}