import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Radio, MessageSquare, Share2, Wifi } from 'lucide-react';

export default function CommunicationProtocolConfig({ onConfigureProtocol }) {
  const [protocolType, setProtocolType] = useState('swarm');
  const [updateFrequency, setUpdateFrequency] = useState(10);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(true);
  const [realTimeSync, setRealTimeSync] = useState(true);

  const handleConfigure = () => {
    onConfigureProtocol?.({
      protocol_type: protocolType,
      update_frequency_hz: updateFrequency,
      data_sharing_enabled: dataSharingEnabled,
      real_time_sync: realTimeSync
    });
  };

  return (
    <Card className="bg-black/40 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          Communication Protocol Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm mb-2 block">Protocol Type</label>
            <Select value={protocolType} onValueChange={setProtocolType}>
              <SelectTrigger className="bg-black/60 border-cyan-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="swarm">Swarm Intelligence</SelectItem>
                <SelectItem value="negotiation">Negotiation-Based</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="consensus">Consensus</SelectItem>
                <SelectItem value="auction">Auction-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white text-sm mb-2 block flex items-center justify-between">
              <span>Update Frequency: {updateFrequency} Hz</span>
              <Badge className="bg-cyan-500/30 text-cyan-300">{updateFrequency < 5 ? 'Low' : updateFrequency < 15 ? 'Medium' : 'High'}</Badge>
            </label>
            <Slider
              value={[updateFrequency]}
              onValueChange={(val) => setUpdateFrequency(val[0])}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDataSharingEnabled(!dataSharingEnabled)}
              className={`p-4 rounded-lg border transition-all ${
                dataSharingEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-black/60 border-cyan-500/30'
              }`}
            >
              <Share2 className={`w-5 h-5 mb-2 ${dataSharingEnabled ? 'text-cyan-400' : 'text-white/40'}`} />
              <div className="text-white text-sm">Data Sharing</div>
              <div className={`text-xs ${dataSharingEnabled ? 'text-cyan-400' : 'text-white/40'}`}>
                {dataSharingEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </button>

            <button
              onClick={() => setRealTimeSync(!realTimeSync)}
              className={`p-4 rounded-lg border transition-all ${
                realTimeSync
                  ? 'bg-cyan-500/20 border-cyan-500/50'
                  : 'bg-black/60 border-cyan-500/30'
              }`}
            >
              <Wifi className={`w-5 h-5 mb-2 ${realTimeSync ? 'text-cyan-400' : 'text-white/40'}`} />
              <div className="text-white text-sm">Real-Time Sync</div>
              <div className={`text-xs ${realTimeSync ? 'text-cyan-400' : 'text-white/40'}`}>
                {realTimeSync ? 'Enabled' : 'Disabled'}
              </div>
            </button>
          </div>

          <Button onClick={handleConfigure} className="w-full bg-cyan-600 hover:bg-cyan-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Configure Protocol
          </Button>

          <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-lg">
            <div className="text-cyan-400 text-xs font-bold mb-1">Protocol Info</div>
            <div className="text-white/80 text-xs">
              {protocolType === 'swarm' && 'Decentralized autonomous coordination'}
              {protocolType === 'negotiation' && 'Resource allocation through bidding'}
              {protocolType === 'hierarchical' && 'Top-down command structure'}
              {protocolType === 'consensus' && 'Democratic decision-making'}
              {protocolType === 'auction' && 'Market-based resource distribution'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}