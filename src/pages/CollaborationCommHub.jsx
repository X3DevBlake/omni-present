import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Bell, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import UnifiedCommHub from '../components/communication/UnifiedCommHub';
import SmartDocumentEditor from '../components/collaboration/SmartDocumentEditor';
import EnhancedNotificationSystem from '../components/notifications/EnhancedNotificationSystem';

export default function CollaborationCommHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const user = await base44.auth.me();
        setUserEmail(user?.email);
        
        // Create or load default document
        const docs = await base44.entities.CollaborativeDocument.list(
          { created_by: user?.email },
          '-created_date',
          1
        );
        
        if (docs[0]) {
          setDocumentId(docs[0].id);
        } else {
          const newDoc = await base44.entities.CollaborativeDocument.create({
            title: 'My Document',
            content: '',
            collaborators: [user?.email]
          });
          setDocumentId(newDoc.id);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-cyan-400" />
            Collaboration & Communication Hub
          </h1>
          <p className="text-white/60 text-lg">
            Powered by Slack, Gemini, Zapier, ElevenLabs & Twilio
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="communication" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <UnifiedCommHub userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {documentId && userEmail ? (
                <SmartDocumentEditor documentId={documentId} userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {userEmail ? (
                <EnhancedNotificationSystem userEmail={userEmail} />
              ) : (
                <p className="text-white/60 text-center py-12">Loading...</p>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}