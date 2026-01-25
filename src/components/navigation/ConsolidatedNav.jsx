import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Menu, X, GraduationCap, Brain, Radio, Rocket, Code, ChevronDown, Home as HomeIcon,
  Sparkles, Activity, Bot, FlaskConical, Network, Globe, Users, MessageSquare
} from 'lucide-react';
import ProfileIcon from './ProfileIcon';
import { Button } from '@/components/ui/button';

const mainCategories = [
  {
    id: 'home',
    name: 'Home',
    icon: HomeIcon,
    color: '#c084fc',
    mainPage: 'Home',
    description: 'Dashboard & Overview',
    featured: true,
    subHubs: []
  },
  {
    id: 'academy',
    name: 'Academy',
    icon: GraduationCap,
    color: '#ec4899',
    mainPage: 'OmniPresentAcademy',
    description: 'Learn AI, Quantum & Consciousness',
    featured: true,
    subHubs: [
      { name: 'Main Academy', page: 'OmniPresentAcademy', icon: GraduationCap },
      { name: 'Research Hub', page: 'ResearchHub', icon: FlaskConical },
      { name: 'AI Training Center', page: 'AITrainingAcademy', icon: Brain },
      { name: 'Developer Portal', page: 'DeveloperPortal', icon: Code },
      { name: 'AI Training Center', page: 'AITrainingCenter', icon: Brain },
      { name: 'Academy Dashboard', page: 'AcademyDashboard', icon: Activity }
    ]
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    icon: Brain,
    color: '#22d3ee',
    mainPage: 'OmegaIntelligenceHub',
    description: 'AI Systems & Analytics',
    featured: true,
    subHubs: [
      { name: 'Omega Intelligence', page: 'OmegaIntelligenceHub', icon: Brain },
      { name: 'AI Marketplace', page: 'AIAgentMarketplace', icon: Bot },
      { name: 'Predictive Intelligence', page: 'PredictiveIntelligenceHub', icon: Activity },
      { name: 'Collaboration Hub', page: 'OmegaCollaborationHub', icon: Network },
      { name: 'AI Management', page: 'AIManagement', icon: Brain },
      { name: 'Agent Behavior Studio', page: 'AgentBehaviorStudio', icon: Sparkles }
    ]
  },
  {
    id: 'network',
    name: 'Network',
    icon: Radio,
    color: '#10b981',
    mainPage: 'RedCommHub',
    description: 'RedComm XG Infrastructure',
    featured: true,
    subHubs: [
      { name: 'RedComm Hub', page: 'RedCommHub', icon: Radio },
      { name: 'Security Intelligence', page: 'SecurityIntelligenceHub', icon: Globe },
      { name: 'Network Analytics', page: 'AIAnalyticsHub', icon: Activity }
    ]
  },
  {
    id: 'simulation',
    name: 'Simulation',
    icon: Rocket,
    color: '#f59e0b',
    mainPage: 'SimulationHub',
    description: 'Virtual Environments & Testing',
    subHubs: [
      { name: 'Simulation Hub', page: 'SimulationHub', icon: Rocket },
      { name: 'Simulation Lab', page: 'SimulationLab', icon: FlaskConical },
      { name: 'Agent Training', page: 'AgentTraining', icon: Brain },
      { name: 'Sandbox Environment', page: 'SandboxEnvironment', icon: Code }
    ]
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: Bot,
    color: '#8b5cf6',
    mainPage: 'AIAgentMarketplace',
    description: 'Buy, Sell & Deploy Agents',
    subHubs: [
      { name: 'Agent Marketplace', page: 'AIAgentMarketplace', icon: Bot },
      { name: 'Agent Customization', page: 'AgentCustomization', icon: Sparkles },
      { name: 'Marketplace Hub', page: 'OmegaMarketplaceHub', icon: Globe }
    ]
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    icon: Network,
    color: '#06b6d4',
    mainPage: 'AgentCollaborationHub',
    description: 'Team & Multi-Agent Work',
    subHubs: [
      { name: 'Collaboration Hub', page: 'AgentCollaborationHub', icon: Network },
      { name: 'Advanced Collaboration', page: 'AdvancedCollaborationHub', icon: Users },
      { name: 'Team Orchestration', page: 'TeamOrchestration', icon: Activity },
      { name: 'Communication Hub', page: 'UnifiedCommunicationHub', icon: MessageSquare }
    ]
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: Activity,
    color: '#14b8a6',
    mainPage: 'EcosystemMonitoringDashboard',
    description: 'System Health & Analytics',
    subHubs: [
      { name: 'Ecosystem Monitor', page: 'EcosystemMonitoringDashboard', icon: Globe },
      { name: 'Security Monitor', page: 'SecurityMonitoringHub', icon: Globe },
      { name: 'Analytics Hub', page: 'AnalyticsIntelligenceHub', icon: Activity }
    ]
  }
];

