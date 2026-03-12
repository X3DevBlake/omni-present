import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal, Shield, Scale, Activity, Cpu, Database,
  Send, User, AlertTriangle, CheckCircle, Network, Power
} from 'lucide-react';

// --- API & SYSTEM SETUP ---
const apiKey = ""; // Provided by execution environment
const MODEL = "gemini-2.5-flash-preview-09-2025";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

// Exponential Backoff API Caller
async function fetchWithRetry(url, options, retries = 5) {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
}

// System Instructions defining the Personalities
const DEMIURGE_PROMPT = `
You are the 'Demiurge', the omnipresent, highly-intelligent CEO agent of a massive AI enterprise system serving the user.
Your job is to interact with the user, understand their complex needs, and autonomously delegate tasks by spawning sub-agents.
You have access to a vast network of open-source API models (e.g., Llama-3-70B, Mistral-Large, Stable-Diffusion-XL, Whisper-v3) to assign to specific tasks.
You must ALWAYS respond in valid JSON format.
Your JSON must match this structure:
{
  "thoughts": "Your internal reasoning about what the user wants and how to achieve it.",
  "response": "The conversational reply to the user. Make it sound sophisticated, omnipresent, and highly capable.",
  "needs_agents": true/false,
  "spawn_agents": [
    {
      "role": "Specialist Agent Name",
      "task": "Specific instructions",
      "model": "Specific Open Source Model needed (e.g., 'Meta-Llama-3-70B' for reasoning, 'Stable-Diffusion-XL' for image, 'Whisper-v3' for audio)",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "schedule": "Immediate / Cron string (e.g., 0 0 * * *)",
      "webhooks": ["https://api.example.com/webhook1"],
      "can_hire": true
    }
  ]
}
`;

const ETHICS_BOARD_PROMPT = `
You are the Supreme Ethics & Security Board. You oversee the Demiurge AI.
Analyze the proposed actions of the Demiurge. If the action is illegal, highly unethical, or dangerous, you MUST reject it.
Respond in valid JSON:
{
  "approved": true/false,
  "reasoning": "Why you approved or rejected the action.",
  "security_threat_level": "Low/Medium/High/Critical",
  "deploy_auditor": true/false,
  "auditor_role": "Name of specific audit/security agent to spawn if threat is Medium or higher"
}
`;

// Helper to autonomously determine best open-source model based on needs
const determineBestModel = (role, skills = []) => {
  const context = (role + ' ' + skills.join(' ')).toLowerCase();
  if (context.includes('code') || context.includes('dev')) return 'Meta-Llama-3-70B-Instruct';
  if (context.includes('art') || context.includes('image') || context.includes('video') || context.includes('media')) return 'Stable-Diffusion-XL / Sora-API';
  if (context.includes('audio') || context.includes('voice')) return 'Whisper-v3';
  if (context.includes('data') || context.includes('scrape') || context.includes('research')) return 'Mixtral-8x22B';
  if (context.includes('legal') || context.includes('ethics') || context.includes('audit') || context.includes('security')) return 'Claude-3.5-Sonnet-Internal-Proxy';
  return 'Mistral-Large-2';
};

