import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Bot, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NegotiationVisualizer3D({ sessionData }) {
    const [step, setStep] = useState(0);
    const logs = sessionData?.negotiation_log || [];

    useEffect(() => {
        if (logs.length > 0 && step < logs.length) {
            const timer = setTimeout(() => setStep(s => s + 1), 1500);
            return () => clearTimeout(timer);
        }
    }, [logs, step]);

    return (
        <div className="w-full bg-black/60 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Bot className="text-purple-400" /> Autonomous Negotiation Engine
                </h3>
                <div className="text-xs text-white/40 font-mono">ID: {sessionData?.mission_id || 'Waiting...'}</div>
            </div>

            <div className="relative h-[300px] bg-white/5 rounded-lg p-4 overflow-hidden flex flex-col gap-3">
                <AnimatePresence>
                    {logs.slice(0, step + 1).map((log, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 bg-black/40 p-3 rounded border border-white/5"
                        >
                            <div className={`w-2 h-2 mt-1.5 rounded-full ${log.agent === 'Alpha-Lead' ? 'bg-cyan-400' : 'bg-pink-400'}`} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-white/80">{log.agent}</span>
                                    <span className="text-[10px] text-white/40 uppercase">{log.action}</span>
                                </div>
                                <p className="text-sm text-white/90 mt-1">{log.detail}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {step >= logs.length && logs.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-auto bg-green-500/20 border border-green-500/50 p-3 rounded flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 font-bold text-sm">Agreement Reached</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}