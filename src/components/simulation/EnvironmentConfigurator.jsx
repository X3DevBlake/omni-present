import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, Zap, Users, Globe, TrendingUp } from 'lucide-react';

export default function EnvironmentConfigurator() {
  const [weather, setWeather] = useState('clear');
  const [economicGrowth, setEconomicGrowth] = useState([50]);
  const [populationDensity, setPopulationDensity] = useState([30]);
  const [resourceScarcity, setResourceScarcity] = useState([40]);
  const [marketVolatility, setMarketVolatility] = useState([25]);
  const [enableEvents, setEnableEvents] = useState(true);
  const [enableDynamicPricing, setEnableDynamicPricing] = useState(false);
  const [interactionModel, setInteractionModel] = useState('cooperative');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cloud className="w-5 h-5 text-green-400" />
            Environmental Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white">Weather Conditions</Label>
            <Select value={weather} onValueChange={setWeather}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="cloudy">Cloudy</SelectItem>
                <SelectItem value="rainy">Rainy</SelectItem>
                <SelectItem value="stormy">Stormy</SelectItem>
                <SelectItem value="extreme">Extreme Conditions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Population Density: {populationDensity[0]}%</Label>
            <Slider
              value={populationDensity}
              onValueChange={setPopulationDensity}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-white">Resource Scarcity: {resourceScarcity[0]}%</Label>
            <Slider
              value={resourceScarcity}
              onValueChange={setResourceScarcity}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Economic Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white">Economic Growth: {economicGrowth[0]}%</Label>
            <Slider
              value={economicGrowth}
              onValueChange={setEconomicGrowth}
              min={-50}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-white">Market Volatility: {marketVolatility[0]}%</Label>
            <Slider
              value={marketVolatility}
              onValueChange={setMarketVolatility}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Dynamic Pricing</Label>
            <Switch
              checked={enableDynamicPricing}
              onCheckedChange={setEnableDynamicPricing}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Agent Interaction Models
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white">Interaction Model</Label>
            <Select value={interactionModel} onValueChange={setInteractionModel}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cooperative">Cooperative</SelectItem>
                <SelectItem value="competitive">Competitive</SelectItem>
                <SelectItem value="mixed">Mixed Strategy</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
                <SelectItem value="emergent">Emergent Behavior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Random Events</Label>
            <Switch
              checked={enableEvents}
              onCheckedChange={setEnableEvents}
            />
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-purple-200">
              <strong>Note:</strong> Agent interactions will affect resource distribution, collaboration opportunities, and overall simulation outcomes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Special Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <h4 className="text-white font-medium text-sm mb-1">Market Crash</h4>
              <p className="text-white/60 text-xs">Sudden 40% value drop at random step</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <h4 className="text-white font-medium text-sm mb-1">Resource Discovery</h4>
              <p className="text-white/60 text-xs">+200% resources for one random agent</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <h4 className="text-white font-medium text-sm mb-1">Collaboration Bonus</h4>
              <p className="text-white/60 text-xs">+50% efficiency for cooperating agents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}