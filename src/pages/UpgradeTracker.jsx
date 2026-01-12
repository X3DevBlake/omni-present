import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function UpgradeTracker() {
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    upgrade_id: '',
    upgrade_name: '',
    category: 'new_feature',
    priority: 'medium',
    status: 'planned',
    description: '',
    completion_percentage: 0
  });

  const queryClient = useQueryClient();

  const { data: upgrades } = useQuery({
    queryKey: ['upgrades'],
    queryFn: () => base44.entities.UpgradeTracker.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.UpgradeTracker.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      setIsCreating(false);
      toast.success('Upgrade created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UpgradeTracker.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrades'] });
      toast.success('Upgrade updated');
    },
  });

  const filteredUpgrades = React.useMemo(() => {
    if (!upgrades) return [];
    return upgrades.filter(u => {
      const categoryMatch = filterCategory === 'all' || u.category === filterCategory;
      const statusMatch = filterStatus === 'all' || u.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [upgrades, filterCategory, filterStatus]);

  const stats = React.useMemo(() => {
    if (!upgrades) return null;
    return {
      total: upgrades.length,
      completed: upgrades.filter(u => u.status === 'completed').length,
      inProgress: upgrades.filter(u => u.status === 'in_progress').length,
      planned: upgrades.filter(u => u.status === 'planned').length,
      avgProgress: upgrades.reduce((sum, u) => sum + (u.completion_percentage || 0), 0) / upgrades.length
    };
  }, [upgrades]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      upgrade_id: `UPG-${Date.now()}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Upgrade Tracker</h1>
            <p className="text-gray-300">Track all 5000+ system upgrades and enhancements</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Upgrade
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Upgrade</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Upgrade Name"
                  value={formData.upgrade_name}
                  onChange={(e) => setFormData({...formData, upgrade_name: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ui_ux">UI/UX</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="new_feature">New Feature</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="ai_enhancement">AI Enhancement</SelectItem>
                      <SelectItem value="backend_optimization">Backend Optimization</SelectItem>
                      <SelectItem value="data_model">Data Model</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({...formData, priority: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-800 border-gray-700 text-white rounded-md"
                  rows={4}
                />

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Create Upgrade
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Total Upgrades</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.total}</span>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-green-400">{stats.completed}</span>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-yellow-400">{stats.inProgress}</span>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Planned</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-blue-400">{stats.planned}</span>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Avg Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white">{stats.avgProgress.toFixed(0)}%</span>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ui_ux">UI/UX</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="new_feature">New Feature</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upgrades List */}
        <div className="space-y-3">
          {filteredUpgrades.map(upgrade => (
            <Card key={upgrade.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {upgrade.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : upgrade.status === 'in_progress' ? (
                        <Clock className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-400" />
                      )}
                      <h3 className="text-lg font-semibold text-white">{upgrade.upgrade_name}</h3>
                    </div>
                    {upgrade.description && (
                      <p className="text-sm text-gray-300 mb-3">{upgrade.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={
                      upgrade.priority === 'critical' ? 'destructive' :
                      upgrade.priority === 'high' ? 'outline' : 'secondary'
                    }>
                      {upgrade.priority}
                    </Badge>
                    <Badge variant="outline">{upgrade.category}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Progress</span>
                    <span>{upgrade.completion_percentage}%</span>
                  </div>
                  <Progress value={upgrade.completion_percentage} className="h-2" />
                </div>

                <div className="flex gap-4 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateMutation.mutate({
                      id: upgrade.id,
                      data: { 
                        status: upgrade.status === 'completed' ? 'in_progress' : 
                               upgrade.status === 'in_progress' ? 'completed' : 'in_progress'
                      }
                    })}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    {upgrade.status === 'planned' ? 'Start' : 
                     upgrade.status === 'in_progress' ? 'Complete' : 'Reopen'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}