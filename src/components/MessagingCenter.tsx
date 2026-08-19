import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  Shield,
  Clock,
  Mic,
  Check,
  CheckCheck,
  MoreVertical,
  Lock,
  ChevronLeft,
  UserX,
  MessageCircle,
  Sparkles,
  Search,
  X,
  Phone,
  Video,
  PhoneOff,
  VideoOff,
  Settings,
  AlertCircle,
  Trash2,
  Volume2,
  Smile,
  Heart,
  Palette,
  CalendarHeart,
} from 'lucide-react';
import {
  UserProfile,
  ChatMessage,
  Conversation,
  PrivacySettings,
  AiAutoResponderSettings,
  CallReceptionPreference,
  LoveSticker,
  DateIdea,
} from '../types';
import { ActiveCallModal } from './ActiveCallModal';
import { AudioMessagePlayer } from './AudioMessagePlayer';
import { EmojiStickerPicker } from './EmojiStickerPicker';
import { DateConciergeModal } from './DateConciergeModal';

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
    mediaType?: 'text' | 'audio' | 'icebreaker' | 'image' | 'sticker',
    audioUrl?: string,
    audioDuration?: number,
    stickerData?: LoveSticker
  ) => void;
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings?: (newSettings: Partial<PrivacySettings>) => void;
  aiSettings: AiAutoResponderSettings;
  onToggleAi: () => void;
  onBlockUser: (userId: string) => void;
  onBackToDiscovery?: () => void;
}

