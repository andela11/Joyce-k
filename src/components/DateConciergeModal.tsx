import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CalendarHeart,
  Shield,
  MapPin,
  Clock,
  Send,
  X,
  AlertTriangle,
  Phone,
  UserCheck,
  CheckCircle2,
  Coffee,
  Palette,
  Heart,
  ChevronRight,
  Flame,
  Info,
  BellRing,
} from 'lucide-react';
import { UserProfile, DateIdea, SafeDateGuardian } from '../types';

interface DateConciergeModalProps {
  currentUser: UserProfile;
  targetProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendDateInvitation: (dateIdea: DateIdea, customNote?: string) => void;
}

export const DateConciergeModal: React.FC<DateConciergeModalProps> = ({
  currentUser,
  targetProfile,
  isOpen,
  onClose,
  onSendDateInvitation,
}) => {
  const [activeTab, setActiveTab] = useState<'concierge' | 'safe_angel'>('concierge');
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [invitationSent, setInvitationSent] = useState(false);

  // Safe-Date Angel State
  const [guardianSettings, setGuardianSettings] = useState<SafeDateGuardian>(() => {
    try {
      const saved = localStorage.getItem('safe_date_guardian');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      contactName: 'Sophie (Amie proche)',
      contactPhone: '+33 6 12 34 56 78',
      meetingLocation: `Café Le Nemours, Palais-Royal (${targetProfile.city || 'Paris'})`,
      startTime: '19:30',
      durationMinutes: 90,
      active: false,
      status: 'safe',
    };
  });

  const [guardianSavedSuccess, setGuardianSavedSuccess] = useState(false);

  // Fetch AI Date Ideas on open
  useEffect(() => {
    if (isOpen && dateIdeas.length === 0) {
      fetchDateIdeas();
    }
  }, [isOpen]);

  const fetchDateIdeas = async () => {
    setIsLoadingIdeas(true);
    try {
      const res = await fetch('/api/ai/date-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: currentUser,
          targetProfile: targetProfile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dateIdeas && data.dateIdeas.length > 0) {
          setDateIdeas(data.dateIdeas);
          setSelectedIdeaId(data.dateIdeas[0].id);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch AI date ideas:', err);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleSendInvitation = () => {
    const selected = dateIdeas.find((d) => d.id === selectedIdeaId);
    if (selected) {
      onSendDateInvitation(selected, customNote);
      setInvitationSent(true);
      setTimeout(() => {
        setInvitationSent(false);
        onClose();
      }, 1400);
    }
  };

  const handleSaveGuardian = () => {
    const updated = { ...guardianSettings, active: true, status: 'safe' as const };
    setGuardianSettings(updated);
    try {
      localStorage.setItem('safe_date_guardian', JSON.stringify(updated));
    } catch {}
    setGuardianSavedSuccess(true);
    setTimeout(() => setGuardianSavedSuccess(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        id="date-concierge-modal"
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 text-white relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
              <CalendarHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base sm:text-lg">Date Concierge IA</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-black tracking-wider uppercase backdrop-blur-xs">
                  Joyce-K Exclusif
                </span>
              </div>
              <p className="text-xs text-white/90">
                Planificateur sur-mesure & Ange gardien pour {targetProfile.name}
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

        {/* Tab Navigation */}
        <div className="flex border-b border-rose-100 bg-rose-50/50 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('concierge')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'concierge'
                ? 'bg-white text-rose-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Scénarios de Date IA</span>
          </button>
          <button
            onClick={() => setActiveTab('safe_angel')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'safe_angel'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Safe-Date Angel (Sécurité)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'concierge' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    L'IA analyse vos affinités communes avec {targetProfile.name} :
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {targetProfile.interests.slice(0, 4).map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-0.5 rounded-full bg-white text-rose-700 font-semibold border border-rose-200 text-[10px]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {isLoadingIdeas ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Création des scénarios romantiques sur-mesure par l'IA...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Choisissez votre rendez-vous idéal :
                    </span>
                    <button
                      onClick={fetchDateIdeas}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Régénérer
                    </button>
                  </div>

                  {dateIdeas.map((idea) => {
                    const isSelected = selectedIdeaId === idea.id;
                    return (
                      <div
                        key={idea.id}
                        onClick={() => setSelectedIdeaId(idea.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left space-y-2.5 relative ${
                          isSelected
                            ? 'bg-rose-50/80 border-rose-500 shadow-md shadow-rose-100'
                            : 'bg-white border-rose-100 hover:border-rose-200 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 uppercase">
                              {idea.theme}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 mt-1">
                              {idea.title}
                            </h4>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {idea.description}
                        </p>

                        <div className="pt-2 border-t border-rose-100/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{idea.locationType}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span className="truncate">{idea.suggestedTimeSlot}</span>
                          </div>
                        </div>

                        {/* Icebreaker advice */}
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Astuce conversation sur place :</strong> "
                            {idea.icebreakerQuestion}"
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Optional Custom Note */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-700">
                      Message personnalisé d'invitation (Optionnel) :
                    </label>
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder={`Ex: Ça te dirait qu'on teste ça ce vendredi ?`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'safe_angel' && (
            <div className="space-y-4 text-left">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-black text-emerald-900 text-sm">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span>Votre Ange Gardien de Rendez-Vous Réel</span>
                </div>
                <p className="leading-relaxed">
                  Avant de rencontrer {targetProfile.name} dans le monde réel, activez le Safe-Date
                  Angel. Il assure un check-in discret à mi-parcours et peut alerter un proche de
                  confiance en cas de silence prolongé.
                </p>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Contact de confiance (Proche / Ami(e))
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={guardianSettings.contactName}
                      onChange={(e) =>
                        setGuardianSettings({
                          ...guardianSettings,
                          contactName: e.target.value,
                        })
                      }
                      placeholder="Prénom de votre ami(e)"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                    <input
                      type="tel"
                      value={guardianSettings.contactPhone}
                      onChange={(e) =>
                        setGuardianSettings({
                          ...guardianSettings,
                          contactPhone: e.target.value,
                        })
                      }
                      placeholder="Numéro de téléphone"
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Lieu public du rendez-vous
                  </label>
                  <input
                    type="text"
                    value={guardianSettings.meetingLocation}
                    onChange={(e) =>
                      setGuardianSettings({
                        ...guardianSettings,
                        meetingLocation: e.target.value,
                      })
                    }
                    placeholder="Nom du café / restaurant public"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Heure de début
                    </label>
                    <input
                      type="time"
                      value={guardianSettings.startTime}
                      onChange={(e) =>
                        setGuardianSettings({
                          ...guardianSettings,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Durée estimée
                    </label>
                    <select
                      value={guardianSettings.durationMinutes}
                      onChange={(e) =>
                        setGuardianSettings({
                          ...guardianSettings,
                          durationMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value={45}>45 minutes (Café express)</option>
                      <option value={90}>1 heure 30 (Verre & discussion)</option>
                      <option value={120}>2 heures (Dîner / Expo)</option>
                      <option value={180}>3 heures (Soirée complète)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <BellRing className="w-4 h-4 text-emerald-600" />
                  <span>Comment fonctionne l'alerte discrète ?</span>
                </div>
                <p>
                  À mi-parcours (environ {Math.round(guardianSettings.durationMinutes / 2)} min après{' '}
                  {guardianSettings.startTime}), l'application vous envoie une notification
                  silencieuse. Si vous ne confirmez pas que tout se passe bien sous 15 minutes, un
                  SMS sécurisé est préparé pour {guardianSettings.contactName || 'votre contact'}.
                </p>
              </div>

              {guardianSavedSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Ange Gardien activé avec succès pour ce rendez-vous !</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-rose-100 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          {activeTab === 'concierge' ? (
            <button
              onClick={handleSendInvitation}
              disabled={isLoadingIdeas || dateIdeas.length === 0 || invitationSent}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                invitationSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-600 text-white shadow-rose-200 active:scale-95'
              }`}
            >
              {invitationSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Invitation envoyée !</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Envoyer l'invitation dans le chat</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSaveGuardian}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-md shadow-emerald-200 cursor-pointer active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>Activer la protection Safe-Date</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
