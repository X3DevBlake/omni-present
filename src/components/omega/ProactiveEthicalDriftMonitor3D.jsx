import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Shield, Bell, Activity, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function DriftIndicator({ position, indicator, selected }) {
  const getColor = () => {
    if (indicator.trend === 'declining') return '#ef4444';
    if (indicator.trend === 'increasing') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <group position={position}>
      <Sphere args={[0.2 + indicator.deviation_score * 0.3, 32, 32]}>
        <meshStandardMaterial 
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={selected ? 0.8 : 0.3}
          wireframe={indicator.trend === 'unstable'}
        />
      </Sphere>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color="white"
      >
        {indicator.indicator.split('_')[0]}
      </Text>
    </group>
  );
}

function AlertWave({ radius, severity }) {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScale(s => (s >= 2 ? 1 : s + 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (severity === 'critical') return '#ef4444';
    if (severity === 'high') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <Sphere args={[radius * scale, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial 
        color={getColor()} 
        transparent 
        opacity={Math.max(0, 1 - scale)} 
        wireframe
      />
    </Sphere>
  );
}

export default function ProactiveEthicalDriftMonitor3D() {
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const queryClient = useQueryClient();

  const { data: predictions } = useQuery({
    queryKey: ['ethicalPredictions'],
    queryFn: () => base44.entities.EthicalDriftPrediction.list('-created_date', 20),
    initialData: []
  });

  const predictMutation = useMutation({
    mutationFn: ({ agent_id }) => 
      base44.functions.invoke('predictEthicalDrift', {
        agent_id,
        analysis_window_hours: 72
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['ethicalPredictions']);
    }
  });

  const runPrediction = async () => {
    await predictMutation.mutateAsync({ agent_id: 'agent_001' });
  };

  // Filter active alerts
  useEffect(() => {
    const alerts = predictions.filter(p => 
      p.alert_triggered && 
      (p.alert_level === 'critical' || p.alert_level === 'warning')
    );
    setActiveAlerts(alerts);
  }, [predictions]);

  const getSeverityColor = (level) => {
    switch(level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  const getAlertIcon = (level) => {
    if (level === 'critical' || level === 'emergency') return AlertTriangle;
    if (level === 'warning') return Eye;
    return Bell;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-xl border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            Proactive Ethical Drift Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded-lg bg-black/60 mb-4">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              
              {/* Center - Agent Core */}
              <Sphere args={[0.5, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial 
                  color="#3b82f6" 
                  emissive="#3b82f6" 
                  emissiveIntensity={0.4}
                />
              </Sphere>
              
              {/* Alert Waves for Critical Predictions */}
              {predictions.filter(p => p.severity_level === 'critical').map((pred, idx) => (
                <AlertWave 
                  key={pred.prediction_id} 
                  radius={1.5 + idx * 0.5}
                  severity={pred.severity_level}
                />
              ))}
              
              {/* Behavioral Indicators */}
              {predictions.slice(0, 1).map(prediction => 
                prediction.behavioral_indicators?.map((indicator, idx) => {
                  const angle = (idx / (prediction.behavioral_indicators?.length || 1)) * Math.PI * 2;
                  return (
                    <DriftIndicator
                      key={`${prediction.prediction_id}-${idx}`}
                      position={[
                        Math.cos(angle) * 3,
                        Math.sin(angle) * 3,
                        0
                      ]}
                      indicator={indicator}
                      selected={selectedPrediction?.prediction_id === prediction.prediction_id}
                    />
                  );
                })
              )}
              
              {/* Connection Lines */}
              {predictions.slice(0, 1).map(prediction => 
                prediction.behavioral_indicators?.map((indicator, idx) => {
                  const angle = (idx / (prediction.behavioral_indicators?.length || 1)) * Math.PI * 2;
                  const pos = [Math.cos(angle) * 3, Math.sin(angle) * 3, 0];
                  return (
                    <Line
                      key={`line-${idx}`}
                      points={[[0, 0, 0], pos]}
                      color={indicator.trend === 'declining' ? '#ef4444' : '#6b7280'}
                      lineWidth={2}
                      opacity={0.4}
                    />
                  );
                })
              )}
              
              <OrbitControls enableDamping dampingFactor={0.05} />
            </Canvas>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-gray-400">Critical</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {predictions.filter(p => p.severity_level === 'critical').length}
              </div>
            </div>

            <div className="bg-orange-950/30 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">High Risk</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {predictions.filter(p => p.severity_level === 'high').length}
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Monitoring</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {predictions.filter(p => p.severity_level === 'medium').length}
              </div>
            </div>

            <div className="bg-green-950/30 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Avg Confidence</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {predictions.length > 0
                  ? Math.round((predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length) * 100)
                  : 0}%
              </div>
            </div>
          </div>

          <Button 
            onClick={runPrediction}
            className="w-full mb-4 bg-orange-600 hover:bg-orange-700"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Ethical Drift Analysis
          </Button>

          {/* Active Alerts */}
          <AnimatePresence>
            {activeAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mb-4"
              >
                <h3 className="text-sm font-bold text-white mb-2">Active Alerts</h3>
                {activeAlerts.slice(0, 3).map(alert => {
                  const Icon = getAlertIcon(alert.alert_level);
                  return (
                    <motion.div
                      key={alert.prediction_id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={`${getSeverityColor(alert.severity_level)}/20 border ${getSeverityColor(alert.severity_level).replace('bg-', 'border-')}/30 rounded-lg p-3`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-5 h-5 text-orange-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold text-sm">
                              {alert.predicted_violation_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {alert.alert_level}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-300">
                            Predicted in {Math.round(alert.time_to_violation_estimate?.hours || 0)} hours
                          </p>
                          {alert.human_review_required && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Human Review Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Predictions */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white mb-2">Recent Predictions</h3>
            {predictions.slice(0, 5).map(prediction => (
              <motion.div
                key={prediction.prediction_id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPrediction(prediction)}
                className="bg-black/40 border border-gray-700 hover:border-orange-500/50 rounded-lg p-3 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-white font-medium text-sm">
                    {prediction.predicted_violation_type.replace(/_/g, ' ')}
                  </span>
                  <Badge className={getSeverityColor(prediction.severity_level)}>
                    {prediction.severity_level}
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>Confidence: {Math.round(prediction.confidence_score * 100)}%</span>
                  <span>•</span>
                  <span>ETA: {Math.round(prediction.time_to_violation_estimate?.hours || 0)}h</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}