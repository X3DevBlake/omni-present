import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, Shield, Eye } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import AgentBehaviorDefinition from '../components/agents/AgentBehaviorDefinition';
import AgentDatasetTraining from '../components/agents/AgentDatasetTraining';
import AgentRoleManagement from '../components/agents/AgentRoleManagement';
import AgentDecisionVisualizer from '../components/agents/AgentDecisionVisualizer';
import WorkflowAutomation from '../components/workflow/WorkflowAutomation';
import { usePersonalization } from '../components/personalization/PersonalizationContext';

export default function AgentCustomization() {
  const { trackPageVisit } = usePersonalization();
  const [activeTab, setActiveTab] = useState('behavior');
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    trackPageVisit('AgentCustomization');
  }, []);

  const tabs = [
    { id: 'behavior', label: 'Behaviors', icon: Zap },
    { id: 'training', label: 'Training', icon: Settings },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'decision', label: 'Decision Tree', icon: Eye },
    { id: 'workflow', label: 'Workflows', icon: Zap }
  ];

  return (
    <>
      <EnhancedHubNav currentHub="AgentCustomization" />
      <AuroraBackground className="min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Agent <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Customization</span>
            </h1>
            <p className="text-white/60 text-lg">Design, train, and manage intelligent autonomous agents</p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'behavior' && (
              <AgentBehaviorDefinition selectedAgent={selectedAgent} onSelectAgent={setSelectedAgent} />
            )}
            {activeTab === 'training' && (
              <AgentDatasetTraining selectedAgent={selectedAgent} />
            )}
            {activeTab === 'roles' && (
              <AgentRoleManagement selectedAgent={selectedAgent} />
            )}
            {activeTab === 'decision' && (
              <AgentDecisionVisualizer selectedAgent={selectedAgent} />
            )}
            {activeTab === 'workflow' && (
              <WorkflowAutomation />
            )}
          </motion.div>
        </div>
      </AuroraBackground>
    </>
  );
}