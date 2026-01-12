import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Flag, Plus, Users, Percent } from 'lucide-react';
import { toast } from 'sonner';

export default function FeatureFlagManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    feature_key: '',
    feature_name: '',
    description: '',
    enabled: false,
    rollout_percentage: 0,
    environment: 'production'
  });

  const queryClient = useQueryClient();

  const { data: flags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => base44.entities.FeatureFlag.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureFlag.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      setIsCreating(false);
      toast.success('Feature flag created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureFlag.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      feature_key: formData.feature_key.toLowerCase().replace(/\s+/g, '_')
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Feature Flags</h1>
            <p className="text-gray-300">Control feature rollout and A/B testing</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">Feature Key</label>
                  <Input
                    value={formData.feature_key}
                    onChange={(e) => setFormData({...formData, feature_key: e.target.value})}
                    placeholder="new_dashboard_layout"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Feature Name</label>
                  <Input
                    value={formData.feature_name}
                    onChange={(e) => setFormData({...formData, feature_name: e.target.value})}
                    placeholder="New Dashboard Layout"
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the feature..."
                    className="w-full p-2 bg-gray-800 border-gray-700 text-white rounded-md"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Enabled</label>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Flag
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Total Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-white">{flags?.length || 0}</span>
                <Flag className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Enabled</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-400">
                {flags?.filter(f => f.enabled).length || 0}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">In Rollout</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-yellow-400">
                {flags?.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length || 0}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Flags List */}
        <div className="space-y-4">
          {flags?.map(flag => (
            <Card key={flag.id} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{flag.feature_name}</h3>
                      <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                      <Badge variant="outline">{flag.environment}</Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{flag.feature_key}</p>
                    {flag.description && (
                      <p className="text-sm text-gray-300">{flag.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(checked) => 
                      updateMutation.mutate({ id: flag.id, data: { enabled: checked } })
                    }
                  />
                </div>

                <div className="space-y-4">
                  {/* Rollout Percentage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Rollout Percentage
                      </label>
                      <span className="text-white font-bold">{flag.rollout_percentage}%</span>
                    </div>
                    <Slider
                      value={[flag.rollout_percentage]}
                      onValueChange={([value]) => 
                        updateMutation.mutate({ 
                          id: flag.id, 
                          data: { rollout_percentage: value } 
                        })
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Target Info */}
                  {(flag.target_users?.length > 0 || flag.target_roles?.length > 0) && (
                    <div className="flex gap-4 text-sm">
                      {flag.target_users?.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="w-4 h-4" />
                          <span>{flag.target_users.length} targeted users</span>
                        </div>
                      )}
                      {flag.target_roles?.length > 0 && (
                        <div className="text-gray-300">
                          Roles: {flag.target_roles.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}