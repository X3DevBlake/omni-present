import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../omni/AuroraBackground';
import TimeBasedGreeting from './TimeBasedGreeting';
import VoiceActivatedSearch from './VoiceActivatedSearch';
import PersonalizedKPIDashboard from './PersonalizedKPIDashboard';
import ProactiveInsightsPanel from './ProactiveInsightsPanel';
import AIRecommendationCards from './AIRecommendationCards';
import QuickActionsPanel from './QuickActionsPanel';
import EcosystemGraph3D from './EcosystemGraph3D';
import DataVisualizationCarousel from './DataVisualizationCarousel';
import RealTimeNotificationFeed from './RealTimeNotificationFeed';
import SmartTaskRecommender from './SmartTaskRecommender';
import PersonalizedNewsFeed from './PersonalizedNewsFeed';
import InteractiveMetricsGalaxy3D from './InteractiveMetricsGalaxy3D';
import GamificationProgressRing3D from './GamificationProgressRing3D';
import AIContextualAssistant from './AIContextualAssistant';
import AdaptiveNavigationAI from '../navigation/AdaptiveNavigationAI';
import VoiceNavigationControl from '../navigation/VoiceNavigationControl';
import PredictiveNavSuggestions from '../navigation/PredictiveNavSuggestions';
import SmartQuickAccess from '../navigation/SmartQuickAccess';
import CollaborativeUserPresence from './CollaborativeUserPresence';
import InteractiveTourGuide from './InteractiveTourGuide';
import DynamicWidgetGrid from './DynamicWidgetGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function EnhancedHomepageLayout() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: ecosystemData } = useQuery({
    queryKey: ['ecosystem-graph'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getEcosystemGraph', {});
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
    enabled: !!user,
    refetchInterval: 60000
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

  const { data: recentActivities } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => base44.entities.UserActivity.filter({ user_id: user.id }, '-timestamp', 30),
    enabled: !!user,
    refetchInterval: 5000
  });

  const { data: navigationData } = useQuery({
    queryKey: ['navigation-data'],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeNavigationIntelligence', {
        current_page: 'HomeEnhanced'
      });
      return response.data.pattern;
    },
    enabled: !!user
  });

  const { data: widgets } = useQuery({
    queryKey: ['user-widgets'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserWidgets', {});
      return response.data.widgets;
    },
    enabled: !!user
  });

  const { data: dashboardSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateDashboardSummary', {});
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 120000
  });

  const dismissInsight = useMutation({
    mutationFn: async (insightId) => {
      await base44.entities.ProactiveInsight.update(insightId, { acknowledged: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-insights'] });
    }
  });

  const updateWidgets = useMutation({
    mutationFn: async (updatedWidgets) => {
      await Promise.all(
        updatedWidgets.map((w, i) => 
          base44.entities.HomepageWidget.update(w.id, { display_order: i })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-widgets'] });
      toast.success('Widget layout saved');
    }
  });

  if (!user) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading your personalized experience...</div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <TimeBasedGreeting userName={user?.full_name} />

        {dashboardSummary && (
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-white text-lg font-semibold mb-2">Executive Summary</h3>
            <p className="text-white/80 mb-4">{dashboardSummary.summary}</p>
            {dashboardSummary.urgent_items?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {dashboardSummary.urgent_items.map((item, i) => (
                  <span key={i} className="text-xs bg-red-600/30 text-red-300 px-3 py-1 rounded-full">
                    ⚠️ {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <VoiceActivatedSearch />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-6">
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

            <SmartTaskRecommender />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8 mt-6">
            {ecosystemData && (
              <EcosystemGraph3D graphData={ecosystemData} />
            )}

            <InteractiveMetricsGalaxy3D />

            <DataVisualizationCarousel
              ecosystemData={ecosystemData}
              activities={recentActivities}
            />
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-8 mt-6">
            <RealTimeNotificationFeed />
            
            <PersonalizedNewsFeed />

            <GamificationProgressRing3D />
          </TabsContent>

          <TabsContent value="customize" className="space-y-8 mt-6">
            {widgets && (
              <DynamicWidgetGrid
                widgets={widgets}
                onReorder={(updated) => updateWidgets.mutate(updated)}
                onRemove={(id) => toast.info('Widget removed')}
                onAdd={() => toast.info('Add widget dialog')}
                onConfigure={(widget) => toast.info('Configure widget')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AIContextualAssistant
        currentPage="HomeEnhanced"
        userActivity={recentActivities}
      />

      <AdaptiveNavigationAI />
      
      <VoiceNavigationControl />

      {navigationData?.predicted_next_pages && (
        <PredictiveNavSuggestions predictions={navigationData.predicted_next_pages} />
      )}

      {navigationData?.most_visited_pages && (
        <SmartQuickAccess
          mostVisited={navigationData.most_visited_pages}
          recentPages={recentActivities?.filter(a => a.activity_type === 'page_view') || []}
        />
      )}

      <CollaborativeUserPresence currentPage="HomeEnhanced" />
    </AuroraBackground>
  );
}