import React, { useState } from 'react';
import { Mic, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NaturalLanguageControl({ onCommandProcessed }) {
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        try {
            const res = await base44.functions.invoke('interaction/naturalLanguageRouter', { command: input });
            const data = res.data;
            toast.success(data.response_message);
            setInput('');
            if (onCommandProcessed) onCommandProcessed(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to process command.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">AI Command Interface</span>
            </div>
            <div className="flex gap-2">
                <Input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    placeholder="E.g., 'Increase simulation aggression by 20%'"
                    className="bg-white/10 border-white/10 text-white placeholder:text-white/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                    onClick={handleSend} 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                    {isProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
                <Button variant="outline" className="px-3">
                    <Mic className="w-4 h-4 text-white/70" />
                </Button>
            </div>
        </div>
    );
}