import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  MessageCircle,
  X,
  Compass,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';

interface MatchCelebrationModalProps {
  userProfile: UserProfile;
  matchedProfile: UserProfile;
  onClose: () => void;
  onSendMessage: (targetProfile: UserProfile, message?: string) => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  userProfile,
  matchedProfile,
  onClose,
  onSendMessage,
}) => {
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);

  const commonInterests = userProfile.interests.filter((i) =>
    matchedProfile.interests.includes(i)
  );

  useEffect(() => {
    // Fire celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fbbf24', '#a855f7'],
    });

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
            `Salut ${matchedProfile.name} ! Ravi(e) de voir qu'on partage la passion pour ${commonInterests[0] || 'les bonnes choses'} !`,
            `C'est un match ! Plutôt brunch du dimanche ou expo insolite pour fêter ça ?`,
          ]);
        }
      } catch (err) {
        console.error(err);
        setIcebreakers([
          `Salut ${matchedProfile.name} ! Ravi(e) de notre match sur nos passions communes !`,
          `Deux profils qui adorent ${commonInterests[0] || 'les voyages'}... Coïncidence ? 😉`,
        ]);
      } finally {
        setLoadingIcebreakers(false);
      }
    };

    loadIcebreakers();
  }, [matchedProfile.id]);

  return (
    <div
      id="match-celebration-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div
        id="match-celebration-container"
        className="relative w-full max-w-md bg-white border border-rose-100 rounded-[32px] p-6 shadow-2xl shadow-rose-200/90 text-slate-800 text-center overflow-hidden"
      >
        {/* Glow rings */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-200/60 rounded-full blur-2xl pointer-events-none" />

        <button
          id="close-match-celebration-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-100 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="relative z-10 space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Coup de Cœur Réciproque
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
            C'est un Match !
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Vous et <span className="font-bold text-rose-600">{matchedProfile.name}</span> avez eu un coup de cœur mutuel.
          </p>
        </div>

        {/* Avatars connection */}
        <div className="relative z-10 flex items-center justify-center gap-3 my-4">
          <div className="relative">
            <img
              src={userProfile.photos[0]}
              alt={userProfile.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-200"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-bold text-slate-700 block mt-1">
              Vous
            </span>
          </div>

          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-300 animate-bounce">
            <Heart className="w-6 h-6 fill-white" />
          </div>

          <div className="relative">
            <img
              src={matchedProfile.photos[0]}
              alt={matchedProfile.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-400 shadow-md shadow-orange-200"
              referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-bold text-slate-700 block mt-1">
              {matchedProfile.name}
            </span>
          </div>
        </div>

        {/* Mutual interests badges */}
        {commonInterests.length > 0 && (
          <div className="relative z-10 bg-rose-50/70 border border-rose-200 rounded-2xl p-3 my-4 text-left shadow-xs">
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
        <div className="relative z-10 text-left space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Propositions d'accroche par l'IA :
            </span>
          </div>

          {loadingIcebreakers ? (
            <div className="p-3 bg-rose-50/80 rounded-xl text-center text-xs text-slate-500 font-medium animate-pulse border border-rose-200">
              Génération des phrases d'accroche basées sur vos affinités...
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {icebreakers.map((ib, idx) => (
                <button
                  key={idx}
                  id={`icebreaker-btn-${idx}`}
                  onClick={() => onSendMessage(matchedProfile, ib)}
                  className="w-full text-left p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 hover:border-rose-300 text-xs text-slate-800 transition-all active:scale-[0.98] group shadow-xs font-medium"
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

        {/* Actions */}
        <div className="relative z-10 pt-5 flex items-center gap-2">
          <button
            id="celebration-open-chat-btn"
            onClick={() => onSendMessage(matchedProfile)}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Écrire un message
          </button>
          <button
            id="celebration-keep-swiping-btn"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};
