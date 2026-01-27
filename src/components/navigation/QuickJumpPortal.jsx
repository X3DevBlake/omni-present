import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Zap, Search, Bot, Terminal, Activity, ArrowRight, Database, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickJumpPortal() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Toggle with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <motion.div 
                className="fixed bottom-4 right-4 z-40"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
            >
                <Button 
                    onClick={() => setOpen(true)}
                    className="h-12 px-4 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/30"
                >
                    <Zap className="w-5 h-5 mr-2" />
                    Quick Jump
                    <span className="ml-2 text-xs bg-black/20 px-1.5 py-0.5 rounded text-cyan-100">⌘K</span>
                </Button>
            </motion.div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <div className="bg-black/95 border border-cyan-500/30 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl">
                    <CommandInput placeholder="Type a command or search..." className="border-b border-white/10 text-white placeholder:text-gray-500" />
                    <CommandList className="custom-scrollbar">
                        <CommandEmpty>No results found.</CommandEmpty>
                        
                        <CommandGroup heading="Agent Actions">
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('AIAgentMarketplace')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Bot className="mr-2 h-4 w-4" />
                                <span>Deploy New Agent</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('AgentTraining')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Train Model</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('AgentCollaborationHub')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Activity className="mr-2 h-4 w-4" />
                                <span>Monitor Swarm</span>
                            </CommandItem>
                        </CommandGroup>
                        
                        <CommandSeparator className="bg-white/10" />
                        
                        <CommandGroup heading="System Hubs">
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('OmniBankingHub')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Database className="mr-2 h-4 w-4" />
                                <span>Banking Core</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('SecurityComplianceHub')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Security Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand(() => navigate(createPageUrl('SimulationHub')))} className="aria-selected:bg-cyan-900/30 aria-selected:text-cyan-400">
                                <Activity className="mr-2 h-4 w-4" />
                                <span>Simulation Engine</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </div>
            </CommandDialog>
        </>
    );
}