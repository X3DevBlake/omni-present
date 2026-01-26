import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home, Activity, Brain, Rocket, Shield, Database, LayoutGrid, 
  Settings, Bot, GraduationCap, Globe, DollarSign
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
  { id: 'core', name: 'Core Systems', icon: Home, color: 'text-purple-400' },
  { id: 'ai', name: 'Intelligence & AI', icon: Brain, color: 'text-cyan-400' },
  { id: 'sim', name: 'Simulation & Modeling', icon: Rocket, color: 'text-amber-400' },
  { id: 'finance', name: 'Marketplace & Economy', icon: DollarSign, color: 'text-emerald-400' },
  { id: 'security', name: 'Security & Compliance', icon: Shield, color: 'text-red-400' },
  { id: 'learning', name: 'Academy & Learning', icon: GraduationCap, color: 'text-pink-400' },
  { id: 'dev', name: 'Development & API', icon: Database, color: 'text-indigo-400' },
  { id: 'network', name: 'Network & Comm', icon: Globe, color: 'text-blue-400' },
  { id: 'collab', name: 'Collaboration', icon: LayoutGrid, color: 'text-orange-400' },
  { id: 'agents', name: 'Autonomous Agents', icon: Bot, color: 'text-green-400' },
];

export default function Sidebar({ isOpen, hubs = [] }) {
  const location = useLocation();

  const getHubsByCategory = (cat) => {
    return hubs.filter(h => h.category?.includes(cat.name) || h.category === cat.name);
  };

  return (
    <motion.div
      initial={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      animate={{ width: isOpen ? 280 : 0, opacity: isOpen ? 1 : 0 }}
      className="fixed left-0 top-20 bottom-0 z-30 bg-black/80 backdrop-blur-xl border-r border-white/10 overflow-hidden"
    >
      <ScrollArea className="h-full py-4">
        <div className="px-4 space-y-6">
          {hubs.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-10 px-4">
              Loading hubs or no hubs found...
            </div>
          )}
          {categories.map((cat) => {
            const catHubs = getHubsByCategory(cat);
            if (catHubs.length === 0) return null;

            return (
              <div key={cat.id}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${cat.color}`}>
                  <cat.icon className="w-3 h-3" />
                  {cat.name}
                </h3>
                <div className="space-y-1">
                  {catHubs.map((hub) => (
                    <Link 
                      key={hub.id} 
                      to={createPageUrl(hub.path || hub.name)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        location.pathname.includes(hub.name) 
                          ? 'bg-white/10 text-white font-medium' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {hub.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}