import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Cpu, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function DynamicDeviceDiscovery({ agentId }) {
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState([]);

  const scanForDevices = async () => {
    setDiscovering(true);
    
    const mockDevices = [
      { signature: 'holo_proj_001', type: 'holographic_projector' },
      { signature: 'ar_glass_002', type: 'ar_glasses' },
      { signature: 'haptic_dev_003', type: 'haptic_glove' }
    ];

    for (const device of mockDevices) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze device with signature: ${device.signature}
        
Determine capabilities and communication protocol.`,
        response_json_schema: {
          type: 'object',
          properties: {
            capabilities: { type: 'object' },
            protocol: { type: 'string' }
          }
        }
      });

      await base44.entities.DeviceDiscoveryLog.create({
        agent_id: agentId,
        device_signature: device.signature,
        device_type_detected: device.type,
        capabilities_discovered: result.capabilities,
        interface_protocol: result.protocol,
        success: true,
        learning_applied: true
      });
    }

    const logs = await base44.entities.DeviceDiscoveryLog.list({ agent_id: agentId });
    setDiscovered(logs);
    setDiscovering(false);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-green-400" />
        Device Discovery
      </h3>

      <Button onClick={scanForDevices} disabled={discovering} className="w-full mb-4 bg-green-500 hover:bg-green-600">
        <Search className="w-4 h-4 mr-2" />
        {discovering ? 'Scanning...' : 'Scan for Devices'}
      </Button>

      <div className="space-y-2">
        {discovered.map(log => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/30 rounded p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-green-400" />
                <p className="text-white text-sm font-semibold">{log.device_type_detected}</p>
              </div>
              {log.success && <CheckCircle className="w-4 h-4 text-green-400" />}
            </div>
            <p className="text-white/60 text-xs mb-1">Protocol: {log.interface_protocol}</p>
            <p className="text-white/60 text-xs">Signature: {log.device_signature}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}