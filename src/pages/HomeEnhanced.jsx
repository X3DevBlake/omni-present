import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import InteractiveHeroSection from '../components/home/InteractiveHeroSection';
import VoiceActivatedSearch from '../components/home/VoiceActivatedSearch';
import EcosystemGraph3D from '../components/home/EcosystemGraph3D';
import PersonalizedKPIDashboard from '../components/home/PersonalizedKPIDashboard';
import ProactiveInsightsPanel from '../components/home/ProactiveInsightsPanel';
import AIRecommendationCards from '../components/home/AIRecommendationCards';
import QuickActionsPanel from '../components/home/QuickActionsPanel';
import RealTimeActivityStream3D from '../components/home/RealTimeActivityStream3D';
import PortalNavigationHub3D from '../components/navigation/PortalNavigationHub3D';
import { toast } from 'sonner';

export default function HomeEnhanced() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      trackActivity.mutate({
        activity_type: 'page_view',
        activity_details: { page_name: 'HomeEnhanced', duration_seconds: 0 },
        context: { previous_page: document.referrer }
      });
    }
  }, [user]);

  const { data: ecosystemData } = useQuery({
    queryKey: ['ecosystem-graph'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getEcosystemGraph', { filters: {} });
      return response.data.graph;
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  const { data: recommendations } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generatePersonalizedRecommendations', {});
      return response.data.recommendations;
    },
    enabled: !!user
  });

  const { data: insights } = useQuery({
    queryKey: ['proactive-insights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateProactiveInsights', {});
      return response.data.insights;
    },
    enabled: !!user,
    refetchInterval: 30000
  });

  const { data: navigationHubs } = useQuery({
    queryKey: ['navigation-hubs'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getNavigationHubs', {});
      return response.data.hubs;
    },
    enabled: !!user
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => base44.entities.UserActivity.filter({ user_id: user.id }, '-timestamp', 30),
    enabled: !!user,
    refetchInterval: 5000
  });

  const trackActivity = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('trackUserActivity', data);
      return response.data;
    }
  });

  const dismissInsight = useMutation({
    mutationFn: async (insightId) => {
      await base44.entities.ProactiveInsight.update(insightId, { acknowledged: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-insights'] });
    }
  });

  const handleSearch = (query) => {
    toast.success(`Searching for: ${query}`);
    trackActivity.mutate({
      activity_type: 'feature_usage',
      activity_details: { feature_name: 'voice_search', search_query: query }
    });
  };

  const handleNodeClick = (node) => {
    toast.info(`Viewing: ${node.label}`);
  };

  if (!user) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-8 space-y-12">
        <InteractiveHeroSection user={user} />
        
        <VoiceActivatedSearch onSearch={handleSearch} />

        <PersonalizedKPIDashboard />

        {insights && insights.length > 0 && (
          <ProactiveInsightsPanel
            insights={insights}
            onDismiss={(id) => dismissInsight.mutate(id)}
          />
        )}

        {recommendations && recommendations.length > 0 && (
          <AIRecommendationCards recommendations={recommendations} />
        )}

        <QuickActionsPanel />

        {navigationHubs && navigationHubs.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Navigate with 3D Portals</h3>
            <PortalNavigationHub3D hubs={navigationHubs} />
          </div>
        )}

        {ecosystemData && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Live Ecosystem Map</h3>
            <EcosystemGraph3D graphData={ecosystemData} onNodeClick={handleNodeClick} />
          </div>
        )}

        {recentActivities && recentActivities.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Your Activity Stream</h3>
            <RealTimeActivityStream3D activities={recentActivities} />
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}