import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function ContextualAssistantOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Greetings. I am the Omega Sentient Assistant. I am monitoring your session.' }
    ]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl w-80 h-96 shadow-2xl overflow-hidden flex flex-col mb-4"
                    >
                        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-3 flex justify-between items-center border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-bold text-white">Omega Assistant</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {messages.map((m, i) => (
                                <div key={i} className={`text-sm p-2 rounded-lg max-w-[85%] ${m.role === 'system' ? 'bg-cyan-900/30 border border-cyan-500/20 mr-auto' : 'bg-blue-600 ml-auto'}`}>
                                    {m.content}
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10 bg-black/40">
                            <input 
                                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                                placeholder="Ask about system status..."
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full p-4 shadow-lg shadow-cyan-500/30 border border-white/20 text-white flex items-center justify-center"
            >
                {isOpen ? <Minimize2 className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}