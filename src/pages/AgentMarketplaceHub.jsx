import React from 'react';
import AgentMarketplace from '../components/marketplace/AgentMarketplace';
import { Store, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AgentMarketplaceHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Store className="w-10 h-10 text-indigo-500" />
            Agent Marketplace
          </h1>
          <p className="text-gray-600">
            Discover, deploy, and share intelligent AI agents with the community
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">250+</p>
              <p className="text-sm text-gray-600">Available Agents</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
            <CardContent className="p-6">
              <Store className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">50K+</p>
              <p className="text-sm text-gray-600">Total Downloads</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </CardContent>
          </Card>
        </div>

        <AgentMarketplace />
      </div>
    </div>
  );
}