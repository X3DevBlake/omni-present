import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lightbulb, Mic, Phone, HelpCircle, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedGeminiCopilotWithVoice() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'copilot',
      text: 'I can now explain financial metrics with voice, answer your "why" questions deeply, and even help you schedule consultations. What would you like to explore?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
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

  const startVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopVoiceRecord = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob) => {
    try {
      // Transcribe audio
      const formData = new FormData();
      formData.append('file', audioBlob);

      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: 'Transcribe this audio message',
        file_urls: [URL.createObjectURL(audioBlob)],
      });

      if (transcription) {
        setInput(transcription.toString());
      }
    } catch (error) {
      console.error('Error processing voice:', error);
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
      // Determine if this is a "why" question or needs anomaly analysis
      const isWhyQuestion = input.toLowerCase().includes('why');
      const needsAnomalyAnalysis = input.toLowerCase().includes('anomaly') || input.toLowerCase().includes('alert');
      const needsConsultation = input.toLowerCase().includes('help') && input.length > 50;

      let response;

      if (isWhyQuestion) {
        response = await generateDetailedExplanation(input);
      } else if (needsAnomalyAnalysis) {
        response = await analyzeAnomalies(input, userEmail);
      } else if (needsConsultation) {
        response = await suggestConsultation(input, userEmail);
      } else {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Answer this financial question with depth: "${input}"`,
          add_context_from_internet: true,
        });
      }

      const copilotMessage = {
        id: messages.length + 2,
        sender: 'copilot',
        text: response.answer || response,
        timestamp: new Date(),
        hasVoice: voiceMode,
        deepAnalysis: true,
      };

      setMessages(prev => [...prev, copilotMessage]);

      // Generate voice response if enabled
      if (voiceMode) {
        const audioUrl = await generateVoiceResponse(copilotMessage.text);
        if (audioUrl) {
          setVoiceUrl(audioUrl);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedExplanation = async (question) => {
    return await base44.integrations.Core.InvokeLLM({
      prompt: `Provide a deeply detailed, thoughtful explanation:
      
Question: "${question}"

Structure your response with:
1. Direct answer
2. Root causes and context
3. Supporting data/examples
4. Implications and what it means
5. Actionable next steps
6. Related concepts to understand`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          rootCauses: { type: 'array', items: { type: 'string' } },
          implications: { type: 'array', items: { type: 'string' } },
          nextSteps: { type: 'array', items: { type: 'string' } },
        },
      },
    });
  };

  const analyzeAnomalies = async (question, email) => {
    try {
      const anomalies = await base44.entities.FraudAlert.filter(
        { user_email: email, status: 'pending' },
        '-detected_at',
        5
      );

      return await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these financial anomalies in detail:
        
Question: "${question}"
Anomalies: ${JSON.stringify(anomalies?.map(a => ({ type: a.alert_type, severity: a.severity })))}

Provide:
1. Root cause analysis for each
2. Interconnections between anomalies
3. Risk assessment
4. Personalized impact on user's finances
5. Recommended actions`,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            rootCauseAnalysis: { type: 'object' },
            riskAssessment: { type: 'string' },
            personalizedImpact: { type: 'array', items: { type: 'string' } },
          },
        },
      });
    } catch (error) {
      console.error('Error analyzing anomalies:', error);
      return { answer: 'Error analyzing anomalies' };
    }
  };

  const suggestConsultation = async (question, email) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `This user's question suggests they need expert help:
        
Question: "${question}"
Email: ${email}

Assess complexity and suggest:
1. Whether they need human expert consultation
2. Type of expert (tax, investment, general)
3. Urgency level
4. How to proceed with booking`,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            suggestConsultation: { type: 'boolean' },
            expertType: { type: 'string' },
            urgency: { type: 'string' },
          },
        },
      });

      if (response.suggestConsultation) {
        return {
          answer: response.answer + '\n\n📞 I can help you schedule a consultation with a certified advisor. Would you like me to proceed?',
        };
      }

      return response;
    } catch (error) {
      console.error('Error suggesting consultation:', error);
      return { answer: 'Error processing request' };
    }
  };

  const generateVoiceResponse = async (text) => {
    try {
      // Would use ElevenLabs API here
      console.log('Generating voice response for:', text);
      return 'voice-url-here';
    } catch (error) {
      console.error('Error generating voice:', error);
      return null;
    }
  };

  const scheduleConsultation = async () => {
    // Handle consultation booking
    console.log('Scheduling consultation...');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden border border-purple-500/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-b border-purple-500/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Gemini Copilot Pro</h3>
            <p className="text-white/60 text-sm">Deep insights • Voice explanations • Expert consultations</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setVoiceMode(!voiceMode)}
              className={`p-2 rounded-lg transition-all ${
                voiceMode
                  ? 'bg-cyan-500/30 border border-cyan-400'
                  : 'bg-white/10 border border-white/20 hover:bg-white/20'
              }`}
              title="Voice explanations"
            >
              <Mic className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              title="Schedule consultation"
            >
              <Phone className="w-4 h-4 text-white/60" />
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

                {msg.deepAnalysis && msg.sender === 'copilot' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-purple-400/30 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-yellow-400 text-xs">
                      <Lightbulb className="w-4 h-4" />
                      Deep analysis provided
                    </div>
                  </motion.div>
                )}

                {msg.hasVoice && msg.sender === 'copilot' && voiceUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="mt-3 px-3 py-1.5 bg-cyan-500/30 rounded text-cyan-300 text-xs"
                  >
                    🔊 Listen
                  </motion.button>
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
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-purple-500/20 p-4 bg-purple-500/10 space-y-2">
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
            placeholder="Ask anything... try 'why' questions or ask about anomalies"
            className="flex-1 bg-white/10 border border-purple-400/30 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            disabled={loading || isRecording}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={isRecording ? stopVoiceRecord : startVoiceRecord}
            className={`p-2 rounded-lg transition-all ${
              isRecording
                ? 'bg-red-500/20 border border-red-400'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }`}
          >
            <Mic className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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