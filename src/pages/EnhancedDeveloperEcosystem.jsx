import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Code, BookOpen, Package, Bug, Sparkles } from 'lucide-react';

import AICodeGenerationStudio from '../components/developer/AICodeGenerationStudio';
import LivingDocumentationHub from '../components/documentation/LivingDocumentationHub';
import AISkillMarketplace from '../components/marketplace/AISkillMarketplace';
import SpatialSDKDebugger3D from '../components/developer/SpatialSDKDebugger3D';

export default function EnhancedDeveloperEcosystem() {
  const { data: codeRequests = [] } = useQuery({
    queryKey: ['code-requests'],
    queryFn: () => base44.entities.CodeGenerationRequest.list()
  });

  const { data: skills = [] } = useQuery({
    queryKey: ['ai-skills'],
    queryFn: () => base44.entities.AISkillModule.list()
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['documentation'],
    queryFn: () => base44.entities.DocumentationArticle.list()
  });

  const stats = {
    codeGenerated: codeRequests.length,
    skillsAvailable: skills.length,
    docsArticles: docs.length,
    aiGenDocs: docs.filter(d => d.ai_generated).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Code className="w-10 h-10 text-indigo-400" />
            Enhanced Developer Ecosystem
          </h1>
          <p className="text-slate-400">
            AI-assisted code generation • Living documentation • Skill marketplace • Spatial debugging
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.codeGenerated}</div>
              <div className="text-xs text-slate-400">Code Generated</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Package className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.skillsAvailable}</div>
              <div className="text-xs text-slate-400">Skills Available</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.docsArticles}</div>
              <div className="text-xs text-slate-400">Documentation</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur border-slate-700">
            <CardContent className="pt-6 text-center">
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.aiGenDocs}</div>
              <div className="text-xs text-slate-400">AI Generated</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="codegen" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-700 p-1">
            <TabsTrigger value="codegen" className="gap-2">
              <Code className="w-4 h-4" />
              Code Generation
            </TabsTrigger>
            <TabsTrigger value="debugger" className="gap-2">
              <Bug className="w-4 h-4" />
              Spatial Debugger
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="gap-2">
              <Package className="w-4 h-4" />
              Skill Marketplace
            </TabsTrigger>
            <TabsTrigger value="docs" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="codegen">
            <AICodeGenerationStudio />
          </TabsContent>

          <TabsContent value="debugger">
            <SpatialSDKDebugger3D />
          </TabsContent>

          <TabsContent value="marketplace">
            <AISkillMarketplace />
          </TabsContent>

          <TabsContent value="docs">
            <LivingDocumentationHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}