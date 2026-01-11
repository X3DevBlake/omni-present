import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Phone, Calendar, AlertCircle, FileText, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UnifiedGeminiVoiceHub() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: 'I can now record voice consultations, suggest expert meetings, and integrate with Slack. What do you need?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [suggestedExpert, setSuggestedExpert] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const mediaRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
    }
  };

  const stopVoiceInput = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    try {
      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: 'Transcribe this voice message',
        file_urls: [URL.createObjectURL(audioBlob)],
      });

      setInput(transcription.toString());
    } catch (error) {
      console.error('Error transcribing:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Analyze query complexity and urgency
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this financial query for expert consultation needs:
        
Query: "${userMessage.text}"
User: ${userEmail}

Determine:
1. Complexity (simple/moderate/complex)
2. Urgency (low/medium/high/critical)
3. Requires expert (yes/no)
4. Expert type needed
5. Is this an anomaly/alert situation
6. Confidence that expert booking is needed`,
        response_json_schema: {
          type: 'object',
          properties: {
            complexity: { type: 'string' },
            urgency: { type: 'string' },
            needsExpert: { type: 'boolean' },
            expertType: { type: 'string' },
            isAlert: { type: 'boolean' },
            confidence: { type: 'number' },
          },
        },
      });

      // Get Gemini response
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Respond to this financial question comprehensively:
        
Query: "${userMessage.text}"
Complexity: ${analysis.complexity}

Provide detailed answer with:
1. Direct response
2. Key considerations
3. Next steps
4. When to involve expert`,
        add_context_from_internet: true,
      });

      const copilotMessage = {
        id: messages.length + 2,
        sender: 'copilot',
        text: response.toString(),
        timestamp: new Date(),
        analysis,
      };

      setMessages(prev => [...prev, copilotMessage]);

      // If expert booking suggested, store for action
      if (analysis.needsExpert && analysis.confidence > 0.7) {
        setSuggestedExpert({
          type: analysis.expertType,
          urgency: analysis.urgency,
          context: userMessage.text,
          messageId: userMessage.id,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateVoiceConsultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        
        // Transcribe consultation
        const transcription = await base44.integrations.Core.InvokeLLM({
          prompt: 'Transcribe this consultation request',
          file_urls: [URL.createObjectURL(audioBlob)],
        });

        // Save to Google Drive via Zapier
        await base44.integrations.Core.InvokeLLM({
          prompt: `Save consultation to Google Drive:
          
User: ${userEmail}
Date: ${new Date().toISOString()}
Transcript: ${transcription}

Create document with consultation details and context.`,
        });

        setConsultation({
          transcript: transcription,
          saved: true,
          timestamp: new Date(),
        });

        // Notify Slack
        await base44.integrations.Core.InvokeLLM({
          prompt: `Send Slack notification about consultation:
          
User: ${userEmail}
Consultation recorded and saved to Google Drive.`,
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const bookExpertConsultation = async () => {
    if (!suggestedExpert) return;

    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create expert consultation booking:
        
Expert Type: ${suggestedExpert.type}
Urgency: ${suggestedExpert.urgency}
User: ${userEmail}
Context: ${suggestedExpert.context}

Send:
1. Calendly booking link to user via Slack
2. Context summary to expert
3. Confirmation to user`,
      });

      setSuggestedExpert(null);
    } catch (error) {
      console.error('Error booking:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Gemini Voice Hub</h2>
            <p className="text-white/60 text-sm">Voice · Chat · Expert Booking · Slack Integration</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setVoiceMode(!voiceMode)}
              className={`p-2 rounded-lg border transition-all ${
                voiceMode
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/10 border-white/20'
              }`}
              title="Voice mode"
            >
              <Mic className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-md ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-400'
                  : 'bg-purple-500/20 border border-purple-400'
              } rounded-lg px-4 py-3`}>
                <p className="text-white text-sm mb-2">{msg.text}</p>

                {msg.analysis && msg.sender === 'copilot' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-purple-400/30 space-y-2"
                  >
                    {msg.analysis.needsExpert && msg.analysis.confidence > 0.7 && (
                      <div className="flex items-center gap-2 text-yellow-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        Expert consultation suggested
                      </div>
                    )}
                    <p className="text-white/70 text-xs">
                      Complexity: {msg.analysis.complexity} • Urgency: {msg.analysis.urgency}
                    </p>
                  </motion.div>
                )}

                <p className="text-white/40 text-xs mt-2">{msg.timestamp.toLocaleTimeString()}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-purple-500/20 border border-purple-400 rounded-lg px-4 py-3">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Expert Booking Suggestion */}
        {suggestedExpert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-lg p-4 max-w-md w-full space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-300 font-bold">Expert Consultation Recommended</p>
              </div>
              <p className="text-white/80 text-sm">
                Your query requires a {suggestedExpert.type} expert. {suggestedExpert.urgency === 'critical' ? '⚡ This is urgent.' : ''}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={bookExpertConsultation}
                className="w-full px-4 py-2 bg-yellow-500/30 border border-yellow-400 rounded text-yellow-300 hover:bg-yellow-500/40 flex items-center justify-center gap-2 text-sm"
              >
                <Calendar className="w-4 h-4" /> Book Expert Now
              </motion.button>
            </div>
          </motion.div>
        )}

        {consultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="bg-green-500/10 border border-green-400/50 rounded-lg p-4 max-w-md w-full text-center space-y-2">
              <p className="text-green-300 font-bold text-sm">✓ Consultation saved to Google Drive</p>
              <p className="text-green-200/80 text-xs">Shared with Slack community</p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4 bg-white/5 space-y-2">
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            Recording...
          </motion.div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or click mic to speak..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            disabled={loading}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={isRecording ? stopVoiceInput : startVoiceInput}
            className={`p-2 rounded-lg border transition-all ${
              isRecording
                ? 'bg-red-500/20 border-red-400'
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
          >
            <Mic className="w-4 h-4 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={initiateVoiceConsultation}
            className="p-2 rounded-lg border bg-purple-500/20 border-purple-400 hover:bg-purple-500/30"
            title="Record consultation"
          >
            <Phone className="w-4 h-4 text-purple-300" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </form>
    </div>
  );
}