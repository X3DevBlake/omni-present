import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import {
  Home, Activity, Brain, Rocket, Shield, Database, LayoutGrid,
  Settings, Bot, GraduationCap, Globe, DollarSign, Cpu, Radio,
  Users, Atom, BarChart2, Scale, LifeBuoy, Wallet, FlaskConical,
  Search, ChevronDown, Boxes, Webhook, Layers, Eye, Code
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
  { id: 'core', name: 'Core', icon: Home, color: 'text-white/70',
    items: [
      { name: 'Dashboard', path: 'DashboardHome', icon: LayoutGrid },
      { name: 'Home', path: 'Home', icon: Home },
      { name: 'Navigation Hub', path: 'OmniNavigationHub', icon: Globe },
    ]
  },
  { id: '4d', name: '4D Systems', icon: Boxes, color: 'text-purple-400',
    items: [
      { name: '4D Visualizer', path: 'DashboardHome', icon: Boxes },
      { name: 'Global Earth', path: 'GlobalMap', icon: Globe },
      { name: 'Simulations', path: 'SimulationHub', icon: Rocket },
    ]
  },
  { id: 'ai', name: 'Intelligence', icon: Brain, color: 'text-purple-400',
    items: [
      { name: 'AI Labs', path: 'AILab', icon: FlaskConical },
      { name: 'Agent Hub', path: 'AgentCollaborationHub', icon: Bot },
      { name: 'Agent Marketplace', path: 'AIAgentMarketplace', icon: Users },
      { name: 'Training Center', path: 'AITrainingCenter', icon: GraduationCap },
      { name: 'Analytics', path: 'AIAnalyticsHub', icon: BarChart2 },
    ]
  },
  { id: 'data', name: 'Data & Webhooks', icon: Database, color: 'text-cyan-400',
    items: [
      { name: 'Webhooks', path: 'Webhooks', icon: Webhook },
      { name: 'API Explorer', path: 'APIExplorer', icon: Code },
      { name: 'Data Marketplace', path: 'DataMarketplace', icon: Database },
      { name: 'Monitoring', path: 'SystemHealth', icon: Activity },
    ]
  },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-emerald-400',
    items: [
      { name: 'DeFi Hub', path: 'AdvancedDeFiHub', icon: Wallet },
      { name: 'Trading', path: 'CryptoTradingHub', icon: DollarSign },
      { name: 'Banking', path: 'OmniBankingHub', icon: Wallet },
    ]
  },
  { id: 'network', name: 'Network', icon: Radio, color: 'text-orange-400',
    items: [
      { name: 'RedComm', path: 'RedCommHub', icon: Radio },
      { name: 'Communications', path: 'CommunicationsHub', icon: Radio },
    ]
  },
  { id: 'learn', name: 'Academy', icon: GraduationCap, color: 'text-pink-400',
    items: [
      { name: 'Academy', path: 'OmniPresentAcademy', icon: GraduationCap },
      { name: 'Courses', path: 'CurriculumCourses', icon: Layers },
    ]
  },
  { id: 'security', name: 'Security', icon: Shield, color: 'text-red-400',
    items: [
      { name: 'Security Hub', path: 'Security', icon: Shield },
      { name: 'Compliance', path: 'ComplianceDashboard', icon: Scale },
      { name: 'Ethics', path: 'EthicsHub', icon: Eye },
    ]
  },
];

const KNOWN_PAGES = new Set([
  "AIAgentMarketplace", "AIAnalyticsHub", "AICollaborationHub", "AIEthicsHub",
  "AILab", "AILabsAdvanced", "AIManagement", "AIPlayground", "AITrainingAcademy",
  "AITrainingCenter", "APIExplorer", "About", "AdminHome", "AdvancedDeFiHub",
  "AgentCollaborationHub", "AgentMarketplace", "Analytics", "Billing",
  "CommunicationsHub", "Community", "ComplianceDashboard", "CryptoTradingHub",
  "DashboardHome", "DataMarketplace", "Documentation", "DeveloperPortal",
  "EthicsHub", "Features", "GlobalMap", "Home", "Labs", "Marketplace",
  "OmniBankingHub", "OmniNavigationHub", "OmniPresentAcademy", "Profile",
  "RedCommHub", "Roadmap", "SandboxHub", "Security", "Settings",
  "SimulationHub", "SystemHealth", "Team", "Webhooks", "CurriculumCourses",
  "CodeEditor", "GenericHub",
]);

function SidebarCategory({ category, isActive }) {
  const [expanded, setExpanded] = useState(isActive);
  const location = useLocation();

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
          expanded ? 'text-white/80 bg-white/[0.03]' : 'text-white/30 hover:text-white/50'
        }`}
      >
        <category.icon className={`w-3.5 h-3.5 ${category.color}`} />
        <span className="flex-1 text-left">{category.name}</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-0.5 space-y-0.5 border-l border-white/[0.04] pl-3">
              {category.items.map((item) => {
                const isItemActive = location.pathname.includes(item.path);
                return (
                  <Link
                    key={item.path + item.name}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                      isItemActive
                        ? 'text-white bg-purple-500/10 border-l-2 border-purple-500 -ml-[13px] pl-[11px]'
                        : 'text-white/35 hover:text-white/70 hover:bg-white/[0.03]'
                    }`}
                  >
                    <item.icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ isOpen, hubs = [], isLoading = false }) {
  const location = useLocation();

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? 260 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-[52px] bottom-0 z-30 bg-black/80 backdrop-blur-2xl border-r border-white/[0.04] overflow-hidden"
    >
      <ScrollArea className="h-full">
        <div className="p-3 space-y-1">
          {/* System status */}
          <div className="px-3 py-2 mb-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Systems Online</span>
            </div>
          </div>

          {/* Navigation Categories */}
          {categories.map((cat) => {
            const isActive = cat.items.some(item => location.pathname.includes(item.path));
            return <SidebarCategory key={cat.id} category={cat} isActive={isActive} />;
          })}

          {/* Dynamic hubs */}
          {hubs.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <div className="px-3 py-1 text-[10px] text-white/20 uppercase tracking-wider mb-2">
                Connected Hubs ({hubs.length})
              </div>
              <div className="space-y-0.5">
                {hubs.slice(0, 15).map((hub) => (
                  <Link
                    key={hub.id || hub.name}
                    to={
                      KNOWN_PAGES.has(hub.name)
                        ? createPageUrl(hub.name)
                        : createPageUrl('GenericHub') + '?name=' + encodeURIComponent(hub.name)
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all truncate"
                  >
                    <div className="w-1 h-1 rounded-full bg-purple-400/40 flex-shrink-0" />
                    {hub.name}
                  </Link>
                ))}
                {hubs.length > 15 && (
                  <Link
                    to={createPageUrl('OmniNavigationHub')}
                    className="block px-3 py-1.5 text-[10px] text-purple-400/50 hover:text-purple-400 transition-colors"
                  >
                    +{hubs.length - 15} more hubs...
                  </Link>
                )}
              </div>
            </div>
          )}

          {isLoading && hubs.length === 0 && (
            <div className="px-3 py-4 text-[10px] text-white/20 text-center animate-pulse">
              Loading hubs...
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
