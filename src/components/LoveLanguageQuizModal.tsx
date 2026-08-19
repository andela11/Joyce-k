import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  CheckCircle2,
  X,
  Smile,
  Gift,
  Clock,
  HandHeart,
  MessageCircle,
  ArrowRight,
  Flame,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { UserProfile, LoveLanguage } from '../types';

interface LoveLanguageQuizModalProps {
  currentUser: UserProfile;
  targetProfile?: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveLoveLanguage: (language: LoveLanguage, label: string) => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: 'Après une longue journée éprouvante, qu’est-ce qui te réconforte le plus ?',
    options: [
      {
        label: 'Un message doux ou des encouragements sincères',
        language: 'words' as LoveLanguage,
        icon: MessageCircle,
      },
      {
        label: 'Une soirée posée à deux, sans téléphone, juste à discuter',
        language: 'quality_time' as LoveLanguage,
        icon: Clock,
      },
      {
        label: 'Une petite surprise gourmande ou un objet choisi avec soin',
        language: 'gifts' as LoveLanguage,
        icon: Gift,
      },
      {
        label: 'Qu’on me prépare un bon plat sans que j’aie à demander',
        language: 'acts_of_service' as LoveLanguage,
        icon: HandHeart,
      },
      {
        label: 'Un long câlin chaleureux et un contact apaisant',
        language: 'physical_touch' as LoveLanguage,
        icon: Heart,
      },
    ],
  },
  {
    id: 2,
    question: 'Pour marquer une attention romantique, quel geste a le plus d’impact sur toi ?',
    options: [
      {
        label: 'Une lettre manuscrite ou un compliment touchant',
        language: 'words' as LoveLanguage,
        icon: MessageCircle,
      },
      {
        label: 'Un week-end improvisé rien que pour nous deux',
        language: 'quality_time' as LoveLanguage,
        icon: Clock,
      },
      {
        label: 'Un cadeau symbolique qui rappelle une discussion passée',
        language: 'gifts' as LoveLanguage,
        icon: Gift,
      },
      {
        label: 'M’aider à régler une tâche complexe pour m’alléger l’esprit',
        language: 'acts_of_service' as LoveLanguage,
        icon: HandHeart,
      },
      {
        label: 'Tenir ma main discrètement ou m’enlacer tendrement',
        language: 'physical_touch' as LoveLanguage,
        icon: Heart,
      },
    ],
  },
  {
    id: 3,
    question: 'Ce qui te blesse le plus dans une relation amoureuse ?',
    options: [
      {
        label: 'Les remarques cassantes ou le manque de reconnaissance',
        language: 'words' as LoveLanguage,
        icon: MessageCircle,
      },
      {
        label: 'Quand l’autre est distrait par son écran pendant nos moments',
        language: 'quality_time' as LoveLanguage,
        icon: Clock,
      },
      {
        label: 'Les dates oubliées ou l’absence totale de petites attentions',
        language: 'gifts' as LoveLanguage,
        icon: Gift,
      },
      {
        label: 'Les promesses non tenues et la passivité',
        language: 'acts_of_service' as LoveLanguage,
        icon: HandHeart,
      },
      {
        label: 'La distance physique froide et le refus de tendresse',
        language: 'physical_touch' as LoveLanguage,
        icon: Heart,
      },
    ],
  },
  {
    id: 4,
    question: 'Quelle est ta façon naturelle de prouver ton amour ?',
    options: [
      {
        label: 'Exprimer clairement mes sentiments avec admiration',
        language: 'words' as LoveLanguage,
        icon: MessageCircle,
      },
      {
        label: 'Bloquer du temps précieux exclusif pour mon partenaire',
        language: 'quality_time' as LoveLanguage,
        icon: Clock,
      },
      {
        label: 'Dénicher le cadeau parfait qui fera briller ses yeux',
        language: 'gifts' as LoveLanguage,
        icon: Gift,
      },
      {
        label: 'Rendre service et anticiper ses besoins quotidiens',
        language: 'acts_of_service' as LoveLanguage,
        icon: HandHeart,
      },
      {
        label: 'Chercher la proximité physique, les caresses et les baisers',
        language: 'physical_touch' as LoveLanguage,
        icon: Heart,
      },
    ],
  },
];

const LANGUAGE_DETAILS: Record<
  LoveLanguage,
  { title: string; desc: string; advice: string; emoji: string }
