import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mic, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';


export default function TwilioGeminiVoiceCall() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [query, setQuery] = useState('');
  const [callStatus, setCallStatus] = useState(null);
  const [initiating, setInitiating] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const initiateVoiceCall = async () => {
    if (!phoneNumber || !query) return;

    setInitiating(true);
    try {
      const response = await base44.functions.invoke('unified-voice-orchestration', { 
        phone_number: phoneNumber, 
        query, 
        user_email: userEmail 
      });
      const result = response.data;

      setCallStatus({
        id: Date.now(),
        phone: phoneNumber,
        message: result.message,
        status: 'sent',
        timestamp: new Date(),
      });

      // Reset form
      setPhoneNumber('');
      setQuery('');
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallStatus({
        id: Date.now(),
        phone: phoneNumber,
        status: 'error',
        timestamp: new Date(),
      });
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-white text-sm font-bold">Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm"
          disabled={initiating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-white text-sm font-bold">Your Query</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything financial..."
          className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 text-sm resize-none"
          disabled={initiating}
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={initiateVoiceCall}
        disabled={!phoneNumber || !query || initiating}
        className="w-full px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
      >
        <Phone className="w-4 h-4" />
        {initiating ? 'Calling...' : 'Initiate Voice Call'}
      </motion.button>

      {callStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-lg p-3 ${
            callStatus.status === 'sent'
              ? 'bg-green-500/10 border-green-400/30'
              : 'bg-red-500/10 border-red-400/30'
          }`}
        >
          <p className={`text-sm font-bold ${
            callStatus.status === 'sent' ? 'text-green-300' : 'text-red-300'
          }`}>
            {callStatus.status === 'sent' ? '✓ Call Initiated' : '✗ Error'}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {callStatus.phone}
          </p>
          {callStatus.message && (
            <p className="text-white/60 text-xs mt-2">{callStatus.message}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}