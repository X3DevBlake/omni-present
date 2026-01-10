import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModelArchitectureDesigner() {
  const [layers, setLayers] = useState([
    { id: 1, type: 'Input', neurons: 128 },
    { id: 2, type: 'Dense', neurons: 64 },
    { id: 3, type: 'Output', neurons: 10 }
  ]);

  const addLayer = (type) => {
    const newLayer = {
      id: Date.now(),
      type,
      neurons: type === 'Dropout' ? 0.5 : 32
    };
    setLayers([...layers.slice(0, -1), newLayer, layers[layers.length - 1]]);
  };

  const removeLayer = (id) => {
    if (layers.length > 2) {
      setLayers(layers.filter(l => l.id !== id && l.type !== 'Input' && l.type !== 'Output'));
    }
  };

  const layerTypes = ['Dense', 'Conv2D', 'LSTM', 'Dropout', 'BatchNorm'];

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Layers className="w-6 h-6 text-indigo-400" />
        Model Architecture Designer
      </h3>

      <div className="flex gap-2 mb-6 flex-wrap">
        {layerTypes.map(type => (
          <Button
            key={type}
            onClick={() => addLayer(type)}
            size="sm"
            className="bg-indigo-500/20 hover:bg-indigo-500/30"
          >
            <Plus className="w-3 h-3 mr-1" />
            {type}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-white font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <div className="text-white font-semibold">{layer.type}</div>
                <div className="text-white/60 text-sm">
                  {layer.type === 'Dropout' ? `${layer.neurons * 100}%` : `${layer.neurons} neurons`}
                </div>
              </div>
            </div>
            {layer.type !== 'Input' && layer.type !== 'Output' && (
              <Button
                onClick={() => removeLayer(layer.id)}
                variant="ghost"
                size="sm"
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-lg p-4">
        <div className="text-white/60 text-sm mb-2">Total Parameters</div>
        <div className="text-white text-2xl font-bold">
          {layers.reduce((sum, l) => sum + (l.neurons || 0), 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}