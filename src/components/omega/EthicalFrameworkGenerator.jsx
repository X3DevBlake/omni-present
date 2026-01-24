import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Trash, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function EthicalFrameworkGenerator() {
  const queryClient = useQueryClient();
  const [frameworkName, setFrameworkName] = useState('');
  const [principles, setPrinciples] = useState([]);
  const [newPrinciple, setNewPrinciple] = useState('');
  const [selectedWeights, setSelectedWeights] = useState({
    transparency: 0.8,
    fairness: 0.9,
    autonomy: 0.7,
    safety: 1.0,
    privacy: 0.85
  });

  const createFrameworkMutation = useMutation({
    mutationFn: async (framework) => {
      return base44.entities.EthicalFramework.create({
        framework_id: `eth_fw_${Date.now()}`,
        framework_name: framework.name,
        principles: framework.principles,
        principle_weights: framework.weights,
        decision_threshold: 0.7,
        intervention_threshold: 0.65,
        auto_apply: true,
        version: '1.0.0'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ethical_frameworks'] });
      setFrameworkName('');
      setPrinciples([]);
    }
  });

  const addPrinciple = () => {
    if (newPrinciple) {
      setPrinciples([...principles, newPrinciple]);
      setNewPrinciple('');
    }
  };

  const removePrinciple = (idx) => {
    setPrinciples(principles.filter((_, i) => i !== idx));
  };

  const saveFramework = () => {
    if (!frameworkName || principles.length === 0) return;
    
    createFrameworkMutation.mutate({
      name: frameworkName,
      principles,
      weights: selectedWeights
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-950/90 via-emerald-950/90 to-teal-950/90 backdrop-blur-xl border-green-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-green-400" />
          Ethical Framework Generator
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Define custom ethical principles for AI decision-making
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Framework Name</label>
            <Input
              value={frameworkName}
              onChange={(e) => setFrameworkName(e.target.value)}
              placeholder="e.g., Human-Centric Ethics Framework"
              className="bg-black/60 border-green-500/30 text-white"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-2 block">Core Principles</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                placeholder="Add ethical principle..."
                className="bg-black/60 border-green-500/30 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addPrinciple()}
              />
              <Button onClick={addPrinciple} size="icon" className="bg-green-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {principles.length > 0 && (
              <div className="space-y-2">
                {principles.map((principle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-black/60 rounded-lg p-2 border border-green-500/20"
                  >
                    <span className="text-gray-300 text-sm">{principle}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removePrinciple(idx)}
                      className="h-6 w-6"
                    >
                      <Trash className="w-3 h-3 text-red-400" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-3 block">Principle Weights</label>
            <div className="space-y-3">
              {Object.entries(selectedWeights).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs capitalize">{key}</span>
                    <span className="text-white text-xs font-mono">{value.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={value}
                    onChange={(e) => setSelectedWeights({
                      ...selectedWeights,
                      [key]: parseFloat(e.target.value)
                    })}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={saveFramework}
          disabled={!frameworkName || principles.length === 0 || createFrameworkMutation.isPending}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {createFrameworkMutation.isPending ? 'Saving...' : 'Save Ethical Framework'}
        </Button>

        {createFrameworkMutation.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-950/60 rounded-lg p-3 border border-green-500/30"
          >
            <div className="text-green-400 text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Framework saved successfully
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}