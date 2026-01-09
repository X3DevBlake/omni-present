import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Navigation, Activity, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AgentLocationTracker({ agents = [] }) {
  const [agentPositions, setAgentPositions] = useState({});
  const [trails, setTrails] = useState({});

  useEffect(() => {
    // Initialize positions for agents
    const initialPositions = {};
    const initialTrails = {};
    
    agents.forEach(agent => {
      // Random starting positions (you can customize this)
      initialPositions[agent.id] = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        speed: Math.random() * 5 + 2,
        heading: Math.random() * 360
      };
      initialTrails[agent.id] = [initialPositions[agent.id]];
    });

    setAgentPositions(initialPositions);
    setTrails(initialTrails);

    // Simulate agent movement
    const interval = setInterval(() => {
      setAgentPositions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(agentId => {
          const pos = updated[agentId];
          // Move agent in current heading
          const distance = pos.speed * 0.00001; // Small movement
          pos.lat += Math.cos(pos.heading * Math.PI / 180) * distance;
          pos.lng += Math.sin(pos.heading * Math.PI / 180) * distance;
          
          // Randomly adjust heading
          pos.heading += (Math.random() - 0.5) * 30;
        });
        return updated;
      });

      setTrails(prev => {
        const updated = { ...prev };
        Object.keys(agentPositions).forEach(agentId => {
          if (updated[agentId] && agentPositions[agentId]) {
            updated[agentId] = [
              ...updated[agentId].slice(-50), // Keep last 50 positions
              agentPositions[agentId]
            ];
          }
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [agents]);

  if (agents.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <MapPin className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">No agents to track</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">Real-Time Agent Locations</h3>
        </div>
      </div>

      <div className="h-[600px] relative">
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {Object.entries(agentPositions).map(([agentId, pos]) => {
            const agent = agents.find(a => a.id === agentId);
            if (!agent) return null;

            return (
              <React.Fragment key={agentId}>
                {/* Agent trail */}
                {trails[agentId] && trails[agentId].length > 1 && (
                  <Polyline
                    positions={trails[agentId].map(p => [p.lat, p.lng])}
                    color="#00f5ff"
                    opacity={0.5}
                    weight={2}
                  />
                )}

                {/* Agent marker */}
                <Marker position={[pos.lat, pos.lng]}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-lg mb-2">{agent.name}</div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Speed: {pos.speed.toFixed(1)} units/s</div>
                        <div>Heading: {pos.heading.toFixed(0)}°</div>
                        <div>Lat: {pos.lat.toFixed(4)}</div>
                        <div>Lng: {pos.lng.toFixed(4)}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Agent status overlay */}
        <div className="absolute top-4 right-4 space-y-2 max-h-[200px] overflow-y-auto">
          {agents.map(agent => {
            const pos = agentPositions[agent.id];
            if (!pos) return null;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-3 min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-white font-bold text-sm">{agent.name}</span>
                </div>
                <div className="text-white/60 text-xs">
                  {pos.speed.toFixed(1)} units/s • {pos.heading.toFixed(0)}°
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}