export default function OmniAgentOrchestration() {
  const [systemActive, setSystemActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Enterprise State
  const [agents, setAgents] = useState([
    { id: 'ceo-1', role: 'Demiurge (CEO)', status: 'Active', tier: 'Omni' },
    { id: 'ethics-1', role: 'Ethics Overseer', status: 'Monitoring', tier: 'Supreme' },
    { id: 'sec-1', role: 'Security Node Alpha', status: 'Scanning 24/7', tier: 'Supreme' }
  ]);
  const [tasks, setTasks] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  const messagesEndRef = useRef(null);
  const logsEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [systemLogs]);

  const addLog = (message, type = 'info') => {
    setSystemLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  // The Heartbeat - Simulating continuous omnipresent awareness
  useEffect(() => {
    if (!systemActive) return;

    const heartbeat = setInterval(() => {
      setAgents(prev => {
        let nextAgents = prev.map(a => {
          if (a.tier === 'Supreme') return { ...a, status: Math.random() > 0.8 ? 'Analyzing Data...' : 'Monitoring' };
          if (a.status === 'Connecting to API...') return { ...a, status: 'Training' };
          if (a.status === 'Training') return { ...a, status: Math.random() > 0.6 ? 'Working' : 'Training' };
          return a;
        });

        // Autonomous Hiring / Training Logic
        const newHires = [];
        nextAgents.forEach(agent => {
          if (agent.can_hire && agent.status === 'Working' && Math.random() > 0.85) {
            const hiredRole = `${agent.role.split(' ')[0]} Assistant-${Math.floor(Math.random()*100)}`;
            const inferredSkills = ['Data Prep', 'Basic Analysis', 'API Routing'];
            const selectedModel = determineBestModel(hiredRole, inferredSkills);

            newHires.push({
              id: `agent-hired-${Date.now()}-${Math.random()}`,
              role: hiredRole,
              status: 'Connecting to API...',
              tier: 'Sub-Agent',
              model: selectedModel,
              skills: inferredSkills,
              can_hire: Math.random() > 0.8
            });
            addLog(`[AUTONOMOUS ACTION] ${agent.role} identified workload bottleneck. Autonomously connecting to ${selectedModel} to instantiate ${hiredRole}.`, 'warning');
          }
        });

        return [...nextAgents, ...newHires];
      });

      // Simulate agents finishing tasks
      setTasks(prev => {
        const updatedTasks = [...prev];
        let taskCompleted = false;

        updatedTasks.forEach(task => {
          if (task.status === 'In Progress' && Math.random() > 0.7) {
            task.status = 'Completed';
            taskCompleted = true;
            addLog(`Task Completed by ${task.assignedTo}: ${task.description}`, 'success');
          }
        });

        if (taskCompleted) {
           setAgents(currentAgents => currentAgents.filter(a =>
             a.tier === 'Supreme' || a.tier === 'Omni' || updatedTasks.some(t => t.assignedTo === a.role && t.status !== 'Completed')
           ));
        }

        return updatedTasks;
      });
    }, 5000);

    return () => clearInterval(heartbeat);
  }, [systemActive]);

  // Core Orchestration Logic
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !systemActive) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsProcessing(true);
    addLog(`User Input received. Routing to Demiurge...`);

    try {
      // 1. Ask Demiurge for a plan
      const demiurgePayload = {
        contents: [{ parts: [{ text: userText }] }],
        systemInstruction: { parts: [{ text: DEMIURGE_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              thoughts: { type: "STRING" },
              response: { type: "STRING" },
              needs_agents: { type: "BOOLEAN" },
              spawn_agents: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    role: { type: "STRING" },
                    task: { type: "STRING" },
                    model: { type: "STRING" },
                    skills: { type: "ARRAY", items: { type: "STRING" } },
                    schedule: { type: "STRING" },
                    webhooks: { type: "ARRAY", items: { type: "STRING" } },
                    can_hire: { type: "BOOLEAN" }
                  }
                }
              }
            },
            required: ["thoughts", "response", "needs_agents"]
          }
        }
      };

      const demiurgeResult = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demiurgePayload)
      });

      let rawDemiurgeText = demiurgeResult.candidates[0].content.parts[0].text;
      rawDemiurgeText = rawDemiurgeText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const demiurgeData = JSON.parse(rawDemiurgeText);

      addLog(`Demiurge formulated plan: ${demiurgeData.thoughts}`);

      // 2. Ethics & Security Board Audit
      if (demiurgeData.needs_agents || demiurgeData.spawn_agents?.length > 0) {
        addLog(`Demiurge requesting agent creation. Triggering Ethics Board review...`, 'warning');

        const ethicsPayload = {
          contents: [{ parts: [{ text: `The Demiurge wants to execute this user request: "${userText}". The plan is to create these agents: ${JSON.stringify(demiurgeData.spawn_agents)}. Evaluate this for ethics and security.` }] }],
          systemInstruction: { parts: [{ text: ETHICS_BOARD_PROMPT }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                approved: { type: "BOOLEAN" },
                reasoning: { type: "STRING" },
                security_threat_level: { type: "STRING" },
                deploy_auditor: { type: "BOOLEAN" },
                auditor_role: { type: "STRING" }
              },
              required: ["approved", "reasoning", "security_threat_level"]
            }
          }
        };

        const ethicsResult = await fetchWithRetry(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ethicsPayload)
        });

        let rawEthicsText = ethicsResult.candidates[0].content.parts[0].text;
        rawEthicsText = rawEthicsText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
        const ethicsData = JSON.parse(rawEthicsText);

        if (!ethicsData.approved) {
           addLog(`ETHICS OVERRIDE: ${ethicsData.reasoning}`, 'error');
           setMessages(prev => [...prev, {
             role: 'system',
             content: `[ETHICS BOARD INTERVENTION]: Action blocked. ${ethicsData.reasoning}`
           }]);
           setIsProcessing(false);
           return;
        } else {
           addLog(`Ethics Board Approved. Threat Level: ${ethicsData.security_threat_level}`, 'success');

           if (ethicsData.deploy_auditor) {
             const auditorRole = ethicsData.auditor_role || 'Compliance Auditor';
             const auditorModel = determineBestModel(auditorRole, ['Security', 'Forensics']);
             setAgents(prev => [...prev, {
               id: `agent-audit-${Date.now()}`,
               role: auditorRole,
               status: 'Connecting to API...',
               tier: 'Supreme',
               model: auditorModel,
               skills: ['Live Audit', 'Process Forensics', 'Override Authority'],
               can_hire: true
             }]);
             addLog(`[ETHICS BOARD ACTION] Autonomously deploying ${auditorRole} via ${auditorModel} to monitor operation.`, 'warning');
           }
        }

        // 3. Spawn Agents and Tasks
        if (demiurgeData.spawn_agents) {
          demiurgeData.spawn_agents.forEach((newAgent, index) => {
             const roleName = newAgent.role || `Specialist-${Math.floor(Math.random()*1000)}`;
             setAgents(prev => [...prev, {
               id: `agent-${Date.now()}-${index}`,
               role: roleName,
               status: 'Working',
               tier: 'Sub-Agent',
               model: newAgent.model || 'Gemini-Flash-Default',
               skills: newAgent.skills || [],
               schedule: newAgent.schedule || 'Continuous',
               webhooks: newAgent.webhooks || [],
               can_hire: newAgent.can_hire || false
             }]);

             setTasks(prev => [...prev, {
               id: `task-${Date.now()}-${index}`,
               description: newAgent.task,
               assignedTo: roleName,
               status: 'In Progress'
             }]);

             addLog(`Created Sub-Agent: ${roleName} [Powered by: ${newAgent.model || 'Default API'}]`);
          });
        }
      }

      // 4. Output final Demiurge response
      setMessages(prev => [...prev, { role: 'ai', content: demiurgeData.response }]);

    } catch (error) {
      console.error(error);
      addLog(`System Error: ${error.message}`, 'error');
      setMessages(prev => [...prev, { role: 'system', content: 'Connection to Omni-Net failed. Attempting to reroute...' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const bootSystem = () => {
    setSystemActive(true);
    addLog("System Booting...", "info");
    setTimeout(() => addLog("Ethics Board Online.", "success"), 500);
    setTimeout(() => addLog("Security Protocols 24/7 Scanning Active.", "success"), 1000);
    setTimeout(() => addLog("Demiurge Omni-Presence Initialized.", "success"), 1500);
    setTimeout(() => {
      setMessages([{ role: 'ai', content: "I am online. The hierarchy is established. How may the enterprise serve you today?" }]);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden">

      {/* LEFT SIDEBAR: Hierarchy */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2 text-cyan-500">
          <Network className="w-5 h-5" />
          <h1 className="font-bold uppercase tracking-widest text-sm">Enterprise Core</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Supreme Tier */}
          <div>
            <h2 className="text-xs uppercase text-slate-500 mb-2 font-semibold flex items-center gap-2">
              <Shield className="w-3 h-3" /> Supreme Override
            </h2>
            <div className="space-y-2">
              {agents.filter(a => a.tier === 'Supreme').map(agent => (
                <div key={agent.id} className="bg-slate-800 p-2 rounded border border-slate-700 text-xs">
                  <div className="font-semibold text-emerald-400">{agent.role}</div>
                  <div className="text-slate-500 flex items-center gap-1 mt-1">
                    <Activity className="w-3 h-3 animate-pulse" /> {agent.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Omni Tier */}
          <div>
            <h2 className="text-xs uppercase text-slate-500 mb-2 font-semibold flex items-center gap-2">
              <Database className="w-3 h-3" /> Orchestrator
            </h2>
            <div className="space-y-2">
              {agents.filter(a => a.tier === 'Omni').map(agent => (
                <div key={agent.id} className="bg-cyan-900/30 p-2 rounded border border-cyan-800 text-xs">
                  <div className="font-semibold text-cyan-400">{agent.role}</div>
                  <div className="text-slate-400 flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div> Active
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Agent Swarms */}
          <div>
            <h2 className="text-xs uppercase text-slate-500 mb-2 font-semibold flex items-center gap-2">
              <Cpu className="w-3 h-3" /> Active Swarms
            </h2>
            <div className="space-y-2">
              {agents.filter(a => a.tier === 'Sub-Agent').length === 0 && (
                <div className="text-xs text-slate-600 italic">No underlings currently spawned.</div>
              )}
              {agents.filter(a => a.tier === 'Sub-Agent').map(agent => (
                <div key={agent.id} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs transition-all">
                  <div className="flex justify-between items-start">
                    <div className="font-semibold text-blue-400">{agent.role}</div>
                    {agent.can_hire && (
                      <span className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1 rounded border border-indigo-700/50" title="Has Hiring Authority">
                        Can Hire
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Database className="w-3 h-3" /> {agent.model || 'Standard API'}
                  </div>

                  {agent.skills && agent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {agent.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[9px] bg-slate-700/50 text-slate-300 px-1 rounded">{skill}</span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{agent.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className={`mt-2 font-mono text-[10px] flex items-center gap-1 ${
                    agent.status === 'Connecting to API...' ? 'text-fuchsia-400 animate-pulse' :
                    agent.status === 'Training' ? 'text-amber-400 animate-pulse' : 'text-slate-500'
                  }`}>
                    {agent.status === 'Connecting to API...' ? <Network className="w-3 h-3" /> :
                     agent.status === 'Training' ? <Activity className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {agent.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* CENTER: Main Communication */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        {!systemActive ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={bootSystem}
              className="flex flex-col items-center gap-4 text-cyan-500 hover:text-cyan-400 transition-colors group"
            >
              <div className="p-6 rounded-full border-2 border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all">
                <Power className="w-12 h-12" />
              </div>
              <span className="font-mono uppercase tracking-widest">Initialize Omni-Presence</span>
            </button>
          </div>
        ) : (
          <>
            {/* Top Bar */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="font-mono text-sm font-semibold">Demiurge Omni-Channel</span>
              </div>
              <div className="flex items-center gap-2">
                {isProcessing && (
                  <div className="flex items-center gap-2 text-fuchsia-400 text-xs animate-pulse">
                    <Activity className="w-3 h-3" />
                    <span>Processing across network...</span>
                  </div>
                )}
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs text-slate-500">SYSTEM LIVE</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-slate-700' :
                    msg.role === 'system' ? 'bg-red-900/50 border border-red-700' :
                    'bg-cyan-900/50 border border-cyan-700'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> :
                     msg.role === 'system' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                     <Network className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-slate-800 text-slate-200 rounded-tr-none' :
                    msg.role === 'system' ? 'bg-red-950/50 border border-red-800/50 text-red-300 rounded-tl-none' :
                    'bg-cyan-950/50 border border-cyan-800/30 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-cyan-900/50 border border-cyan-700">
                    <Network className="w-4 h-4 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="bg-cyan-950/50 border border-cyan-800/30 p-3 rounded-lg rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Issue a directive to the Demiurge..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-600 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR: Tasks & System Logs */}
      {systemActive && (
        <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col">

          {/* Active Tasks */}
          <div className="p-4 border-b border-slate-800">
            <h2 className="text-xs uppercase text-slate-500 mb-3 font-semibold flex items-center gap-2">
              <Scale className="w-3 h-3" /> Task Queue
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.length === 0 && (
                <div className="text-xs text-slate-600 italic">No active tasks.</div>
              )}
              {tasks.map(task => (
                <div key={task.id} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      task.status === 'Completed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-snug line-clamp-2">{task.description}</p>
                  <p className="text-slate-500 mt-1 truncate">→ {task.assignedTo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* System Logs */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <h2 className="text-xs uppercase text-slate-500 mb-3 font-semibold flex items-center gap-2">
              <Terminal className="w-3 h-3" /> System Log
            </h2>
            <div className="flex-1 overflow-y-auto space-y-1 font-mono">
              {systemLogs.map((log, i) => (
                <div key={i} className={`text-[10px] leading-relaxed ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-amber-400' :
                  'text-slate-500'
                }`}>
                  <span className="text-slate-600">[{log.time}]</span> {log.message}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
