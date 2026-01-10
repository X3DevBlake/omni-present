import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CreateGuideline() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'fairness',
    severity: 'medium',
    applicable_to: [],
  });

  const queryClient = useQueryClient();
  const agentTypes = ['financial', 'trading', 'portfolio', 'risk', 'analysis'];
  const categories = ['transparency', 'fairness', 'safety', 'privacy', 'accountability', 'sustainability'];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EthicsGuideline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ethicsGuidelines'] });
      setFormData({ title: '', description: '', category: 'fairness', severity: 'medium', applicable_to: [] });
      setOpen(false);
    },
  });

  const toggleAgentType = (type) => {
    setFormData({
      ...formData,
      applicable_to: formData.applicable_to.includes(type)
        ? formData.applicable_to.filter(t => t !== type)
        : [...formData.applicable_to, type],
    });
  };

  const handleSubmit = () => {
    if (formData.title && formData.description) {
      createMutation.mutate(formData);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Guideline
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6"
    >
      <h3 className="text-lg font-bold text-white mb-4">Create Ethics Guideline</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">Title</label>
          <Input
            placeholder="e.g., Data Privacy Protection"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Description</label>
          <Textarea
            placeholder="Describe the guideline..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-white/5 border-white/10 text-white h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Applicable To</label>
          <div className="space-y-2">
            {agentTypes.map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.applicable_to.includes(type)}
                  onChange={() => toggleAgentType(type)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-white/70 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.description}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            Create Guideline
          </Button>
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}