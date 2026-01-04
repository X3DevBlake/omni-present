import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Plus, Minus, Edit, AlertCircle, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function DiffComponent({ component, changeType, position }) {
  const colors = {
    added: '#10b981',
    removed: '#ef4444',
    modified: '#f59e0b'
  };

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={component.size || [0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={colors[changeType]}
          transparent
          opacity={0.7}
          emissive={colors[changeType]}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh>
        <boxGeometry args={component.size?.map(s => s * 1.05) || [0.55, 0.55, 0.55]} />
        <meshBasicMaterial color={colors[changeType]} wireframe transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export default function Visual3DDiff({ version1, version2, onClose }) {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeVersionDiff();
  }, [version1, version2]);

  const analyzeVersionDiff = async () => {
    setIsAnalyzing(true);

    try {
      const prompt = `
        Analyze version differences between two AI infrastructure blueprints:
        
        Version 1: ${JSON.stringify(version1)}
        Version 2: ${JSON.stringify(version2)}
        
        Identify:
        1. Component changes (added, removed, modified)
        2. Potential conflicts or incompatibilities
        3. Performance implications of changes
        4. Security impact assessment
        5. Unexpected interactions between changed components
        
        Provide actionable insights for merge conflict resolution.
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            changes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  component: { type: 'string' },
                  changeType: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            },
            conflicts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  conflict: { type: 'string' },
                  severity: { type: 'string' },
                  resolution: { type: 'string' }
                }
              }
            },
            performanceImpact: { type: 'string' },
            securityImpact: { type: 'string' }
          }
        }
      });

      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Diff analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mockChanges = [
    { component: 'GPU Array 1', type: 'modified', position: [1.2, 0, 0], details: 'Upgraded from A100 to H100' },
    { component: 'Storage Tier', type: 'added', position: [0, -1.5, 0], details: 'Added NVMe cache layer' },
    { component: 'Legacy Network', type: 'removed', position: [-1.5, 0, 0], details: 'Removed 10Gbps adapter' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden flex"
      >
        {/* 3D Visualization */}
        <div className="flex-1 relative">
          <Canvas camera={{ position: [4, 3, 4], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {mockChanges.map((change, idx) => (
              <DiffComponent
                key={idx}
                component={change}
                changeType={change.type}
                position={change.position}
              />
            ))}
            <OrbitControls />
          </Canvas>
          <div className="absolute top-4 right-4 space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40">
              <Plus className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">Added</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40">
              <Minus className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">Removed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40">
              <Edit className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Modified</span>
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="w-96 p-6 border-l border-white/20 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-cyan-400" />
              <h3 className="text-white font-semibold">AI Analysis</h3>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {aiAnalysis && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white/80 font-semibold mb-2">Changes Detected</h4>
                {aiAnalysis.changes?.map((change, idx) => (
                  <div key={idx} className="mb-2 p-3 rounded-lg bg-white/5">
                    <div className="text-white font-medium text-sm">{change.component}</div>
                    <div className="text-white/60 text-xs">{change.details}</div>
                  </div>
                ))}
              </div>

              {aiAnalysis.conflicts?.length > 0 && (
                <div>
                  <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Potential Conflicts
                  </h4>
                  {aiAnalysis.conflicts.map((conflict, idx) => (
                    <div key={idx} className="mb-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <div className="text-orange-400 text-sm mb-1">{conflict.conflict}</div>
                      <div className="text-white/60 text-xs mb-2">Severity: {conflict.severity}</div>
                      <div className="text-white/80 text-xs">Resolution: {conflict.resolution}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="text-cyan-400 text-sm mb-1">Performance Impact</div>
                <div className="text-white/80 text-xs">{aiAnalysis.performanceImpact}</div>
              </div>

              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="text-purple-400 text-sm mb-1">Security Impact</div>
                <div className="text-white/80 text-xs">{aiAnalysis.securityImpact}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}