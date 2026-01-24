import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cone, Line, Text, Html } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as THREE from 'three';
import { Cpu, Play, RotateCcw, Layers, Save, Download } from 'lucide-react';

const QuantumGate = ({ position, gate, isActive }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  const gateColors = {
    'H': '#3b82f6',    // Hadamard - blue
    'X': '#ef4444',    // Pauli-X - red
    'Y': '#10b981',    // Pauli-Y - green
    'Z': '#8b5cf6',    // Pauli-Z - purple
    'CNOT': '#f59e0b', // CNOT - amber
    'T': '#ec4899'     // T gate - pink
  };

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.8, 0.8, 0.2]}>
        <meshStandardMaterial
          color={gateColors[gate.type] || '#6b7280'}
          emissive={gateColors[gate.type] || '#000000'}
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </Box>
      <Text position={[0, 0, 0.2]} fontSize={0.4} color="white" anchorX="center">
        {gate.type}
      </Text>
    </group>
  );
};

const QubitWire = ({ position, state, label }) => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
      const phase = state.clock.elapsedTime * 2;
      sphereRef.current.rotation.y = phase;
    }
  });

  return (
    <group position={position}>
      {/* Wire line */}
      <Box args={[12, 0.05, 0.05]}>
        <meshStandardMaterial color="#4b5563" />
      </Box>
      {/* State indicator */}
      <Sphere ref={sphereRef} args={[0.2, 32, 32]} position={[-6.5, 0, 0]}>
        <meshStandardMaterial
          color={state === '1' ? '#10b981' : '#3b82f6'}
          emissive={state === '1' ? '#10b981' : '#3b82f6'}
          emissiveIntensity={0.8}
        />
      </Sphere>
      <Text position={[-7.5, 0, 0]} fontSize={0.3} color="white">
        |{label}⟩
      </Text>
    </group>
  );
};

