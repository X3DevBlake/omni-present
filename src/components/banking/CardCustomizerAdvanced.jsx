import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OmniCard3DViewer from '../omni/OmniCard3DViewer';

export default function CardCustomizerAdvanced({ onSave }) {
  const [design, setDesign] = useState({
    background_color: '#1e293b',
    accent_color: '#6366f1',
    pattern: 'gradient',
    material: 'metallic'
  });

  const colors = [
    { name: 'Slate', value: '#1e293b' },
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Green', value: '#10b981' },
    { name: 'Black', value: '#000000' }
  ];

  const accents = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gold', value: '#fbbf24' },
    { name: 'Cyan', value: '#22d3ee' },
    { name: 'Emerald', value: '#34d399' }
  ];

  const materials = [
    { name: 'Matte', value: 'matte' },
    { name: 'Glossy', value: 'glossy' },
    { name: 'Metallic', value: 'metallic' },
    { name: 'Holographic', value: 'holographic' }
  ];

  const patterns = [
    { name: 'Gradient', value: 'gradient' },
    { name: 'Geometric', value: 'geometric' },
    { name: 'Waves', value: 'waves' },
    { name: 'Neural', value: 'neural' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 3D Preview */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <OmniCard3DViewer card={{ card_design: design, card_type: 'premium' }} />
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Customize Design</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="grid grid-cols-4 bg-slate-800">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="pattern">Pattern</TabsTrigger>
              <TabsTrigger value="finish">Finish</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label className="text-white mb-3 block">Background Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setDesign({ ...design, background_color: color.value })}
                      className={`h-20 rounded-lg border-2 transition-all ${
                        design.background_color === color.value
                          ? 'border-purple-500 scale-105'
                          : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      <span className="text-white text-xs font-bold drop-shadow-lg">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-3 block">Accent Color</Label>
                <div className="grid grid-cols-3 gap-3">
                  {accents.map(accent => (
                    <button
                      key={accent.value}
                      onClick={() => setDesign({ ...design, accent_color: accent.value })}
                      className={`h-16 rounded-lg border-2 transition-all ${
                        design.accent_color === accent.value
                          ? 'border-purple-500 scale-105'
                          : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: accent.value }}
                    >
                      <span className="text-white text-xs font-bold drop-shadow-lg">
                        {accent.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="material" className="space-y-4">
              <Label className="text-white mb-3 block">Material Finish</Label>
              <div className="grid grid-cols-2 gap-3">
                {materials.map(material => (
                  <button
                    key={material.value}
                    onClick={() => setDesign({ ...design, material: material.value })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      design.material === material.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    <span className="text-white font-bold">{material.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pattern" className="space-y-4">
              <Label className="text-white mb-3 block">Pattern Style</Label>
              <div className="grid grid-cols-2 gap-3">
                {patterns.map(pattern => (
                  <button
                    key={pattern.value}
                    onClick={() => setDesign({ ...design, pattern: pattern.value })}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      design.pattern === pattern.value
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    <span className="text-white font-bold">{pattern.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="finish" className="space-y-4">
              <p className="text-slate-400">Additional finishing options coming soon</p>
            </TabsContent>
          </Tabs>

          <Button
            onClick={() => onSave(design)}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            Save Design
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}