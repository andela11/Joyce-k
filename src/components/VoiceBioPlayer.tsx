import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Volume2, Sparkles, Heart } from 'lucide-react';
import { UserProfile } from '../types';

interface VoiceBioPlayerProps {
  profile: UserProfile;
  compact?: boolean;
}

export const VoiceBioPlayer: React.FC<VoiceBioPlayerProps> = ({ profile, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = profile.voiceBioDurationSeconds || 15;
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);
  const oscillatorNodesRef = useRef<any[]>([]);

  // Simulated natural voice frequencies
  const waveformBars = [
    25, 45, 80, 55, 95, 70, 40, 85, 60, 90, 75, 50, 100, 65, 85, 45, 70, 90, 55, 35,
  ];

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    setIsPlaying(true);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Create warm vocal chord simulation
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.connect(ctx.destination);

        const fundamentalFreq = profile.gender === 'femme' ? 220 : 130;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamentalFreq, ctx.currentTime);

        // Vocal warmth modulation
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4.5, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(8, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        osc.connect(gainNode);
        osc.start();
        oscillatorNodesRef.current = [osc, lfo, gainNode];
      }
    } catch (err) {
      console.warn('Audio Context tone generation:', err);
    }

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          stopAudio();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        oscillatorNodesRef.current.forEach((node) => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch {}
        });
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const progressPercent = (currentTime / totalDuration) * 100;

  if (compact) {
    return (
      <div
        onClick={handleTogglePlay}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500/90 to-purple-600/90 backdrop-blur-md text-white border border-white/20 shadow-md cursor-pointer hover:scale-102 transition-transform"
      >
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
        </div>
        <div className="flex items-center gap-1">
          <Mic className="w-3 h-3 text-rose-200" />
          <span className="text-[11px] font-black">
            {isPlaying ? `${currentTime}s / ${totalDuration}s` : 'Écouter sa voix'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-purple-900/90 via-slate-900/95 to-rose-950/90 p-3.5 sm:p-4 text-white border border-purple-500/30 shadow-lg relative overflow-hidden backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
              Voice Bio Vibe
            </span>
            <p className="text-xs font-bold text-slate-100 line-clamp-1">
              "{profile.voiceBioPrompt || 'Une anecdote spontanée...'}"
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-purple-200 bg-white/10 px-2 py-0.5 rounded-full">
          0:{currentTime < 10 ? `0${currentTime}` : currentTime} / 0:
          {totalDuration < 10 ? `0${totalDuration}` : totalDuration}
        </span>
      </div>

      {/* Waveform & Play button */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-500 hover:opacity-90 text-white flex items-center justify-center shadow-md shadow-rose-950/50 cursor-pointer active:scale-95 transition-all shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play Voice Bio'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Dynamic Waveform Bars */}
        <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-black/30 rounded-xl border border-white/10">
          {waveformBars.map((height, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isPassed = barProgress <= progressPercent;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? 'bg-gradient-to-t from-rose-400 to-purple-300'
                    : 'bg-white/20'
                } ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: isPlaying ? `${Math.max(20, (height * (isPlaying ? Math.random() * 0.5 + 0.7 : 1)))}%` : `${height * 0.6}%`,
                  minHeight: '4px',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