const MeasurementResult = ({ position, qubitStates }) => {
  return (
    <group position={position}>
      <Cone args={[0.4, 1, 32]} rotation={[0, 0, -Math.PI / 2]}>
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.7}
        />
      </Cone>
      <Html distanceFactor={8}>
        <div className="bg-black/90 border border-amber-500/50 rounded-lg p-3 min-w-[150px]">
          <div className="text-amber-400 font-bold text-sm mb-1">Measurement</div>
          <div className="text-white font-mono text-xs">
            {qubitStates.join('')}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default function QuantumCircuitBuilder3D() {
  const [circuit, setCircuit] = useState([
    { qubit: 0, gate: { type: 'H' }, position: 0 },
    { qubit: 0, gate: { type: 'CNOT', control: 0, target: 1 }, position: 1 },
    { qubit: 1, gate: { type: 'X' }, position: 2 }
  ]);

  const [qubitCount, setQubitCount] = useState(3);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [qubitStates, setQubitStates] = useState(['0', '0', '0']);
  const [measurementResult, setMeasurementResult] = useState(null);
  const [savedStates, setSavedStates] = useState([]);
  const [experimentResults, setExperimentResults] = useState([]);
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [draggedGate, setDraggedGate] = useState(null);

  const executeCircuit = () => {
    setIsExecuting(true);
    setExecutionStep(0);
    
    // Step-by-step execution visualization
    const stepInterval = setInterval(() => {
      setExecutionStep(step => {
        if (step >= circuit.length) {
          clearInterval(stepInterval);
          const result = qubitStates.map(() => Math.random() > 0.5 ? '1' : '0');
          setQubitStates(result);
          setMeasurementResult(result);
          
          // Record experiment
          const experimentData = {
            circuit: circuit.map(c => c.gate.type).join('-'),
            result: result.join(''),
            timestamp: Date.now(),
            parameters: { qubitCount, gateCount: circuit.length }
          };
          setExperimentResults([experimentData, ...experimentResults.slice(0, 9)]);
          
          setIsExecuting(false);
          return 0;
        }
        return step + 1;
      });
    }, 500);
  };

  const addGate = (qubit, gateType) => {
    const newGate = { 
      qubit: qubit !== undefined ? qubit : selectedQubit, 
      gate: { type: gateType }, 
      position: circuit.length 
    };
    setCircuit([...circuit, newGate]);
  };

  const removeGate = (index) => {
    setCircuit(circuit.filter((_, i) => i !== index));
  };

  const saveState = () => {
    const state = {
      name: `Circuit ${savedStates.length + 1}`,
      circuit: [...circuit],
      qubitCount,
      timestamp: Date.now()
    };
    setSavedStates([...savedStates, state]);
  };

  const loadState = (state) => {
    setCircuit(state.circuit);
    setQubitCount(state.qubitCount);
    setQubitStates(Array(state.qubitCount).fill('0'));
    setMeasurementResult(null);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-blue-400" />
          Quantum Circuit Builder & Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="circuit" className="mb-4">
          <TabsList className="bg-white/10">
            <TabsTrigger value="circuit">Circuit</TabsTrigger>
            <TabsTrigger value="bloch">Bloch Sphere</TabsTrigger>
            <TabsTrigger value="statevector">State Vector</TabsTrigger>
          </TabsList>

          <TabsContent value="circuit">
            <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4">
              <Canvas camera={{ position: [0, 0, 18], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[15, 15, 15]} />

                {/* Qubit wires */}
                {Array.from({ length: qubitCount }).map((_, idx) => (
                  <QubitWire
                    key={idx}
                    position={[0, 3 - idx * 1.5, 0]}
                    state={qubitStates[idx]}
                    label={`q${idx}`}
                  />
                ))}

                {/* Gates */}
                {circuit.map((op, idx) => {
                  const x = -5 + op.position * 2.5;
                  const y = 3 - op.qubit * 1.5;
                  const isCurrentStep = isExecuting && idx === executionStep;

                  if (op.gate.type === 'CNOT') {
                    return (
                      <group key={idx} onClick={() => removeGate(idx)}>
                        <QuantumGate
                          position={[x, 3 - op.gate.control * 1.5, 0]}
                          gate={{ type: '●' }}
                          isActive={isCurrentStep}
                        />
                        <QuantumGate
                          position={[x, 3 - op.gate.target * 1.5, 0]}
                          gate={{ type: '⊕' }}
                          isActive={isCurrentStep}
                        />
                        <Line
                          points={[
                            new THREE.Vector3(x, 3 - op.gate.control * 1.5, 0),
                            new THREE.Vector3(x, 3 - op.gate.target * 1.5, 0)
                          ]}
                          color={isCurrentStep ? '#10b981' : '#f59e0b'}
                          lineWidth={isCurrentStep ? 4 : 2}
                        />
                      </group>
                    );
                  }

                  return (
                    <group key={idx} onClick={() => removeGate(idx)}>
                      <QuantumGate
                        position={[x, y, 0]}
                        gate={op.gate}
                        isActive={isCurrentStep}
                      />
                    </group>
                  );
                })}

                {/* Measurement */}
                {measurementResult && (
                  <MeasurementResult
                    position={[6, 1.5, 0]}
                    qubitStates={measurementResult}
                  />
                )}

                <OrbitControls enableZoom />
              </Canvas>
            </div>
          </TabsContent>

          <TabsContent value="bloch">
            <div className="h-[500px] bg-black rounded-lg overflow-hidden mb-4 flex items-center justify-center">
              <Canvas camera={{ position: [3, 3, 5], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} />

                {/* Bloch sphere */}
                <Sphere args={[2, 64, 64]}>
                  <meshStandardMaterial
                    color="#1e40af"
                    transparent
                    opacity={0.1}
                    wireframe
                  />
                </Sphere>

                {/* Axes */}
                <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#ef4444" lineWidth={2} />
                <Line points={[[0, -3, 0], [0, 3, 0]]} color="#10b981" lineWidth={2} />
                <Line points={[[0, 0, -3], [0, 0, 3]]} color="#3b82f6" lineWidth={2} />

                {/* State vector */}
                <Cone args={[0.2, 0.8, 32]} position={[0, 2, 0]}>
                  <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.8} />
                </Cone>

                <Text position={[3.5, 0, 0]} fontSize={0.3} color="#ef4444">X</Text>
                <Text position={[0, 3.5, 0]} fontSize={0.3} color="#10b981">Y</Text>
                <Text position={[0, 0, 3.5]} fontSize={0.3} color="#3b82f6">Z</Text>

                <OrbitControls enableZoom />
              </Canvas>
            </div>
          </TabsContent>

          <TabsContent value="statevector">
            <div className="bg-black/60 rounded-lg p-4 h-[500px] overflow-y-auto">
              <div className="text-white font-mono text-sm space-y-2">
                <div className="text-purple-400 mb-3">State Vector |ψ⟩:</div>
                {Array.from({ length: Math.pow(2, qubitCount) }).map((_, idx) => {
                  const binary = idx.toString(2).padStart(qubitCount, '0');
                  const amplitude = (Math.random() * 0.5).toFixed(3);
                  const phase = (Math.random() * Math.PI).toFixed(2);
                  return (
                    <div key={idx} className="text-gray-300">
                      {amplitude} e^(i{phase}) |{binary}⟩
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={executeCircuit}
            disabled={isExecuting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? `Executing Step ${executionStep + 1}/${circuit.length}` : 'Execute Circuit'}
          </Button>
          <Button onClick={saveState} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setCircuit([]);
              setQubitStates(Array(qubitCount).fill('0'));
              setMeasurementResult(null);
              setExecutionStep(0);
            }}
            variant="outline"
            className="border-white/20 text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-4">
          <label className="text-white text-sm mb-2 block">Selected Qubit: {selectedQubit}</label>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: qubitCount }).map((_, i) => (
              <Button
                key={i}
                size="sm"
                onClick={() => setSelectedQubit(i)}
                className={selectedQubit === i ? 'bg-blue-600' : 'bg-gray-700'}
              >
                q{i}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={() => {
                setQubitCount(qubitCount + 1);
                setQubitStates([...qubitStates, '0']);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              + Qubit
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button size="sm" onClick={() => addGate(selectedQubit, 'H')} className="bg-blue-600">H</Button>
          <Button size="sm" onClick={() => addGate(selectedQubit, 'X')} className="bg-red-600">X</Button>
          <Button size="sm" onClick={() => addGate(selectedQubit, 'Y')} className="bg-green-600">Y</Button>
          <Button size="sm" onClick={() => addGate(selectedQubit, 'Z')} className="bg-purple-600">Z</Button>
          <Button size="sm" onClick={() => setCircuit([...circuit, { qubit: 0, gate: { type: 'CNOT', control: 0, target: 1 }, position: circuit.length }])} className="bg-amber-600">
            CNOT
          </Button>
          <Button size="sm" onClick={() => addGate(selectedQubit, 'T')} className="bg-pink-600">T</Button>
        </div>

        {/* Saved States & Experiment Comparison */}
        {(savedStates.length > 0 || experimentResults.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {savedStates.length > 0 && (
              <div className="mb-3">
                <h4 className="text-white text-xs font-bold mb-2">Saved States:</h4>
                <div className="flex gap-2 flex-wrap">
                  {savedStates.map((state, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      onClick={() => loadState(state)}
                      className="bg-purple-600 hover:bg-purple-700 text-xs"
                    >
                      {state.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {experimentResults.length > 0 && (
              <div>
                <h4 className="text-white text-xs font-bold mb-2">Experiment History:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {experimentResults.map((exp, idx) => (
                    <div key={idx} className="bg-black/40 rounded p-2 text-xs">
                      <div className="text-gray-400">{exp.circuit}</div>
                      <div className="text-white font-mono">Result: |{exp.result}⟩</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}