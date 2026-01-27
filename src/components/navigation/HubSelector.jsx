import React, { useState } from 'react';
import { Search, ChevronDown, Check, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HubSelector({ hubs, onSelect, currentCategory }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredHubs = hubs.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full max-w-md mx-auto pointer-events-auto">
            <div 
                className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg flex items-center p-1 cursor-pointer hover:border-cyan-500/50 transition-colors shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="px-3 text-cyan-400">
                    <Search className="w-4 h-4" />
                </div>
                <div className="flex-1 text-sm text-white font-medium truncate py-1.5">
                    {search || "Navigate to Hub / Page..."}
                </div>
                <div className="px-2 flex gap-2">
                    <kbd className="hidden sm:inline-block pointer-events-none h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/50 opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl max-h-[400px] flex flex-col overflow-hidden z-50"
                    >
                        <div className="p-2 border-b border-white/10">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search ecosystem..."
                                className="w-full bg-transparent border-none outline-none text-white text-sm px-2"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                            {filteredHubs.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-xs">No hubs found</div>
                            ) : (
                                filteredHubs.map(hub => (
                                    <div
                                        key={hub.id || hub.name}
                                        className="flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer group"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(hub);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: hub.category === currentCategory ? '#22d3ee' : '#555' }} />
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-sm text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                                                {hub.name}
                                            </div>
                                            <div className="text-[10px] text-gray-500 truncate">
                                                {hub.category}
                                            </div>
                                        </div>
                                        {hub.featured && <div className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">FEATURED</div>}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-2 bg-white/5 text-[10px] text-gray-500 flex justify-between border-t border-white/10">
                            <span>{filteredHubs.length} results</span>
                            <span>Navigation System v4.0</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}