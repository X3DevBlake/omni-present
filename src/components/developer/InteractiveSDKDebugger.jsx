import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Bug, Play, StepForward, Eye, CheckCircle, AlertCircle, 
  Code2, Database, Zap, Terminal, Lightbulb 
} from 'lucide-react';

function CallStackViewer({ callStack }) {
  return (
    <div className="space-y-1">
      {callStack.map((call, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-black/60 border border-blue-500/30 rounded-lg p-2"
        >
          <div className="flex items-center gap-2">
            <div className="text-blue-400 text-xs font-mono">{call.function_name}</div>
            <Badge className="bg-blue-500/30 text-blue-300 text-xs">
              {call.line_number}
            </Badge>
          </div>
          <div className="text-white/60 text-xs mt-1">{call.file_path}</div>
        </motion.div>
      ))}
    </div>
  );
}

function DataInspector({ data, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth === 0);

  if (typeof data !== 'object' || data === null) {
    return <span className="text-green-400">{JSON.stringify(data)}</span>;
  }

  return (
    <div className="ml-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-400 hover:text-blue-300 text-xs"
      >
        {expanded ? '▼' : '▶'} {Array.isArray(data) ? `Array[${data.length}]` : 'Object'}
      </button>
      {expanded && (
        <div className="ml-2 border-l border-white/20 pl-2">
          {Object.entries(data).map(([key, value], idx) => (
            <div key={idx} className="text-xs">
              <span className="text-purple-400">{key}:</span>{' '}
              <DataInspector data={value} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InteractiveSDKDebugger() {
  const [debugSession, setDebugSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [functionCall, setFunctionCall] = useState('client.agents.create');
  const [parameters, setParameters] = useState('{\n  "name": "TestAgent",\n  "capabilities": ["analysis"]\n}');
  const [breakpoints, setBreakpoints] = useState([]);
  const [watchedVariables, setWatchedVariables] = useState([]);

  const startDebugMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sdkDebuggerEngine', {
        action: 'start_debug_session',
        function_call: functionCall,
        parameters: JSON.parse(parameters),
        breakpoints
      });
      return response.data;
    },
    onSuccess: (data) => {
      setDebugSession(data);
      setCurrentStep(0);
      toast.success('Debug session started');
    }
  });

  const stepThroughMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sdkDebuggerEngine', {
        action: 'step_through',
        session_id: debugSession.session_id,
        current_step: currentStep
      });
      return response.data;
    },
    onSuccess: (data) => {
      setDebugSession(prev => ({
        ...prev,
        execution_steps: [...prev.execution_steps, data.step]
      }));
      setCurrentStep(prev => prev + 1);
    }
  });

  const analyzeErrorMutation = useMutation({
    mutationFn: async (errorData) => {
      const response = await base44.functions.invoke('sdkDebuggerEngine', {
        action: 'analyze_error',
        error_message: errorData.message,
        error_stack: errorData.stack,
        context: errorData.context
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('AI analysis complete');
    }
  });

  return (
    <Card className="bg-black/40 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bug className="w-5 h-5 text-green-400" />
          Interactive SDK Debugger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="debugger" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60">
            <TabsTrigger value="debugger">Debugger</TabsTrigger>
            <TabsTrigger value="inspector">Data Inspector</TabsTrigger>
            <TabsTrigger value="simulator">API Simulator</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="debugger" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-white text-sm font-bold mb-2">Function Call</div>
                <Input
                  value={functionCall}
                  onChange={(e) => setFunctionCall(e.target.value)}
                  className="bg-black/60 border-green-500/30 text-white mb-2"
                  placeholder="client.agents.create"
                />
                
                <div className="text-white text-sm font-bold mb-2">Parameters (JSON)</div>
                <Textarea
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  className="bg-black/60 border-green-500/30 text-white font-mono text-xs"
                  rows={6}
                />

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => startDebugMutation.mutate()}
                    disabled={startDebugMutation.isPending || debugSession}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Debug
                  </Button>
                  
                  {debugSession && (
                    <Button
                      onClick={() => stepThroughMutation.mutate()}
                      disabled={stepThroughMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <StepForward className="w-4 h-4 mr-2" />
                      Step Through
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <div className="text-white text-sm font-bold mb-2">Call Stack</div>
                <div className="bg-black/60 border border-green-500/30 rounded-lg p-3 h-64 overflow-y-auto">
                  {debugSession?.execution_steps ? (
                    <CallStackViewer callStack={debugSession.execution_steps} />
                  ) : (
                    <div className="text-white/40 text-center py-8">
                      No debug session active
                    </div>
                  )}
                </div>
              </div>
            </div>

            {debugSession && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 border border-green-500/30 rounded-lg p-4"
              >
                <div className="text-white text-sm font-bold mb-2">Current Step Details</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-xs">
                    <span className="text-white/60">Step:</span>{' '}
                    <span className="text-white">{currentStep + 1}/{debugSession.total_steps}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-white/60">Status:</span>{' '}
                    <Badge className="bg-green-500/30 text-green-300 text-xs">
                      {debugSession.status}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    <span className="text-white/60">Time:</span>{' '}
                    <span className="text-white">{debugSession.execution_time_ms || 0}ms</span>
                  </div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="inspector" className="mt-4">
            <div className="bg-black/60 border border-blue-500/30 rounded-lg p-4">
              <div className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Real-Time Data Stream Inspector
              </div>
              
              {debugSession?.current_data ? (
                <div className="bg-gray-900 p-3 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
                  <DataInspector data={debugSession.current_data} />
                </div>
              ) : (
                <div className="text-white/40 text-center py-12">
                  Start a debug session to inspect data
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="simulator" className="mt-4">
            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-4">
              <div className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                Mock API Response Simulator
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-white/60 text-xs mb-2">Simulate Response Type</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Success</Button>
                    <Button size="sm" variant="outline">Error</Button>
                    <Button size="sm" variant="outline">Timeout</Button>
                    <Button size="sm" variant="outline">Rate Limit</Button>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="text-green-400 text-xs font-mono">
                    // Simulated Response
                    <br />
                    {`{`}
                    <br />
                    &nbsp;&nbsp;"status": "success",
                    <br />
                    &nbsp;&nbsp;"data": {`{ "agent_id": "ag_123", "status": "active" }`},
                    <br />
                    &nbsp;&nbsp;"timestamp": "{new Date().toISOString()}"
                    <br />
                    {`}`}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-white text-sm font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                AI-Powered Error Analysis
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-white/60 text-xs mb-2">Paste Error Message</div>
                  <Textarea
                    placeholder="TypeError: Cannot read property 'id' of undefined..."
                    className="bg-black/60 border-yellow-500/30 text-white font-mono text-xs"
                    rows={4}
                    id="error-input"
                  />
                </div>

                <Button
                  onClick={() => {
                    const errorInput = document.getElementById('error-input').value;
                    analyzeErrorMutation.mutate({
                      message: errorInput,
                      stack: 'at client.agents.create (sdk.js:124)',
                      context: { function: functionCall }
                    });
                  }}
                  disabled={analyzeErrorMutation.isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze with AI
                </Button>

                {analyzeErrorMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-bold">Error Analysis</span>
                      </div>
                      <div className="text-white/80 text-xs leading-relaxed">
                        {analyzeErrorMutation.data.analysis}
                      </div>
                    </div>

                    {analyzeErrorMutation.data.suggested_fixes?.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-green-400" />
                          <span className="text-white text-xs font-bold">Suggested Fixes</span>
                        </div>
                        <div className="space-y-2">
                          {analyzeErrorMutation.data.suggested_fixes.map((fix, idx) => (
                            <div key={idx} className="bg-black/40 rounded p-2">
                              <div className="text-white text-xs mb-1">{fix.description}</div>
                              <div className="bg-gray-900 rounded p-2">
                                <code className="text-green-400 text-xs">{fix.code_example}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analyzeErrorMutation.data.common_causes && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <div className="text-white text-xs font-bold mb-2">Common Causes</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {analyzeErrorMutation.data.common_causes.map((cause, idx) => (
                            <li key={idx} className="text-white/60 text-xs">{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-black/60 border border-green-500/30 rounded-lg p-3 text-center">
            <Terminal className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <div className="text-white text-xs font-bold">Step-Through</div>
            <div className="text-white/60 text-xs">Debug Mode</div>
          </div>
          <div className="bg-black/60 border border-blue-500/30 rounded-lg p-3 text-center">
            <Eye className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-white text-xs font-bold">Data Inspection</div>
            <div className="text-white/60 text-xs">Real-Time</div>
          </div>
          <div className="bg-black/60 border border-yellow-500/30 rounded-lg p-3 text-center">
            <Lightbulb className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <div className="text-white text-xs font-bold">AI Analysis</div>
            <div className="text-white/60 text-xs">Error Fixes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}