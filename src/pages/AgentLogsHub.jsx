import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentInteractionLogger from '../components/logging/AgentInteractionLogger';
import AgentInteractionFlow3D from '../components/3d/AgentInteractionFlow3D';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Globe } from 'lucide-react';

export default function AgentLogsHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Agent Interaction Logs</h1>
          <p className="text-gray-600">
            Comprehensive logging and visualization of all agent interactions
          </p>
        </div>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              3D Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <AgentInteractionLogger />
          </TabsContent>

          <TabsContent value="3d">
            <Card>
              <CardHeader>
                <CardTitle>Agent Interaction Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentInteractionFlow3D height="700px" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}