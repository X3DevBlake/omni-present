import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Square, Play, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentSimulationRecorder({ show, onClose, simulationRef }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [playbackRecording, setPlaybackRecording] = useState(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const recordingData = useRef([]);
  const recordingInterval = useRef(null);

  const startRecording = () => {
    recordingData.current = [];
    setIsRecording(true);
    
    recordingInterval.current = setInterval(() => {
      if (simulationRef?.current) {
        const canvas = simulationRef.current.querySelector('canvas');
        if (canvas) {
          recordingData.current.push({
            timestamp: Date.now(),
            imageData: canvas.toDataURL('image/png', 0.5)
          });
        }
      }
    }, 100);

    toast.success('Recording started');
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    const recording = {
      id: Date.now(),
      frames: recordingData.current,
      duration: recordingData.current.length / 10,
      createdAt: new Date()
    };

    setRecordings([...recordings, recording]);
    setCurrentRecording(recording);
    recordingData.current = [];
    toast.success(`Recording saved (${recording.duration.toFixed(1)}s)`);
  };

  const playRecording = (recording) => {
    setPlaybackRecording(recording);
    setPlaybackTime(0);

    let frameIndex = 0;
    const playInterval = setInterval(() => {
      if (frameIndex >= recording.frames.length) {
        clearInterval(playInterval);
        setPlaybackRecording(null);
        return;
      }
      setPlaybackTime(frameIndex / 10);
      frameIndex++;
    }, 100);
  };

  const downloadRecording = (recording) => {
    const data = {
      id: recording.id,
      duration: recording.duration,
      frameCount: recording.frames.length,
      frames: recording.frames
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_${recording.id}.json`;
    a.click();
    toast.success('Recording downloaded');
  };

  const exportAsVideo = async (recording) => {
    toast.info('Exporting as image sequence...');
    
    recording.frames.forEach((frame, i) => {
      const a = document.createElement('a');
      a.href = frame.imageData;
      a.download = `frame_${String(i).padStart(4, '0')}.png`;
      a.click();
    });
    
    toast.success('Frames exported! Use video editor to combine');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
              <Video className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Simulation Recorder</h3>
              <p className="text-white/60">Record and replay agent simulations</p>
            </div>
          </div>

          <div className="mb-6">
            <button onClick={isRecording ? stopRecording : startRecording} className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${isRecording ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'}`}>
              {isRecording ? <><Square className="w-5 h-5" /> Stop Recording</> : <><Video className="w-5 h-5" /> Start Recording</>}
            </button>
            {isRecording && (
              <div className="mt-2 text-center text-red-400 text-sm animate-pulse">
                Recording... {recordingData.current.length} frames
              </div>
            )}
          </div>

          {playbackRecording && (
            <div className="mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
              <h4 className="text-purple-400 font-semibold mb-3">Playback</h4>
              <div className="bg-black rounded-lg overflow-hidden mb-3">
                {playbackRecording.frames[Math.floor(playbackTime * 10)] && (
                  <img src={playbackRecording.frames[Math.floor(playbackTime * 10)].imageData} alt="Playback" className="w-full" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">{playbackTime.toFixed(1)}s</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(playbackTime / playbackRecording.duration) * 100}%` }} />
                </div>
                <span className="text-white text-sm">{playbackRecording.duration.toFixed(1)}s</span>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-white font-semibold mb-3">Recordings ({recordings.length})</h4>
            {recordings.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No recordings yet. Start recording to capture simulations!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recordings.map(rec => (
                  <div key={rec.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-white font-medium">Recording {rec.id}</div>
                        <div className="text-white/60 text-xs">{rec.duration.toFixed(1)}s · {rec.frames.length} frames</div>
                        <div className="text-white/40 text-xs">{rec.createdAt.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => playRecording(rec)} className="p-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded hover:bg-purple-500/30">
                          <Play className="w-4 h-4" />
                        </button>
                        <button onClick={() => downloadRecording(rec)} className="p-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded hover:bg-blue-500/30">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => exportAsVideo(rec)} className="p-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded hover:bg-green-500/30">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-black rounded overflow-hidden">
                      <img src={rec.frames[0]?.imageData} alt="Thumbnail" className="w-full h-32 object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}