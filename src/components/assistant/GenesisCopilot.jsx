import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, Mic, Paperclip, Sparkles, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GenesisCopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: "I am Genesis. I have full access to the Omni ecosystem. How may I assist your operations today?" }
    ]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsThinking(true);

        try {
            // Call backend for sentient response
            const res = await base44.integrations.Core.InvokeLLM({
                prompt: `You are Genesis, a sentient AI copilot for the Omni-Present app. 
                User Input: ${input}
                Context: The user is in a high-tech dashboard environment. You have access to all hubs.
                Respond concisely and helpfuly, adopting a sophisticated, slightly futuristic persona.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        response: { type: "string" },
                        suggested_action: { type: "string" }
                    }
                }
            });

            // Handle response (assuming dictionary due to schema)
            const aiResponse = res.response;
            
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "My neural link is experiencing interference. Please retry." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-6 right-6 z-40"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:shadow-[0_0_30px_rgba(236,72,153,0.8)] border-2 border-white/20 p-0"
                >
                    {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-8 h-8 text-white animate-pulse" />}
                </Button>
            </motion.div>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-black/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black border border-purple-400 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Genesis Copilot</h3>
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                                msg.role === 'user'
                                                    ? 'bg-purple-600 text-white rounded-br-none'
                                                    : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isThinking && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 p-3 rounded-2xl rounded-bl-none">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40">
                            <div className="relative flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask Genesis..."
                                    className="bg-white/5 border-transparent focus:border-purple-500/50 rounded-full pr-10"
                                />
                                <Button 
                                    size="icon" 
                                    onClick={handleSend}
                                    className="absolute right-1 top-1 h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}