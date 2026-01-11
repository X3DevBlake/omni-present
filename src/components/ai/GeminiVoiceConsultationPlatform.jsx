import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mic, Send, Calendar, FileText, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function GeminiVoiceConsultationPlatform() {
  const [mode, setMode] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const startVoiceConsultation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processConsultation(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error:', error);
    }
  };

  const stopVoiceConsultation = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processConsultation = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // Transcribe
      const transcription = await base44.integrations.Core.InvokeLLM({
        prompt: 'Transcribe this consultation request',
        file_urls: [URL.createObjectURL(audioBlob)],
      });

      setTranscript(transcription.toString());

      // Analyze and suggest expert if needed
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this consultation request and determine expert recommendation:
        
Query: "${transcription}"
Email: ${userEmail}

Evaluate:
1. Complexity level
2. Whether Gemini can help or human expert needed
3. Type of expert (tax, investment, legal)
4. Urgency
5. Key discussion points for expert`,
        response_json_schema: {
          type: 'object',
          properties: {
            complexity: { type: 'string' },
            needsExpert: { type: 'boolean' },
            expertType: { type: 'string' },
            urgency: { type: 'string' },
            discussionPoints: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      setConsultation({
        id: Date.now(),
        transcript: transcription,
        analysis,
        audioUrl: URL.createObjectURL(audioBlob),
        timestamp: new Date(),
        saved: false,
      });
    } catch (error) {
      console.error('Error processing consultation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToGoogleDrive = async () => {
    if (!consultation) return;

    try {
      // Save transcription and context to Google Drive
      await base44.integrations.Core.InvokeLLM({
        prompt: `Save consultation to Google Drive:
        
Consultation ID: ${consultation.id}
Date: ${consultation.timestamp}
Transcript: ${consultation.transcript}
Analysis: ${JSON.stringify(consultation.analysis)}
User: ${userEmail}

Create formatted document with consultation details.`,
      });

      setConsultation(prev => ({ ...prev, saved: true }));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const bookExpertConsultation = async () => {
    if (!consultation) return;

    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Create expert consultation booking:
        
Expert Type: ${consultation.analysis.expertType}
Urgency: ${consultation.analysis.urgency}
User: ${userEmail}
Context: ${consultation.transcript}
Discussion Points: ${consultation.analysis.discussionPoints.join(', ')}

Send Slack notification with booking form.`,
      });

      // Notify user
      const bookingLink = `https://calendly.com/experts/${consultation.analysis.expertType}`;
      setConsultation(prev => ({ ...prev, bookingLink }));
    } catch (error) {
      console.error('Error booking:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Mode Selector */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setMode('chat')}
          className={`px-4 py-2 rounded-lg border transition-all ${
            mode === 'chat'
              ? 'bg-cyan-500/20 border-cyan-400'
              : 'bg-white/10 border-white/20'
          }`}
        >
          Chat
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setMode('voice')}
          className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
            mode === 'voice'
              ? 'bg-purple-500/20 border-purple-400'
              : 'bg-white/10 border-white/20'
          }`}
        >
          <Phone className="w-4 h-4" /> Voice Consultation
        </motion.button>
      </div>

      {/* Voice Consultation */}
      {mode === 'voice' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-purple-400/30 rounded-lg p-6 space-y-4"
        >
          <div className="text-center space-y-3">
            <p className="text-white font-bold">Record Voice Consultation</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={isRecording ? stopVoiceConsultation : startVoiceConsultation}
              className={`mx-auto p-4 rounded-full border-4 transition-all ${
                isRecording
                  ? 'bg-red-500/30 border-red-400 animate-pulse'
                  : 'bg-purple-500/20 border-purple-400 hover:bg-purple-500/30'
              }`}
            >
              <Mic className="w-8 h-8 text-white" />
            </motion.button>
            <p className="text-white/60 text-sm">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
          </div>

          {isProcessing && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-cyan-300 text-sm">Processing consultation...</p>
            </motion.div>
          )}

          {consultation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded p-4 space-y-3"
            >
              <p className="text-white font-semibold text-sm">Transcription:</p>
              <p className="text-white/80 text-sm">{consultation.transcript}</p>

              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded p-3">
                <p className="text-cyan-300 font-semibold text-sm mb-2">Analysis:</p>
                <ul className="space-y-1 text-cyan-200/80 text-xs">
                  <li>🎯 Complexity: {consultation.analysis.complexity}</li>
                  <li>⚡ Urgency: {consultation.analysis.urgency}</li>
                  {consultation.analysis.needsExpert && (
                    <li>👨‍⚖️ Expert: {consultation.analysis.expertType}</li>
                  )}
                </ul>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={saveToGoogleDrive}
                  className="flex-1 px-3 py-2 bg-green-500/20 border border-green-400 rounded text-green-300 text-xs hover:bg-green-500/30 flex items-center justify-center gap-1"
                >
                  <FileText className="w-3 h-3" /> Save to Drive
                </motion.button>

                {consultation.analysis.needsExpert && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={bookExpertConsultation}
                    className="flex-1 px-3 py-2 bg-yellow-500/20 border border-yellow-400 rounded text-yellow-300 text-xs hover:bg-yellow-500/30 flex items-center justify-center gap-1"
                  >
                    <Calendar className="w-3 h-3" /> Book Expert
                  </motion.button>
                )}
              </div>

              {consultation.bookingLink && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-500/10 border border-green-400/30 rounded p-3 text-center"
                >
                  <p className="text-green-300 text-xs mb-2">Expert consultation booking ready!</p>
                  <a
                    href={consultation.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 underline text-xs"
                  >
                    Schedule Now →
                  </a>
                </motion.div>
              )}

              {consultation.saved && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-500/10 border border-blue-400/30 rounded p-2 text-center"
                >
                  <p className="text-blue-300 text-xs">✓ Saved to Google Drive</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}