import React, { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Eye, TrendingUp, Network } from 'lucide-react';

function NeuralNetworkVisualization({ layers = [784, 128, 64, 10] }) {
  const networkRef = React.useRef();

  const nodes = React.useMemo(() => {
    const nodeList = [];
    const connections = [];

    layers.forEach((count, layerIndex) => {
      const layerNodes = [];
      for (let i = 0; i < Math.min(count, 10); i++) {
        const y = (i - Math.min(count, 10) / 2) * 0.8;
        const x = (layerIndex - layers.length / 2) * 3;
        layerNodes.push([x, y, 0]);
      }
      nodeList.push(layerNodes);

      if (layerIndex > 0) {
        layerNodes.forEach((node) => {
          nodeList[layerIndex - 1].slice(0, 3).forEach((prevNode) => {
            connections.push({ start: prevNode, end: node });
          });
        });
      }
    });

    return { nodes: nodeList.flat(), connections };
  }, [layers]);

  return (
    <group ref={networkRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />

      {nodes.nodes.map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {nodes.connections.map((conn, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...conn.start, ...conn.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#666" opacity={0.3} transparent />
        </line>
      ))}
    </group>
  );
}

export default function ModelVisualizationStudio() {
  const [selectedModel, setSelectedModel] = useState('');

  const { data: models } = useQuery({
    queryKey: ['visualization-models'],
    queryFn: async () => {
      const models = await base44.entities.TrainingProgress.list('-created_date', 20);
      return models;
    },
  });

  const selectedModelData = models?.find(m => m.id === selectedModel);

  const trainingMetrics = React.useMemo(() => {
    if (!selectedModelData) return [];
    const epochs = selectedModelData.total_epochs || 10;
    return Array.from({ length: epochs }, (_, i) => ({
      epoch: i + 1,
      loss: Math.max(0.1, 2 / (1 + i * 0.3) + Math.random() * 0.1),
      accuracy: Math.min(0.98, 0.5 + (i / epochs) * 0.5 + Math.random() * 0.05),
      val_loss: Math.max(0.15, 2.2 / (1 + i * 0.25) + Math.random() * 0.15),
      val_accuracy: Math.min(0.95, 0.45 + (i / epochs) * 0.5 + Math.random() * 0.05),
    }));
  }, [selectedModelData]);

  const performanceMetrics = [
    { metric: 'Precision', value: 0.92 },
    { metric: 'Recall', value: 0.88 },
    { metric: 'F1-Score', value: 0.90 },
    { metric: 'AUC-ROC', value: 0.94 },
    { metric: 'Specificity', value: 0.91 },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            Select Model to Visualize
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Choose a model" />
            </SelectTrigger>
            <SelectContent>
              {models?.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.model_name} - {model.model_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedModel && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Neural Network Architecture */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Network className="w-5 h-5 text-purple-400" />
                  Network Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
                    <Suspense fallback={null}>
                      <NeuralNetworkVisualization />
                      <OrbitControls enablePan={false} />
                    </Suspense>
                  </Canvas>
                </div>
              </CardContent>
            </Card>

            {/* Performance Radar */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="metric" stroke="#fff" />
                    <PolarRadiusAxis stroke="#ffffff40" />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="#ec4899"
                      fill="#ec4899"
                      fillOpacity={0.6}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #ffffff20',
                        borderRadius: '8px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Training Progress */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white mb-3 text-sm font-medium">Loss Over Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={trainingMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="epoch" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #ffffff20',
                        }}
                      />
                      <Line type="monotone" dataKey="loss" stroke="#3b82f6" strokeWidth={2} name="Train Loss" />
                      <Line type="monotone" dataKey="val_loss" stroke="#ec4899" strokeWidth={2} name="Val Loss" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="text-white mb-3 text-sm font-medium">Accuracy Over Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={trainingMetrics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="epoch" stroke="#fff" />
                      <YAxis stroke="#fff" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #ffffff20',
                        }}
                      />
                      <Area type="monotone" dataKey="accuracy" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.3} name="Train Acc" />
                      <Area type="monotone" dataKey="val_accuracy" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} name="Val Acc" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}