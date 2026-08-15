import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Shield,
  Clock,
  Mic,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Lock,
  Zap,
  Play,
  Pause,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  UserX,
  MessageCircle,
} from 'lucide-react';
import {
  UserProfile,
  ChatMessage,
  Conversation,
  PrivacySettings,
  AiAutoResponderSettings,
} from '../types';

interface MessagingCenterProps {
  currentUser: UserProfile;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: Record<string, ChatMessage[]>;
  onSendMessage: (
    conversationId: string,
    text: string,
    isAiGenerated?: boolean,
    mediaType?: 'text' | 'audio' | 'icebreaker'
  ) => void;
  privacySettings: PrivacySettings;
  aiSettings: AiAutoResponderSettings;
  onToggleAi: () => void;
  onBlockUser: (userId: string) => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  setActiveConversationId,
  messages,
  onSendMessage,
  privacySettings,
  aiSettings,
  onToggleAi,
  onBlockUser,
}) => {
  const [inputText, setInputText] = useState('');
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeChatMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatMessages, activeConversationId]);

  // Load AI suggestions for active conversation
  useEffect(() => {
    if (!activeConv) return;
    const fetchSmartSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch('/api/ai/icebreakers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: currentUser,
            targetProfile: activeConv.participant,
          }),
        });
        const data = await res.json();
        if (data.icebreakers && data.icebreakers.length > 0) {
          setAiSuggestions(data.icebreakers);
        } else {
          setAiSuggestions([
            `J'adore ton idée ! Tu as d'autres adresses préférées dans le coin ?`,
            `On dirait qu'on a le même feeling sur nos sorties !`,
          ]);
        }
      } catch (err) {
        console.error(err);
        setAiSuggestions([
          `Super ! Quel est ton spot préféré pour un bon café ?`,
          `On a vraiment beaucoup de points communs !`,
        ]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSmartSuggestions();
  }, [activeConv?.id]);

  // Handle Send text
  const handleSend = () => {
    if (!inputText.trim() || !activeConversationId) return;
    onSendMessage(activeConversationId, inputText.trim(), false, 'text');
    setInputText('');
  };

  // Simulate AI Auto-Responder answering on user's behalf
  const handleTriggerAiAutoReply = async () => {
    if (!activeConv || !activeConversationId || isGeneratingAiReply) return;
    setIsGeneratingAiReply(true);

    const lastReceived = [...activeChatMessages]
      .reverse()
      .find((m) => !m.isSelf);
    const partnerMessage =
      lastReceived?.text || `Salut ${currentUser.name}, comment se passe ta journée ?`;

    try {
      const res = await fetch('/api/ai/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: currentUser,
          partnerProfile: activeConv.participant,
          chatHistory: activeChatMessages,
          partnerMessage,
          aiSettings,
        }),
      });
      const data = await res.json();
      const aiReply =
        data.reply ||
        `Coucou ! Je suis actuellement indisponible mais ton message me fait plaisir. Je reviens vers toi dès que possible !`;

      onSendMessage(activeConversationId, aiReply, true, 'text');
    } catch (err) {
      console.error('Auto reply failed', err);
      onSendMessage(
        activeConversationId,
        `Coucou ! Je suis un peu pris(e) en ce moment, mais je te réponds dès que je me libère :)`,
        true,
        'text'
      );
    } finally {
      setIsGeneratingAiReply(false);
    }
  };

  // Simulated Voice Note recording
  const handleToggleRecordAudio = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
    } else {
      setIsRecordingAudio(false);
      if (activeConversationId) {
        onSendMessage(
          activeConversationId,
          `Message vocal chiffré (${Math.max(1, recordingSeconds)}s)`,
          false,
          'audio'
        );
      }
      setRecordingSeconds(0);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  return (
    <div id="messaging-center-view" className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-white border border-rose-100 rounded-[32px] overflow-hidden shadow-2xl shadow-rose-100/70 flex flex-col md:flex-row">
        {/* Left Side: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-rose-100 flex flex-col bg-rose-50/40 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                <span>Discussions</span>
                <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Chiffrement de bout en bout E2EE
              </p>
            </div>

            {/* AI Auto-Responder Global Pill */}
            <button
              id="conv-list-ai-toggle"
              onClick={onToggleAi}
              title="Activer/Désactiver l'IA pour répondre pendant vos absences"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                aiSettings.enabled
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-600 border-rose-200 hover:bg-rose-50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>IA : {aiSettings.enabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-rose-100">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConversationId;
                const lastMsg =
                  messages[conv.id]?.[messages[conv.id]?.length - 1];

                return (
                  <button
                    key={conv.id}
                    id={`conversation-item-${conv.id}`}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors select-none ${
                      isSelected
                        ? 'bg-rose-100/80 border-l-4 border-rose-500'
                        : 'hover:bg-rose-100/40 bg-white/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participant.photos[0]}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                      {conv.participant.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {conv.participant.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {lastMsg
                            ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Match'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 truncate flex items-center gap-1 font-medium">
                        {lastMsg?.isAiGenerated && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                            IA
                          </span>
                        )}
                        <span>{lastMsg ? lastMsg.text : 'Nouveau match ! Envoyez un premier mot'}</span>
                      </p>

                      {/* Common tag */}
                      {conv.commonInterests && conv.commonInterests.length > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full truncate max-w-full">
                          ✨ {conv.commonInterests[0]}
                        </span>
                      )}
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black shrink-0 shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-rose-300" />
                <p className="font-semibold text-slate-700">Aucune conversation active pour le moment.</p>
                <p className="text-slate-500 font-medium">
                  Likez des profils dans l'onglet Découvrir pour démarrer !
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-rose-50/20 relative">
            {/* Top Chat Header */}
            <div className="p-3 sm:p-4 border-b border-rose-100 flex items-center justify-between bg-white/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  id="chat-back-to-list-btn"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-xl bg-rose-100 text-slate-700 hover:text-slate-900"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activeConv.participant.photos[0]}
                    alt={activeConv.participant.name}
                    className="w-10 h-10 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  {activeConv.participant.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      {activeConv.participant.name}, {activeConv.participant.age}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                      {activeConv.participant.city}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Chiffrement certifié & Sécurisé</span>
                  </p>
                </div>
              </div>

              {/* Options & AI Trigger */}
              <div className="flex items-center gap-2">
                {/* Simulated AI Trigger button */}
                <button
                  id="simulate-ai-auto-reply-btn"
                  onClick={handleTriggerAiAutoReply}
                  disabled={isGeneratingAiReply}
                  title="Simuler une réponse automatique de votre IA pour tester le répondeur"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Bot className={`w-4 h-4 ${isGeneratingAiReply ? 'animate-spin' : 'text-white'}`} />
                  <span className="hidden sm:inline">
                    {isGeneratingAiReply ? 'IA rédige...' : 'Répondre par IA'}
                  </span>
                </button>

                {/* More / Privacy options */}
                <button
                  id="chat-options-menu-btn"
                  onClick={() => setShowOptionsModal(!showOptionsModal)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-rose-100 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Wingman active banner if enabled */}
            {aiSettings.enabled && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">
                    <strong className="font-bold">Mode Répondeur IA actif :</strong> L'IA répondra avec
                    votre ton ({aiSettings.personalityTone.replace('_', ' ')}) si
                    vous êtes indisponible.
                  </span>
                </div>
                <button
                  id="banner-pause-ai-btn"
                  onClick={onToggleAi}
                  className="text-emerald-700 hover:underline font-bold ml-2 shrink-0 text-[11px]"
                >
                  Mettre en pause
                </button>
              </div>
            )}

            {/* Ephemeral messages banner if active */}
            {privacySettings.ephemeralMessages !== 'off' && (
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center gap-1.5 text-[11px] text-amber-900 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Messages éphémères activés : disparition automatique après{' '}
                  {privacySettings.ephemeralMessages}.
                </span>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* Security handshake message */}
              <div className="text-center my-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-rose-200 text-[11px] text-slate-500 font-medium shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Canal chiffré de bout en bout • Aucune donnée partagée à des tiers
                  </span>
                </div>
              </div>

              {activeChatMessages.map((msg) => {
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.isSelf ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] sm:max-w-[70%] rounded-2xl p-3 shadow-md relative ${
                        msg.isSelf
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-tr-sm shadow-rose-200'
                          : 'bg-white border border-rose-100 text-slate-800 rounded-tl-sm shadow-rose-100/60'
                      }`}
                    >
                      {/* AI generated indicator badge */}
                      {msg.isAiGenerated && (
                        <div className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-800 mb-1 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 w-fit">
                          <Bot className="w-3 h-3 text-emerald-600" />
                          <span>Réponse générée par mon IA (Mode Absent)</span>
                        </div>
                      )}

                      {/* Audio Message */}
                      {msg.mediaType === 'audio' ? (
                        <div className="flex items-center gap-3 py-1 min-w-[180px]">
                          <button
                            onClick={() =>
                              setIsPlayingAudio(
                                isPlayingAudio === msg.id ? null : msg.id
                              )
                            }
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          >
                            {isPlayingAudio === msg.id ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-white ${
                                  isPlayingAudio === msg.id
                                    ? 'w-full transition-all duration-3000'
                                    : 'w-1/3'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-white/90 font-medium mt-1 block">
                              Message vocal chiffré
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp & checkmarks */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                          msg.isSelf ? 'text-white/80' : 'text-slate-400'
                        }`}
                      >
                        <span className="font-semibold">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.isSelf && <CheckCheck className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Icebreakers Suggestions Carousel */}
            {aiSuggestions.length > 0 && (
              <div className="px-4 py-2.5 bg-white/90 border-t border-rose-100">
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Suggestions d'accroches personnalisées :</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {aiSuggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(sug)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-slate-700 hover:text-rose-700 transition-all text-left max-w-xs truncate shadow-xs"
                      title={sug}
                    >
                      "{sug}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-rose-100">
              <div className="flex items-center gap-2">
                {/* Simulated Voice note recorder button */}
                <button
                  id="record-voice-note-btn"
                  onClick={handleToggleRecordAudio}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isRecordingAudio
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-md'
                      : 'bg-rose-50 border-rose-200 text-slate-600 hover:text-slate-900 hover:bg-rose-100'
                  }`}
                  title={
                    isRecordingAudio
                      ? 'Arrêter et envoyer la note vocale'
                      : 'Enregistrer une note vocale'
                  }
                >
                  <Mic className="w-5 h-5" />
                </button>

                {isRecordingAudio ? (
                  <div className="flex-1 px-4 py-2.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Enregistrement audio en cours... ({recordingSeconds}s)
                    </span>
                    <button
                      onClick={handleToggleRecordAudio}
                      className="px-3.5 py-1 rounded-xl bg-rose-600 text-white font-bold text-[11px] shadow-sm shadow-rose-200"
                    >
                      Envoyer
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      id="chat-message-input"
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder="Écrivez un message sécurisé..."
                      className="flex-1 bg-rose-50/60 border border-rose-200 focus:border-rose-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />

                    <button
                      id="send-chat-message-btn"
                      onClick={handleSend}
                      disabled={!inputText.trim()}
                      className="p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold transition-all shadow-md shadow-rose-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Chat Options & Security Menu Modal */}
            {showOptionsModal && (
              <div
                id="chat-options-overlay"
                className="absolute top-16 right-4 z-30 w-64 bg-white border border-rose-100 rounded-2xl shadow-2xl shadow-rose-100 p-3 space-y-2 animate-fade-in"
              >
                <div className="text-xs font-bold text-slate-800 pb-2 border-b border-rose-100">
                  Options de sécurité du chat
                </div>

                <button
                  id="chat-block-user-btn"
                  onClick={() => {
                    onBlockUser(activeConv.participant.id);
                    setShowOptionsModal(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 text-left font-bold transition-colors"
                >
                  <UserX className="w-4 h-4" />
                  <span>Bloquer & Signaler ce profil</span>
                </button>

                <div className="pt-2 border-t border-rose-100 text-[10px] text-slate-500 font-medium">
                  Protégé par le système de modération anti-harcèlement et chiffrement RSA/AES.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Chat Area */
          <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-500 shadow-md shadow-rose-100">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Sélectionnez une discussion
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mt-1">
                Discutez en toute sécurité avec vos matchs. L'IA de répondeur
                automatique veille sur vos messages quand vous êtes absent.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
