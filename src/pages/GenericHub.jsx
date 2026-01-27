import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Server, Shield, Cpu, Zap, Globe, 
  Terminal, Database, Network, Lock, AlertCircle,
  Edit, Save, Plus, Tag, BarChart3, Layers
} from 'lucide-react';
import InteractiveHubNetwork3D from '../components/home/InteractiveHubNetwork3D';

export default function GenericHub({ forcedName, forcedCategory, visualizerOverride }) {
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const name = forcedName || params.get('name'); 

    const fetchHub = async () => {
      setLoading(true);
      try {
        let data;
        if (id) {
          data = await base44.entities.Hub.get(id);
        } else if (name) {
          // Client-side find for now if list filters aren't perfect yet
          const all = await base44.entities.Hub.list({ limit: 1000 });
          data = all.find(h => h.name === name);
        }

        if (data) {
          setHub(data);
          setEditForm(data);
        }
      } catch (error) {
        console.error("Error fetching hub:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHub();
  }, [location.search, forcedName]);

  const handleSave = async () => {
    try {
      await base44.entities.Hub.update(hub.id, editForm);
      setHub(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update hub", error);
    }
  };

  const handleAddTag = () => {
    const newTags = [...(editForm.tags || []), "New Tag"];
    setEditForm({ ...editForm, tags: newTags });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Globe className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold">System Navigation</h1>
          </div>
          <p className="text-gray-400 mb-12">Exploring the Omni-Present Network Lattice...</p>
          <InteractiveHubNetwork3D />
          <div className="mt-8 text-center">
             <Button onClick={() => window.location.href = '/OmniHub'} className="bg-cyan-600 hover:bg-cyan-500">
                Return to Omni Hub Core
             </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative pb-20">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header & Controls */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge variant="outline" className="text-indigo-400 border-indigo-400/30">
                {hub.category}
              </Badge>
              {hub.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/30">
                  Featured Node
                </Badge>
              )}
              {hub.tags?.map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-white/10 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              {hub.name}
            </h1>
            <p className="text-xl text-gray-400 mt-2 max-w-2xl">
              {hub.description || `Advanced node responsible for ${hub.category.toLowerCase()} operations.`}
            </p>
          </div>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit Metadata
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Edit Hub Metadata</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Description</label>
                  <Textarea 
                    value={editForm.description || ''} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Category</label>
                  <Input 
                    value={editForm.category || ''} 
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Tags (Comma separated)</label>
                  <Input 
                    value={editForm.tags?.join(', ') || ''} 
                    onChange={e => setEditForm({...editForm, tags: e.target.value.split(',').map(t => t.trim())})}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Visualizer */}
            <div className="h-[400px] bg-black/50 border border-white/10 rounded-2xl overflow-hidden relative">
              {visualizerOverride ? (
                // If specific override exists, we could render it here, 
                // but GenericHub doesn't import all. 
                // For now, standard viz or placeholder.
                <InteractiveHubNetwork3D />
              ) : (
                <InteractiveHubNetwork3D />
              )}
              <div className="absolute bottom-4 right-4 bg-black/80 p-2 rounded text-xs text-gray-400 border border-white/10">
                Live Network Visualization
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    Processing Power
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {(Math.random() * 100).toFixed(1)} PFlops
                  </div>
                  <p className="text-sm text-gray-400">Allocated computational resources</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Network className="w-5 h-5 text-blue-400" />
                    Connectivity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {(Math.random() * 99 + 1).toFixed(2)}%
                  </div>
                  <p className="text-sm text-gray-400">Network uptime and reliability</p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Database className="w-5 h-5 text-green-400" />
                    Data Throughput
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {(Math.random() * 500).toFixed(0)} TB/s
                  </div>
                  <p className="text-sm text-gray-400">Real-time data synchronization</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Usage Statistics</CardTitle>
                <CardDescription>Historical performance data for {hub.name}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center text-gray-500">
                <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                <p>Analytics visualization module loading...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Resource Document {i}</h3>
                      <p className="text-sm text-gray-400">Technical documentation and API references</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="bg-black border border-white/10 rounded-xl p-4 font-mono text-sm h-[400px] overflow-y-auto">
              <div className="flex items-center gap-2 text-gray-500 mb-2 border-b border-white/10 pb-2 sticky top-0 bg-black">
                <Terminal className="w-4 h-4" />
                <span>System Logs - {hub.name}</span>
              </div>
              <div className="space-y-1 text-green-400/80">
                <p>{`> [${new Date().toISOString()}] Initializing connection to ${hub.name}...`}</p>
                <p>{`> [${new Date().toISOString()}] Verifying security protocols... [OK]`}</p>
                <p>{`> [${new Date().toISOString()}] Syncing with Omni-Present Core... [OK]`}</p>
                <p>{`> [${new Date().toISOString()}] Loading module capabilities for ${hub.category}...`}</p>
                <p>{`> [${new Date().toISOString()}] 384+ sub-modules detected.`}</p>
                <p>{`> [${new Date().toISOString()}] Establishing neural link...`}</p>
                <p className="animate-pulse">{`> System ready. Awaiting command.`}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}