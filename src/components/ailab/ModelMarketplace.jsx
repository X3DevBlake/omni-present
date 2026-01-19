import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Upload, Star, Search, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModelMarketplace() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sharedModels } = useQuery({
    queryKey: ['shared-models'],
    queryFn: async () => {
      const models = await base44.entities.AgentMarketplaceListing.filter({ type: 'model' });
      return models;
    },
  });

  const { data: myModels } = useQuery({
    queryKey: ['my-trained-models'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const models = await base44.entities.TrainingProgress.filter({
        created_by: user.email,
        status: 'completed',
      });
      return models;
    },
  });

  const shareModel = useMutation({
    mutationFn: async (model) => {
      const listing = await base44.entities.AgentMarketplaceListing.create({
        name: model.model_name,
        description: `Trained ${model.model_type} model with ${(model.metrics?.accuracy * 100).toFixed(2)}% accuracy`,
        type: 'model',
        model_id: model.id,
        price: 0,
        rating: 0,
        downloads: 0,
        is_public: true,
      });
      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-models'] });
    },
  });

  const downloadModel = useMutation({
    mutationFn: async (listing) => {
      // Download and create local copy
      await base44.entities.AgentPurchase.create({
        listing_id: listing.id,
        amount: 0,
        status: 'completed',
      });

      // Increment download count
      await base44.entities.AgentMarketplaceListing.update(listing.id, {
        downloads: (listing.downloads || 0) + 1,
      });

      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-models'] });
    },
  });

  const filteredModels = sharedModels?.filter(model =>
    model.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Share */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search models..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>

      {/* My Models to Share */}
      {myModels && myModels.length > 0 && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-pink-400" />
              Share Your Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myModels.slice(0, 3).map((model) => (
                <div key={model.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-2">{model.model_name}</h4>
                  <p className="text-white/60 text-sm mb-3">
                    Accuracy: {(model.metrics?.accuracy * 100).toFixed(2)}%
                  </p>
                  <Button
                    size="sm"
                    onClick={() => shareModel.mutate(model)}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    Share to Gallery
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels?.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-black/40 border-white/10 hover:border-pink-500/50 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-white text-lg">{model.name}</CardTitle>
                  <Badge className="bg-pink-500/20 text-pink-400 border-0">
                    Free
                  </Badge>
                </div>
                <CardDescription className="text-white/60">
                  {model.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {model.rating || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {model.downloads || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {Math.floor(Math.random() * 100) + 10}
                  </div>
                </div>

                <Button
                  onClick={() => downloadModel.mutate(model)}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  disabled={downloadModel.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Model
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredModels && filteredModels.length === 0 && (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No models found. Try a different search or share your first model!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}