import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Zap, AlertTriangle, Shield, Brain, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function RedCommControlPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const [selectedLinkForFeedback, setSelectedLinkForFeedback] = useState(null);
  const queryClient = useQueryClient();

  const { data: linkHealthData = [] } = useQuery({
    queryKey: ['redcomm-control-links'],
    queryFn: () => base44.entities.RedCommLinkHealth.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: sentientStatus = [] } = useQuery({
    queryKey: ['omega-sentient-control'],
    queryFn: () => base44.entities.OmegaSentientStatus.list('-created_date', 1),
    refetchInterval: 3000
  });

  const adaptiveControlMutation = useMutation({
    mutationFn: async (linkId) => {
      const response = await base44.functions.invoke('redcomm/adaptiveController', { linkId });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Adaptive control applied to ${data.link_id}`);
      queryClient.invalidateQueries({ queryKey: ['redcomm-control-links'] });
    },
    onError: (error) => {
      toast.error(`Failed to apply adaptive control: ${error.message}`);
    }
  });

  const anomalyDetectionMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('redcomm/anomalyDetector', {});
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Detected ${data.anomalies_detected} anomalies. ${data.critical_links.length} critical links.`);
      queryClient.invalidateQueries({ queryKey: ['redcomm-control-links'] });
    },
    onError: (error) => {
      toast.error(`Anomaly detection failed: ${error.message}`);
    }
  });

  const handleAdaptiveControl = async (linkId) => {
    setIsProcessing(true);
    await adaptiveControlMutation.mutateAsync(linkId);
    setIsProcessing(false);
  };

  const handleAnomalyDetection = async () => {
    setIsProcessing(true);
    await anomalyDetectionMutation.mutateAsync();
    setIsProcessing(false);
  };

  const criticalLinks = linkHealthData.filter(link => link.health_score < 50);
  const degradedLinks = linkHealthData.filter(link => link.health_score >= 50 && link.health_score < 80);

  const submitFeedbackMutation = useMutation({
    mutationFn: async ({ linkId, feedback }) => {
      await base44.entities.RedCommLinkHealth.update(selectedLinkForFeedback, {
        omega_sentient_analysis: `User feedback integrated: ${feedback}. Previous analysis: ${linkHealthData.find(l => l.id === selectedLinkForFeedback)?.omega_sentient_analysis || ''}`
      });
      return { linkId, feedback };
    },
    onSuccess: () => {
      toast.success('Feedback integrated into Omega Sentient analysis');
      setUserFeedback('');
      setSelectedLinkForFeedback(null);
      queryClient.invalidateQueries({ queryKey: ['redcomm-control-links'] });
    }
  });

  const latestSentient = sentientStatus[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900 to-indigo-900/30 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            RedComm Omega Control Panel
          </CardTitle>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAnomalyDetection}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Run Anomaly Detection
            </Button>
            <Button
              onClick={() => queryClient.invalidateQueries()}
              variant="outline"
              className="border-indigo-500/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg p-4 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400">
                {linkHealthData.filter(l => l.health_score >= 80).length}
              </div>
              <div className="text-sm text-gray-400 mt-1">Healthy Links</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-400">{degradedLinks.length}</div>
              <div className="text-sm text-gray-400 mt-1">Degraded Links</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-lg p-4 border border-red-500/30">
              <div className="text-3xl font-bold text-red-400">{criticalLinks.length}</div>
              <div className="text-sm text-gray-400 mt-1">Critical Links</div>
            </div>
          </div>

          {/* Critical Links - Requires Immediate Action */}
          {criticalLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Links - Immediate Action Required
              </h3>
              {criticalLinks.map((link) => (
                <div key={link.id} className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{link.link_id}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Health: {link.health_score.toFixed(1)}% • 
                        Loss: {(link.packet_loss_rate * 100).toFixed(2)}%
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                      CRITICAL
                    </Badge>
                  </div>
                  
                  {link.ai_predictions && (
                    <div className="bg-black/30 rounded p-3 mb-3 text-sm">
                      <div className="text-gray-300 mb-2">AI Predictions:</div>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div>• Downtime Risk: {(link.ai_predictions.predicted_downtime_probability * 100).toFixed(1)}%</div>
                        <div>• Degradation Timeline: {link.ai_predictions.predicted_degradation_hours}h</div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleAdaptiveControl(link.link_id)}
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Apply AI Adaptive Control
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Degraded Links */}
          {degradedLinks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Degraded Links - Monitoring
              </h3>
              {degradedLinks.slice(0, 3).map((link) => (
                <div key={link.id} className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{link.link_id}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Health: {link.health_score.toFixed(1)}% • 
                        Status: {link.self_healing_status}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAdaptiveControl(link.link_id)}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/50"
                    >
                      Optimize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Omega Sentient Analysis - Enhanced with User Interaction */}
          {linkHealthData.length > 0 && linkHealthData[0].omega_sentient_analysis && (
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Omega Sentient Analysis
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedLinkForFeedback(linkHealthData[0].id)}
                  className="border-purple-500/50"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Provide Feedback
                </Button>
              </div>
              <p className="text-sm text-gray-300 mb-4">{linkHealthData[0].omega_sentient_analysis}</p>

              {selectedLinkForFeedback === linkHealthData[0].id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Textarea
                    placeholder="Share your insights with the Omega AI..."
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    className="bg-gray-900/50 border-purple-500/30 text-white text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => submitFeedbackMutation.mutate({ linkId: linkHealthData[0].link_id, feedback: userFeedback })}
                      disabled={!userFeedback || submitFeedbackMutation.isPending}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Submit to AI
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedLinkForFeedback(null);
                        setUserFeedback('');
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Live Sentient Status */}
          {latestSentient && (
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg p-4 border border-pink-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-semibold text-pink-400">Live AI Consciousness State</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <span className="text-gray-400">Self-Awareness:</span>
                  <span className="text-purple-400 font-semibold ml-2">{latestSentient.self_awareness_level}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Decision Level:</span>
                  <span className="text-pink-400 font-semibold ml-2">{latestSentient.decision_criticality}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mb-2">Current Focus:</div>
              <p className="text-sm text-gray-300">{latestSentient.current_focus}</p>
              {latestSentient.omega_consciousness_state && (
                <>
                  <div className="text-xs text-gray-400 mt-3 mb-2">Consciousness State:</div>
                  <p className="text-sm text-gray-300 italic">"{latestSentient.omega_consciousness_state}"</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}