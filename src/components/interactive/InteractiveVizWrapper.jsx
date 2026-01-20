import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw } from 'lucide-react';

export default function InteractiveVizWrapper({ 
  title, 
  children, 
  customizationOptions,
  onRefresh 
}) {
  const [showCustomization, setShowCustomization] = useState(false);
  const [vizConfig, setVizConfig] = useState({
    colorScheme: 'default',
    nodeSize: 'medium',
    animationSpeed: 'normal'
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <div className="flex gap-2">
          {customizationOptions && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCustomization(!showCustomization)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Palette className="w-4 h-4" />
            </Button>
          )}
          {onRefresh && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {showCustomization && customizationOptions && (
        <Card className="bg-white/10 border-white/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-sm">Visualization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-white/70 text-xs">Color Scheme</label>
              <select 
                value={vizConfig.colorScheme}
                onChange={(e) => setVizConfig({...vizConfig, colorScheme: e.target.value})}
                className="w-full mt-1 bg-white/5 border border-white/20 text-white rounded px-2 py-1 text-sm"
              >
                <option value="default">Default</option>
                <option value="neon">Neon</option>
                <option value="pastel">Pastel</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>
            <div>
              <label className="text-white/70 text-xs">Node Size</label>
              <select 
                value={vizConfig.nodeSize}
                onChange={(e) => setVizConfig({...vizConfig, nodeSize: e.target.value})}
                className="w-full mt-1 bg-white/5 border border-white/20 text-white rounded px-2 py-1 text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="text-white/70 text-xs">Animation Speed</label>
              <select 
                value={vizConfig.animationSpeed}
                onChange={(e) => setVizConfig({...vizConfig, animationSpeed: e.target.value})}
                className="w-full mt-1 bg-white/5 border border-white/20 text-white rounded px-2 py-1 text-sm"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {React.cloneElement(children, { vizConfig })}
    </div>
  );
}