export const MessagingCenter: React.FC<MessagingCenterProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  setActiveConversationId,
  messages,
  onSendMessage,
  privacySettings,
  onUpdatePrivacySettings,
  aiSettings,
  onToggleAi,
  onBlockUser,
  onBackToDiscovery,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showCallSettingsModal, setShowCallSettingsModal] = useState(false);
  const [showCallHubPopup, setShowCallHubPopup] = useState(false);
  const [showFloatingCallBubble, setShowFloatingCallBubble] = useState(false);

  // Real Voice Note Recording State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioPermissionError, setAudioPermissionError] = useState<string | null>(null);
  const [recordingVisualizerBars, setRecordingVisualizerBars] = useState<number[]>([
    20, 45, 70, 30, 85, 60, 95, 40, 75, 50, 90, 65, 35, 80, 55, 30,
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<any>(null);

  // Real Audio / Video Calls state
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [blockedCallNotice, setBlockedCallNotice] = useState<{
    type: 'audio' | 'video';
    reason: 'user_setting' | 'partner_setting';
    message: string;
  } | null>(null);

  // Emoji & Sticker Picker State
  const [showEmojiStickerPicker, setShowEmojiStickerPicker] = useState(false);
  const [showDateConciergeModal, setShowDateConciergeModal] = useState(false);

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleSendDateInvitation = (dateIdea: DateIdea, customNote?: string) => {
    if (!activeConversationId) return;
    const inviteText = `✨ INVITATION DATE CONCIERGE IA : ${dateIdea.title}
📍 Lieu : ${dateIdea.locationType}
🕒 Créneau : ${dateIdea.suggestedTimeSlot}
💡 Activité : ${dateIdea.description}${customNote ? `\n\n"${customNote}"` : ''}`;

    onSendMessage(activeConversationId, inviteText);
  };

  const handleSendSticker = (sticker: LoveSticker) => {
    if (!activeConversationId) return;
    onSendMessage(
      activeConversationId,
      sticker.title,
      false,
      'sticker',
      undefined,
      undefined,
      sticker
    );
    setShowEmojiStickerPicker(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Load AI smart suggestions when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    let isMounted = true;

    const fetchSmartSuggestions = async () => {
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
        if (isMounted) {
          if (data.icebreakers && data.icebreakers.length > 0) {
            setAiSuggestions(data.icebreakers);
          } else {
            setAiSuggestions([
              `Coucou ! J'adore ton profil, tu aimes quel type de sorties ?`,
              `Hello ! On a l'air d'avoir beaucoup de passions communes ✨`,
              `Salut ! Quel est ton endroit préféré dans la ville ?`,
            ]);
          }
        }
      } catch {
        if (isMounted) {
          setAiSuggestions([
            `Coucou ! J'adore ton profil, tu as passé un bon week-end ?`,
            `Hello ! Tes photos sont superbes, ravie de matcher avec toi !`,
            `Salut ! Quels sont tes projets pour les prochains jours ?`,
          ]);
        }
      }
    };

    fetchSmartSuggestions();

    return () => {
      isMounted = false;
    };
  }, [activeConv?.id]);

  // Handle Send text
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !activeConversationId) {
      inputRef.current?.focus();
      return;
    }
    onSendMessage(activeConversationId, trimmed, false, 'text');
    setInputText('');
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 50);
  };

  // =========================================================================
  // REAL VOICE RECORDING ENGINE (MediaRecorder & AudioContext)
  // =========================================================================

  const startVoiceRecording = async () => {
    setAudioPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Votre navigateur ne prend pas en charge la capture audio.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      audioStreamRef.current = stream;

      // Determine supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        '',
      ];
      let selectedMime = '';
      for (const mime of mimeTypes) {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime;
          break;
        }
      }

      const recorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(200); // collect 200ms slices

      // Setup Web Audio Analyser for live frequency visualization
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateBars = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const bars = Array.from(dataArray.slice(0, 16)).map((v) =>
                Math.max(15, Math.min(100, Math.round((v / 255) * 100)))
              );
              setRecordingVisualizerBars(bars);
              animFrameRef.current = requestAnimationFrame(updateBars);
            }
          };
          updateBars();
        }
      } catch {
        // Continue even if Analyser fails
      }

      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setAudioPermissionError(
          "Accès microphone refusé. Veuillez autoriser l'accès au micro dans les paramètres du navigateur pour envoyer des vocaux."
        );
      } else {
        setAudioPermissionError(
          "Impossible d'accéder au microphone de votre appareil. Vérifiez vos périphériques audio."
        );
      }
    }
  };

  const stopAndSendVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    const finalSeconds = Math.max(1, recordingSeconds);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        // Convert blob to DataURL so it persists in state & local storage seamlessly
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const audioBase64 = reader.result as string;
          if (activeConversationId) {
            onSendMessage(
              activeConversationId,
              `Message vocal chiffré (${finalSeconds}s)`,
              false,
              'audio',
              audioBase64,
              finalSeconds
            );
          }
          cleanupAudioStream();
          setIsRecordingVoice(false);
          setRecordingSeconds(0);
        };
      };
      recorder.stop();
    } else {
      cleanupAudioStream();
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
    }
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupAudioStream();
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const cleanupAudioStream = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelVoiceRecording();
    };
  }, [activeConversationId]);

  // =========================================================================
  // CALL FLOW ENGINE
  // =========================================================================

  const handleStartCall = (type: 'audio' | 'video') => {
    const isAudioBlockedByUser =
      privacySettings.allowAudioCalls === false ||
      privacySettings.callReception === 'no_audio' ||
      privacySettings.callReception === 'none';

    const isVideoBlockedByUser =
      privacySettings.allowVideoCalls === false ||
      privacySettings.callReception === 'no_video' ||
      privacySettings.callReception === 'none';

    if (type === 'audio' && isAudioBlockedByUser) {
      setBlockedCallNotice({
        type: 'audio',
        reason: 'user_setting',
        message:
          'Vous avez bloqué la réception et l’émission des appels audio dans vos paramètres de confidentialité.',
      });
      return;
    }

    if (type === 'video' && isVideoBlockedByUser) {
      setBlockedCallNotice({
        type: 'video',
        reason: 'user_setting',
        message:
          'Vous avez bloqué les appels vidéo dans vos paramètres de confidentialité.',
      });
      return;
    }

    // Launch Real Camera & Microphone Call Modal
    setActiveCallType(type);
  };

  // Simulate AI Auto-Responder answering on user's behalf
  const handleTriggerAiAutoReply = async () => {
    if (!activeConv || !activeConversationId || isGeneratingAiReply) return;
    setIsGeneratingAiReply(true);

    const lastReceived = [...activeChatMessages]
      .reverse()
      .find((m) => !m.isSelf);
    const partnerMessage =
      lastReceived?.text || `Salut ${currentUser.name}, comment vas-tu aujourd'hui ?`;

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
        `Coucou ! Je suis un peu pris(e) en ce moment, mais ton message me fait super plaisir. Je te réponds dès que possible !`;

      onSendMessage(activeConversationId, aiReply, true, 'text');
    } catch {
      onSendMessage(
        activeConversationId,
        `Coucou ! Merci pour ton message, je reviens vers toi très vite ! :)`,
        true,
        'text'
      );
    } finally {
      setIsGeneratingAiReply(false);
    }
  };

  // Filter conversations with search query
  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participant.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="messaging-center-view"
      className="w-full h-full flex flex-col min-h-0 overflow-hidden bg-rose-50/40"
    >
      <div className="w-full h-full max-w-7xl mx-auto md:p-3 lg:p-4 flex flex-col min-h-0">
        <div className="flex-1 bg-white md:border md:border-rose-100 md:rounded-3xl overflow-hidden md:shadow-xl md:shadow-rose-100/60 flex flex-col md:flex-row min-h-0">
          {/* ========================================================================= */}
          {/* Left Side: Conversations List (Hidden on mobile if a chat is active)      */}
          {/* ========================================================================= */}
          <div
            className={`w-full md:w-80 lg:w-96 md:border-r border-rose-100 flex flex-col bg-rose-50/30 min-h-0 ${
              activeConversationId ? 'hidden md:flex' : 'flex flex-1'
            }`}
          >
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-rose-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                {onBackToDiscovery && (
                  <button
                    id="conv-list-back-btn"
                    onClick={onBackToDiscovery}
                    title="Retour aux profils à découvrir"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    <ChevronLeft className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                    <span className="text-xs font-bold">Profils</span>
                  </button>
                )}
                <div>
                  <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                    <span>Messages</span>
                    <span
                      className="p-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300"
                      title="Chiffrement sécurisé"
                    >
                      <Shield className="w-3 h-3" />
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    {conversations.length} conversation
                    {conversations.length > 1 ? 's' : ''} active
                    {conversations.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* AI Auto-responder pill */}
              <button
                id="conv-list-ai-toggle"
                onClick={onToggleAi}
                title="Activer/Désactiver le Répondeur IA"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  aiSettings.enabled
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-600 border-rose-200 hover:bg-rose-50'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>IA : {aiSettings.enabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Search filter in conversations */}
            {conversations.length > 2 && (
              <div className="px-3 py-2 bg-white/70 border-b border-rose-100 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une discussion..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-rose-100/70 min-h-0 overscroll-contain pb-28 md:pb-6">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConversationId;
                  const lastMsg =
                    messages[conv.id]?.[messages[conv.id]?.length - 1];

                  return (
                    <button
                      key={conv.id}
                      id={`conversation-item-${conv.id}`}
                      onClick={() => setActiveConversationId(conv.id)}
                      className={`w-full text-left p-3 sm:p-3.5 flex items-center gap-3 transition-all select-none cursor-pointer ${
                        isSelected
                          ? 'bg-rose-100/90 border-l-4 border-rose-500'
                          : 'hover:bg-rose-100/50 bg-white/80'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.participant.photos[0]}
                          alt={conv.participant.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        {conv.isAiAutoResponding ? (
                          <span
                            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white border-2 border-white text-xs shadow-2xs"
                            title="Hors ligne • Répondeur IA actif"
                          >
                            🤖
                          </span>
                        ) : conv.participant.isOnline ? (
                          <span
                            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white text-xs shadow-2xs"
                            title="En ligne 😊"
                          >
                            😊
                          </span>
                        ) : (
                          <span
                            className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 text-slate-700 border-2 border-white text-xs shadow-2xs"
                            title="Hors ligne 🥺"
                          >
                            🥺
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {conv.participant.name}
                            </h4>
                            <span className="text-sm select-none shrink-0" title={conv.participant.isOnline ? '😊' : '🥺'}>
                              {conv.participant.isOnline ? '😊' : '🥺'}
                            </span>
                            {conv.isAiAutoResponding && (
                              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black shrink-0">
                                <Bot className="w-2.5 h-2.5 text-amber-700" />
                                IA
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-1">
                            {lastMsg
                              ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Match'}
                          </span>
                        </div>

                        {conv.isAiAutoResponding && !lastMsg && (
                          <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 truncate mb-0.5">
                            <span className="text-xs">🤖</span>
                            <span>Répondeur IA actif</span>
                          </p>
                        )}

                        <p className="text-xs text-slate-600 truncate flex items-center gap-1 font-medium">
                          {lastMsg?.isAiGenerated && (
                            <span className="px-1 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300 shrink-0">
                              IA
                            </span>
                          )}
                          {lastMsg?.mediaType === 'audio' && (
                            <span className="flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                              <Volume2 className="w-3 h-3" />
                              <span>Vocal ({lastMsg.audioDuration || 4}s)</span>
                            </span>
                          )}
                          {lastMsg?.mediaType !== 'audio' && (
                            <span className="truncate">
                              {lastMsg
                                ? lastMsg.text
                                : 'Nouveau match ! Dites bonjour 👋'}
                            </span>
                          )}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black shrink-0 shadow-xs">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 mx-auto">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {searchQuery ? 'Aucun résultat' : 'Aucune discussion'}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      {searchQuery
                        ? 'Essayez avec un autre nom de profil.'
                        : 'Découvrez des profils et envoyez des likes pour débloquer de nouveaux matchs.'}
                    </p>
                  </div>
                  {onBackToDiscovery && (
                    <button
                      onClick={onBackToDiscovery}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm hover:bg-rose-500 cursor-pointer"
                    >
                      Découvrir des profils
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Right Side: Active Chat Window                                            */}
          {/* ========================================================================= */}
          {activeConv ? (
            <div className="flex-1 flex flex-col bg-rose-50/20 relative min-h-0 h-full overflow-hidden">
              {/* Top Chat Header */}
              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-rose-100 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0 z-20">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  {/* Back to conversations list button (Visible on desktop and mobile) */}
                  <button
                    id="chat-back-to-list-btn"
                    onClick={() => {
                      setActiveConversationId(null);
                      setShowEmojiStickerPicker(false);
                    }}
                    title="Retour à la liste des discussions"
                    className="p-1.5 sm:p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                    <span className="text-xs font-bold text-rose-700">
                      Discussions
                    </span>
                  </button>

                  {/* Direct Back to Discovery Button on Desktop */}
                  {onBackToDiscovery && (
                    <button
                      id="chat-to-discovery-btn"
                      onClick={() => {
                        setShowEmojiStickerPicker(false);
                        onBackToDiscovery();
                      }}
                      title="Retourner aux profils à découvrir"
                      className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                      <span>Profils</span>
                    </button>
                  )}

                  <div className="relative shrink-0">
                    <img
                      src={activeConv.participant.photos[0]}
                      alt={activeConv.participant.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    {activeConv.isAiAutoResponding ? (
                      <span
                        className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white border-2 border-white text-xs shadow-2xs"
                        title="Hors ligne • Répondeur IA actif"
                      >
                        🤖
                      </span>
                    ) : activeConv.participant.isOnline ? (
                      <span
                        className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white text-xs shadow-2xs"
                        title="En ligne 😊"
                      >
                        😊
                      </span>
                    ) : (
                      <span
                        className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 text-slate-700 border-2 border-white text-xs shadow-2xs"
                        title="Hors ligne 🥺"
                      >
                        🥺
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {activeConv.participant.name}, {activeConv.participant.age}
                      </h3>
                      <span className="text-sm select-none shrink-0" title={activeConv.participant.isOnline ? '😊' : '🥺'}>
                        {activeConv.participant.isOnline ? '😊' : '🥺'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons (Date Concierge, AI Reply & Options) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Date Concierge IA & Safe-Date Angel Button */}
                  <button
                    id="chat-date-concierge-btn"
                    onClick={() => setShowDateConciergeModal(true)}
                    title="Planificateur de Date IA & Sécurité Safe-Date"
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <CalendarHeart className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden sm:inline">Date IA</span>
                  </button>

                  {/* Trigger AI Auto-reply demo */}
                  <button
                    id="simulate-ai-auto-reply-btn"
                    onClick={handleTriggerAiAutoReply}
                    disabled={isGeneratingAiReply}
                    title="Tester une réponse rédigée automatiquement par votre IA"
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-[11px] font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Bot
                      className={`w-3.5 h-3.5 ${
                        isGeneratingAiReply ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="hidden md:inline">
                      {isGeneratingAiReply ? 'IA...' : 'Répondre par IA'}
                    </span>
                  </button>

                  {/* Chat Options Dropdown */}
                  <button
                    id="chat-options-menu-btn"
                    onClick={() => setShowOptionsModal(!showOptionsModal)}
                    title="Options du chat et des appels"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Auto-responder status banner */}
              {aiSettings.enabled && (
                <div className="bg-emerald-50 border-b border-emerald-100 px-3 sm:px-4 py-1.5 flex items-center justify-between text-[11px] text-emerald-900 shrink-0 z-10">
                  <div className="flex items-center gap-1.5 truncate">
                    <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      <strong>Répondeur IA actif :</strong> Répondra avec votre
                      style ({aiSettings.personalityTone}) en cas d'absence.
                    </span>
                  </div>
                  <button
                    onClick={onToggleAi}
                    className="text-emerald-700 hover:underline font-bold ml-2 shrink-0 text-[10px] cursor-pointer"
                  >
                    Pause
                  </button>
                </div>
              )}

              {/* Microphone Permission Alert */}
              {audioPermissionError && (
                <div className="p-3 bg-amber-500/90 text-slate-950 text-xs font-semibold flex items-center justify-between gap-2 shadow-md shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{audioPermissionError}</span>
                  </div>
                  <button
                    onClick={() => setAudioPermissionError(null)}
                    className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Chat Messages Stream Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0 overscroll-contain">
                {/* Security Handshake badge */}
                <div className="text-center my-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-rose-200 text-[10px] text-slate-500 font-medium shadow-xs">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>
                      Canal chiffré de bout en bout • Messages vocaux réels & double coche bleue
                    </span>
                  </div>
                </div>

                {/* Partner Offline & AI Auto-responder status card */}
                {activeConv.isAiAutoResponding && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                        <Bot className="w-4 h-4 text-amber-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {activeConv.participant.name} est hors ligne
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 text-[9px] font-black tracking-wide">
                            RÉPONDEUR IA ACTIF
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium truncate mt-0.5">
                          {activeConv.participant.lastActiveText || 'Dernière visite il y a 25 min'} • Son assistant IA prend le relais pour échanger en toute bienveillance.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-white/90 border border-amber-200 px-2 py-1 rounded-lg shrink-0 hidden sm:inline-flex items-center gap-1 shadow-2xs">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Auto-réponse
                    </span>
                  </div>
                )}

                {activeChatMessages.map((msg) => {
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.isSelf ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                          msg.isSelf
                            ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-tr-xs shadow-rose-200'
                            : 'bg-white border border-rose-100 text-slate-800 rounded-tl-xs shadow-slate-100'
                        }`}
                      >
                        {/* AI-Generated badge */}
                        {msg.isAiGenerated && (
                          <div className="flex items-center gap-1 text-[9px] font-black tracking-wider text-emerald-900 mb-1 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300 w-fit">
                            <Bot className="w-2.5 h-2.5 text-emerald-700" />
                            <span>Réponse IA (Mode Absent)</span>
                          </div>
                        )}

                        {/* Audio Media Voice Note Player or Sticker */}
                        {msg.mediaType === 'sticker' && msg.stickerData ? (
                          <div className="flex flex-col items-center select-none py-1">
                            <div
                              className={`rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br ${msg.stickerData.gradient} text-white shadow-lg border border-white/30 text-center space-y-1 relative overflow-hidden transform hover:scale-105 transition-transform max-w-[210px] sm:max-w-[240px]`}
                            >
                              <span className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/20 blur-md pointer-events-none" />
                              <div className="text-3xl sm:text-4xl filter drop-shadow-md my-0.5 animate-pulse">
                                {msg.stickerData.emoji}
                              </div>
                              <h4 className="font-black text-xs sm:text-sm leading-tight drop-shadow-xs text-white">
                                {msg.stickerData.title}
                              </h4>
                              {msg.stickerData.subtitle && (
                                <p className="text-[10px] sm:text-[11px] text-white/90 font-medium leading-tight">
                                  {msg.stickerData.subtitle}
                                </p>
                              )}
                              {msg.stickerData.isCustom && (
                                <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded-full text-white">
                                  Sticker Personnalisé
                                </span>
                              )}
                            </div>
                          </div>
                        ) : msg.mediaType === 'audio' ? (
                          <AudioMessagePlayer
                            audioUrl={msg.audioUrl}
                            duration={msg.audioDuration || 5}
                            isSelf={msg.isSelf}
                            label={msg.text}
                          />
                        ) : (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium select-text">
                            {msg.text}
                          </p>
                        )}

                        {/* Message Timestamp & Read Receipts (Double Blue Checkmark) */}
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] ${
                            msg.isSelf ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          <span className="font-semibold">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {msg.isSelf && (
                            msg.isRead ? (
                              <span
                                className="flex items-center text-sky-300 font-black ml-0.5 drop-shadow-xs"
                                title="Message lu par le partenaire (Double coche bleue)"
                              >
                                <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                              </span>
                            ) : (
                              <span
                                className="flex items-center text-white/60 font-semibold ml-0.5"
                                title="Message envoyé et distribué"
                              >
                                <Check className="w-3.5 h-3.5 stroke-2" />
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Icebreaker / Smart Suggestions Carousel */}
              {aiSuggestions.length > 0 && !isRecordingVoice && (
                <div className="px-3 sm:px-4 py-2 bg-white/90 border-t border-rose-100 shrink-0 z-10">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-rose-600 font-bold mb-1">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>Suggestions d'accroches pour briser la glace :</span>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {aiSuggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputText(sug);
                          inputRef.current?.focus();
                        }}
                        className="shrink-0 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold text-slate-700 hover:text-rose-700 transition-all text-left max-w-xs truncate shadow-2xs cursor-pointer"
                        title={sug}
                      >
                        "{sug}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* Message Input Bar (Fixed & Fully Responsive with Real Voice Note Support) */}
              {/* ========================================================================= */}
              <div className="p-2 sm:p-3 bg-white border-t border-rose-100 shrink-0 z-30 shadow-md">
                {isRecordingVoice ? (
                  /* Live Real Voice Recording Bar */
                  <div className="flex items-center gap-2 sm:gap-3 bg-rose-50 border border-rose-300 rounded-2xl p-2 sm:p-2.5 shadow-inner">
                    {/* Discard / Trash button */}
                    <button
                      type="button"
                      id="discard-voice-note-btn"
                      onClick={cancelVoiceRecording}
                      className="p-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      title="Annuler l'enregistrement vocal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Pulsing indicator & timer */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                      <span className="font-black text-rose-700 text-xs sm:text-sm tabular-nums">
                        {formatTimer(recordingSeconds)}
                      </span>
                    </div>

                    {/* Live Waveform visualizer */}
                    <div className="flex-1 flex items-center justify-center gap-0.5 sm:gap-1 h-7 overflow-hidden px-1">
                      {recordingVisualizerBars.map((height, i) => (
                        <span
                          key={i}
                          style={{ height: `${Math.max(6, (height / 100) * 24)}px` }}
                          className="w-1 rounded-full bg-gradient-to-t from-rose-600 to-orange-500 transition-all duration-75"
                        />
                      ))}
                    </div>

                    {/* Stop & Send Voice Note Button */}
                    <button
                      type="button"
                      id="send-voice-note-btn"
                      onClick={stopAndSendVoiceRecording}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer shrink-0"
                      title="Envoyer le message vocal"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Envoyer</span>
                    </button>
                  </div>
                ) : (
                  /* Standard Text & Voice Input Form */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-1.5 sm:gap-2 max-w-full"
                  >
                    {/* Voice Note Recording Trigger Button */}
                    <button
                      type="button"
                      id="start-voice-record-btn"
                      onClick={startVoiceRecording}
                      className="p-2.5 sm:p-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-all cursor-pointer shrink-0 min-w-[42px] min-h-[42px] flex items-center justify-center active:scale-95"
                      title="Enregistrer un vrai message vocal avec votre microphone"
                    >
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Emoji & Stickers Quick Selector Trigger Button */}
                    <button
                      type="button"
                      id="toggle-emoji-sticker-picker-btn"
                      onClick={() => setShowEmojiStickerPicker((prev) => !prev)}
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[42px] min-h-[42px] flex items-center justify-center active:scale-95 ${
                        showEmojiStickerPicker
                          ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200'
                          : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-slate-700 hover:text-rose-600'
                      }`}
                      title="Émojis rapides & Stickers d'Amour & Bonheur"
                    >
                      <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Text Input */}
                    <input
                      ref={inputRef}
                      id="chat-message-input"
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Écrivez un message..."
                      autoComplete="off"
                      className="flex-1 bg-rose-50/70 border border-rose-200 focus:border-rose-500 focus:bg-white rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium min-w-0 shadow-inner"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      id="send-chat-message-btn"
                      onClick={(e) => {
                        if (inputText.trim()) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={!inputText.trim()}
                      className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-md cursor-pointer active:scale-95 ${
                        inputText.trim()
                          ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-200'
                          : 'bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed opacity-70 shadow-none'
                      }`}
                      title="Envoyer le message"
                      aria-label="Envoyer le message"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </form>
                )}
              </div>

              {/* ========================================================================= */}
              {/* Floating Call Bubble FAB (Speed-Dial for Audio, Video & Call Settings)    */}
              {/* ========================================================================= */}
              <div className="absolute right-3.5 sm:right-5 bottom-18 sm:bottom-20 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
                {/* Backdrop when open for easy dismissal */}
                {showFloatingCallBubble && (
                  <div
                    onClick={() => setShowFloatingCallBubble(false)}
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] pointer-events-auto animate-fade-in"
                  />
                )}

                {/* Expanded Speed Dial Options Bubble Container */}
                {showFloatingCallBubble && (
                  <div className="relative z-40 flex flex-col items-end gap-2.5 mb-1 pointer-events-auto animate-fade-in">
                    {/* Option 1: Video Call Bubble */}
                    <div className="flex items-center gap-2.5 group">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-rose-100 text-xs font-bold text-slate-800 pointer-events-none whitespace-nowrap shadow-rose-100">
                        <span className="text-rose-600 font-extrabold mr-1">Vidéo HD</span>
                        <span className="text-[10px] text-slate-500 font-normal">Caméra & Micro</span>
                      </div>
                      <button
                        id="fab-video-call-btn"
                        onClick={() => {
                          setShowFloatingCallBubble(false);
                          handleStartCall('video');
                        }}
                        title={`Lancer un appel vidéo HD avec ${activeConv.participant.name}`}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-xl shadow-rose-300 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Option 2: Audio Call Bubble */}
                    <div className="flex items-center gap-2.5 group">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 text-xs font-bold text-slate-800 pointer-events-none whitespace-nowrap shadow-emerald-100">
                        <span className="text-emerald-600 font-extrabold mr-1">Appel Voix</span>
                        <span className="text-[10px] text-slate-500 font-normal">Chiffré WebRTC</span>
                      </div>
                      <button
                        id="fab-audio-call-btn"
                        onClick={() => {
                          setShowFloatingCallBubble(false);
                          handleStartCall('audio');
                        }}
                        title={`Lancer un appel audio avec ${activeConv.participant.name}`}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Option 3: Call Security & Settings Bubble */}
                    <div className="flex items-center gap-2.5 group">
                      <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-lg border border-slate-100 text-[11px] font-bold text-slate-700 pointer-events-none whitespace-nowrap shadow-slate-100">
                        <span>Réglages d'appels</span>
                      </div>
                      <button
                        id="fab-call-settings-btn"
                        onClick={() => {
                          setShowFloatingCallBubble(false);
                          setShowCallSettingsModal(true);
                        }}
                        title="Préférences d'appels & confidentialité"
                        className="w-10 h-10 rounded-full bg-slate-800 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border-2 border-white"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Floating Trigger Bubble Button */}
                <button
                  id="chat-floating-call-fab-btn"
                  onClick={() => setShowFloatingCallBubble(!showFloatingCallBubble)}
                  title={showFloatingCallBubble ? "Fermer le menu des appels" : "Options d'appels instantanés"}
                  className={`relative z-40 w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer border-2 border-white pointer-events-auto ${
                    showFloatingCallBubble
                      ? 'bg-slate-900 text-white rotate-90 shadow-slate-400'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:scale-105 shadow-emerald-300'
                  }`}
                >
                  {showFloatingCallBubble ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <>
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white"></span>
                      </span>
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                    </>
                  )}
                </button>
              </div>

              {/* Emoji & Sticker Picker Floating Popover */}
              {showEmojiStickerPicker && (
                <div
                  id="chat-emoji-sticker-picker-overlay"
                  className="absolute bottom-16 sm:bottom-20 left-2 right-2 sm:left-auto sm:right-4 z-40 max-w-lg shadow-2xl animate-fade-in"
                >
                  <EmojiStickerPicker
                    onSelectEmoji={handleSelectEmoji}
                    onSendSticker={handleSendSticker}
                    onClose={() => setShowEmojiStickerPicker(false)}
                  />
                </div>
              )}

              {/* Chat Options & Security Menu Modal */}
              {showOptionsModal && (
                <div
                  id="chat-options-overlay"
                  className="absolute top-14 right-3 z-40 w-72 bg-white border border-rose-100 rounded-3xl shadow-2xl p-3 space-y-2 animate-fade-in"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-rose-100">
                    <span>Options de la conversation</span>
                    <button
                      onClick={() => setShowOptionsModal(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Open Call Settings Quick Switcher */}
                  <button
                    onClick={() => {
                      setShowOptionsModal(false);
                      setShowCallSettingsModal(true);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-slate-700 hover:bg-rose-50 text-left font-bold transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-rose-500" />
                    <div className="flex-1 min-w-0">
                      <div>Préférences des appels</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {privacySettings.callReception === 'all' && 'Tous les appels autorisés'}
                        {privacySettings.callReception === 'no_video' && 'Audio uniquement'}
                        {privacySettings.callReception === 'no_audio' && 'Vidéo uniquement'}
                        {privacySettings.callReception === 'none' && 'Bloquer tous les appels'}
                      </div>
                    </div>
                  </button>

                  <button
                    id="chat-block-user-btn"
                    onClick={() => {
                      onBlockUser(activeConv.participant.id);
                      setShowOptionsModal(false);
                    }}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 text-left font-bold transition-colors cursor-pointer"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Bloquer & Signaler {activeConv.participant.name}</span>
                  </button>

                  <div className="pt-2 border-t border-rose-100 text-[10px] text-slate-500 font-medium leading-tight">
                    Vos échanges et flux d'appels sont protégés par le chiffrement de bout en bout.
                  </div>
                </div>
              )}

              {/* Call Settings Quick Modal */}
              {showCallSettingsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in border border-rose-100">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            Réception des Appels
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Choisissez qui peut vous joindre par voix ou vidéo
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCallSettingsModal(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        {
                          id: 'all' as CallReceptionPreference,
                          title: 'Tous les appels autorisés',
                          desc: 'Recevoir les appels audio & vidéo de vos matchs',
                          icon: Phone,
                          allowAudio: true,
                          allowVideo: true,
                        },
                        {
                          id: 'no_video' as CallReceptionPreference,
                          title: 'Bloquer les appels vidéo uniquement',
                          desc: 'Recevoir uniquement des appels audio sans caméra',
                          icon: VideoOff,
                          allowAudio: true,
                          allowVideo: false,
                        },
                        {
                          id: 'no_audio' as CallReceptionPreference,
                          title: 'Bloquer les appels audio uniquement',
                          desc: 'Recevoir uniquement des appels vidéo',
                          icon: PhoneOff,
                          allowAudio: false,
                          allowVideo: true,
                        },
                        {
                          id: 'none' as CallReceptionPreference,
                          title: 'Bloquer tous les appels (Audio & Vidéo)',
                          desc: 'Refuser tous les appels entrants (Mode discret)',
                          icon: Shield,
                          allowAudio: false,
                          allowVideo: false,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected =
                          (privacySettings.callReception || 'all') === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onUpdatePrivacySettings?.({
                                callReception: item.id,
                                allowAudioCalls: item.allowAudio,
                                allowVideoCalls: item.allowVideo,
                              });
                            }}
                            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50 border-2 border-rose-500 shadow-xs'
                                : 'bg-white border-rose-200 hover:bg-rose-50/50'
                            }`}
                          >
                            <div
                              className={`p-2 rounded-xl shrink-0 ${
                                isSelected
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-rose-100 text-rose-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                                <span>{item.title}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-rose-600 font-bold">
                                    ✓ Actif
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setShowCallSettingsModal(false)}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Enregistrer mes préférences
                    </button>
                  </div>
                </div>
              )}

              {/* Blocked Call Notice Modal */}
              {blockedCallNotice && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in border border-rose-100 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                      {blockedCallNotice.type === 'video' ? (
                        <VideoOff className="w-7 h-7" />
                      ) : (
                        <PhoneOff className="w-7 h-7" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-base text-slate-900">
                        {blockedCallNotice.type === 'video'
                          ? 'Appels vidéo non autorisés'
                          : 'Appels audio non autorisés'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {blockedCallNotice.message}
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {blockedCallNotice.reason === 'user_setting' ? (
                        <button
                          onClick={() => {
                            onUpdatePrivacySettings?.({
                              callReception: 'all',
                              allowAudioCalls: true,
                              allowVideoCalls: true,
                            });
                            setBlockedCallNotice(null);
                            // Directly start the call after enabling
                            setActiveCallType(blockedCallNotice.type);
                          }}
                          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 cursor-pointer"
                        >
                          Autoriser dans mes paramètres et appeler
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setBlockedCallNotice(null);
                            setActiveCallType('audio');
                          }}
                          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-200 cursor-pointer"
                        >
                          Passer un appel audio sécurisé
                        </button>
                      )}

                      <button
                        onClick={() => setBlockedCallNotice(null)}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Real WebRTC Interactive Camera & Mic Call Modal */}
              {activeCallType && activeConv && (
                <ActiveCallModal
                  callType={activeCallType}
                  partner={activeConv.participant}
                  currentUser={currentUser}
                  onEndCall={() => setActiveCallType(null)}
                />
              )}

              {/* Date Concierge IA & Safe-Date Angel Modal */}
              {showDateConciergeModal && activeConv && (
                <DateConciergeModal
                  isOpen={showDateConciergeModal}
                  onClose={() => setShowDateConciergeModal(false)}
                  currentUser={currentUser}
                  targetProfile={activeConv.participant}
                  onSendDateInvitation={handleSendDateInvitation}
                />
              )}
            </div>
          ) : (
            /* Empty State for Desktop (No conversation selected) */
            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-500 shadow-md shadow-rose-100">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Sélectionnez une discussion
                </h3>
                <p className="text-xs text-slate-500 font-medium max-w-sm mt-1">
                  Échangez en toute discrétion et authenticité avec vos matchs.
                  Messages vocaux enregistrables avec votre microphone, appels audio/vidéo et confirmation de lecture.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
