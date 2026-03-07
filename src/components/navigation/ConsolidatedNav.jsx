import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, Globe, Users, Search, Zap } from 'lucide-react';
import ProfileIcon from './ProfileIcon';
import { Button } from '@/components/ui/button';
import GlobalSearch from './GlobalSearch';
import { OmniPresentLogoSVG } from '@/components/svg/OmniIcons';
import { Badge } from '@/components/ui/badge';

export default function ConsolidatedNav({ onSidebarToggle, isSidebarOpen }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="px-4 md:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onSidebarToggle}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ?
                <X className="w-5 h-5 text-white/60" /> :
                <Menu className="w-5 h-5 text-white/60" />
              }
            </motion.button>

            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
              <OmniPresentLogoSVG size={28} animated={false} />
              <span className="text-sm font-bold gradient-text-omni hidden md:block tracking-wide">
                OMNI-PRESENT
              </span>
            </Link>

            <Badge variant="outline" className="border-purple-500/20 text-purple-400/60 text-[9px] hidden lg:flex gap-1 ml-2">
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
              4D Engine Active
            </Badge>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <GlobalSearch />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="md:hidden p-2 text-white/40 hover:text-white"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4" />
            </Button>

            <Link to={createPageUrl('AgentCollaborationHub')} className="hidden lg:block">
              <Button size="sm" variant="ghost" className="text-xs text-white/40 hover:text-white h-8 gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Agents
              </Button>
            </Link>

            <Link to={createPageUrl('OmniNavigationHub')} className="hidden lg:block">
              <Button size="sm" variant="ghost" className="text-xs text-white/40 hover:text-white h-8 gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Hubs
              </Button>
            </Link>

            <Link to={createPageUrl('Webhooks')} className="hidden lg:block">
              <Button size="sm" variant="ghost" className="text-xs text-white/40 hover:text-white h-8 gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Webhooks
              </Button>
            </Link>

            <div className="w-px h-5 bg-white/[0.06] mx-1 hidden md:block" />
            <ProfileIcon />
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pt-2 overflow-hidden"
            >
              <GlobalSearch />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
