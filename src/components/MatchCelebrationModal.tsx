import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Bot,
  MessageCircle,
  X,
  Compass,
  Zap,
  Phone,
  Video,
} from 'lucide-react';
import { UserProfile } from '../types';

interface MatchCelebrationModalProps {
  userProfile: UserProfile;
  matchedProfile: UserProfile;
  onClose: () => void;
  onSendMessage: (targetProfile: UserProfile, message?: string) => void;
  onStartCall?: (targetProfile: UserProfile, type: 'audio' | 'video') => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  userProfile,
  matchedProfile,
  onClose,
  onSendMessage,
  onStartCall,
}) => {
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);

  const userInterests = userProfile?.interests || [];
  const matchedInterests = matchedProfile?.interests || [];
  const commonInterests = userInterests.filter((i) =>
    matchedInterests.includes(i)
  );

  useEffect(() => {
    // Fire celebratory confetti safely
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7'],
        disableForReducedMotion: true,
      });
    } catch {
      // ignore
    }

    const loadIcebreakers = async () => {
      setLoadingIcebreakers(true);
      try {
        const res = await fetch('/api/ai/icebreakers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile,
            targetProfile: matchedProfile,
          }),
        });
        const data = await res.json();
        if (data.icebreakers && data.icebreakers.length > 0) {
          setIcebreakers(data.icebreakers);
        } else {
          setIcebreakers([
            `Salut ${matchedProfile?.name || ''} ! Ravi(e) de voir qu'on partage la passion pour ${commonInterests?.[0] || 'les bonnes choses'} !`,
            `C'est un match ! Plutôt brunch du dimanche ou expo insolite pour fêter ça ?`,
          ]);
        }
      } catch (err) {
        console.error(err);
        setIcebreakers([
          `Salut ${matchedProfile?.name || ''} ! Ravi(e) de notre match sur nos passions communes !`,
          `Deux profils qui adorent ${commonInterests?.[0] || 'les voyages'}... Coïncidence ? 😉`,
        ]);
      } finally {
        setLoadingIcebreakers(false);
      }
    };

    loadIcebreakers();
  }, [matchedProfile?.id]);

  return (
    <div
      id="match-celebration-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-4 md:p-6 bg-slate-900/65 backdrop-blur-md flex flex-col justify-start sm:justify-center items-center animate-fade-in"
    >
      <div
        id="match-celebration-container"
        className="relative w-full max-w-md bg-white border border-rose-100 rounded-3xl sm:rounded-[32px] p-4 sm:p-6 shadow-2xl shadow-rose-200/90 text-slate-800 text-center my-auto max-h-[92dvh] flex flex-col overflow-hidden shrink-0"
      >
        {/* Glow rings */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-200/60 rounded-full blur-2xl pointer-events-none" />

        <button
          id="close-match-celebration-btn"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable interior */}
        <div className="relative z-10 overflow-y-auto pr-1 space-y-4 no-scrollbar">
          {/* Title */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider mb-1 shadow-xs">
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              Coup de Cœur Réciproque
            </div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              C'est un Match !
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Vous et <span className="font-bold text-rose-600">{matchedProfile?.name}</span> avez eu un coup de cœur mutuel.
            </p>
          </div>

          {/* Avatars connection */}
          <div className="flex items-center justify-center gap-3 my-2">
            <div className="relative flex flex-col items-center">
              <img
                src={userProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800'}
                alt={userProfile?.name || 'Vous'}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-200 aspect-square select-none"
                referrerPolicy="no-referrer"
              />
              <span className="text-[11px] font-bold text-slate-700 block mt-1">
                Vous
              </span>
            </div>

            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-300 animate-bounce">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
            </div>

            <div className="relative flex flex-col items-center">
              <img
                src={matchedProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                alt={matchedProfile?.name || 'Match'}
                className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl object-cover border-2 border-orange-400 shadow-md shadow-orange-200 aspect-square select-none"
                referrerPolicy="no-referrer"
              />
              <span className="text-[11px] font-bold text-slate-700 block mt-1">
                {matchedProfile?.name}
              </span>
            </div>
          </div>

          {/* Mutual interests badges */}
          {commonInterests.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3 text-left shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Vos {commonInterests.length} passions partagées :
              </div>
              <div className="flex flex-wrap gap-1.5">
                {commonInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-rose-600 border border-rose-200 shadow-xs"
                  >
                    ✓ {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Icebreaker choices */}
          <div className="text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-rose-500" />
                Propositions d'accroche par l'IA :
              </span>
            </div>

            {loadingIcebreakers ? (
              <div className="p-3 bg-rose-50/80 rounded-xl text-center text-xs text-slate-500 font-medium border border-rose-200">
                Génération des phrases d'accroche basées sur vos affinités...
              </div>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {icebreakers.map((ib, idx) => (
                  <button
                    key={idx}
                    id={`icebreaker-btn-${idx}`}
                    onClick={() => onSendMessage(matchedProfile, ib)}
                    className="w-full text-left p-2.5 sm:p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 hover:border-rose-300 text-xs text-slate-800 transition-all active:scale-[0.98] group shadow-xs font-medium"
                  >
                    <p className="line-clamp-2 italic">"{ib}"</p>
                    <span className="text-[10px] font-black text-rose-600 group-hover:text-rose-700 mt-1 inline-flex items-center gap-1">
                      Envoyer <MessageCircle className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions (Direct Video & Audio Calls + Message + Continue) */}
          <div className="pt-2 space-y-2.5">
            {/* Quick Call Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="celebration-audio-call-btn"
                onClick={() => {
                  if (onStartCall) onStartCall(matchedProfile, 'audio');
                }}
                className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Phone className="w-3 h-3" />
                </div>
                <span>Appel Audio</span>
              </button>

              <button
                id="celebration-video-call-btn"
                onClick={() => {
                  if (onStartCall) onStartCall(matchedProfile, 'video');
                }}
                className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <Video className="w-3 h-3" />
                </div>
                <span>Appel Vidéo 🎥</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="celebration-open-chat-btn"
                onClick={() => onSendMessage(matchedProfile)}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-200 flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Écrire un message</span>
              </button>
              <button
                id="celebration-keep-swiping-btn"
                onClick={onClose}
                className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
