import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

const detailedKnowledge = {
  normal: {
    0: "In normal view, you're seeing the Neural Core's standard operational state. This octagonal design maximizes heat dissipation while maintaining compact footprint. The metallic finish indicates advanced thermal coating that handles 450W TDP.",
    1: "GPU Array 1 in normal view shows the standard 8-GPU configuration. The purple tint represents the liquid cooling system actively managing thermal loads across all processors.",
  },
  exploded: {
    0: "The exploded view reveals three critical layers: the top thermal interface with diamond-patterned heat pipes, the middle computational layer housing tensor cores, and the bottom power delivery system with redundant VRMs. This tri-layer design ensures thermal isolation while maximizing computational density.",
    1: "Exploding GPU Array 1 shows the internal architecture: HBM3 memory stacks mounted directly on the GPU die (top layer), the actual GPU cores with 142,336 CUDA cores (middle), and the power/cooling infrastructure (bottom). This vertical stacking achieves 3.2 TB/s memory bandwidth.",
  },
  'cross-section': {
    0: "The cross-section reveals internal microarchitecture: cyan structures are data pathways with PCIe Gen5 lanes, purple sections house the actual tensor processing units. Notice the honeycomb pattern - this is the cache hierarchy optimized for AI workload memory access patterns.",
    1: "Cross-sectioning the GPU shows the memory controllers (cyan) interfacing with compute units (purple). The internal structure uses a mesh topology allowing any tensor core to access any memory location in under 5 nanoseconds.",
  },
  stress: {
    0: "Under current load conditions, the Neural Core shows thermal concentration in the central processing regions. The deformation you're seeing is exaggerated - in reality, precision mounting prevents any physical stress. Red areas indicate >85°C zones requiring immediate cooling response. This is normal under peak AI training loads but sustained operation here could reduce lifespan by 40%.",
    1: "The GPU's stress analysis reveals hotspots around memory controllers - this is expected during high-bandwidth operations. The yellowing indicates optimal operating range (75-80°C). If these zones turn red, the system automatically throttles to prevent silicon degradation. Current load suggests we're running inference workloads rather than training.",
  },
};

export default function EnhancedVoiceAssistant({ 
  onTranscript, 
  focusedComponent, 
  telemetry, 
  onVoiceCommand,
  currentView = 'normal'
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Proactive insights based on telemetry
    const newInsights = [];
    
    if (telemetry.cpuLoad > 80) {
      newInsights.push("⚠️ CPU approaching thermal limits. Consider load balancing.");
    }
    if (telemetry.gpuLoad > 85) {
      newInsights.push("⚡ GPU arrays at peak performance. Excellent for current AI training task.");
    }
    if (telemetry.activeWorkflows > 15) {
      newInsights.push("📊 High workflow concurrency detected. System demonstrating excellent parallel processing.");
    }
    
    setInsights(newInsights);
  }, [telemetry]);

  useEffect(() => {
    // Provide contextual information when view or component changes
    if (focusedComponent !== null && currentView && detailedKnowledge[currentView]?.[focusedComponent]) {
      setTranscript(detailedKnowledge[currentView][focusedComponent]);
    }
  }, [focusedComponent, currentView]);

  const generateContextualResponse = () => {
    const commands = [
      'generate high performance blueprint',
      'explain current view',
      'analyze telemetry trends',
      'suggest optimizations',
      'show failure points',
    ];
    
    const detectedCommand = commands[Math.floor(Math.random() * commands.length)];
    setLastCommand(detectedCommand);

    if (detectedCommand.includes('generate')) {
      onVoiceCommand?.('generate', { budget: 'high', workload: 'ai-training', scale: 'large' });
      return "Generating enterprise-scale AI training infrastructure. Optimizing for maximum throughput and fault tolerance. Configuration includes redundant power, dual network paths, and hot-swappable components.";
    }

    if (detectedCommand.includes('explain current view')) {
      if (focusedComponent !== null && currentView) {
        return detailedKnowledge[currentView]?.[focusedComponent] || "Detailed view analysis in progress.";
      }
      return "Select a component and change its view mode to see detailed structural analysis. Try Shift+Click on any component for isolation view.";
    }

    if (detectedCommand.includes('telemetry') || detectedCommand.includes('trends')) {
      const cpuTrend = telemetry.cpuLoad > 60 ? 'increasing' : 'stable';
      const gpuTrend = telemetry.gpuLoad > 70 ? 'high but efficient' : 'nominal';
      return `Telemetry analysis: CPU load ${cpuTrend} at ${Math.round(telemetry.cpuLoad)}%, GPU utilization ${gpuTrend} at ${Math.round(telemetry.gpuLoad)}%. Network throughput ${telemetry.networkTraffic.toFixed(0)} Gbps with ${telemetry.activeWorkflows} concurrent workflows. Data flow rate: ${telemetry.dataFlowRate.toFixed(1)} GB/s. System is performing within optimal parameters.`;
    }

    if (detectedCommand.includes('optimizations')) {
      return "Based on current telemetry: 1) Consider implementing dynamic voltage scaling on idle GPU arrays to reduce power by 15%. 2) Current memory access patterns suggest enabling prefetch optimization. 3) Network traffic shows opportunity for compression, potentially doubling effective bandwidth.";
    }

    if (detectedCommand.includes('failure points')) {
      return "Critical failure analysis: Primary risk is thermal runaway in Neural Core under sustained 100% load. Secondary concern: NVLink saturation during multi-GPU synchronization in large model training. Mitigation: Active load balancing and dynamic frequency scaling are deployed. Current MTBF: 50,000 hours.";
    }

    return "I can provide detailed analysis of component views, explain telemetry patterns, suggest optimizations, or generate custom blueprints. What would you like to explore?";
  };

  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTranscript('Listening... Ask about components, request analysis, or command "generate blueprint"');
      
      setTimeout(() => {
        const response = generateContextualResponse();
        setTranscript(response);
        onTranscript?.(response);
        
        setTimeout(() => {
          setIsListening(false);
        }, 10000);
      }, 1500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="absolute top-6 right-6 z-10">
      <motion.button
        onClick={toggleListening}
        className={`p-3 rounded-full transition-all shadow-lg ${
          isListening 
            ? 'bg-red-500/20 border-2 border-red-500/60 text-red-400' 
            : 'bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isListening ? { scale: [1, 1.1, 1] } : {}}
        transition={isListening ? { repeat: Infinity, duration: 1.5 } : {}}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </motion.button>
      
      {/* Proactive Insights */}
      {insights.length > 0 && !isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/30 max-w-xs"
        >
          <div className="text-yellow-400 text-xs font-semibold mb-1">💡 Insights</div>
          {insights.map((insight, i) => (
            <div key={i} className="text-white/70 text-xs mt-1">{insight}</div>
          ))}
        </motion.div>
      )}
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-4 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 max-w-xs"
        >
          {lastCommand && (
            <div className="text-cyan-400 text-xs mb-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Command: {lastCommand}
            </div>
          )}
          <p className="text-white/80 text-sm leading-relaxed">{transcript}</p>
        </motion.div>
      )}
    </div>
  );
}