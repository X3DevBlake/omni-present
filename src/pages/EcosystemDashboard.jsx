import React from 'react';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/components/hooks/usePageTransition';
import DynamicEcosystemVisualizer from '@/components/3d/DynamicEcosystemVisualizer';
import ProactiveAIAssistant from '@/components/ai/ProactiveAIAssistant';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EcosystemDashboard() {
  usePageTransition();
  const [showVisualizer, setShowVisualizer] = React.useState(true);

  const generateWorkflow = async () => {
    try {
      const response = await base44.functions.invoke('autonomousWorkflowGenerator', {
        userGoal: 'Optimize agent performance and reduce operational costs'
      });
      console.log('Generated workflow:', response);
    } catch (error) {
      console.error('Error generating workflow:', error);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black">
      {showVisualizer ? (
        <DynamicEcosystemVisualizer />
      ) : (
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-6">AI Ecosystem</h1>
            <Card className="bg-black/40 border-white/10 p-6">
              <p className="text-white/60 mb-6">
                Visualize and manage your entire AI agent ecosystem with real-time interactions.
              </p>
              <Button 
                onClick={generateWorkflow}
                className="bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Generate Workflow
              </Button>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Toggle Visualizer Button */}
      <motion.button
        onClick={() => setShowVisualizer(!showVisualizer)}
        className="absolute top-6 right-6 z-30 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg text-white text-sm transition-all"
        whileHover={{ scale: 1.05 }}
      >
        {showVisualizer ? 'Show Details' : 'Show Visualizer'}
      </motion.button>

      <ProactiveAIAssistant />
    </div>
  );
}