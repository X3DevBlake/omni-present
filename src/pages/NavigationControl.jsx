import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import NavigationHubPortal3D from '../components/navigation/NavigationHubPortal3D';
import AdaptiveNavigationAI from '../components/navigation/AdaptiveNavigationAI';

export default function NavigationControl() {
  const navigate = useNavigate();
  const [currentHub, setCurrentHub] = useState('');

  const handleNavigate = (path) => {
    setCurrentHub(path);
    navigate(createPageUrl(path));
  };

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Navigation Control Center</h1>
          <p className="text-slate-400">AI-powered navigation and hub discovery</p>
        </motion.div>

        <Tabs defaultValue="portal" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="portal">
              <Compass className="w-4 h-4 mr-2" />
              3D Hub Portal
            </TabsTrigger>
            <TabsTrigger value="adaptive">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4 mr-2" />
              Layout Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portal">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Immersive Hub Navigation</CardTitle>
                <p className="text-slate-400 text-sm">
                  Click any portal to instantly navigate to that hub
                </p>
              </CardHeader>
              <CardContent>
                <NavigationHubPortal3D
                  onNavigate={handleNavigate}
                  currentHub={currentHub}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adaptive">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">AI Navigation Assistant</CardTitle>
                <p className="text-slate-400 text-sm">
                  Get intelligent suggestions based on your activity
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-lg p-8 text-center">
                  <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">
                    AI Navigation Active
                  </h3>
                  <p className="text-slate-300 mb-4">
                    The AI assistant will appear on the right side of your screen with contextual suggestions
                    as you navigate through the platform.
                  </p>
                  <Button
                    onClick={() => navigate(createPageUrl('AIManagement'))}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Try It Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Navigation Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center"
                  >
                    <Layout className="w-8 h-8 mb-2" />
                    <span>Compact</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center border-purple-500 bg-purple-500/20"
                  >
                    <Layout className="w-8 h-8 mb-2" />
                    <span>Expanded</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center justify-center"
                  >
                    <Layout className="w-8 h-8 mb-2" />
                    <span>Immersive</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Assistant Demo */}
        <AdaptiveNavigationAI />
      </div>
    </AuroraBackground>
  );
}