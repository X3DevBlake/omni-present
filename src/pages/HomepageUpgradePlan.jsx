import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Rocket, Filter, Search, TrendingUp, 
  CheckCircle, Clock, AlertCircle, Play 
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomepageUpgradePlan() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const queryClient = useQueryClient();

  const { data: upgrades, isLoading } = useQuery({
    queryKey: ['homepage-upgrades'],
    queryFn: async () => {
      const all = await base44.entities.UpgradeTracker.list('-created_date', 1000);
      return all.filter(u => u.technical_details?.page === 'Homepage');
    }
  });

  const generateUpgrades = useMutation({
    mutationFn: async () => {
      // Call the backend function to generate upgrades
      return await base44.integrations.Core.InvokeLLM({
        prompt: 'Generate homepage upgrades',
        response_json_schema: {
          type: 'object',
          properties: { status: { type: 'string' } }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-upgrades'] });
      toast.success('1000 homepage upgrades generated!');
    }
  });

  const updateUpgradeStatus = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.UpgradeTracker.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-upgrades'] });
    }
  });

  const filteredUpgrades = React.useMemo(() => {
    if (!upgrades) return [];
    
    return upgrades.filter(upgrade => {
      const matchesSearch = upgrade.upgrade_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           upgrade.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || upgrade.technical_details?.focus_area === filterCategory;
      const matchesPriority = filterPriority === 'all' || upgrade.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || upgrade.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [upgrades, searchQuery, filterCategory, filterPriority, filterStatus]);

  const stats = React.useMemo(() => {
    if (!upgrades) return { total: 0, planned: 0, inProgress: 0, completed: 0 };
    
    return {
      total: upgrades.length,
      planned: upgrades.filter(u => u.status === 'planned').length,
      inProgress: upgrades.filter(u => u.status === 'in_progress').length,
      completed: upgrades.filter(u => u.status === 'completed').length,
      avgEffort: (upgrades.reduce((sum, u) => sum + (u.estimated_effort_hours || 0), 0) / upgrades.length).toFixed(1)
    };
  }, [upgrades]);

  const categories = [...new Set(upgrades?.map(u => u.technical_details?.focus_area).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10 text-cyan-400" />
              Homepage Upgrade Plan
            </h1>
            <p className="text-gray-300">1000 enhancements to revolutionize the homepage experience</p>
          </div>
          {(!upgrades || upgrades.length === 0) && (
            <Button 
              onClick={() => generateUpgrades.mutate()}
              disabled={generateUpgrades.isPending}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generateUpgrades.isPending ? 'Generating...' : 'Generate 1000 Upgrades'}
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-gray-300">Total Upgrades</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.planned}</div>
              <div className="text-sm text-gray-300">Planned</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.inProgress}</div>
              <div className="text-sm text-gray-300">In Progress</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-300">Completed</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-400 mb-1">{stats.avgEffort}h</div>
              <div className="text-sm text-gray-300">Avg Effort</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search upgrades..."
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-white"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Upgrades List */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Upgrade Items ({filteredUpgrades.length})</span>
              <Filter className="w-5 h-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading && (
                <div className="text-center py-8 text-gray-400">Loading upgrades...</div>
              )}

              {!isLoading && filteredUpgrades.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {upgrades?.length === 0 ? 'No upgrades generated yet' : 'No upgrades match your filters'}
                </div>
              )}

              {filteredUpgrades.map(upgrade => (
                <div key={upgrade.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{upgrade.upgrade_name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{upgrade.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={
                          upgrade.priority === 'critical' ? 'destructive' :
                          upgrade.priority === 'high' ? 'default' :
                          'secondary'
                        }>
                          {upgrade.priority}
                        </Badge>
                        
                        <Badge variant="outline" className="text-cyan-400">
                          {upgrade.technical_details?.focus_area}
                        </Badge>

                        <Badge variant="outline" className="text-gray-300">
                          {upgrade.estimated_effort_hours}h
                        </Badge>

                        {upgrade.status === 'completed' && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {upgrade.status === 'in_progress' && (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {upgrade.status === 'planned' && (
                        <Button
                          size="sm"
                          onClick={() => updateUpgradeStatus.mutate({ id: upgrade.id, status: 'in_progress' })}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {upgrade.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateUpgradeStatus.mutate({ id: upgrade.id, status: 'completed' })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {upgrade.completion_percentage > 0 && upgrade.status === 'in_progress' && (
                    <Progress value={upgrade.completion_percentage} className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}