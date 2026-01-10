import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, ZoomIn, ZoomOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import InteractiveGlobe3D from './InteractiveGlobe3D';
import { Button } from '@/components/ui/button';

export default function GlobalMapDashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const { data: locations = [] } = useQuery({
    queryKey: ['globalLocations'],
    queryFn: () => base44.entities.LocationData.list().catch(() => []),
  });

  const filteredLocations = filterType === 'all' 
    ? locations 
    : locations.filter(l => l.location_type === filterType);

  const locationTypes = ['all', 'agent', 'office', 'market', 'event', 'poi', 'resource'];
  const typeColors = {
    agent: 'from-cyan-500 to-blue-500',
    office: 'from-purple-500 to-pink-500',
    market: 'from-yellow-500 to-orange-500',
    event: 'from-red-500 to-orange-500',
    poi: 'from-green-500 to-emerald-500',
    resource: 'from-sky-500 to-cyan-500',
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-black/20 to-black/40 rounded-xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-cyan-400" />
          Global Location Network
        </h2>
        <p className="text-white/60">Explore agents, markets, and resources worldwide</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Globe */}
        <div className="lg:col-span-3">
          <InteractiveGlobe3D 
            locations={filteredLocations} 
            onLocationSelect={setSelectedLocation}
          />
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Filters */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter By Type
            </h3>
            <div className="space-y-2">
              {locationTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm capitalize ${
                    filterType === type
                      ? `bg-gradient-to-r ${typeColors[type] || 'from-gray-500 to-gray-600'} text-white`
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex-1 overflow-y-auto"
            >
              <h3 className="text-white font-bold mb-3">{selectedLocation.name}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/60">Type</p>
                  <p className="text-white capitalize">{selectedLocation.location_type}</p>
                </div>
                {selectedLocation.address && (
                  <div>
                    <p className="text-white/60">Address</p>
                    <p className="text-white">{selectedLocation.address}</p>
                  </div>
                )}
                {selectedLocation.city && (
                  <div>
                    <p className="text-white/60">City</p>
                    <p className="text-white">{selectedLocation.city}</p>
                  </div>
                )}
                {selectedLocation.country && (
                  <div>
                    <p className="text-white/60">Country</p>
                    <p className="text-white">{selectedLocation.country}</p>
                  </div>
                )}
                {selectedLocation.timezone && (
                  <div>
                    <p className="text-white/60">Timezone</p>
                    <p className="text-white">{selectedLocation.timezone}</p>
                  </div>
                )}
                {selectedLocation.description && (
                  <div>
                    <p className="text-white/60">Description</p>
                    <p className="text-white text-xs">{selectedLocation.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-white/60 text-sm mb-2">Locations Found</p>
            <p className="text-2xl font-bold text-cyan-400">{filteredLocations.length}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}