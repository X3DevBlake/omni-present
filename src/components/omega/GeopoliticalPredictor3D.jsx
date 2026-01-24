import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const RegionNode = ({ position, risk, label }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0.5 + risk * 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
    }
  });
  
  const riskColor = risk > 0.6 ? '#ef4444' : risk > 0.3 ? '#f59e0b' : '#10b981';
  
  return (
    <group position={position}>
      <Sphere ref={meshRef} args={[0.3, 32, 32]}>
        <meshStandardMaterial
          color={riskColor}
          emissive={riskColor}
          emissiveIntensity={risk * 1.5}
        />
      </Sphere>
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center">
        {label}
      </Text>
    </group>
  );
};

export default function GeopoliticalPredictor3D() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState([]);

  const { data: storedPredictions } = useQuery({
    queryKey: ['geopolitical_predictions'],
    queryFn: () => base44.entities.GeopoliticalPrediction.list('-created_date', 10),
    initialData: []
  });

  const runPrediction = async () => {
    setIsPredicting(true);
    
    try {
      const response = await base44.functions.invoke('geopoliticalPredictor', {
        regions: ['Eastern_Europe', 'Middle_East', 'Asia_Pacific', 'North_America'],
        time_horizon_days: 30
      });

      setPredictions(response.data.predictions || []);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const regionPositions = {
    'Eastern_Europe': [-2, 1, 0],
    'Middle_East': [0, 1.5, 0],
    'Asia_Pacific': [2, 0.5, 0],
    'North_America': [-1.5, -1, 0]
  };

  return (
    <Card className="bg-gradient-to-br from-orange-950/90 via-red-950/90 to-rose-950/90 backdrop-blur-xl border-orange-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Globe className="w-6 h-6 text-orange-400" />
          Geopolitical Risk Predictor
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          AI-powered network resilience forecasting via RedComm XG
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-black/40 rounded-xl overflow-hidden mb-4 border border-orange-500/20">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#f97316" />

            {predictions.map((pred, idx) => {
              const pos = regionPositions[pred.target_region] || [0, 0, 0];
              return (
                <RegionNode
                  key={idx}
                  position={pos}
                  risk={pred.probability}
                  label={pred.target_region.split('_')[0]}
                />
              );
            })}

            <OrbitControls enableZoom />
          </Canvas>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/60 rounded-lg p-3 border border-orange-500/30">
            <div className="text-orange-400 text-xs mb-1">Predictions</div>
            <div className="text-white text-2xl font-bold">{storedPredictions.length}</div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-red-500/30">
            <div className="text-red-400 text-xs mb-1">High Risk</div>
            <div className="text-white text-2xl font-bold">
              {storedPredictions.filter(p => p.probability > 0.5).length}
            </div>
          </div>
          
          <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-400 text-xs mb-1">Accuracy</div>
            <div className="text-white text-2xl font-bold">
              {storedPredictions[0]?.prediction_accuracy ? 
                (storedPredictions[0].prediction_accuracy * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        {predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-4 max-h-48 overflow-y-auto"
          >
            {predictions.map((pred, idx) => (
              <div key={idx} className="bg-black/60 rounded-lg p-3 border border-orange-500/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-white font-semibold text-sm">{pred.target_region}</div>
                    <div className="text-gray-400 text-xs capitalize">{pred.prediction_type.replace(/_/g, ' ')}</div>
                  </div>
                  <Badge className={pred.probability > 0.6 ? 'bg-red-600' : 'bg-amber-600'}>
                    {(pred.probability * 100).toFixed(0)}%
                  </Badge>
                </div>
                {pred.impact_assessment && (
                  <div className="text-xs text-gray-300">
                    Network Impact: {(pred.impact_assessment.network_resilience_impact * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        <Button
          onClick={runPrediction}
          disabled={isPredicting}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          {isPredicting ? 'Analyzing...' : 'Run Geopolitical Analysis'}
        </Button>
      </CardContent>
    </Card>
  );
}