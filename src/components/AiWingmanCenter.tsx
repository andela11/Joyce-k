import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Zap,
  Shield,
  MessageSquare,
  Send,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Settings,
  HelpCircle,
  Clock,
  Flame,
  UserCheck,
} from 'lucide-react';
import {
  UserProfile,
  AiAutoResponderSettings,
  PersonalityTone,
  FlirtingLevel,
} from '../types';

interface AiWingmanCenterProps {
  currentUser: UserProfile;
  aiSettings: AiAutoResponderSettings;
  onUpdateAiSettings: (newSettings: Partial<AiAutoResponderSettings>) => void;
  onUpdateUserBio: (newBio: string) => void;
}

export const AiWingmanCenter: React.FC<AiWingmanCenterProps> = ({
  currentUser,
  aiSettings,
  onUpdateAiSettings,
  onUpdateUserBio,
}) => {
  // Playground state for testing the user's AI replica live
  const [testMessages, setTestMessages] = useState<
    { sender: 'match' | 'ai'; text: string }[]
  >([
    {
      sender: 'match',
      text: 'Salut ! J\'ai vu ton profil, tu as l\'air d\'avoir des goûts super cools ! Tu fais quoi ce week-end ?',
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // AI Bio Assistant state
  const [bioVibe, setBioVibe] = useState('Élégant & Pétillant');
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<string | null>(null);

  const tones: { id: PersonalityTone; label: string; desc: string; icon: string }[] = [
    {
      id: 'charmant_esprit',
      label: 'Charmant & Spirituel',
      desc: 'Élégant, cultivé, avec une pointe de répartie et d\'esprit fin.',
      icon: '✨',
    },
    {
      id: 'romantique_doux',
      label: 'Romantique & Doux',
      desc: 'Chaleureux, à l\'écoute, axé sur les émotions et la sensibilité.',
      icon: '🌹',
    },
    {
      id: 'humour_petillant',
      label: 'Humour & Pétillant',
      desc: 'Plein d\'énergie, taquin, joueur et prompt à faire sourire.',
      icon: '😄',
    },
    {
      id: 'mysterieux',
      label: 'Mystérieux & Captivant',
      desc: 'Intriguant, posant de bonnes questions sans tout dévoiler d\'un coup.',
      icon: '🌙',
    },
    {
      id: 'direct_bienveillant',
      label: 'Direct & Authentique',
      desc: 'Naturel, spontané, clair sur ses intentions et bienveillant.',
      icon: '🎯',
    },
  ];

  // Test live reply with Gemini API
  const handleTestSimulate = async () => {
    if (!testInput.trim() || isSimulating) return;
    const userText = testInput.trim();
    setTestInput('');

    const newHistory = [...testMessages, { sender: 'match' as const, text: userText }];
    setTestMessages(newHistory);
    setIsSimulating(true);

    try {
      const res = await fetch('/api/ai/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: currentUser,
          partnerProfile: {
            name: 'Léa (Match Test)',
            age: 27,
            city: currentUser.city,
            interests: currentUser.interests.slice(0, 3),
            bio: 'Testeur de charme et de réactivité !',
          },
          chatHistory: newHistory.map((m) => ({
            isSelf: m.sender === 'ai',
            text: m.text,
          })),
          partnerMessage: userText,
          aiSettings,
        }),
      });
      const data = await res.json();
      setTestMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text:
            data.reply ||
            `Coucou ! Merci pour ton message, je te réponds avec plaisir dès que je me libère !`,
        },
      ]);
    } catch (err) {
      console.error(err);
      setTestMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Coucou ! Je suis un peu occupé(e) là maintenant, mais j'adore ta question ! Je te réponds très vite :)`,
        },
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  // Enhance Bio with AI
  const handleGenerateAiBio = async () => {
    setIsEnhancingBio(true);
    try {
      const res = await fetch('/api/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: currentUser.bio,
          interests: currentUser.interests,
          vibe: bioVibe,
          relationshipGoal: currentUser.relationshipGoal,
        }),
      });
      const data = await res.json();
      if (data.enhancedBio) {
        setGeneratedBio(data.enhancedBio);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingBio(false);
    }
  };

  return (
    <div id="ai-wingman-center-view" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white rounded-[32px] p-5 sm:p-6 shadow-xl shadow-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-white text-rose-600 shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>IA Répondeur & Wingman</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold border border-white/30">
                  {aiSettings.enabled ? 'ACTIF' : 'EN PAUSE'}
                </span>
              </h1>
              <p className="text-xs text-white/90 font-medium">
                Votre double numérique répond à vos matchs en votre absence selon votre style
              </p>
            </div>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 bg-white/95 p-3 rounded-2xl border border-white/40 shadow-sm text-slate-800">
          <span className="text-xs font-bold text-slate-800">
            Mode Répondeur :
          </span>
          <button
            id="master-ai-responder-toggle"
            onClick={() => onUpdateAiSettings({ enabled: !aiSettings.enabled })}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none flex items-center ${
              aiSettings.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Grid: Settings & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personality & Rules (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tone Selector */}
          <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" /> Tonalité & Personnalité de l'IA
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Comment l'IA doit s'exprimer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tones.map((t) => {
                const isSelected = aiSettings.personalityTone === t.id;
                return (
                  <button
                    key={t.id}
                    id={`tone-select-btn-${t.id}`}
                    onClick={() => onUpdateAiSettings({ personalityTone: t.id })}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-rose-50/80 border-2 border-rose-500 text-rose-900 shadow-md shadow-rose-100'
                        : 'bg-white border border-rose-200/70 text-slate-700 hover:border-rose-300 hover:bg-rose-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1 text-slate-900">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug font-medium">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flirting Level & Safety Rules */}
          <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-rose-100 pb-3">
              <Flame className="w-4 h-4 text-orange-500" /> Intensité de Séduction & Limites
            </h3>

            {/* Flirting level 3-way toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Niveau de séduction souhaité :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'amical' as FlirtingLevel, label: 'Amical & Sympa' },
                  { id: 'subtil' as FlirtingLevel, label: 'Subtil & Charmant' },
                  { id: 'seducteur' as FlirtingLevel, label: 'Audacieux & Séducteur' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    id={`flirting-level-${lvl.id}`}
                    onClick={() => onUpdateAiSettings({ flirtingLevel: lvl.id })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                      aiSettings.flirtingLevel === lvl.id
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200'
                        : 'bg-rose-50/80 border border-rose-200 text-slate-700 hover:bg-rose-100'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Rules Input */}
            <div className="space-y-2 pt-2">
              <label
                htmlFor="custom-ai-instructions"
                className="text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>Consignes personnalisées pour l'IA :</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Règles secrètes respectées strictement)
                </span>
              </label>
              <textarea
                id="custom-ai-instructions"
                rows={3}
                value={aiSettings.customPromptInstructions}
                onChange={(e) =>
                  onUpdateAiSettings({
                    customPromptInstructions: e.target.value,
                  })
                }
                placeholder="Exemple : Rappelle que j'adore le cinéma italien, ne propose pas de rendez-vous avant le 3ème échange, reste très poli..."
                className="w-full bg-rose-50/60 border border-rose-200 focus:border-rose-500 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed font-medium"
              />
            </div>

            {/* Safety badge */}
            <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 shadow-xs">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Garantie Confidentialité :</strong> L'IA ne révélera JAMAIS
                votre numéro de téléphone, votre adresse ou des données sensibles
                sans confirmation manuelle.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulator Playground & Bio Enhancer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Simulator Playground */}
          <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 flex flex-col h-[420px]">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Simulateur en Direct
                </h3>
              </div>
              <button
                id="clear-simulator-history-btn"
                onClick={() =>
                  setTestMessages([
                    {
                      sender: 'match',
                      text: 'Salut ! Quel est ton resto ou ton endroit favori en ce moment ?',
                    },
                  ])
                }
                className="text-[11px] text-rose-600 font-bold hover:underline"
              >
                Réinitialiser
              </button>
            </div>

            {/* Chat preview body */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'ai' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-medium mb-0.5 px-1">
                    {msg.sender === 'ai'
                      ? `Votre IA (${aiSettings.personalityTone.replace('_', ' ')})`
                      : 'Match de test'}
                  </span>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                      msg.sender === 'ai'
                        ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-tr-none shadow-md shadow-rose-200'
                        : 'bg-rose-50 border border-rose-100 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-pulse font-medium">
                  <Bot className="w-4 h-4 animate-spin text-rose-500" />
                  <span>Votre IA réfléchit à la réponse idéale...</span>
                </div>
              )}
            </div>

            {/* Test input */}
            <div className="pt-3 border-t border-rose-100 flex items-center gap-2 mt-2">
              <input
                id="simulator-test-input"
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTestSimulate();
                }}
                placeholder="Écrivez comme un match..."
                className="flex-1 bg-rose-50/60 border border-rose-200 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                id="simulator-send-btn"
                onClick={handleTestSimulate}
                disabled={!testInput.trim() || isSimulating}
                className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white transition-all disabled:opacity-40 shadow-sm shadow-rose-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Bio Enhancer */}
          <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Optimiseur de Bio par IA
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Laissez Gemini sublimer votre bio en valorisant vos centres
              d'intérêt et votre personnalité unique.
            </p>

            <div className="flex items-center gap-2">
              <select
                id="bio-vibe-select"
                value={bioVibe}
                onChange={(e) => setBioVibe(e.target.value)}
                className="flex-1 bg-rose-50/70 border border-rose-200 text-slate-800 font-semibold text-xs rounded-xl px-3 py-2 focus:ring-rose-500 shadow-sm"
              >
                <option value="Élégant & Pétillant">✨ Élégant & Pétillant</option>
                <option value="Humour & Spontané">😄 Humour & Spontané</option>
                <option value="Poétique & Aventure">🌿 Poétique & Aventure</option>
                <option value="Direct & Passionné">🔥 Direct & Passionné</option>
              </select>

              <button
                id="generate-enhanced-bio-btn"
                onClick={handleGenerateAiBio}
                disabled={isEnhancingBio}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEnhancingBio ? 'animate-spin' : ''}`} />
                <span>{isEnhancingBio ? 'Génération...' : 'Améliorer'}</span>
              </button>
            </div>

            {generatedBio && (
              <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-2 animate-fade-in">
                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  "{generatedBio}"
                </p>
                <button
                  id="apply-generated-bio-btn"
                  onClick={() => {
                    onUpdateUserBio(generatedBio);
                    setGeneratedBio(null);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Appliquer cette bio à mon profil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
