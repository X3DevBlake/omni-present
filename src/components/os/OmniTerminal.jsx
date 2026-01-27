import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Shield, Activity, Wifi, Command, Smartphone, Laptop, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { base44 } from '@/api/base44Client';

export default function OmniTerminal({ selectedDevice }) {
    const [history, setHistory] = useState([
        { type: 'system', content: 'Omni-OS Neural Link Established...' },
        { type: 'system', content: 'Waiting for input command sequence...' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = async (e) => {
        if (e.key === 'Enter' && input.trim()) {
            const cmd = input.trim();
            setInput('');
            setHistory(prev => [...prev, { type: 'user', content: `> ${cmd}` }]);
            setIsProcessing(true);

            try {
                const response = await base44.functions.invoke('os/executeSystemTask', {
                    command: cmd,
                    device_id: selectedDevice?.id,
                    os_type: selectedDevice?.os || 'linux'
                });

                setHistory(prev => [...prev, { type: 'output', content: response.data.output }]);
            } catch (error) {
                setHistory(prev => [...prev, { type: 'error', content: `Execution Failed: ${error.message}` }]);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-black/90 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.1)] relative">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] opacity-20" />
            
            {/* Header */}
            <div className="p-4 border-b border-cyan-500/30 flex items-center justify-between bg-cyan-950/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-mono font-bold tracking-wider">OMNI_TERMINAL_V9</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-cyan-600">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span>LINK_ACTIVE</span>
                    </div>
                    <div>{selectedDevice ? `${selectedDevice.name} [${selectedDevice.os.toUpperCase()}]` : 'NO_TARGET'}</div>
                </div>
            </div>

            {/* Terminal Output */}
            <ScrollArea className="flex-1 p-4 font-mono text-sm relative z-0" viewportRef={scrollRef}>
                <div className="space-y-2">
                    {history.map((entry, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`${
                                entry.type === 'user' ? 'text-white' :
                                entry.type === 'error' ? 'text-red-400' :
                                entry.type === 'system' ? 'text-cyan-600' :
                                'text-cyan-300'
                            }`}
                        >
                            <pre className="whitespace-pre-wrap font-mono">{entry.content}</pre>
                        </motion.div>
                    ))}
                    {isProcessing && (
                        <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
                            <span className="w-2 h-4 bg-cyan-500 block" />
                            <span>Processing Neural Command...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-cyan-500/30 bg-black/50 backdrop-blur-sm relative z-20">
                <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold text-lg animate-pulse">{'>'}</span>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleCommand}
                        placeholder={selectedDevice ? "Enter system command..." : "Select a device to begin..."}
                        disabled={!selectedDevice}
                        className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder:text-cyan-800/50 focus:ring-0"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
}