import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Thermometer, Activity, HardDrive } from 'lucide-react';
import GlassCard from './GlassCard';

const componentDetails = {
  0: {
    name: 'Neural Core',
    type: 'Central Processor',
    specs: {
      'Processing Power': '2.5 PetaFLOPS',
      'Architecture': 'Custom Tensor Core Array',
      'Precision': 'FP64, FP32, FP16, INT8',
      'Clock Speed': '2.8 GHz Base, 3.5 GHz Boost',
      'TDP': '450W',
      'Cooling': 'Liquid Cooling with Phase Change',
    },
    description: 'The Neural Core serves as the central intelligence processor, orchestrating all AI operations with unprecedented parallel processing capabilities.',
    animation: 'pulse',
  },
  1: {
    name: 'GPU Array 1',
    type: 'NVIDIA HGX 8-GPU System',
    specs: {
      'Memory': '640GB HBM3',
      'Bandwidth': '3.2 TB/s',
      'CUDA Cores': '142,336 per GPU',
      'Tensor Cores': '568 per GPU',
      'NVLink': '900 GB/s inter-GPU',
      'Power': '700W per GPU',
    },
    description: 'High-performance GPU cluster delivering massive parallel processing for AI training and inference workloads.',
    animation: 'cooling',
  },
  2: {
    name: 'GPU Array 2',
    type: 'NVIDIA HGX 8-GPU System',
    specs: {
      'Memory': '640GB HBM3',
      'Bandwidth': '3.2 TB/s',
      'CUDA Cores': '142,336 per GPU',
      'Tensor Cores': '568 per GPU',
      'NVLink': '900 GB/s inter-GPU',
      'Power': '700W per GPU',
    },
    description: 'Redundant GPU cluster ensuring continuous operation and load balancing across intensive AI workloads.',
    animation: 'cooling',
  },
  3: {
    name: 'Memory Pool',
    type: 'DDR5 System RAM',
    specs: {
      'Capacity': '2TB',
      'Speed': '5600 MT/s',
      'Channels': '8-Channel',
      'Bandwidth': '358 GB/s',
      'Latency': 'CL40',
      'ECC': 'Full ECC Support',
    },
    description: 'Massive system memory pool providing high-bandwidth access for real-time AI processing and data streaming.',
    animation: 'dataflow',
  },
  4: {
    name: 'Storage Layer',
    type: 'NVMe SSD Array',
    specs: {
      'Capacity': '50TB',
      'Interface': 'PCIe Gen5 x4',
      'Read Speed': '14,000 MB/s',
      'Write Speed': '12,000 MB/s',
      'IOPS': '2.5M Read, 2M Write',
      'Endurance': '10 DWPD',
    },
    description: 'Ultra-fast NVMe storage array delivering persistent data access with minimal latency for AI model storage and retrieval.',
    animation: 'dataflow',
  },
  5: {
    name: 'Network Hub',
    type: 'InfiniBand HDR',
    specs: {
      'Bandwidth': '400 Gbps',
      'Latency': 'Sub-microsecond',
      'Topology': 'Fat-tree mesh',
      'Ports': '200Gbps x 2',
      'Protocol': 'RDMA over Converged Ethernet',
      'QoS': 'Hardware-based priority',
    },
    description: 'Low-latency, high-bandwidth networking providing seamless interconnection between all system components.',
    animation: 'network',
  },
  6: {
    name: 'I/O Controller',
    type: 'PCIe Gen5 Interface',
    specs: {
      'Bandwidth': '128 GT/s',
      'Lanes': '64 x PCIe 5.0',
      'Latency': '< 100ns',
      'Protocols': 'NVMe, CXL 3.0',
      'DMA Engines': '16 Independent',
      'Buffer': '4GB DDR5',
    },
    description: 'Advanced I/O controller managing high-speed data transfer between system components and external interfaces.',
    animation: 'pulse',
  },
};

export default function ComponentDetailPanel({ componentIndex, onClose }) {
  const details = componentDetails[componentIndex];
  
  if (!details) return null;

  const AnimationPreview = () => {
    switch (details.animation) {
      case 'cooling':
        return (
          <div className="relative h-32 bg-gradient-to-t from-blue-500/10 to-transparent rounded-lg overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                animate={{ y: [-128, 0, -128] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: "linear" }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <Thermometer className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        );
      case 'dataflow':
        return (
          <div className="relative h-32 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg overflow-hidden">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-0 w-2 h-2 bg-purple-400 rounded-full"
                animate={{ x: [0, 300], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity, ease: "linear" }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        );
      case 'network':
        return (
          <div className="relative h-32 bg-gradient-to-br from-pink-500/10 to-transparent rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.circle
                  key={i}
                  cx="50%"
                  cy="50%"
                  r={10 + i * 10}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="1"
                  initial={{ opacity: 0.8, scale: 0 }}
                  animate={{ opacity: 0, scale: 1 }}
                  transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        );
      default:
        return (
          <div className="relative h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-lg overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6 sm:p-8" glow glowColor="cyan">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{details.name}</h2>
                <p className="text-cyan-400 text-sm">{details.type}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Animation Preview */}
            <div className="mb-6">
              <AnimationPreview />
            </div>

            {/* Description */}
            <p className="text-white/70 mb-6 leading-relaxed">{details.description}</p>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(details.specs).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-white/50 mb-1">{key}</div>
                    <div className="text-sm text-white font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}