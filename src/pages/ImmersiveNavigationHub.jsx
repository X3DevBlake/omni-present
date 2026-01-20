import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CrossHubNetwork3D from '../components/navigation/CrossHubNetwork3D';
import PredictiveNavigationPath3D from '../components/navigation/PredictiveNavigationPath3D';
import NavigationHeatmap3D from '../components/navigation/NavigationHeatmap3D';
import NavigationAnalyticsDashboard from '../components/navigation/NavigationAnalyticsDashboard';
import NavigationTimeline from '../components/navigation/NavigationTimeline';
import { Network, TrendingUp, Map, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function ImmersiveNavigationHub() {
  const [selectedHub, setSelectedHub] = useState(null);

  const { data: networkData } = useQuery({
    queryKey: ['cross-hub-network'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getCrossHubNetwork', {});
      return response.data;
    },
    refetchInterval: 30000
  });

  const { data: navigationData } = useQuery({
    queryKey: ['navigation-intelligence'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeNavigationIntelligence', {
        current_page: 'ImmersiveNavigationHub'
      });
      return response.data.pattern;
    },
    refetchInterval: 20000
  });

  const handleHubSelect = (hub) => {
    setSelectedHub(hub);
    toast.info(`Selected: ${hub.display_name}`);
  };

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Immersive Navigation Hub
          </h1>
          <p className="text-white/70 text-xl">
            AI-Powered Navigation Intelligence & Predictive Path Analysis
          </p>
        </div>

        {networkData?.insights && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Activity className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-2">AI Navigation Insights</h3>
                  <div className="space-y-2">
                    {networkData.insights.map((insight, i) => (
                      <p key={i} className="text-white/80 text-sm">• {insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="network" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="network">
              <Network className="w-4 h-4 mr-2" />
              Hub Network
            </TabsTrigger>
            <TabsTrigger value="predictive">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predictive Paths
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <Map className="w-4 h-4 mr-2" />
              Usage Heatmap
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="space-y-6 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Cross-Hub Network Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                {networkData && (
                  <CrossHubNetwork3D
                    hubs={networkData.hubs}
                    links={networkData.links}
                    onHubSelect={handleHubSelect}
                  />
                )}
              </CardContent>
            </Card>

            {selectedHub && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">
                    {selectedHub.display_name}
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-white/80 text-sm">
                    <div>
                      <span className="text-white/60">Category:</span>
                      <p className="font-medium">{selectedHub.hub_category}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Total Visits:</span>
                      <p className="font-medium">{selectedHub.usage_stats?.total_visits || 0}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Unique Visitors:</span>
                      <p className="font-medium">{selectedHub.usage_stats?.unique_visitors || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {networkData?.optimization_suggestions && (
              <Card className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 border-purple-400/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-3">Optimization Suggestions</h3>
                  <div className="space-y-2">
                    {networkData.optimization_suggestions.map((suggestion, i) => (
                      <p key={i} className="text-white/80 text-sm">💡 {suggestion}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">AI-Predicted Navigation Paths</CardTitle>
              </CardHeader>
              <CardContent>
                {navigationData?.predicted_next_pages && (
                  <PredictiveNavigationPath3D
                    predictions={navigationData.predicted_next_pages}
                    currentPage="ImmersiveNavigationHub"
                  />
                )}
              </CardContent>
            </Card>

            {navigationData?.predicted_next_pages && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {navigationData.predicted_next_pages.slice(0, 3).map((pred, i) => (
                  <Card key={i} className="bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-green-400/50">
                    <CardContent className="p-4">
                      <div className="text-white">
                        <div className="text-3xl font-bold mb-2">
                          {(pred.probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm font-medium mb-1">
                          {pred.page_name?.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xs text-white/60">{pred.reason}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Navigation Usage Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                {navigationData && (
                  <NavigationHeatmap3D navigationData={navigationData} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {navigationData && (
              <>
                <NavigationAnalyticsDashboard navigationData={navigationData} />
                <NavigationTimeline navigationSequence={navigationData.navigation_sequence || []} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}