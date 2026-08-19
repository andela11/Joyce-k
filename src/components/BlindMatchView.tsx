import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  Clock,
  Heart,
  Send,
  Lock,
  Flame,
  MessageCircle,
  Check,
  CheckCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { MOCK_PROFILES } from '../data/mockProfiles';

interface BlindMatchViewProps {
  currentUser: UserProfile;
  onMatchRevealed: (partner: UserProfile) => void;
  onOpenDirectChat: (partnerId: string) => void;
}

export const BlindMatchView: React.FC<BlindMatchViewProps> = ({
  currentUser,
  onMatchRevealed,
  onOpenDirectChat,
}) => {
  // Blind partner for the session
  const [partner, setPartner] = useState<UserProfile>(() => {
    return MOCK_PROFILES[2] || MOCK_PROFILES[1]; // Clara or Aïcha
  });

  const [dailyTopic, setDailyTopic] = useState<{
    question: string;
    theme: string;
    icebreakerPrompt: string;
  }>({
    question:
      'Si tu pouvais revivre un seul souvenir précis pour la toute première fois, lequel choisirais-tu et pourquoi ?',
    theme: 'Émotions & Nostalgie',
    icebreakerPrompt: 'Raconte-moi un moment qui a marqué ta vie...',
  });

  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes countdown
  const [userRevealed, setUserRevealed] = useState(false);
  const [partnerRevealed, setPartnerRevealed] = useState(false);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'blind_msg_0',
      conversationId: 'blind_session',
      senderId: partner.id,
      receiverId: currentUser.id,
      text: `Hello ! Très intrigué(e) par cette question du jour. Pour ma part, ce serait sans hésitation mon premier voyage improvisé en solitaire où j'ai découvert ma passion ! Et toi ?`,
      timestamp: Date.now() - 45000,
      isSelf: false,
      isRead: true,
    },
  ]);

  // Fetch AI Question on mount
  useEffect(() => {
    const fetchQuestion = async () => {
      setIsLoadingTopic(true);
      try {
        const res = await fetch('/api/ai/blind-question', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.question) setDailyTopic(data);
        }
      } catch (e) {
        console.warn('Blind question fetch error:', e);
      } finally {
        setIsLoadingTopic(false);
      }
    };
    fetchQuestion();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `blind_msg_${Date.now()}`,
      conversationId: 'blind_session',
      senderId: currentUser.id,
      receiverId: partner.id,
      text: inputText.trim(),
      timestamp: Date.now(),
      isSelf: true,
      isRead: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate partner response and partner reveal agreement after 2 messages
    if (chatMessages.length >= 2 && !partnerRevealed) {
      setTimeout(() => {
        setPartnerRevealed(true);
        const partnerMsg: ChatMessage = {
          id: `blind_msg_p_${Date.now()}`,
          conversationId: 'blind_session',
          senderId: partner.id,
          receiverId: currentUser.id,
          text: `J'adore nos échanges et notre feeling ! J'ai cliqué pour révéler mon identité ✨ À toi de jouer !`,
          timestamp: Date.now(),
          isSelf: false,
          isRead: true,
        };
        setChatMessages((prev) => [...prev, partnerMsg]);
      }, 3000);
    }
  };

  const handleRevealClick = () => {
    setUserRevealed(true);
    // Trigger full reveal after smooth excitement
    setTimeout(() => {
      setPartnerRevealed(true);
      setIsFullyRevealed(true);
      onMatchRevealed(partner);
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-5 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 text-white rounded-3xl p-5 sm:p-6 border border-purple-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>Événement Blind-Match • 21h</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Rencontre Mystère Sans Jugement Physique
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Connectez-vous d'abord par l'esprit, les valeurs et la spontanéité. Vos photos se
              révèlent uniquement si l'alchimie opère des deux côtés !
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="px-4 py-2 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-md flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Temps restant</div>
                <div className="text-sm font-black text-white font-mono">
                  {formatTimer(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Mystery Profile Card + Live Blind Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Mystery Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-md text-center space-y-4 relative overflow-hidden">
            {/* Mystery Avatar Container */}
            <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden border-4 border-purple-100 shadow-xl group">
              <img
                src={partner.photos[0]}
                alt="Blind Match"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isFullyRevealed ? 'filter-none scale-100' : 'filter blur-2xl scale-110'
                }`}
                referrerPolicy="no-referrer"
              />

              {!isFullyRevealed && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-white p-3 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20">
                    Identité Floutée
                  </span>
                </div>
              )}

              {isFullyRevealed && (
                <span className="absolute bottom-2 left-2 right-2 bg-emerald-600/90 text-white text-[10px] font-black py-1 rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Identité Révélée !
                </span>
              )}
            </div>

            {/* Profile Info (Partially Hidden or Revealed) */}
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {isFullyRevealed ? `${partner.name}, ${partner.age} ans` : `Mystère, ${partner.age} ans`}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isFullyRevealed ? partner.city : `${partner.city} • ${partner.occupation}`}
              </p>
            </div>

            {/* Common Interests */}
            <div className="space-y-2 pt-2 border-t border-rose-100 text-left">
              <span className="text-[11px] font-bold text-slate-700 block">
                Vos affinités et passions communes :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {partner.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold"
                  >
                    ✨ {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Reveal Action Button */}
            <div className="pt-2">
              {!isFullyRevealed ? (
                <button
                  onClick={handleRevealClick}
                  disabled={userRevealed}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    userRevealed
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-gradient-to-r from-purple-600 via-rose-600 to-orange-500 hover:opacity-95 text-white shadow-rose-200 active:scale-95'
                  }`}
                >
                  {userRevealed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>En attente de révélation mutuelle...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Révéler nos profils & photos</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => onOpenDirectChat(partner.id)}
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-rose-400" />
                  <span>Poursuivre la conversation dans la messagerie</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Topic of the Day & Live Blind Chat */}
        <div className="lg:col-span-7 flex flex-col h-[520px] bg-white rounded-3xl border border-rose-100 shadow-md overflow-hidden">
          {/* Topic Banner */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-rose-50 to-orange-50 border-b border-rose-100 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-purple-700">
                  Thème du jour : {dailyTopic.theme}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug mt-0.5">
                "{dailyTopic.question}"
              </p>
            </div>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm font-medium shadow-xs ${
                    msg.isSelf
                      ? 'bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-tr-xs'
                      : 'bg-white border border-rose-100 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] font-semibold text-right mt-1 ${
                      msg.isSelf ? 'text-white/80' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-rose-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Écrivez spontanément à votre Blind-Match..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-rose-200 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-600 text-white font-bold disabled:opacity-50 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
