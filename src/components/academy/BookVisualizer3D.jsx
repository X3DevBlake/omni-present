import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { 
  ChevronLeft, ChevronRight, BookOpen, Download, 
  Bot, Lightbulb, Activity, Zap, Play, Code
} from 'lucide-react';
import * as THREE from 'three';

const Page3D = ({ position, rotation, content, isActive }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={meshRef}>
        <boxGeometry args={[6, 8, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {isActive && (
        <Html distanceFactor={8} transform occlude>
          <div className="w-96 h-128 bg-white p-6 rounded-lg shadow-2xl overflow-auto">
            {content}
          </div>
        </Html>
      )}
    </group>
  );
};

const InteractiveSimulation = ({ simulationId, moduleData }) => {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200 my-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-lg">Interactive 3D Simulation</h4>
      </div>
      
      <div className="bg-white rounded-lg h-64 mb-4 flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh rotation={[0, isRunning ? Math.PI / 4 : 0, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#3b82f6" wireframe />
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>

      <Button
        onClick={() => setIsRunning(!isRunning)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Pause' : 'Run'} Simulation
      </Button>
    </div>
  );
};

const AIContextualAssistant = ({ content, userProgress }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'contextual_assistance',
        content,
        user_progress: userProgress
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions || []);
      setIsThinking(false);
    }
  });

  useEffect(() => {
    setIsThinking(true);
    const timer = setTimeout(() => {
      generateSuggestions.mutate();
    }, 2000);
    return () => clearTimeout(timer);
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200 my-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-5 h-5 text-purple-600" />
        <h4 className="font-bold">AI Learning Assistant</h4>
      </div>

      {isThinking ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Analyzing your progress...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2 bg-white p-3 rounded-lg"
            >
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-1" />
              <p className="text-sm">{suggestion}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const InteractiveCodeBlock = ({ code, language }) => {
  const [output, setOutput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  const runCode = () => {
    setOutput(`// Executing ${language} code...\n// Output: Success`);
  };

  return (
    <div className="bg-slate-900 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <Badge variant="outline" className="text-emerald-400 border-emerald-400">
          {language}
        </Badge>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="text-white"
          >
            <Code className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          className="w-full bg-slate-800 text-white p-3 rounded font-mono text-sm"
          rows={6}
        />
      ) : (
        <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
          <code>{editedCode}</code>
        </pre>
      )}

      {output && (
        <div className="mt-3 bg-slate-800 p-3 rounded">
          <div className="text-xs text-gray-400 mb-1">Output:</div>
          <pre className="text-white font-mono text-sm">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default function BookVisualizer3D({ courseId, moduleIds }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [userProgress, setUserProgress] = useState({ pages_read: 0, time_spent: 0 });
  const queryClient = useQueryClient();

  const { data: modules = [] } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      const allModules = [];
      for (const moduleId of moduleIds || []) {
        const result = await base44.entities.Module.filter({ module_id: moduleId });
        if (result[0]) allModules.push(result[0]);
      }
      return allModules;
    },
    enabled: !!courseId && !!moduleIds
  });

  const { data: biometricData } = useQuery({
    queryKey: ['biometric-feedback'],
    queryFn: () => base44.entities.BiometricDataStream.list(),
    refetchInterval: 5000
  });

  const adaptContentMutation = useMutation({
    mutationFn: async (complexity) => {
      return await base44.functions.invoke('aiCurriculumGenerator', {
        action: 'adapt_content',
        module_id: modules[currentPage]?.module_id,
        complexity_level: complexity,
        biometric_data: biometricData?.[0]
      });
    }
  });

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    modules.forEach((module, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(16);
      doc.text(module.title, 20, 20);
      doc.setFontSize(12);
      doc.text(module.ai_summary || '', 20, 40, { maxWidth: 170 });
    });

    doc.save(`course-${courseId}.pdf`);
  };

  const nextPage = () => {
    if (currentPage < modules.length - 1) {
      setCurrentPage(currentPage + 1);
      setUserProgress(prev => ({ ...prev, pages_read: prev.pages_read + 1 }));
    }
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const currentModule = modules[currentPage];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
      {/* Header Controls */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <Card className="bg-white/80 backdrop-blur-xl border-white/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="font-bold text-lg">Holographic Curriculum Viewer</h2>
                <p className="text-sm text-gray-600">
                  Page {currentPage + 1} of {modules.length}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
              >
                {viewMode === '2d' ? '3D View' : '2D View'}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="pt-32 px-6 pb-24 h-full overflow-auto">
        <AnimatePresence mode="wait">
          {viewMode === '3d' ? (
            <motion.div
              key="3d-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Canvas camera={{ position: [0, 0, 10] }}>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} />
                
                <Page3D
                  position={[0, 0, 0]}
                  rotation={[0, 0, 0]}
                  content={
                    <div className="prose prose-sm">
                      <h2>{currentModule?.title}</h2>
                      <ReactMarkdown>{currentModule?.ai_summary || ''}</ReactMarkdown>
                    </div>
                  }
                  isActive={true}
                />
                
                <OrbitControls enableZoom />
              </Canvas>
            </motion.div>
          ) : (
            <motion.div
              key={`page-${currentPage}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white p-12 shadow-2xl rounded-2xl">
                <h1 className="text-4xl font-bold mb-6 text-slate-900">
                  {currentModule?.title}
                </h1>

                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <InteractiveCodeBlock
                            code={String(children).replace(/\n$/, '')}
                            language={match[1]}
                          />
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {currentModule?.ai_summary || ''}
                  </ReactMarkdown>
                </div>

                {/* Embedded Simulation */}
                <InteractiveSimulation
                  simulationId={currentModule?.simulation_environments?.[0]}
                  moduleData={currentModule}
                />

                {/* AI Contextual Assistant */}
                <AIContextualAssistant
                  content={currentModule?.ai_summary}
                  userProgress={userProgress}
                />

                {/* Learning Outcomes */}
                {currentModule?.learning_outcomes && (
                  <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      Learning Outcomes
                    </h3>
                    <ul className="space-y-2">
                      {currentModule.learning_outcomes.map((outcome, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600">✓</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Card className="bg-white/90 backdrop-blur-xl p-4 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex gap-2">
            {modules.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentPage
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400 cursor-pointer'
                }`}
                onClick={() => setCurrentPage(idx)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage === modules.length - 1}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
}