import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader, Sparkles, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MeetingAgendaGenerator({ userEmail }) {
  const [agenda, setAgenda] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateAgenda = async () => {
    setGenerating(true);
    try {
      // Get recent documents and conversations
      const documents = await base44.entities.CollaborativeDocument.list(
        { created_by: userEmail },
        '-last_modified',
        5
      );

      const conversations = await base44.entities.AIConversation.list(
        { user_email: userEmail },
        '-created_date',
        10
      );

      const comments = await base44.entities.DocumentComment.list(
        { authorEmail: userEmail },
        '-created_date',
        10
      );

      // Generate agenda with Gemini
      const agendaData = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive meeting agenda based on recent activity:

Recent Documents:
${JSON.stringify(documents, null, 2)}

Recent Conversations:
${JSON.stringify(conversations, null, 2)}

Recent Comments:
${JSON.stringify(comments, null, 2)}

Create an agenda with:
1. Meeting title
2. Key topics to discuss (extracted from document changes and conversations)
3. Action items that need review
4. Decisions needed
5. Time allocations for each topic
6. Attendees who should be invited (based on who's involved in documents/conversations)

Return structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  topic: { type: 'string' },
                  duration: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            action_items: { type: 'array', items: { type: 'string' } },
            decisions_needed: { type: 'array', items: { type: 'string' } },
            suggested_attendees: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setAgenda(agendaData);

      // Auto-send to Slack
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send this meeting agenda to Slack channel #meetings:

${agendaData.title}

Topics:
${agendaData.topics.map(t => `- ${t.topic} (${t.duration}): ${t.description}`).join('\n')}

Action Items to Review:
${agendaData.action_items.join('\n')}

Attendees: ${agendaData.suggested_attendees.join(', ')}`
      });

    } catch (error) {
      console.error('Error generating agenda:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        AI Meeting Agenda Generator
      </h3>

      <button
        onClick={generateAgenda}
        disabled={generating}
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Generating Agenda...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate from Recent Activity
          </>
        )}
      </button>

      {agenda && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Title */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
            <h4 className="text-white font-bold text-lg">{agenda.title}</h4>
          </div>

          {/* Topics */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Topics
            </h4>
            <div className="space-y-2">
              {agenda.topics?.map((topic, idx) => (
                <div key={idx} className="bg-white/5 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold text-sm">{topic.topic}</p>
                    <span className="text-cyan-400 text-xs">{topic.duration}</span>
                  </div>
                  <p className="text-white/60 text-xs">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 text-sm">Action Items to Review</h4>
            <ul className="space-y-1">
              {agenda.action_items?.map((item, idx) => (
                <li key={idx} className="text-white/70 text-sm">• {item}</li>
              ))}
            </ul>
          </div>

          {/* Decisions */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 text-sm">Decisions Needed</h4>
            <ul className="space-y-1">
              {agenda.decisions_needed?.map((decision, idx) => (
                <li key={idx} className="text-white/70 text-sm">• {decision}</li>
              ))}
            </ul>
          </div>

          {/* Attendees */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-white font-bold mb-2 text-sm">Suggested Attendees</h4>
            <p className="text-white/70 text-sm">{agenda.suggested_attendees?.join(', ')}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}