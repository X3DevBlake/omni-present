import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Search, Sparkles, ThumbsUp, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function LivingDocumentationHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const queryClient = useQueryClient();

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['documentation', selectedCategory],
    queryFn: async () => {
      const filter = selectedCategory === 'all' ? {} : { category: selectedCategory };
      return await base44.entities.DocumentationArticle.filter(filter);
    }
  });

  const generateDocsMutation = useMutation({
    mutationFn: async (topic) => {
      const response = await base44.functions.invoke('livingDocsGenerator', {
        topic,
        category: selectedCategory === 'all' ? 'tutorials' : selectedCategory,
        auto_update: false
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentation'] });
      toast.success('Documentation generated!');
    }
  });

  const voteHelpfulMutation = useMutation({
    mutationFn: async (articleId) => {
      const article = articles.find(a => a.id === articleId);
      await base44.entities.DocumentationArticle.update(articleId, {
        helpful_votes: (article.helpful_votes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentation'] });
      toast.success('Thanks for the feedback!');
    }
  });

  const filteredArticles = articles.filter(article =>
    !searchQuery || 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = ['all', 'getting_started', 'entities', 'functions', 'spatial_mapping', 'ai_agents', 'integrations', 'sdk_reference', 'tutorials'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="pl-10 bg-slate-800 text-white border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-slate-400 mb-2">Categories</div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                const topic = prompt('What topic should I document?');
                if (topic) generateDocsMutation.mutate(topic);
              }}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={generateDocsMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateDocsMutation.isPending ? 'Generating...' : 'Generate New Doc'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Articles</span>
              <span className="text-white font-semibold">{articles.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">AI Generated</span>
              <span className="text-green-400 font-semibold">
                {articles.filter(a => a.ai_generated).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Views</span>
              <span className="text-white font-semibold">
                {articles.reduce((sum, a) => sum + (a.views_count || 0), 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="lg:col-span-2 space-y-4">
        {selectedArticle ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-2xl mb-2">
                    {selectedArticle.title}
                  </CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="bg-indigo-900 text-indigo-200">
                      {selectedArticle.difficulty_level}
                    </Badge>
                    {selectedArticle.ai_generated && (
                      <Badge variant="outline" className="bg-purple-900 text-purple-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedArticle.views_count || 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {selectedArticle.helpful_votes || 0} helpful
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedArticle(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown>{selectedArticle.content_markdown}</ReactMarkdown>
              </div>

              {selectedArticle.code_examples?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Code Examples</h3>
                  {selectedArticle.code_examples.map((example, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-sm text-slate-400">{example.description}</div>
                      <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-green-400">
                          <code>{example.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => voteHelpfulMutation.mutate(selectedArticle.id)}
                  variant="outline"
                  className="gap-2"
                  disabled={voteHelpfulMutation.isPending}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No documentation found</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Try generating documentation for a new topic
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map(article => (
                <Card
                  key={article.id}
                  className="bg-slate-900 border-slate-700 hover:border-indigo-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">{article.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags?.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {article.helpful_votes || 0}
                          </span>
                          {article.ai_generated && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-indigo-900 text-indigo-200">
                        {article.difficulty_level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}