import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, RotateCcw, Bug, AlertCircle } from 'lucide-react';

function DebugAgent({ agent, isActive, breakpoints = [] }) {
  const meshRef = useRef();
  const [currentLine, setCurrentLine] = useState(0);

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      meshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const position = agent.position || [0, 0, 0];

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.5, 16, 16]}>
        <meshStandardMaterial
          color={isActive ? "#00FF00" : "#888888"}
          emissive={isActive ? "#00FF00" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
        />
      </Sphere>
      
      {isActive && (
        <>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.3}
            color="#FFFF00"
            anchorX="center"
            anchorY="middle"
          >
            {agent.id}
          </Text>
          <Text
            position={[0, -1.2, 0]}
            fontSize={0.2}
            color="#00FFFF"
            anchorX="center"
            anchorY="middle"
          >
            Line: {currentLine}
          </Text>
        </>
      )}

      {/* Breakpoint indicators */}
      {breakpoints.includes(agent.id) && (
        <Sphere position={[1, 0, 0]} args={[0.2, 8, 8]}>
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={1} />
        </Sphere>
      )}
    </group>
  );
}

function DataFlowLine({ from, to, active }) {
  const points = [from, to];

  return (
    <Line
      points={points}
      color={active ? "#00FFFF" : "#444444"}
      lineWidth={active ? 3 : 1}
      transparent
      opacity={active ? 0.8 : 0.3}
    />
  );
}

function DebugScene({ agents, activeAgent, dataFlows, breakpoints }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0088FF" />
      
      <OrbitControls enablePan={true} enableZoom={true} />

      {agents.map((agent, idx) => (
        <DebugAgent
          key={agent.id}
          agent={agent}
          isActive={activeAgent === agent.id}
          breakpoints={breakpoints}
        />
      ))}

      {dataFlows.map((flow, idx) => (
        <DataFlowLine
          key={idx}
          from={flow.from}
          to={flow.to}
          active={flow.active}
        />
      ))}

      <gridHelper args={[20, 20, '#222222', '#111111']} />
    </>
  );
}

export default function SpatialSDKDebugger3D() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgent, setActiveAgent] = useState('agent_1');
  const [breakpoints, setBreakpoints] = useState([]);
  const [testCode, setTestCode] = useState(`// Test spatial navigation
const agent = new SpatialAgent();
agent.moveTo({ x: 5, y: 0, z: 5 });
agent.scanEnvironment();
agent.avoidObstacles();`);

  const agents = [
    { id: 'agent_1', position: [0, 0, 0] },
    { id: 'agent_2', position: [5, 0, 5] },
    { id: 'agent_3', position: [-5, 0, 5] }
  ];

  const dataFlows = [
    { from: [0, 0, 0], to: [5, 0, 5], active: isRunning },
    { from: [5, 0, 5], to: [-5, 0, 5], active: isRunning }
  ];

  const toggleBreakpoint = (agentId) => {
    setBreakpoints(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 3D Visualization */}
      <div className="lg:col-span-2">
        <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Spatial Debugger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full rounded-lg overflow-hidden bg-black">
              <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000011', 10, 40]} />
                <DebugScene
                  agents={agents}
                  activeAgent={activeAgent}
                  dataFlows={dataFlows}
                  breakpoints={breakpoints}
                />
              </Canvas>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
                className="gap-2"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Run'}
              </Button>
              <Button variant="outline" onClick={() => setIsRunning(false)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              {agents.map(agent => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveAgent(agent.id)}
                  className={activeAgent === agent.id ? 'bg-indigo-900' : ''}
                >
                  {agent.id}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code & Controls */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Test Code</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="bg-slate-950 text-green-400 font-mono text-sm min-h-40 border-slate-700"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Breakpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agents.map(agent => (
              <div
                key={agent.id}
                onClick={() => toggleBreakpoint(agent.id)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                <span className="text-white text-sm">{agent.id}</span>
                {breakpoints.includes(agent.id) && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Call Stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 p-2 rounded">scanEnvironment()</div>
            <div className="bg-slate-950 p-2 rounded">processSemanticGraph()</div>
            <div className="bg-slate-950 p-2 rounded">detectObstacles()</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}