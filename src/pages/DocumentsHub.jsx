import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OmniDataOrb3D from '../components/academy/OmniDataOrb3D';
import BookVisualizer3D from '../components/academy/BookVisualizer3D';
import UniversalHolographicOverlay from '../components/holographic/UniversalHolographicOverlay';
import { BookOpen, Database, Sparkles, FileText, Globe } from 'lucide-react';

export default function DocumentsHub() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState('orb');

  const { data: articles = [] } = useQuery({
    queryKey: ['all-documentation'],
    queryFn: () => base44.entities.DocumentationArticle.list()
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const categorizedDocs = {
    getting_started: articles.filter(a => a.category === 'getting_started'),
    entities: articles.filter(a => a.category === 'entities'),
    functions: articles.filter(a => a.category === 'functions'),
    spatial_mapping: articles.filter(a => a.category === 'spatial_mapping'),
    ai_agents: articles.filter(a => a.category === 'ai_agents'),
    tutorials: articles.filter(a => a.category === 'tutorials')
  };

  if (viewMode === 'orb') {
    return (
      <div className="relative">
        <div className="absolute top-6 left-6 z-20">
          <Button
            onClick={() => setViewMode('list')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Switch to List View
          </Button>
        </div>
        <OmniDataOrb3D />
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="relative">
        <div className="absolute top-6 left-6 z-20">
          <Button
            onClick={() => setSelectedCourse(null)}
            variant="outline"
            className="border-white/20 text-white bg-black/40 backdrop-blur-xl"
          >
            ← Back to Catalog
          </Button>
        </div>
        <BookVisualizer3D
          courseId={selectedCourse.course_id}
          moduleIds={selectedCourse.modules}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-6">
      <UniversalHolographicOverlay />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Documents & Knowledge Hub
            </h1>
            <p className="text-gray-300">
              Comprehensive platform documentation with holographic visualization
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setViewMode('orb')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Globe className="w-4 h-4 mr-2" />
              3D Data Orb
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Search
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{articles.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{courses.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {articles.filter(a => a.ai_generated).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {articles.reduce((sum, a) => sum + (a.views_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="bg-white/10 backdrop-blur-xl border-white/20">
          <TabsTrigger value="courses" className="text-white">Courses</TabsTrigger>
          <TabsTrigger value="documentation" className="text-white">Documentation</TabsTrigger>
          <TabsTrigger value="tutorials" className="text-white">Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-blue-400/50 transition-all cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{course.title}</CardTitle>
                    <p className="text-sm text-gray-300 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {course.modules?.length || 0} modules
                      </span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(categorizedDocs).map(([category, docs]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white capitalize">
                      {category.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {docs.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white/5 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                        >
                          <div className="text-sm text-white font-medium">{doc.title}</div>
                          <div className="text-xs text-gray-400">
                            {doc.difficulty_level} • {doc.views_count || 0} views
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {categorizedDocs.tutorials.map((tutorial, idx) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{tutorial.title}</CardTitle>
                        <p className="text-sm text-gray-300 mt-2">
                          {tutorial.content_markdown?.substring(0, 150)}...
                        </p>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Start
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}