import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TaskDependencyBuilder({ tasks, onDependencyCreate }) {
  const [dependencies, setDependencies] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);
  const [selectedTo, setSelectedTo] = useState(null);

  const handleCreateDependency = async () => {
    if (!selectedFrom || !selectedTo || selectedFrom === selectedTo) return;

    try {
      const newDep = {
        from_task_id: selectedFrom,
        to_task_id: selectedTo,
        dependency_type: 'blocks'
      };
      
      setDependencies([...dependencies, newDep]);
      await base44.entities.TaskDependency?.create?.(newDep);
      
      setSelectedFrom(null);
      setSelectedTo(null);
      onDependencyCreate?.();
    } catch (error) {
      console.error('Failed to create dependency:', error);
    }
  };

  const handleRemoveDependency = async (index) => {
    const dep = dependencies[index];
    setDependencies(dependencies.filter((_, i) => i !== index));
    
    try {
      // Delete if has ID (persisted)
      if (dep.id) {
        await base44.entities.TaskDependency?.delete?.(dep.id);
      }
      onDependencyCreate?.();
    } catch (error) {
      console.error('Failed to remove dependency:', error);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Task Dependencies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dependency Builder */}
        <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-slate-300">Create task dependencies to visualize workflow</p>
          
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">From Task</label>
              <select
                value={selectedFrom || ''}
                onChange={(e) => setSelectedFrom(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm px-3 py-2 rounded"
              >
                <option value="">Select task...</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.task_name}</option>
                ))}
              </select>
            </div>
            
            <ArrowRight className="w-4 h-4 text-blue-400" />
            
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Blocks Task</label>
              <select
                value={selectedTo || ''}
                onChange={(e) => setSelectedTo(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm px-3 py-2 rounded"
              >
                <option value="">Select task...</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.task_name}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleCreateDependency}
              disabled={!selectedFrom || !selectedTo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dependencies List */}
        <div className="space-y-2">
          {dependencies.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No dependencies created yet</p>
          ) : (
            dependencies.map((dep, idx) => {
              const fromTask = tasks.find(t => t.id === dep.from_task_id);
              const toTask = tasks.find(t => t.id === dep.to_task_id);
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-sm flex-1">
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-300">
                      {fromTask?.task_name}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300">
                      {toTask?.task_name}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleRemoveDependency(idx)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}