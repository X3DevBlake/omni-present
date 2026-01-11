import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Download, Share2, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DocumentWorkspace({ workspaceId, userEmail }) {
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('market_analysis');
  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', workspaceId],
    queryFn: () => workspaceId ? base44.entities.CollaborativeDocument.filter({ workspace_id: workspaceId }).catch(() => []) : []
  });

  const createDoc = useMutation({
    mutationFn: async () => {
      return await base44.entities.CollaborativeDocument.create({
        workspace_id: workspaceId,
        user_email: userEmail,
        title: newDocTitle,
        document_type: newDocType,
        google_doc_id: `doc_${Date.now()}`,
        google_drive_url: `https://docs.google.com/document/d/doc_${Date.now()}`,
        content: { sections: [] },
        contributing_agents: [],
        edit_history: [],
        status: 'draft'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', workspaceId] });
      setNewDocTitle('');
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-bold">Collaborative Documents</h3>
      </div>

      {/* Create New Document */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
        <Input
          placeholder="Document title..."
          value={newDocTitle}
          onChange={(e) => setNewDocTitle(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <div className="flex gap-2">
          <Select value={newDocType} onValueChange={setNewDocType}>
            <SelectTrigger className="flex-1 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_analysis">Market Analysis</SelectItem>
              <SelectItem value="financial_plan">Financial Plan</SelectItem>
              <SelectItem value="risk_report">Risk Report</SelectItem>
              <SelectItem value="trading_strategy">Trading Strategy</SelectItem>
              <SelectItem value="monthly_review">Monthly Review</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => createDoc.mutate()} disabled={!newDocTitle}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <motion.div
            key={doc.id || idx}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="text-white font-bold">{doc.title}</h4>
                <p className="text-white/60 text-xs">{doc.document_type}</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" title="Edit">
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" title="Download">
                  <Download className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" title="Share">
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>{doc.contributing_agents?.length || 0} agents</span>
              <span>•</span>
              <span className="capitalize">{doc.status}</span>
              <span>•</span>
              <span>{doc.edit_history?.length || 0} edits</span>
            </div>

            {doc.google_drive_url && (
              <a
                href={doc.google_drive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-xs mt-2 inline-block"
              >
                Open in Google Docs →
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}