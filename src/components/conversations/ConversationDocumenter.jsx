import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

export default function ConversationDocumenter() {
  const [docTitle, setDocTitle] = useState('');

  const documentConversations = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/auto-document-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docTitle })
      });
      if (!response.ok) throw new Error('Failed to document');
      return response.json();
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-lg">
          <FileText className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Google Docs Documentation</h3>
          <p className="text-white/60 text-sm">Auto-document all conversations</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Document title (optional)"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          className="bg-white/5 border-white/10"
        />

        <Button
          onClick={() => documentConversations.mutate()}
          disabled={documentConversations.isPending}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
        >
          {documentConversations.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Documenting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Create Documentation
            </>
          )}
        </Button>

        {documentConversations.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white font-bold text-sm">Documentation Created</span>
            </div>
            <p className="text-white/60 text-sm mb-3">
              {documentConversations.data.conversationsDocumented} conversations documented
            </p>
            <a
              href={documentConversations.data.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Docs
            </a>
          </motion.div>
        )}

        {documentConversations.error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{documentConversations.error.message}</p>
            <p className="text-white/60 text-xs mt-1">
              Make sure Google Docs is connected in your integrations
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}