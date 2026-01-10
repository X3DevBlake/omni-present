/**
 * Real-World Map Visualization 3D
 * Integrates geographic data with financial/agent visualizations
 * Supports overlay of agent locations, offices, events
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RealWorldMapVisualization3D({ locations = [], mapCenter = { lat: 40, lng: -95 }, zoom = 4 }) {
  const containerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [viewMode, setViewMode] = useState('satellite');

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map (Mapbox/Google Maps would go here)
    // For demo, create SVG-based map visualization
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 1000 600');
    svg.style.background = 'linear-gradient(to bottom, #0a0a2e 0%, #16213e 100%)';

    // Draw grid
    for (let i = 0; i <= 10; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (i * 100).toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', (i * 100).toString());
      line.setAttribute('y2', '600');
      line.setAttribute('stroke', '#00d4ff');
      line.setAttribute('stroke-width', '0.5');
      line.setAttribute('opacity', '0.2');
      svg.appendChild(line);
    }

    for (let i = 0; i <= 6; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', (i * 100).toString());
      line.setAttribute('x2', '1000');
      line.setAttribute('y2', (i * 100).toString());
      line.setAttribute('stroke', '#00d4ff');
      line.setAttribute('stroke-width', '0.5');
      line.setAttribute('opacity', '0.2');
      svg.appendChild(line);
    }

    // Plot locations
    locations.forEach((loc, idx) => {
      // Normalize coordinates
      const x = ((loc.longitude + 180) / 360) * 1000;
      const y = ((90 - loc.latitude) / 180) * 600;

      // Draw marker
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', loc.location_type === 'agent' ? '#ff00ff' : '#00ff88');
      circle.setAttribute('opacity', '0.8');
      svg.appendChild(circle);

      // Draw glow
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', x.toString());
      glow.setAttribute('cy', y.toString());
      glow.setAttribute('r', '15');
      glow.setAttribute('fill', loc.location_type === 'agent' ? '#ff00ff' : '#00ff88');
      glow.setAttribute('opacity', '0.1');
      svg.appendChild(glow);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x + 20).toString());
      text.setAttribute('y', (y - 10).toString());
      text.setAttribute('fill', '#00d4ff');
      text.setAttribute('font-size', '10');
      text.textContent = loc.name;
      svg.appendChild(text);
    });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(svg);
    setMapLoaded(true);
  }, [locations, currentZoom, viewMode]);

  return (
    <div className="w-full space-y-4">
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Real-World Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2 items-center flex-wrap">
            <Button
              size="sm"
              variant={viewMode === 'satellite' ? 'default' : 'outline'}
              onClick={() => setViewMode('satellite')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Satellite
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'terrain' ? 'default' : 'outline'}
              onClick={() => setViewMode('terrain')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Terrain
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentZoom(Math.min(20, currentZoom + 1))}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentZoom(Math.max(1, currentZoom - 1))}
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-400">Zoom: {currentZoom}</span>
          </div>

          {/* Map Container */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-[400px] rounded-lg overflow-hidden border border-cyan-500/20 bg-black"
          />

          {/* Location Legend */}
          <div className="flex gap-4 text-sm text-gray-400 mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Agent Locations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Points of Interest</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}