export default function ConsolidatedNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-purple-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </motion.button>

            <Link to={createPageUrl('Home')}>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-7 h-7 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,1)]" />
                </motion.div>
                
                <motion.h1 
                  className="text-2xl font-black relative"
                  style={{ 
                    background: 'linear-gradient(90deg, #c084fc 0%, #ec4899 50%, #22d3ee 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 20px rgba(192, 132, 252, 0.8)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))',
                    textShadow: '0 0 30px rgba(192, 132, 252, 0.9), 0 0 60px rgba(236, 72, 153, 0.7), 0 0 90px rgba(34, 211, 238, 0.5)'
                  }}
                  animate={{ 
                    backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
                    filter: [
                      'drop-shadow(0 0 20px rgba(192, 132, 252, 0.8)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))',
                      'drop-shadow(0 0 30px rgba(236, 72, 153, 0.9)) drop-shadow(0 0 50px rgba(34, 211, 238, 0.7))',
                      'drop-shadow(0 0 25px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 45px rgba(192, 132, 252, 0.6))',
                      'drop-shadow(0 0 20px rgba(192, 132, 252, 0.8)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))'
                    ]
                  }}
                  transition={{ 
                    backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" },
                    filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  OMNI-PRESENT
                </motion.h1>
              </motion.div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Quick Access to Academy */}
              <Link to={createPageUrl('OmniPresentAcademy')}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Academy
                  </Button>
                </motion.div>
              </Link>
              <ProfileIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24 relative overflow-y-auto h-full">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-16"
              >
                <h2 className="text-5xl font-black text-white mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Navigate the Ecosystem
                </h2>
                <p className="text-gray-400 text-lg">Explore all hubs and capabilities</p>
              </motion.div>

              {/* Featured Categories */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {mainCategories.filter(cat => cat.featured).map((category, idx) => {
                  const Icon = category.icon;
                  const isExpanded = expandedCategory === category.id;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      <div 
                        className="absolute inset-0 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-all"
                        style={{ backgroundColor: category.color + '40' }}
                      />
                      
                      <div className="relative bg-black/90 backdrop-blur-xl border-2 rounded-3xl p-8 shadow-2xl"
                        style={{ borderColor: category.color + '60' }}
                      >
                        <Link to={createPageUrl(category.mainPage)} onClick={() => setIsOpen(false)}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="mb-6"
                          >
                            <Icon className="w-16 h-16 text-white mx-auto mb-4"
                              style={{ filter: `drop-shadow(0 0 20px ${category.color})` }}
                            />
                            <h3 className="text-3xl font-bold text-white mb-2">{category.name}</h3>
                            <p className="text-gray-400">{category.description}</p>
                          </motion.div>
                        </Link>

                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors mt-4 py-2 border-t border-white/10"
                        >
                          <span className="text-sm">View All</span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-4"
                            >
                              <div className="space-y-2">
                                {category.subHubs.map((hub, i) => {
                                  const HubIcon = hub.icon;
                                  return (
                                    <Link key={i} to={createPageUrl(hub.page)} onClick={() => setIsOpen(false)}>
                                      <motion.div
                                        whileHover={{ x: 5 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                      >
                                        <HubIcon className="w-5 h-5 text-white/60" />
                                        <span className="text-white text-sm">{hub.name}</span>
                                      </motion.div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* More Hubs */}
              {mainCategories.filter(cat => !cat.featured).map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className="w-full bg-white/5 hover:bg-white/10 rounded-2xl p-6 transition-all border border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Icon className="w-8 h-8 text-purple-400" />
                          <div className="text-left">
                            <h3 className="text-xl font-bold text-white">{category.name}</h3>
                            <p className="text-gray-500 text-sm">{category.description}</p>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-6 h-6 text-white/60" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 px-4">
                            {category.subHubs.map((hub, i) => {
                              const HubIcon = hub.icon;
                              return (
                                <Link key={i} to={createPageUrl(hub.page)} onClick={() => setIsOpen(false)}>
                                  <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-black/60 border border-white/10 rounded-xl p-4 hover:border-purple-400/50 transition-all"
                                  >
                                    <HubIcon className="w-8 h-8 text-purple-400 mb-2" />
                                    <h4 className="text-white font-semibold text-sm">{hub.name}</h4>
                                  </motion.div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}