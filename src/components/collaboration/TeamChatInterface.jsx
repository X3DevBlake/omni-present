import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, FileText, RefreshCw, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TeamChatInterface({ teamId, activeAgents }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const scrollRef = useRef(null);

    // Poll for messages (simulated real-time)
    useEffect(() => {
        const fetchMessages = async () => {
            if (!teamId) return;
            try {
                const res = await base44.functions.invoke('agentChat', { action: 'history', teamId });
                if (res.data.success) {
                    setMessages(res.data.history);
                }
            } catch (e) { console.error(e); }
        };
        
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [teamId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input;
        setInput('');
        
        // Optimistic UI
        const tempMsg = { 
            content: msg, 
            message_type: 'user', // Human intervention
            timestamp: new Date().toISOString(),
            id: 'temp-' + Date.now()
        };
        setMessages(prev => [...prev, tempMsg]);

        await base44.functions.invoke('agentChat', { 
            action: 'send', 
            teamId, 
            message: msg,
            agentId: 'HUMAN_COMMANDER' 
        });
    };

    const handleSummarize = async () => {
        setLoadingSummary(true);
        try {
            const res = await base44.functions.invoke('agentChat', { action: 'summarize', teamId });
            setSummary(res.data.summary);
        } catch (e) { console.error(e); }
        setLoadingSummary(false);
    };

    return (
        <Card className="bg-black/50 border-white/10 h-full flex flex-col">
            <CardHeader className="py-3 border-b border-white/10 flex flex-row justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Team Comm Log
                </CardTitle>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-[10px]"
                    onClick={handleSummarize}
                    disabled={loadingSummary}
                >
                    {loadingSummary ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3 mr-1" />}
                    AI Summarize
                </Button>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {summary && (
                    <div className="bg-indigo-900/20 border-b border-indigo-500/30 p-3 text-xs text-indigo-200">
                        <div className="font-bold mb-1 flex items-center gap-2">
                            <Bot className="w-3 h-3" /> AI Summary
                        </div>
                        {summary}
                        <button onClick={() => setSummary(null)} className="block mt-1 text-[10px] text-indigo-400 hover:text-white">Dismiss</button>
                    </div>
                )}

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                        {messages.map((msg, i) => (
                            <div key={msg.id || i} className={`flex gap-2 ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.message_type !== 'user' && (
                                    <div className="w-6 h-6 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/30">
                                        <Bot className="w-3 h-3 text-cyan-400" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
                                    msg.message_type === 'user' 
                                    ? 'bg-blue-600/20 border border-blue-500/30 text-white' 
                                    : 'bg-white/5 border border-white/10 text-gray-300'
                                }`}>
                                    {msg.message_type !== 'user' && <div className="text-[9px] text-cyan-500 mb-0.5">{msg.mentions?.[0] || 'Agent'}</div>}
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                <div className="p-3 border-t border-white/10 flex gap-2">
                    <Input 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Inject command..."
                        className="h-8 bg-black/50 border-white/10 text-xs"
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button size="sm" className="h-8 w-8 p-0 bg-blue-600" onClick={handleSend}>
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}