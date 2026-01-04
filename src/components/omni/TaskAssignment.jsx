import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function TaskAssignment({ annotationId, onAssign }) {
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: (data) => {
      return base44.entities.Annotation.update(annotationId, {
        ...data,
        assigned_to: assignee,
        due_date: dueDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      toast.success(`Task assigned to ${assignee}`);
      onAssign?.();
      setAssignee('');
      setDueDate('');
    },
  });

  const handleAssign = () => {
    if (!assignee.trim()) {
      toast.error('Please enter an assignee email');
      return;
    }
    assignMutation.mutate({});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-pink-400" />
        <span className="text-white font-medium text-sm">Assign Task</span>
      </div>

      <input
        type="email"
        placeholder="Assignee email..."
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:border-pink-500 focus:outline-none"
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500 focus:outline-none"
      />

      <button
        onClick={handleAssign}
        disabled={assignMutation.isPending}
        className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        {assignMutation.isPending ? 'Assigning...' : 'Assign Task'}
      </button>
    </div>
  );
}