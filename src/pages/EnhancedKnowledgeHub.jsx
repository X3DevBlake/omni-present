import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import KnowledgeGraph3D from '@/components/knowledge/KnowledgeGraph3D';
import { BookOpen, Search, Eye, ThumbsUp } from 'lucide-react';

export default function EnhancedKnowledgeHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: () => base44.entities.KnowledgeArticle.filter({ status: 'published' })
  });

  const searchMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.functions.invoke('semanticSearch', {
        query,
        limit: 10
      });
      return response.data;
    }
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const categories = [...new Set(articles.map(a => a.category))];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-cyan-400" />
            Enhanced Knowledge Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered semantic search and knowledge management
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask anything... (AI-powered semantic search)"
                  className="bg-slate-800 border-slate-600 text-white pl-12 text-lg"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searchMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {searchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchMutation.data && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {searchMutation.data.results.map((result) => (
                  <Card key={result.id} className="bg-slate-800/50 border-slate-600">
                    <CardContent className="pt-4">
                      <h3 className="text-white font-semibold mb-2">{result.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{result.matching_excerpt}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600">
                          Relevance: {(result.relevance_score * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="outline" className="text-gray-400">
                          {result.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="3d">3D Knowledge Graph</TabsTrigger>
            <TabsTrigger value="browse">Browse Articles</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <KnowledgeGraph3D
                  articles={articles}
                  onArticleClick={setSelectedArticle}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="browse">
            <div className="space-y-4">
              {categories.map((category) => {
                const categoryArticles = articles.filter(a => a.category === category);
                return (
                  <Card key={category} className="bg-slate-900/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryArticles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                            onClick={() => setSelectedArticle(article)}
                          >
                            <span className="text-white">{article.title}</span>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.view_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {article.helpful_count || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="space-y-3">
              {[...articles]
                .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                .slice(0, 10)
                .map((article, idx) => (
                  <Card key={article.id} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl font-bold text-cyan-400">#{idx + 1}</div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="text-gray-400">
                              {article.category}
                            </Badge>
                            <span className="text-gray-400 flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {article.view_count || 0} views
                            </span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4" />
                              {article.helpful_count || 0} helpful
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}