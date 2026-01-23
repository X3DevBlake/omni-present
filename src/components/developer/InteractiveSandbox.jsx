import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function InteractiveSandbox() {
  const [sandboxName, setSandboxName] = useState('');
  const [activeSandbox, setActiveSandbox] = useState(null);
  const [testResults, setTestResults] = useState([]);

  const createSandboxMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sandboxOrchestrator', {
        action: 'create_sandbox',
        name: sandboxName || 'Test Sandbox',
        config: { integration_type: 'agent_plugin' }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setActiveSandbox(data.sandbox);
      toast.success('Sandbox environment created!');
    }
  });

  const runTestsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sandboxOrchestrator', {
        action: 'run_integration_test',
        sandbox_id: activeSandbox.sandbox_id,
        test_config: {}
      });
      return response.data;
    },
    onSuccess: (data) => {
      setTestResults(data.test_results);
      toast.success('Tests completed!');
    }
  });

  return (
    <Card className="bg-black/40 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TestTube className="w-5 h-5 text-green-400" />
          Interactive Sandbox Environment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Sandbox name..."
              value={sandboxName}
              onChange={(e) => setSandboxName(e.target.value)}
              className="bg-black/60 border-green-500/30 text-white"
            />
            <Button 
              onClick={() => createSandboxMutation.mutate()}
              disabled={createSandboxMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Sandbox
            </Button>
          </div>

          {activeSandbox && (
            <div className="bg-green-500/20 border border-green-500/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-bold">{activeSandbox.environment_name}</div>
                  <div className="text-white/60 text-xs">ID: {activeSandbox.sandbox_id}</div>
                </div>
                <Badge className="bg-green-500/30 text-green-300">ACTIVE</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-black/40 p-2 rounded text-center">
                  <div className="text-white/60 text-xs">API Calls</div>
                  <div className="text-white font-bold">
                    {activeSandbox.resource_limits.max_api_calls}
                  </div>
                </div>
                <div className="bg-black/40 p-2 rounded text-center">
                  <div className="text-white/60 text-xs">Compute (s)</div>
                  <div className="text-white font-bold">
                    {activeSandbox.resource_limits.max_compute_seconds}
                  </div>
                </div>
                <div className="bg-black/40 p-2 rounded text-center">
                  <div className="text-white/60 text-xs">Storage (MB)</div>
                  <div className="text-white font-bold">
                    {activeSandbox.resource_limits.max_storage_mb}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => runTestsMutation.mutate()}
                disabled={runTestsMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Integration Tests
              </Button>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-white font-bold mb-2">Test Results</div>
              {testResults.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    test.passed
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-red-500/20 border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white font-bold text-sm">{test.test_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-white/60" />
                      <span className="text-white/60 text-xs">{test.execution_time_ms}ms</span>
                    </div>
                  </div>
                  <div className="text-white/70 text-xs mt-1">{test.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}