> = {
  words: {
    title: 'Paroles Valorisantes',
    desc: 'Vous vous épanouissez grâce aux compliments sincères, aux mots d’amour et à la reconnaissance exprimée.',
    advice: 'Exprimez vos sentiments à voix haute et partagez ce qui vous émerveille chez l’autre.',
    emoji: '💌',
  },
  quality_time: {
    title: 'Moments de Qualité',
    desc: 'Vous valorisez l’attention exclusive, les conversations profondes et les expériences partagées sans distraction.',
    advice: 'Privilégiez les tête-à-tête immersifs et les rendez-vous où vous pouvez vraiment vous écouter.',
    emoji: '⏳',
  },
  gifts: {
    title: 'Cadeaux & Attentions Sincères',
    desc: 'Pour vous, un cadeau est le symbole tangible de la pensée et de l’amour de l’autre.',
    advice: 'Ce n’est pas le prix qui compte mais la réflexion et la délicatesse derrière l’attention.',
    emoji: '🎁',
  },
  acts_of_service: {
    title: 'Petites Attentions & Services Rendus',
    desc: 'Pour vous, les actes parlent plus fort que les paroles : vous aimez voir l’engagement dans les gestes.',
    advice: 'Soulagez votre partenaire dans ses défis quotidiens pour lui montrer votre soutien indéfectible.',
    emoji: '🤝',
  },
  physical_touch: {
    title: 'Tendresse & Contact Physique',
    desc: 'Les gestes affectueux, les caresses et la proximité physique sont votre moyen premier de ressentir la connexion.',
    advice: 'Créez un cocon rassurant où la douceur et la complicité physique sont quotidiennes.',
    emoji: '🤍',
  },
};

export const LoveLanguageQuizModal: React.FC<LoveLanguageQuizModalProps> = ({
  currentUser,
  targetProfile,
  isOpen,
  onClose,
  onSaveLoveLanguage,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<LoveLanguage[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = (lang: LoveLanguage) => {
    const nextAnswers = [...selectedAnswers, lang];
    setSelectedAnswers(nextAnswers);

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Calculate dominant love language
  const counts: Record<LoveLanguage, number> = {
    words: 0,
    quality_time: 0,
    gifts: 0,
    acts_of_service: 0,
    physical_touch: 0,
  };

  selectedAnswers.forEach((ans) => {
    counts[ans] = (counts[ans] || 0) + 1;
  });

  const dominantLanguage = (Object.keys(counts) as LoveLanguage[]).reduce((a, b) =>
    counts[a] >= counts[b] ? a : b
  );

  const dominantInfo = LANGUAGE_DETAILS[dominantLanguage] || LANGUAGE_DETAILS.quality_time;

  const handleSaveResult = () => {
    onSaveLoveLanguage(dominantLanguage, dominantInfo.title);
    onClose();
  };

  const handleReset = () => {
    setCurrentQuestionIdx(0);
    setSelectedAnswers([]);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="love-language-quiz-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in text-slate-800"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-purple-600 to-pink-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base sm:text-lg">Les 5 Langages de l'Amour</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-wider">
                  Test Psychologique
                </span>
              </div>
              <p className="text-xs text-white/90">
                Découvrez comment vous aimez et êtes aimé(e)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isFinished ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Question {currentQuestionIdx + 1} sur {QUESTIONS.length}</span>
                  <span>{Math.round(((currentQuestionIdx + 1) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 to-purple-600 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentQuestionIdx + 1) / QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Title */}
              <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                {QUESTIONS[currentQuestionIdx].question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5 pt-1">
                {QUESTIONS[currentQuestionIdx].options.map((opt, idx) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.language)}
                      className="w-full p-3.5 rounded-2xl border-2 border-rose-100/80 hover:border-purple-400 hover:bg-purple-50/40 transition-all flex items-center gap-3.5 text-left cursor-pointer group active:scale-98"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-purple-100 text-rose-600 group-hover:text-purple-600 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug flex-1">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-200 text-2xl">
                {dominantInfo.emoji}
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Votre Langage Dominant
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  {dominantInfo.title}
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed font-medium">
                  {dominantInfo.desc}
                </p>
              </div>

              {/* Advice Box */}
              <div className="bg-gradient-to-r from-rose-50 to-purple-50 p-4 rounded-2xl border border-purple-100 text-left space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-purple-950">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Conseil d'épanouissement amoureux :</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {dominantInfo.advice}
                </p>
              </div>

              {/* Match Chemistry Harmony if targetProfile provided */}
              {targetProfile && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">
                      Harmonie avec {targetProfile.name} :
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px]">
                      94% Synergie
                    </span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed font-medium">
                    {targetProfile.name} apprécie particulièrement les{' '}
                    <strong>{targetProfile.loveLanguageLabel || 'Moments de qualité'}</strong>. Vos
                    sensibilités se complètent magnifiquement !
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-rose-100 flex items-center justify-between gap-3 shrink-0">
          {!isFinished ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Annuler
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recommencer</span>
            </button>
          )}

          {isFinished && (
            <button
              onClick={handleSaveResult}
              className="px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-rose-600 to-purple-600 hover:opacity-95 text-white flex items-center gap-2 shadow-md shadow-rose-200 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Afficher sur mon profil</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
