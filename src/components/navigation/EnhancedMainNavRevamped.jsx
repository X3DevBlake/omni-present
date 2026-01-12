import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { HubRegistry, HubCategories } from './HubRegistry';
import Hub3DIcon from '../3d/Hub3DIcon';
import { Menu, X, Sparkles, ChevronRight, Zap } from 'lucide-react';
import AuroraBackground from '../omni/AuroraBackground';

export default function EnhancedMainNavRevamped() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredHub, setHoveredHub] = useState(null);

  const categories = ['all', ...Object.keys(HubCategories)];
  
  const filteredHubs = selectedCategory === 'all' 
    ? HubRegistry 
    : HubRegistry.filter(hub => hub.category === selectedCategory);

  return (
    <>
      {/* Floating Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </motion.button>

      {/* Full Screen Navigation Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          >
            <AuroraBackground className="w-full h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto px-6 py-24">
                {/* Header */}
                <motion.div
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mb-12"
                >
                  <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                    Navigate Your Universe
                  </h1>
                  <p className="text-white/60 text-xl">
                    {HubRegistry.length} hubs • Powered by AI
                  </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-wrap gap-3 mb-12"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-3 rounded-full font-medium transition-all ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {cat === 'all' ? 'All Hubs' : HubCategories[cat]?.name}
                    </button>
                  ))}
                </motion.div>

                {/* Quick Action: Workflow Hub */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <Link to={createPageUrl('WorkflowAutomationHub')} onClick={() => setIsOpen(false)}>
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg p-6 hover:border-cyan-400 transition-all cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-cyan-400" />
                        <div>
                          <h3 className="text-white font-bold">Workflow Automation</h3>
                          <p className="text-white/60 text-sm">Orchestrate with Gemini & Zapier</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-cyan-400 ml-auto" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Hub Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                >
                  {filteredHubs.map((hub) => (
                    <motion.div
                      key={hub.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <Link 
                        to={createPageUrl(hub.path)}
                        onClick={() => setIsOpen(false)}
                      >
                        <motion.div
                          className="relative group"
                          onHoverStart={() => setHoveredHub(hub.id)}
                          onHoverEnd={() => setHoveredHub(null)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Card */}
                          <div className="relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden group-hover:border-white/30 transition-all">
                            {/* Glow Effect */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
                              style={{ backgroundColor: hub.color }}
                            />
                            
                            {/* 3D Icon */}
                            <div className="relative z-10 mb-4 flex justify-center">
                              <Hub3DIcon 
                                type={hub.icon3d} 
                                color={hub.color}
                                isHovered={hoveredHub === hub.id}
                                size={100}
                              />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                              <h3 className="text-xl font-bold text-white mb-2 text-center">
                                {hub.name}
                              </h3>
                              <div className="flex items-center justify-center gap-2">
                                <span 
                                  className="text-xs px-3 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: `${hub.color}20`,
                                    color: hub.color
                                  }}
                                >
                                  {HubCategories[hub.category]?.name}
                                </span>
                              </div>

                              {/* Hover Indicator */}
                              <motion.div
                                className="mt-4 flex items-center justify-center gap-2 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                initial={false}
                              >
                                <span className="text-sm">Enter</span>
                                <ChevronRight className="w-4 h-4" />
                              </motion.div>
                            </div>

                            {/* AI Badge for AI hubs */}
                            {hub.category === 'ai' && (
                              <div className="absolute top-3 right-3">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Footer Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-16 text-center text-white/40 text-sm"
                >
                  <p>AI agents can navigate autonomously through all hubs</p>
                  <p className="mt-2">Powered by Mistral AI & Advanced 3D Graphics</p>
                </motion.div>
              </div>
            </AuroraBackground>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}