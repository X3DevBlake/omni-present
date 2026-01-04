import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Scan, X, Loader2, Box, Sparkles } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GlassCard from './GlassCard';

function HolographicAI({ position, isActive }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* AI core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#00f5ff"
          emissive="#00f5ff"
          emissiveIntensity={isActive ? 0.8 : 0.3}
          transparent
          opacity={0.7}
          wireframe
        />
      </mesh>
      
      {/* Orbital rings */}
      {[0.5, 0.7, 0.9].map((radius, idx) => (
        <mesh key={idx} rotation={[Math.PI / 2, 0, idx * Math.PI / 3]}>
          <torusGeometry args={[radius, 0.02, 16, 100]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={isActive ? 0.6 : 0.2}
          />
        </mesh>
      ))}
      
      {/* Particle effects */}
      {isActive && (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color="#00f5ff"
            transparent
            opacity={0.05}
          />
        </mesh>
      )}
    </group>
  );
}

function ScannedEnvironment({ environmentData }) {
  return (
    <group>
      {environmentData.objects?.map((obj, idx) => (
        <mesh key={idx} position={obj.position}>
          <boxGeometry args={obj.size} />
          <meshStandardMaterial
            color={obj.color}
            transparent
            opacity={0.6}
            wireframe
          />
        </mesh>
      ))}
      
      {/* Floor grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshBasicMaterial
          color="#00f5ff"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

export default function EnvironmentScanner({ onEnvironmentCreated, onClose }) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [environmentData, setEnvironmentData] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const fileInputRef = useRef();

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsAnalyzing(true);

    try {
      // Upload images
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      // AI analysis to create 3D environment
      const prompt = `
        Analyze these images of a physical environment and create a 3D spatial representation.
        
        Extract:
        1. Room/space dimensions
        2. Object positions and sizes (desks, servers, racks, etc.)
        3. Layout and spatial relationships
        4. Suitable positions for AI infrastructure placement
        
        Return a structured 3D environment with coordinates and object descriptions.
      `;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: uploadedUrls,
        response_json_schema: {
          type: 'object',
          properties: {
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                depth: { type: 'number' },
                height: { type: 'number' }
              }
            },
            objects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  position: { type: 'array', items: { type: 'number' } },
                  size: { type: 'array', items: { type: 'number' } },
                  color: { type: 'string' }
                }
              }
            },
            recommended_ai_positions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  position: { type: 'array', items: { type: 'number' } },
                  reasoning: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setEnvironmentData(analysis);
      toast.success('Environment scanned and reconstructed');
      onEnvironmentCreated?.(analysis);
    } catch (error) {
      console.error('Environment scanning failed:', error);
      toast.error('Failed to scan environment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startSimulation = () => {
    setSimulationActive(true);
    toast.success('Holographic AI simulation started');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl h-[90vh] flex flex-col"
      >
        <GlassCard className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Scan className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Environment Scanner</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Upload Section */}
          {!environmentData && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-white text-xl mb-2">Scan Your Environment</h3>
                <p className="text-white/60 mb-6">Upload photos of your space to create a 3D representation</p>
                
                <label className="inline-block">
                  <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium cursor-pointer hover:scale-105 transition-transform">
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Environment...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Upload Photos
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isAnalyzing}
                  />
                </label>
              </div>
            </div>
          )}

          {/* 3D Environment View */}
          {environmentData && (
            <>
              <div className="flex-1 rounded-xl overflow-hidden bg-black/40 mb-4">
                <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                  <ambientLight intensity={0.3} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f5ff" />
                  
                  <ScannedEnvironment environmentData={environmentData} />
                  
                  {environmentData.recommended_ai_positions?.map((pos, idx) => (
                    <HolographicAI 
                      key={idx}
                      position={pos.position} 
                      isActive={simulationActive}
                    />
                  ))}
                  
                  <OrbitControls />
                </Canvas>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startSimulation}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  {simulationActive ? 'Simulation Running' : 'Start AI Simulation'}
                </button>
                
                <button
                  onClick={() => setEnvironmentData(null)}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
                >
                  Rescan
                </button>
              </div>

              {environmentData.recommended_ai_positions?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <h4 className="text-white font-semibold mb-2">Recommended AI Placements</h4>
                  <div className="space-y-2">
                    {environmentData.recommended_ai_positions.map((pos, idx) => (
                      <div key={idx} className="text-sm text-white/70">
                        <span className="text-cyan-400">Position {idx + 1}:</span> {pos.reasoning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}