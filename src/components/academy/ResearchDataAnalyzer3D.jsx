import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Zap, Download } from 'lucide-react';
import * as THREE from 'three';
import { toast } from 'sonner';

const DataPoint = ({ position, value, label }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  const size = 0.2 + (value / 100) * 0.5;

  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Text position={[0, -0.8, 0]} fontSize={0.2} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
};

const TrendLine = ({ points, color }) => {
  const linePoints = points.map(p => new THREE.Vector3(...p));
  
  return (
    <Line
      points={linePoints}
      color={color}
      lineWidth={2}
    />
  );
};

export default function ResearchDataAnalyzer3D({ projectId }) {
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [visualizationData, setVisualizationData] = useState([]);

  const analyzeDataMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'analyze_research_data',
        project_id: projectId,
        query
      });
      return response.data;
    },
    onSuccess: (data) => {
      setVisualizationData(data.visualization_points || []);
      toast.success('Analysis complete!');
    }
  });

  const generateVisualization = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('aiResearchAssistantAgent', {
        action: 'generate_data_visualization',
        project_id: projectId,
        data_points: visualizationData
      });
      return response.data;
    }
  });

  const handleAnalyze = () => {
    if (analysisQuery.trim()) {
      analyzeDataMutation.mutate(analysisQuery);
    }
  };

  const sampleData = visualizationData.length > 0 ? visualizationData : [
    { x: -4, y: 2, z: 0, value: 75, label: 'Q1' },
    { x: -2, y: 3, z: 0, value: 85, label: 'Q2' },
    { x: 0, y: 4, z: 0, value: 92, label: 'Q3' },
    { x: 2, y: 4.5, z: 0, value: 95, label: 'Q4' }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          Real-Time Data Analysis & Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Describe the analysis you need (e.g., 'Show correlation between variables A and B')"
            value={analysisQuery}
            onChange={(e) => setAnalysisQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white flex-1"
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzeDataMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {analyzeDataMutation.isPending ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>

        <div className="bg-black/40 rounded-lg h-96 mb-4">
          <Canvas camera={{ position: [0, 2, 10], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} />
            
            {/* Data Points */}
            {sampleData.map((point, idx) => (
              <DataPoint
                key={idx}
                position={[point.x, point.y, point.z]}
                value={point.value}
                label={point.label}
              />
            ))}

            {/* Trend Line */}
            <TrendLine
              points={sampleData.map(p => [p.x, p.y, p.z])}
              color="#10b981"
            />

            {/* Grid */}
            <gridHelper args={[20, 20, '#4b5563', '#374151']} />
            
            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => generateVisualization.mutate()}
            disabled={generateVisualization.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Advanced Viz
          </Button>
          <Button size="sm" variant="outline" className="border-white/20 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}