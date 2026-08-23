import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessagePlayerProps {
  audioUrl?: string;
  duration?: number;
  isSelf: boolean;
  label?: string;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  audioUrl,
  duration = 5,
  isSelf,
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthAudioRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Initialize and handle real audio file playback
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setAudioDuration(Math.round(audio.duration));
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.pause();
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Audio playback notice:', err);
            fallbackSyntheticVoice();
          });
      }
    } else {
      // Fallback synthetic voice chime for demo partner voice notes
      fallbackSyntheticVoice();
    }
  };

  // Synthesizer voice melody if playing simulated/incoming voice note
  const fallbackSyntheticVoice = () => {
    if (isPlaying) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      if (synthAudioRef.current) {
        try {
          synthAudioRef.current.close();
        } catch {}
      }
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthAudioRef.current = ctx;

      const totalSecs = audioDuration || 4;
      setIsPlaying(true);
      setCurrentTime(0);

      // Play soft vocal humming synth chord progression
      const frequencies = [330, 392, 440, 523.25, 440, 392];
      let step = 0;

      const playTone = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequencies[step % frequencies.length], ctx.currentTime);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        step++;
      };

      playTone();
      const toneInterval = setInterval(playTone, 600);

      let elapsed = 0;
      synthIntervalRef.current = setInterval(() => {
        elapsed += 0.5;
        setCurrentTime(elapsed);
        if (elapsed >= totalSecs) {
          clearInterval(synthIntervalRef.current);
          clearInterval(toneInterval);
          setIsPlaying(false);
          setCurrentTime(0);
          try {
            ctx.close();
          } catch {}
        }
      }, 500);
    } catch {
      setIsPlaying(false);
    }
  };

  // Seek audio position on waveform click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * audioDuration;

    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  // Visual waveform heights pattern
  const barHeights = [25, 55, 90, 40, 75, 100, 60, 35, 80, 95, 50, 70, 45, 85, 60, 30];

  return (
    <div className="py-1 min-w-[210px] sm:min-w-[240px] space-y-1.5 select-none">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md ${
            isSelf
              ? 'bg-white text-rose-600 hover:bg-rose-50 active:scale-95'
              : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-200'
          }`}
          title={isPlaying ? 'Mettre en pause' : 'Écouter le message vocal'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization & Scrubber */}
        <div className="flex-1 min-w-0">
          <div
            onClick={handleSeek}
            className="h-8 flex items-center gap-1 cursor-pointer group py-1"
            title="Cliquer pour avancer dans l'audio"
          >
            {barHeights.map((h, i) => {
              const barProgress = (i / barHeights.length) * 100;
              const isPast = barProgress <= progressPercent;

              return (
                <span
                  key={i}
                  style={{ height: `${Math.max(6, (h / 100) * 26)}px` }}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPast
                      ? isSelf
                        ? 'bg-white'
                        : 'bg-rose-600'
                      : isSelf
                      ? 'bg-white/40 group-hover:bg-white/60'
                      : 'bg-slate-300 group-hover:bg-slate-400'
                  } ${isPlaying && isPast ? 'opacity-100 scale-y-110' : 'opacity-80'}`}
                />
              );
            })}
          </div>

          {/* Time indicators */}
          <div
            className={`flex items-center justify-between text-[10px] font-bold ${
              isSelf ? 'text-white/90' : 'text-slate-500'
            }`}
          >
            <span>{formatTime(currentTime)}</span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 opacity-75" />
              <span>{formatTime(audioDuration)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
