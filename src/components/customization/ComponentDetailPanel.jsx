import React from 'react';
import { Slider } from '@/components/ui/slider';
import ColorPicker from './ColorPicker';

export default function ComponentDetailPanel({ component, properties, onUpdateProperty }) {
  if (!component) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-white/40 text-sm">Select a component to customize</p>
      </div>
    );
  }
  
  const metadata = component.metadata || {};
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-white font-bold mb-4">{component.name}</h3>
      
      {metadata.color_options && (
        <div className="mb-4">
          <label className="text-white/60 text-xs mb-2 block">Color</label>
          <ColorPicker
            colors={metadata.color_options}
            selectedColor={properties?.color}
            onColorSelect={(color) => onUpdateProperty('color', color)}
          />
        </div>
      )}
      
      {metadata.scale_min && metadata.scale_max && (
        <div className="mb-4">
          <label className="text-white/60 text-xs mb-2 block">
            Scale: {(properties?.scale || 1).toFixed(2)}
          </label>
          <Slider
            value={[properties?.scale || 1]}
            min={metadata.scale_min}
            max={metadata.scale_max}
            step={0.1}
            onValueChange={(val) => onUpdateProperty('scale', val[0])}
          />
        </div>
      )}
      
      {metadata.material_preset && (
        <div className="mb-4">
          <label className="text-white/60 text-xs mb-2 block">Material</label>
          <select
            value={properties?.material || metadata.material_preset}
            onChange={(e) => onUpdateProperty('material', e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
          >
            <option value="metallic">Metallic</option>
            <option value="glossy">Glossy</option>
            <option value="matte">Matte</option>
          </select>
        </div>
      )}
      
      {metadata.tags && (
        <div className="flex gap-1 flex-wrap">
          {metadata.tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}