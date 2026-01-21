import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link, useLocation } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  Users,
  Shield,
  Bot,
  Boxes,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function IntelligentNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'Home';

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: predictions } = useQuery({
    queryKey: ['nav-predictions', currentPath],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeNavigationIntelligence', {
        current_page: currentPath
      });
      return response.data.predictions;
    },
    enabled: !!user,
    refetchInterval: 60000
  });

  const navItems = [
    { name: 'Home', page: 'Home', icon: Sparkles, color: 'text-white' },
    { name: 'AI Labs', page: 'NextGenMLHub', icon: Brain, color: 'text-cyan-400' },
    { name: 'Analytics', page: 'AnalyticsIntelligenceHub', icon: BarChart3, color: 'text-green-400' },
    { name: 'Collaboration', page: 'CollaborationOrchestrationHub', icon: Users, color: 'text-pink-400' },
    { name: 'Security', page: 'SecurityComplianceHub', icon: Shield, color: 'text-red-400' },
    { name: 'Agents', page: 'AIAgentMarketplace', icon: Bot, color: 'text-purple-400' },
    { name: 'Simulation', page: 'SimulationHub', icon: Boxes, color: 'text-blue-400' }
  ];

  const isPredicted = (pageName) => {
    return predictions?.some(p => p.page_name === pageName);
  };

  const getPredictionScore = (pageName) => {
    const pred = predictions?.find(p => p.page_name === pageName);
    return pred ? (pred.probability * 100).toFixed(0) : null;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-black/60 via-purple-900/30 to-black/60 backdrop-blur-xl border-b border-white/20 shadow-2xl shadow-purple-500/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-white flex items-center gap-3"
              >
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <div className="absolute inset-0 blur-xl bg-cyan-400/50 -z-10" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                  Omni-Present Omega
                </span>
              </motion.div>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const predicted = isPredicted(item.page);
                const score = getPredictionScore(item.page);
                const isActive = currentPath === item.page;
                
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        className={`text-white hover:bg-white/20 relative transition-all ${
                          isActive ? 'bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-white/30' : ''
                        }`}
                      >
                        <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
                        <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                        {predicted && (
                          <Badge className="ml-2 bg-cyan-500/80 text-xs px-1.5 animate-pulse">
                            {score}%
                          </Badge>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[73px] left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-b border-white/10 lg:hidden"
          >
            <div className="container mx-auto px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className={`w-4 h-4 mr-2 ${item.color}`} />
                    {item.name}
                    {isPredicted(item.page) && (
                      <Badge className="ml-auto bg-cyan-500 text-xs">
                        Suggested
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}