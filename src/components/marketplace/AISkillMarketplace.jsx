import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Package, Star, Download, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

function SkillCard({ skill, onInstall }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-slate-900 border-slate-700 hover:border-indigo-600 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              {skill.module_name}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {skill.category}
              </Badge>
              <Badge variant="outline" className="text-xs bg-yellow-900 text-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                {skill.rating?.toFixed(1) || 'N/A'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-900 text-green-200">
                <Download className="w-3 h-3 mr-1" />
                {skill.installation_count || 0}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-400">
              {skill.price_omni || 0}
            </div>
            <div className="text-xs text-slate-400">OMNI</div>
          </div>
        </div>

        {expanded && skill.performance_metrics && (
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-800 rounded-lg">
            <div className="text-xs">
              <div className="text-slate-400">Success Rate</div>
              <div className="text-white font-semibold">
                {(skill.performance_metrics.success_rate * 100).toFixed(0)}%
              </div>
            </div>
            <div className="text-xs">
              <div className="text-slate-400">Avg Time</div>
              <div className="text-white font-semibold">
                {skill.performance_metrics.avg_execution_time_ms?.toFixed(0)}ms
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => onInstall(skill)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            size="sm"
          >
            Install Skill
          </Button>
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            size="sm"
          >
            {expanded ? 'Less' : 'Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AISkillMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['ai-skills', categoryFilter],
    queryFn: async () => {
      const filter = categoryFilter === 'all' ? {} : { category: categoryFilter };
      return await base44.entities.AISkillModule.filter(filter);
    }
  });

  const installMutation = useMutation({
    mutationFn: async (skill) => {
      await base44.entities.AISkillModule.update(skill.id, {
        installation_count: (skill.installation_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-skills'] });
      toast.success('Skill installed successfully!');
    }
  });

  const filteredSkills = skills.filter(skill =>
    !searchQuery ||
    skill.module_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ['all', 'spatial_navigation', 'object_recognition', 'predictive_analytics', 'natural_language', 'decision_making', 'emotional_intelligence'];

  const topSkills = [...skills].sort((a, b) => 
    (b.installation_count || 0) - (a.installation_count || 0)
  ).slice(0, 3);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            AI Skill Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="pl-10 bg-slate-900 text-white border-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                size="sm"
                variant={categoryFilter === cat ? 'default' : 'outline'}
                className={categoryFilter === cat ? 'bg-indigo-600' : ''}
              >
                {cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {topSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Trending Skills</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onInstall={() => installMutation.mutate(skill)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-white font-semibold">
          All Skills ({filteredSkills.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map(skill => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onInstall={() => installMutation.mutate(skill)}
            />
          ))}
        </div>
      </div>

      {filteredSkills.length === 0 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No skills found</p>
            <p className="text-sm text-slate-500 mt-2">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}