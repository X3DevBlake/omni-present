import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Navigation, Zap, Brain } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function AgentLocationTracker({ agents = [] }) {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [paths, setPaths] = useState({});

  const center = agents.length > 0 && agents[0].latitude 
    ? [agents[0].latitude, agents[0].longitude] 
    : [37.7749, -122.4194]; // Default to SF

  const getAgentIcon = (agent) => {
    const color = agent.status === 'working' ? '#00f5ff' : 
                  agent.status === 'learning' ? '#a855f7' : 
                  agent.status === 'shopping' ? '#22c55e' : '#6b7280';
    
    return L.divIcon({
      className: 'custom-agent-marker',
      html: `
        <div style="
          background: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 10px ${color};
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>

      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {agents.filter(a => a.latitude && a.longitude).map((agent) => (
          <Marker 
            key={agent.id} 
            position={[agent.latitude, agent.longitude]}
            icon={getAgentIcon(agent)}
            eventHandlers={{
              click: () => setSelectedAgent(agent)
            }}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold text-lg mb-1">{agent.name}</div>
                <div className="text-sm text-gray-600 mb-2">{agent.location_name || 'Unknown Location'}</div>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    agent.status === 'working' ? 'bg-cyan-100 text-cyan-700' :
                    agent.status === 'learning' ? 'bg-purple-100 text-purple-700' :
                    agent.status === 'shopping' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Agent Info Overlay */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 z-10"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-bold text-lg">{selectedAgent.name}</h3>
              <div className="text-cyan-400 text-sm">{selectedAgent.location_name}</div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 rounded-lg p-2">
              <Navigation className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-white/60 text-xs">Status</div>
              <div className="text-white text-sm font-bold capitalize">{selectedAgent.status}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-white/60 text-xs">Knowledge</div>
              <div className="text-white text-sm font-bold">{selectedAgent.knowledge_count || 0}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-white/60 text-xs">Perception</div>
              <div className="text-white text-sm font-bold">24/7</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}