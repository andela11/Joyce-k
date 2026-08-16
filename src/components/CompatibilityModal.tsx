import React, { useState } from 'react';
import {
  Bot,
  X,
  Heart,
  MessageCircle,
  Shield,
  Zap,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { UserProfile, CompatibilityReport } from '../types';

interface CompatibilityModalProps {
  userProfile: UserProfile;
  targetProfile: UserProfile;
  onClose: () => void;
  onStartChat: (profile: UserProfile, initialMessage?: string) => void;
}

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
  userProfile,
  targetProfile,
  onClose,
  onStartChat,
}) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CompatibilityReport | null>(null);

  // Common interests
  const commonInterests = userProfile.interests.filter((i) =>
    targetProfile.interests.includes(i)
  );

  const calculateCompatibilityWithAi = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          targetProfile,
        }),
      });
      const data = await res.json();
      setReport({
        score: data.score || 88,
        summary: data.summary || 'Excellente harmonie entre vos centres d\'intérêt et vos styles de vie.',
        strengths: data.strengths || [
          `Affinité forte sur ${commonInterests.slice(0, 2).join(' et ') || 'vos passions'}`,
          'Objectifs de relation mutuellement compatibles',
          'Alchimie conversationnelle prometteuse',
        ],
        icebreaker: data.icebreaker || `J'ai vu qu'on adorait tous les deux ${commonInterests[0] || 'les voyages'} ! Quel est ton spot préféré ?`,
        commonInterests,
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setReport({
        score: Math.min(96, 68 + commonInterests.length * 8),
        summary: `Superbe adéquation basée sur vos ${commonInterests.length} centres d'intérêt partagés !`,
        strengths: [
          `Passions communes : ${commonInterests.slice(0, 3).join(', ') || 'partage et authenticité'}`,
          'Vision du couple équilibrée',
          'Complémentarité de personnalité',
        ],
        icebreaker: `Hello ${targetProfile.name} ! Notre score d'affinités est au top, surtout pour ${commonInterests[0] || 'nos sorties'} 😉`,
        commonInterests,
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    calculateCompatibilityWithAi();
  }, [targetProfile.id]);

  return (
    <div
      id="compatibility-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div
        id="compatibility-modal-container"
        className="relative w-full max-w-lg bg-white border border-rose-100 rounded-[32px] p-6 shadow-2xl shadow-rose-200/80 text-slate-800 overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-rose-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-orange-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">
                Analyse d'Affinité IA
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comparaison approfondie de vos profils
              </p>
            </div>
          </div>
          <button
            id="close-compatibility-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-rose-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 relative z-10 max-h-[70vh] overflow-y-auto pr-1">
          {/* Dual avatar match banner */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="relative text-center">
              <img
                src={userProfile.photos[0]}
                alt={userProfile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-200"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-slate-700 block mt-1">
                Vous
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-500 shadow-sm">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              {report && (
                <span className="text-sm font-black text-rose-600 mt-1">
                  {report.score}%
                </span>
              )}
            </div>

            <div className="relative text-center">
              <img
                src={targetProfile.photos[0]}
                alt={targetProfile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-400 shadow-md shadow-orange-200"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-slate-700 block mt-1">
                {targetProfile.name}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                Calcul de l'alchimie algorithmique & centres d'intérêt...
              </p>
            </div>
          ) : report ? (
            <div className="space-y-4">
              {/* Score Bar */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Indice de
                    Compatibilité
                  </span>
                  <span className="text-lg font-black bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-transparent">
                    {report.score} / 100
                  </span>
                </div>
                <div className="w-full h-3 bg-rose-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${report.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-700 font-medium mt-2.5 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Shared Interests Highlights */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  Centres d'intérêt en commun ({commonInterests.length})
                </h4>
                {commonInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {commonInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 rounded-full text-xs font-bold bg-white text-rose-600 border border-rose-200 shadow-xs"
                      >
                        ✓ {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic font-medium">
                    Profils aux centres d'intérêt complémentaires à découvrir !
                  </p>
                )}
              </div>

              {/* Key Strengths */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  Points forts de votre duo
                </h4>
                <div className="space-y-2">
                  {report.strengths.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested AI Icebreaker */}
              <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Accroche recommandée par l'IA
                  </span>
                </div>
                <p className="text-xs italic text-slate-800 font-medium bg-white p-3 rounded-xl border border-rose-200 shadow-xs">
                  "{report.icebreaker}"
                </p>
                <button
                  id="use-ai-icebreaker-btn"
                  onClick={() => onStartChat(targetProfile, report.icebreaker)}
                  className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  Envoyer cette phrase d'accroche
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-rose-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Shield className="w-3.5 h-3.5" /> Données chiffrées & privées
          </span>
          <button
            id="modal-direct-chat-btn"
            onClick={() => onStartChat(targetProfile)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Ouvrir la conversation
          </button>
        </div>
      </div>
    </div>
  );
};
