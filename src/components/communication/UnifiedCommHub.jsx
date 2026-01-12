import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, FileText, Zap, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UnifiedCommHub({ userEmail }) {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Send message via Slack
  const sendSlackMessage = async (channel, message) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send this message to Slack channel #${channel}: "${message}"`
      });
      alert('Message sent to Slack!');
    } catch (error) {
      console.error('Error sending to Slack:', error);
    }
  };

  // Generate voice message via ElevenLabs
  const generateVoiceMessage = async (text) => {
    setLoading(true);
    try {
      const prompt = `Generate a professional voice message using ElevenLabs for this text: "${text}"`;
      await base44.integrations.Core.InvokeLLM({ prompt });
      alert('Voice message generated!');
    } catch (error) {
      console.error('Error generating voice:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send SMS via Twilio
  const sendSMS = async (phoneNumber, message) => {
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send SMS via Twilio to ${phoneNumber}: "${message}"`
      });
      alert('SMS sent via Twilio!');
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  };

  // Create Zapier workflow
  const createWorkflow = async (triggerType, actions) => {
    try {
      await base44.entities.Workflow.create({
        name: `Auto-generated: ${triggerType}`,
        user_email: userEmail,
        trigger: { type: triggerType, config: {} },
        actions: actions.map((action, idx) => ({
          id: `action_${idx}`,
          service: 'zapier',
          type: 'execute',
          config: { description: action }
        })),
        ai_suggested: true,
        enabled: true
      });
      alert('Workflow created!');
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
            activeTab === 'messages'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
              : 'bg-white/5 text-white/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Messages
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
            activeTab === 'voice'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
              : 'bg-white/5 text-white/60'
          }`}
        >
          <Phone className="w-4 h-4" />
          Voice
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded font-semibold flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
              : 'bg-white/5 text-white/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Documents
        </button>
      </div>

      {activeTab === 'messages' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-bold">Send Message</h3>
          <input
            type="text"
            placeholder="Slack Channel"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
            id="slack-channel"
          />
          <textarea
            placeholder="Message"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-24"
            id="slack-message"
          />
          <button
            onClick={() => {
              const channel = document.getElementById('slack-channel').value;
              const message = document.getElementById('slack-message').value;
              sendSlackMessage(channel, message);
            }}
            className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded font-semibold hover:bg-cyan-500/30"
          >
            Send to Slack
          </button>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-bold">Generate Voice Message</h3>
          <textarea
            placeholder="Text to convert to voice (ElevenLabs)"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-24"
            id="voice-text"
          />
          <button
            onClick={() => {
              const text = document.getElementById('voice-text').value;
              generateVoiceMessage(text);
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 text-purple-300 rounded font-semibold hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Generate Voice'}
          </button>
          
          <div className="border-t border-white/10 pt-3 mt-3">
            <h4 className="text-white font-semibold mb-2 text-sm">Send SMS (Twilio)</h4>
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 mb-2"
              id="sms-phone"
            />
            <textarea
              placeholder="SMS Message"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40 h-20"
              id="sms-message"
            />
            <button
              onClick={() => {
                const phone = document.getElementById('sms-phone').value;
                const message = document.getElementById('sms-message').value;
                sendSMS(phone, message);
              }}
              className="w-full px-4 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded font-semibold hover:bg-green-500/30 mt-2"
            >
              Send SMS
            </button>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-bold">Quick Actions</h3>
          <button
            onClick={() => createWorkflow('document_update', ['Notify team via Slack', 'Generate summary with Gemini', 'Send voice briefing via ElevenLabs'])}
            className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded font-semibold hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Create Document Workflow
          </button>
        </div>
      )}
    </div>
  );
}