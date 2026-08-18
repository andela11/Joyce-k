import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shield,
  Lock,
  Sparkles,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { UserProfile } from '../types';

interface FloatingHeart {
  id: string;
  x: number;
  y: number;
  size: number;
  emoji: string;
  color: string;
  rotation: number;
  speed: number;
}

interface ActiveCallModalProps {
  callType: 'audio' | 'video';
  partner: UserProfile;
  currentUser: UserProfile;
  onEndCall: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  callType,
  partner,
  currentUser,
  onEndCall,
}) => {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Double-tap hearts sending state
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [heartNotification, setHeartNotification] = useState<string | null>(null);
  const lastTapRef = useRef<number>(0);
  const videoViewportRef = useRef<HTMLDivElement>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<any>(null);

  // Play realistic ringtone chime using Web Audio API
  const playRingtoneChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playBeep = () => {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc2.frequency.setValueAtTime(480, ctx.currentTime); // B4

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      };

      playBeep();
      ringtoneIntervalRef.current = setInterval(playBeep, 2500);
    } catch {
      // Ignore audio context errors in restricted autoplay environments
    }
  };

  // Play romantic heart sending chime
  const playHeartChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch {
      // ignore audio context restrictions
    }
  };

  // Trigger double-tap / double-click hearts to partner
  const triggerSendHearts = (originX?: number, originY?: number, isFromPartner = false) => {
    playHeartChime();

    const emojis = ['💖', '❤️', '💕', '🥰', '💓', '✨', '💗', '🔥'];
    const colors = ['#f43f5e', '#ec4899', '#e11d48', '#fb7185', '#fda4af', '#f59e0b'];
    const newHearts: FloatingHeart[] = [];

    const rect = videoViewportRef.current?.getBoundingClientRect();
    const centerX = originX && rect ? Math.max(20, Math.min(rect.width - 40, originX - rect.left)) : (rect ? rect.width / 2 : 200);
    const centerY = originY && rect ? Math.max(40, Math.min(rect.height - 40, originY - rect.top)) : (rect ? rect.height - 80 : 350);

    for (let i = 0; i < 12; i++) {
      newHearts.push({
        id: `heart_${Date.now()}_${i}_${Math.random()}`,
        x: centerX + (Math.random() * 140 - 70),
        y: centerY + (Math.random() * 60 - 30),
        size: Math.floor(Math.random() * 24) + 24, // 24px - 48px
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.floor(Math.random() * 40 - 20),
        speed: 1.5 + Math.random() * 1.5,
      });
    }

    setFloatingHearts((prev) => [...prev, ...newHearts]);

    if (!isFromPartner) {
      setHeartNotification(`💖 Vous avez envoyé des cœurs à ${partner.name} !`);
      setTimeout(() => setHeartNotification(null), 2500);

      // Simulate partner reciprocating after 1.5s
      setTimeout(() => {
        if (callStatus === 'connected') {
          triggerSendHearts(undefined, undefined, true);
          setHeartNotification(`💞 ${partner.name} vous envoie des cœurs en retour !`);
          setTimeout(() => setHeartNotification(null), 3000);
        }
      }, 1500);
    }

    // Clean up hearts after animation duration
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 2800);
  };

  // Handle Double-Tap (mobile touch) or Double-Click (desktop) on video screen
  const handleViewportTouchOrClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (callType !== 'video') return;
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 380 && timeSinceLastTap > 30) {
      // Double tap confirmed!
      let posX: number | undefined;
      let posY: number | undefined;

      if ('clientX' in e) {
        posX = e.clientX;
        posY = e.clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        posX = e.changedTouches[0].clientX;
        posY = e.changedTouches[0].clientY;
      }

      triggerSendHearts(posX, posY);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // audio context close
      }
      audioContextRef.current = null;
    }
  };

  // Initialize Real Camera & Mic Stream
  useEffect(() => {
    let isCancelled = false;

    const startLocalStream = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video:
            callType === 'video'
              ? {
                  facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : false,
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (!isCancelled) {
            localStreamRef.current = stream;
            if (localVideoRef.current && callType === 'video') {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err: any) {
        console.warn('Real camera/mic access notice:', err);
        if (!isCancelled) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setMediaError("Accès caméra/micro refusé par le navigateur. Mode simulation actif.");
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setMediaError("Aucune caméra ou micro détecté sur cet appareil.");
          } else {
            setMediaError("Flux multimédia simulé pour cet appel.");
          }
        }
      }
    };

    startLocalStream();
    playRingtoneChime();

    // Simulate partner picking up the call after 2.8 seconds
    const connectTimer = setTimeout(() => {
      stopRingtone();
      setCallStatus('connected');
    }, 2800);

    return () => {
      isCancelled = true;
      clearTimeout(connectTimer);
      stopRingtone();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [callType, facingMode]);

  // Call duration counter when connected
  useEffect(() => {
    let timer: any;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Toggle Microphone Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Video Camera
  const toggleVideo = async () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = !track.enabled;
        });
        setIsVideoEnabled(!isVideoEnabled);
      } else if (!isVideoEnabled) {
        // Request video stream dynamically if not previously granted
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode },
          });
          const newVideoTrack = videoStream.getVideoTracks()[0];
          localStreamRef.current.addTrack(newVideoTrack);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          setIsVideoEnabled(true);
        } catch {
          setIsVideoEnabled(!isVideoEnabled);
        }
      }
    } else {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Switch / Flip Camera on mobile
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleEnd = () => {
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setCallStatus('ended');
    setTimeout(() => {
      onEndCall();
    }, 400);
  };

  // Format Duration mm:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="active-call-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in"
    >
      <div
        className={`bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 relative ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-2xl h-[92dvh] sm:h-[680px]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-rose-500/30 border border-rose-400/40 text-rose-300 backdrop-blur-md">
              {callType === 'video' ? <Video className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">{partner.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Chiffré E2E
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {callStatus === 'ringing' && 'Sonnerie en cours...'}
                {callStatus === 'connected' && `En direct • ${formatDuration(durationSeconds)}`}
                {callStatus === 'ended' && 'Appel terminé'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Réduire' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Notice if permission error */}
        {mediaError && (
          <div className="absolute top-16 inset-x-3 sm:inset-x-6 z-30 p-2.5 rounded-2xl bg-amber-500/90 text-slate-950 text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{mediaError}</span>
          </div>
        )}

        {/* Main Stage Video / Audio Viewport */}
        <div
          ref={videoViewportRef}
          onClick={handleViewportTouchOrClick}
          onTouchEnd={handleViewportTouchOrClick}
          className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-0 select-none cursor-pointer"
        >
          {/* Floating Hearts Animation Layer */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {floatingHearts.map((heart) => (
              <div
                key={heart.id}
                style={{
                  left: `${heart.x}px`,
                  top: `${heart.y}px`,
                  fontSize: `${heart.size}px`,
                  transform: `rotate(${heart.rotation}deg)`,
                }}
                className="absolute animate-float-heart drop-shadow-lg"
              >
                {heart.emoji}
              </div>
            ))}
          </div>

          {/* Heart Sent / Received Toast Notification */}
          {heartNotification && (
            <div className="absolute top-20 z-40 px-4 py-2 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-xl border border-rose-300/40 backdrop-blur-md animate-bounce flex items-center gap-2 pointer-events-none">
              <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
              <span>{heartNotification}</span>
            </div>
          )}

          {/* Hint Overlay for Double Tap in Video Calls */}
          {callType === 'video' && callStatus === 'connected' && (
            <div className="absolute top-24 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-rose-500/30 text-rose-200 text-[11px] font-medium flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity pointer-events-none">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span>Tapotez 2× l'écran pour envoyer des cœurs</span>
            </div>
          )}

          {callType === 'video' ? (
            /* Video Stage */
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Remote Partner Video (or simulated live portrait) */}
              <div className="w-full h-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={partner.photos[0]}
                  alt={partner.name}
                  className="w-full h-full object-cover brightness-90 filter"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40" />

                {/* Animated video live pulse effect */}
                <div className="absolute bottom-24 sm:bottom-28 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold">{partner.name}</span>
                  <span className="text-[10px] text-slate-300">({partner.city})</span>
                </div>
              </div>

              {/* Local Real Camera Video Preview (Picture in Picture) */}
              <div className="absolute top-16 right-3 sm:right-5 z-20 w-28 sm:w-36 h-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-800 transition-all pointer-events-auto">
                {isVideoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center text-slate-400">
                    <img
                      src={currentUser.photos[0]}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700 mb-2 opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] font-bold">Caméra désactivée</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-white">
                  Vous {isMuted ? '(Muet)' : ''}
                </div>
              </div>
            </div>
          ) : (
            /* Audio Call Stage */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-6 relative">
              {/* Background ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-slate-950 to-slate-950" />

              {/* Big Avatar with Pulsing Rings */}
              <div className="relative z-10">
                {callStatus === 'ringing' && (
                  <>
                    <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping" />
                    <div className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse" />
                  </>
                )}
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-rose-500 shadow-2xl shadow-rose-900/50 relative">
                  <img
                    src={partner.photos[0]}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {callStatus === 'connected' && (
                  <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
                    <Shield className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Partner Info */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">{partner.name}, {partner.age}</h3>
                <p className="text-xs text-rose-300 font-semibold">{partner.city} • {partner.occupation}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium border border-white/10 mt-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Appel vocal chiffré Joyce-K</span>
                </div>
              </div>

              {/* Live Audio Visualizer Simulation */}
              {callStatus === 'connected' && (
                <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 h-8">
                  {[40, 70, 30, 90, 60, 100, 45, 80, 50, 85, 35, 65].map((height, i) => (
                    <span
                      key={i}
                      style={{ height: `${isMuted ? 8 : Math.max(10, height * 0.3)}px` }}
                      className="w-1 rounded-full bg-gradient-to-t from-rose-500 to-orange-400 animate-pulse transition-all duration-300"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Dock */}
        <div className="p-4 sm:p-6 bg-slate-950/95 border-t border-slate-800 flex items-center justify-center gap-2.5 sm:gap-4 shrink-0 z-30">
          {/* Send Hearts Quick Action Button */}
          {callType === 'video' && (
            <button
              id="call-send-hearts-btn"
              onClick={(e) => {
                e.stopPropagation();
                triggerSendHearts();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-lg shadow-rose-950"
              title="Envoyer des cœurs d'amour (ou double-tapotez l'écran)"
            >
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
            </button>
          )}

          {/* Mute Mic Button */}
          <button
            id="call-mute-mic-btn"
            onClick={toggleMute}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-2 ring-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMuted ? 'Activer le micro' : 'Couper le micro'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video Camera (Only if Video Call) */}
          {callType === 'video' && (
            <>
              <button
                id="call-toggle-camera-btn"
                onClick={toggleVideo}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                  !isVideoEnabled
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoEnabled ? 'Couper la caméra' : 'Activer la caméra'}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Flip camera on mobile */}
              <button
                id="call-flip-camera-btn"
                onClick={handleFlipCamera}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer flex items-center justify-center"
                title="Changer de caméra"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Mute Speaker */}
          <button
            id="call-mute-speaker-btn"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`p-3.5 sm:p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
              isSpeakerMuted
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isSpeakerMuted ? 'Activer le son' : 'Couper le haut-parleur'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* End Call Button (Hangup) */}
          <button
            id="call-hangup-btn"
            onClick={handleEnd}
            className="px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold transition-all shadow-lg shadow-rose-900/50 flex items-center gap-2 cursor-pointer"
            title="Raccrocher l'appel"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs sm:text-sm">Raccrocher</span>
          </button>
        </div>
      </div>
    </div>
  );
};
