import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Bug, Code, Copy, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AICodeAssistant() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState('');
    const [mode, setMode] = useState('generate');

    const assistantMutation = useMutation({
        mutationFn: async (data) => {
            const res = await base44.functions.invoke('developer/aiCodeAssistant', data);
            return res.data.result;
        },
        onSuccess: (data) => {
            setResult(data);
        },
        onError: () => {
            toast.error("Assistant failed to respond");
        }
    });

    const handleAction = () => {
        if (!input) return;
        assistantMutation.mutate({
            action: mode,
            prompt: mode === 'generate' ? input : undefined,
            code_snippet: mode !== 'generate' ? input : undefined,
            language: 'javascript'
        });
    };

    return (
        <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="border-b border-white/10 pb-3">
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse" /> AI Code Architect
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col gap-4">
                <Tabs defaultValue="generate" onValueChange={setMode} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-black/40 border-white/10">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="debug">Debug</TabsTrigger>
                        <TabsTrigger value="complete">Complete</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex-1 min-h-[200px] flex flex-col gap-4">
                    <Textarea 
                        placeholder={mode === 'generate' ? "Describe the integration you need..." : "Paste your code here..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-black/40 border-cyan-500/20 text-cyan-100 font-mono text-sm resize-none"
                    />
                    
                    <Button 
                        onClick={handleAction}
                        disabled={assistantMutation.isPending}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                    >
                        {assistantMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Code className="w-4 h-4 mr-2" />}
                        {mode === 'generate' ? 'Generate Code' : mode === 'debug' ? 'Analyze & Fix' : 'Auto-Complete'}
                    </Button>
                </div>

                {result && (
                    <div className="bg-black/80 rounded-lg border border-purple-500/30 p-4 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copied!"); }}>
                                <Copy className="w-4 h-4 text-purple-400" />
                            </Button>
                        </div>
                        <pre className="text-xs text-purple-200 font-mono overflow-auto max-h-[300px]">
                            {result}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}