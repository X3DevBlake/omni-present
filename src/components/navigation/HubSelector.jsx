import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, Search, Globe, Cpu, BookOpen, Network, 
  ShoppingCart, Activity, Code, Shield, Box, Users, 
  Sparkles, BarChart, Scale, LifeBuoy
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";

const CATEGORY_ICONS = {
  "Core Systems": Globe,
  "Intelligence & AI": Cpu,
  "Academy & Learning": BookOpen,
  "Network & Communication": Network,
  "Marketplace & Economy": ShoppingCart,
  "Simulation & Modeling": Activity,
  "Development & API": Code,
  "Security & Compliance": Shield,
  "Physical & Embodiment": Box,
  "Collaboration & Community": Users,
  "Quantum & Consciousness": Sparkles,
  "Analytics & Monitoring": BarChart,
  "Governance & Ethics": Scale,
  "Support & Resources": LifeBuoy
};

export default function HubSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [filteredHubs, setFilteredHubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Core Systems");
  const navigate = useNavigate();

  useEffect(() => {
    // Load hubs once
    const loadHubs = async () => {
      try {
        const allHubs = await base44.entities.Hub.list({ limit: 500 }); // Fetch plenty
        setHubs(allHubs);
      } catch (e) {
        console.error("Failed to load hubs", e);
      }
    };
    loadHubs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredHubs(hubs.filter(h => 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.category.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredHubs(hubs.filter(h => h.category === activeCategory));
    }
  }, [searchQuery, activeCategory, hubs]);

  const categories = Object.keys(CATEGORY_ICONS);

  return (
    <div className="relative z-50">
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white h-9 px-3 rounded-lg"
      >
        <Globe className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium hidden md:inline">Omni Hubs</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-[800px] bg-black/90 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 flex"
            >
              {/* Sidebar - Categories */}
              <div className="w-64 border-r border-white/10 bg-black/50 p-2 flex flex-col gap-1 overflow-y-auto max-h-[600px]">
                {categories.map(cat => {
                  const Icon = CATEGORY_ICONS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                        activeCategory === cat && !searchQuery
                          ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Main Content - Search & Grid */}
              <div className="flex-1 flex flex-col p-4 max-h-[600px]">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <Input 
                    placeholder="Search 384+ hubs..." 
                    className="pl-9 bg-white/5 border-white/10 text-white focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-2 content-start">
                  {filteredHubs.length > 0 ? filteredHubs.map(hub => (
                    <Link
                      key={hub.id}
                      to={hub.page === 'GenericHub' ? `${createPageUrl(hub.page)}?id=${hub.id}` : createPageUrl(hub.page)}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all"
                    >
                      <div className="p-2 rounded-lg bg-black/40 group-hover:scale-110 transition-transform">
                        <Activity className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors">
                          {hub.name}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {hub.description || hub.category}
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="col-span-2 text-center py-12 text-gray-500">
                      No hubs found for "{searchQuery}"
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                  <span>{hubs.length} Active Hubs</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    System Online
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}