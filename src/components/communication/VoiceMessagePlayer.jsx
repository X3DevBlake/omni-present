import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from '@tanstack/react-query';
import { Volume2, Download, Loader2 } from 'lucide-react';

export default function VoiceMessagePlayer() {
  const [text, setText] = useState('');
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.7]);
  const [audioUrl, setAudioUrl] = useState(null);

  const generateSpeech = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          stability: stability[0],
          similarityBoost: similarityBoost[0]
        })
      });

      if (!response.ok) throw new Error('Failed to generate speech');
      return response.json();
    },
    onSuccess: (data) => {
      setAudioUrl(data.audio);
    }
  });

  const downloadAudio = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'voice-message.mp3';
    link.click();
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Volume2 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Voice Message Generator</h3>
          <p className="text-white/60 text-sm">Powered by ElevenLabs</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">
            Message Text ({text.length}/2500)
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2500))}
            placeholder="Enter text to convert to speech..."
            className="bg-white/5 border-white/10 min-h-[120px]"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">
            Stability: {stability[0].toFixed(2)}
          </label>
          <Slider
            value={stability}
            onValueChange={setStability}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">
            Similarity Boost: {similarityBoost[0].toFixed(2)}
          </label>
          <Slider
            value={similarityBoost}
            onValueChange={setSimilarityBoost}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </div>

        <Button
          onClick={() => generateSpeech.mutate()}
          disabled={!text.trim() || generateSpeech.isPending}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
        >
          {generateSpeech.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>

        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <audio controls className="w-full" src={audioUrl} />
            <Button
              onClick={downloadAudio}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Audio
            </Button>
          </motion.div>
        )}
      </div>
    </Card>
  );
}