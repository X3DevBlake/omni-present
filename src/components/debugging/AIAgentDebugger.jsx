import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, Zap, FileText, TestTube, AlertCircle, Code, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAgentDebugger() {
  const [logs, setLogs] = useState([
    { timestamp: '2026-01-09 14:23:11', agent: 'Alpha', level: 'error', message: 'Failed to process data batch #47' },
    { timestamp: '2026-01-09 14:22:58', agent: 'Beta', level: 'warning', message: 'High memory usage detected (87%)' },
    { timestamp: '2026-01-09 14:22:45', agent: 'Alpha', level: 'info', message: 'Task completed successfully' },
    { timestamp: '2026-01-09 14:22:32', agent: 'Gamma', level: 'error', message: 'Connection timeout to knowledge base' }
  ]);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [codeFixes, setCodeFixes] = useState([]);
  const [applyingFix, setApplyingFix] = useState(false);
  const [agentState, setAgentState] = useState({
    Alpha: { status: 'running', cpu: 45, memory: 67, tasks: 12 },
    Beta: { status: 'running', cpu: 32, memory: 87, tasks: 8 },
    Gamma: { status: 'error', cpu: 12, memory: 34, tasks: 3 }
  });

  const analyzeLogs = async () => {
    setAnalyzing(true);
    const errorLogs = logs.filter(l => l.level === 'error' || l.level === 'warning');
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze these agent error logs and identify patterns, root causes, and suggest fixes:\n${JSON.stringify(errorLogs, null, 2)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'string' } },
          root_causes: { type: 'array', items: { type: 'string' } },
          suggested_fixes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                fix: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          severity: { type: 'string' }
        }
      }
    });

    setAnalysis(response);
    setAnalyzing(false);
  };

  const generateTestCases = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on these error patterns: ${JSON.stringify(analysis?.patterns || [])}, generate 3-4 test cases to prevent these issues.`,
      response_json_schema: {
        type: 'object',
        properties: {
          test_cases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                test_steps: { type: 'array', items: { type: 'string' } },
                expected_outcome: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setTestCases(response.test_cases);
  };

  const generateCodeFixes = async () => {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate code snippets to fix these issues: ${JSON.stringify(analysis?.suggested_fixes || [])}. Provide working code solutions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          fixes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                code_snippet: { type: 'string' },
                explanation: { type: 'string' },
                test_code: { type: 'string' },
                complexity: { type: 'string' }
              }
            }
          }
        }
      }
    });

    setCodeFixes(response.fixes);
  };

  const applyFix = async (fix) => {
    setApplyingFix(true);
    // Simulate applying the fix
    await new Promise(resolve => setTimeout(resolve, 1500));
    setApplyingFix(false);
    alert(`Applied fix for: ${fix.issue}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-400" />
            AI Agent Debugger
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={analyzeLogs}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-400 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {analyzing ? 'Analyzing...' : 'Analyze Logs'}
          </motion.button>
        </div>

        {/* Real-time Agent State */}
        <div className="mb-6">
          <h4 className="text-white font-bold mb-3 text-sm">Real-Time Agent State</h4>
          <div className="grid md:grid-cols-3 gap-3">
            {Object.entries(agentState).map(([name, state]) => (
              <div key={name} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">{name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    state.status === 'running' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {state.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">CPU</span>
                      <span className="text-cyan-400">{state.cpu}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${state.cpu}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/60">Memory</span>
                      <span className={state.memory > 80 ? 'text-red-400' : 'text-green-400'}>{state.memory}%</span>
                    </div>
                    <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className={`h-full ${state.memory > 80 ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${state.memory}%` }} />
                    </div>
                  </div>
                  <p className="text-white/60">Active Tasks: <span className="text-white font-bold">{state.tasks}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log Stream */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Agent Logs
            </h4>
          </div>
          <div className="bg-black/60 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className={`mb-2 ${
                log.level === 'error' ? 'text-red-400' :
                log.level === 'warning' ? 'text-yellow-400' :
                'text-white/60'
              }`}>
                <span className="text-white/40">[{log.timestamp}]</span>
                <span className="text-purple-400 mx-2">{log.agent}</span>
                <span className="font-bold uppercase">{log.level}:</span> {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-xl border mb-6 ${
              analysis.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
              analysis.severity === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-yellow-500/10 border-yellow-500/30'
            }`}
          >
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              AI Analysis Results
            </h4>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-xs mb-2">Identified Patterns:</p>
                {analysis.patterns.map((pattern, idx) => (
                  <p key={idx} className="text-white text-sm mb-1">• {pattern}</p>
                ))}
              </div>
              <div>
                <p className="text-white/60 text-xs mb-2">Root Causes:</p>
                {analysis.root_causes.map((cause, idx) => (
                  <p key={idx} className="text-orange-400 text-sm mb-1">⚠ {cause}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-white/60 text-xs mb-2">Suggested Fixes:</p>
              <div className="space-y-2">
                {analysis.suggested_fixes.map((fix, idx) => (
                  <div key={idx} className="p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">{fix.issue}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        fix.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        fix.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {fix.priority}
                      </span>
                    </div>
                    <p className="text-cyan-400 text-sm">→ {fix.fix}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={generateTestCases}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Generate Test Cases
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={generateCodeFixes}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                Generate Code Fixes
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Code Fixes */}
        {codeFixes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-xl mb-6"
          >
            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              AI-Generated Code Fixes
            </h4>
            <div className="space-y-3">
              {codeFixes.map((fix, idx) => (
                <div key={idx} className="p-4 bg-black/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-bold text-sm">{fix.issue}</h5>
                    <span className={`px-2 py-1 rounded text-xs ${
                      fix.complexity === 'simple' ? 'bg-green-500/20 text-green-400' :
                      fix.complexity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {fix.complexity}
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mb-3">{fix.explanation}</p>
                  <div className="bg-black/50 rounded p-3 mb-2 font-mono text-xs text-green-400 overflow-x-auto">
                    <pre>{fix.code_snippet}</pre>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded p-3 mb-3">
                    <p className="text-purple-400 text-xs font-semibold mb-1">Unit Test:</p>
                    <pre className="font-mono text-xs text-white/70">{fix.test_code}</pre>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => applyFix(fix)}
                    disabled={applyingFix}
                    className="w-full px-3 py-2 bg-green-500/20 border border-green-500/50 rounded text-green-400 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    {applyingFix ? 'Applying...' : 'Apply Fix & Run Tests'}
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generated Test Cases */}
        {testCases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-xl"
          >
            <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Auto-Generated Test Cases
            </h4>
            <div className="space-y-3">
              {testCases.map((test, idx) => (
                <div key={idx} className="p-3 bg-black/20 rounded-lg">
                  <h5 className="text-white font-bold text-sm mb-2">{test.name}</h5>
                  <p className="text-white/70 text-xs mb-2">{test.description}</p>
                  <div className="mb-2">
                    <p className="text-white/60 text-xs mb-1">Test Steps:</p>
                    {test.test_steps.map((step, sIdx) => (
                      <p key={sIdx} className="text-white text-xs ml-2">{sIdx + 1}. {step}</p>
                    ))}
                  </div>
                  <p className="text-green-400 text-xs">Expected: {test.expected_outcome}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}