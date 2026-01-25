import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, Send, Copy, CheckCircle2, Loader } from 'lucide-react';
import { base44 } from '@/api/base44Client';


export default function LiveVideoFeedConsole() {
  const [callActive, setCallActive] = useState(false);
  const [callData, setCallData] = useState(null);
  const [participants, setParticipants] = useState([
    { id: 'user', name: 'You', email: 'user@example.com', status: 'connected' },
  ]);
  const [videoLink, setVideoLink] = useState('');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const startVideoCall = async () => {
    setInitializing(true);
    try {
      const data = {
        title: 'Financial Consultation',
        duration: 60,
        topics: ['portfolio review', 'investment strategy'],
      };

      const response = await base44.functions.invoke('video-call-orchestration', { ...data, participants });
      setCallData(response.data);

      // Generate video link
      const link = `https://zoom.us/j/${Date.now()}`;
      setVideoLink(link);

      // Notify participants
      await base44.integrations.Core.InvokeLLM({
        prompt: `Send Slack notification about starting video call:
        
Title: ${data.title}
Link: ${link}
Participants: ${participants.map(p => p.name).join(', ')}`,
      });

      setCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    } finally {
      setInitializing(false);
    }
  };

  const endVideoCall = async () => {
    if (!transcript.trim()) return;

    try {
      // Process transcript with Gemini
      const response = await base44.functions.invoke('video-call-orchestration', { 
        action: 'process_transcript',
        transcript, 
        call_id: `call_${Date.now()}` 
      });
      setAnalysis(response.data);
      setCallActive(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const copyVideoLink = () => {
    navigator.clipboard.writeText(videoLink);
  };

  return (
    <div className="space-y-4">
      {/* Call Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`border rounded-lg p-4 ${
          callActive
            ? 'bg-green-500/10 border-green-400/30'
            : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Video className={`w-4 h-4 ${callActive ? 'text-green-400 animate-pulse' : 'text-white/40'}`} />
            <p className="text-white font-bold">{callActive ? 'Call Active' : 'Ready to Start'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={callActive ? endVideoCall : startVideoCall}
            disabled={initializing}
            className={`px-4 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
              callActive
                ? 'bg-red-500/20 border border-red-400 text-red-300 hover:bg-red-500/30'
                : 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
            } disabled:opacity-50`}
          >
            {initializing ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Initializing...
              </>
            ) : callActive ? (
              'End Call'
            ) : (
              <>
                <Video className="w-4 h-4" />
                Start Call
              </>
            )}
          </motion.button>
        </div>

        {/* Video Link */}
        {videoLink && (
          <div className="flex gap-2 bg-white/10 rounded p-2">
            <input
              type="text"
              value={videoLink}
              readOnly
              className="flex-1 bg-transparent text-white text-xs outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={copyVideoLink}
              className="px-2 py-1 hover:bg-white/20 rounded"
            >
              <Copy className="w-3 h-3 text-white" />
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Participants */}
      {callActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2"
        >
          <p className="text-white font-bold text-sm">Connected Participants</p>
          <div className="space-y-1">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <p className="text-white">{p.name}</p>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Live Transcript */}
      {callActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-white font-bold text-sm">Live Transcript</p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Transcription will appear here..."
            className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-xs resize-none"
          />
        </motion.div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4 space-y-3"
        >
          <p className="text-white font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Call Summary
          </p>

          {analysis.keyDecisions && analysis.keyDecisions.length > 0 && (
            <div className="space-y-1">
              <p className="text-white/80 text-xs font-semibold">Key Decisions</p>
              <ul className="space-y-0.5">
                {analysis.keyDecisions.map((item, idx) => (
                  <li key={idx} className="text-white/60 text-xs">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-white/80 text-xs font-semibold">Action Items</p>
              <ul className="space-y-0.5">
                {analysis.actionItems.map((item, idx) => (
                  <li key={idx} className="text-white/60 text-xs">• {item.title}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-1">
              <p className="text-white/80 text-xs font-semibold">Recommendations</p>
              <ul className="space-y-0.5">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-white/60 text-xs">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}