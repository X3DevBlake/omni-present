import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Share2, MessageSquare, Users, Download, Clock, ChevronRight, GitBranch, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import GlassCard from './GlassCard';
import VersionControl from './VersionControl';
import TaskAssignment from './TaskAssignment';
import { toast } from 'sonner';

export default function CollaborationPanel({ blueprintConfig, onClose }) {
  const [activeTab, setActiveTab] = useState('save');
  const [name, setName] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState('comment');
  const queryClient = useQueryClient();

  // Fetch user's blueprints
  const { data: blueprints } = useQuery({
    queryKey: ['blueprints'],
    queryFn: () => base44.entities.Blueprint.list('-created_date', 10),
  });

  // Save blueprint mutation
  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Blueprint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Blueprint saved successfully');
      setName('');
    },
  });

  // Save annotation mutation
  const annotationMutation = useMutation({
    mutationFn: (data) => base44.entities.Annotation.create(data),
    onSuccess: () => {
      toast.success('Annotation added');
      setAnnotation('');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a blueprint name');
      return;
    }

    saveMutation.mutate({
      name,
      configuration: blueprintConfig,
      constraints: blueprintConfig?.constraints || {},
      version: 1,
    });
  };

  const handleShare = () => {
    if (!shareEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    toast.success(`Shared with ${shareEmail}`);
    setShareEmail('');
  };

  const handleAnnotate = (blueprintId) => {
    if (!annotation.trim()) {
      toast.error('Please enter annotation content');
      return;
    }

    annotationMutation.mutate({
      blueprint_id: blueprintId,
      content: annotation,
      type: annotationType,
    });
  };

  const tabs = [
    { id: 'save', label: 'Save', icon: Save },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'versions', label: 'Versions', icon: GitBranch },
    { id: 'share', label: 'Share', icon: Share2 },
    { id: 'annotate', label: 'Annotate', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: UserPlus },
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40 w-full max-w-md">
      <GlassCard className="p-4" glow glowColor="purple">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-500/30 border border-purple-500 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === 'save' && (
            <div>
              <input
                type="text"
                placeholder="Blueprint name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:border-purple-500 focus:outline-none mb-3"
              />
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Blueprint'}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {blueprints?.length > 0 ? (
                blueprints.map((bp) => (
                  <div key={bp.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-white font-medium text-sm">{bp.name}</span>
                      <span className="text-white/40 text-xs">v{bp.version}</span>
                    </div>
                    <div className="text-white/50 text-xs">
                      {new Date(bp.created_date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-white/40 text-sm py-8">No saved blueprints yet</div>
              )}
            </div>
          )}

          {activeTab === 'share' && (
            <div>
              <input
                type="email"
                placeholder="Team member email..."
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:border-purple-500 focus:outline-none mb-3"
              />
              <button
                onClick={handleShare}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm"
              >
                Share Blueprint
              </button>
              <div className="mt-3 text-white/50 text-xs">
                Shared users can view and annotate this blueprint
              </div>
            </div>
          )}

          {activeTab === 'versions' && blueprints?.[0] && (
            <VersionControl 
              blueprintId={blueprints[0].id}
              onRevert={() => toast.success('Blueprint reverted')}
            />
          )}

          {activeTab === 'annotate' && (
            <div>
              <div className="flex gap-2 mb-2">
                {['comment', 'question', 'suggestion', 'issue'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAnnotationType(type)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      annotationType === type
                        ? 'bg-pink-500/30 text-pink-300'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add your annotation..."
                value={annotation}
                onChange={(e) => setAnnotation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:border-purple-500 focus:outline-none mb-3 resize-none"
              />
              <button
                onClick={() => blueprints?.[0] && handleAnnotate(blueprints[0].id)}
                disabled={annotationMutation.isPending}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm"
              >
                {annotationMutation.isPending ? 'Adding...' : 'Add Annotation'}
              </button>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskAssignment
              annotationId={blueprints?.[0]?.id}
              onAssign={() => setActiveTab('history')}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
}