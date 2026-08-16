import React, { useState } from 'react';
import {
  ShieldCheck,
  EyeOff,
  MapPin,
  Clock,
  Download,
  Trash2,
  Lock,
  UserX,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import {
  PrivacySettings,
  DistanceFuzzingLevel,
  EphemeralTimer,
  UserProfile,
} from '../types';

interface PrivacySecurityCenterProps {
  currentUser: UserProfile;
  privacySettings: PrivacySettings;
  onUpdatePrivacySettings: (newSettings: Partial<PrivacySettings>) => void;
  onPurgeAccount: () => void;
  onUnblockUser: (userId: string) => void;
  onBackToDiscovery?: () => void;
}

export const PrivacySecurityCenter: React.FC<PrivacySecurityCenterProps> = ({
  currentUser,
  privacySettings,
  onUpdatePrivacySettings,
  onPurgeAccount,
  onUnblockUser,
  onBackToDiscovery,
}) => {
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // RGPD Data Export
  const handleExportData = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      userProfile: currentUser,
      privacySettings,
      securityStatement:
        'Données personnelles traitées conformément au RGPD de l\'Union Européenne (Règlement UE 2016/679). Chiffrement renforcé et stockage souverain.',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amour_affinites_mes_donnees_${currentUser.name.toLowerCase()}_rgpd.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 4000);
  };

  return (
    <div
      id="privacy-security-center-view"
      className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-[32px] p-5 sm:p-6 shadow-xl shadow-emerald-200/60 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            {onBackToDiscovery && (
              <button
                id="privacy-back-btn"
                onClick={onBackToDiscovery}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/40 transition-colors cursor-pointer mr-1"
                title="Retourner aux Swipes"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            )}
            <div className="p-2.5 rounded-2xl bg-white text-emerald-600 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Centre de Confidentialité & RGPD</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold border border-white/30">
                  100% SÉCURISÉ
                </span>
              </h1>
              <p className="text-xs text-white/90 font-medium">
                Vous gardez le contrôle total sur votre identité, vos photos et votre géolocalisation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Mode Fantôme & Visibilité */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-500" /> Mode Fantôme (Incognito)
            </h3>
            <button
              id="privacy-ghost-mode-toggle"
              onClick={() =>
                onUpdatePrivacySettings({ ghostMode: !privacySettings.ghostMode })
              }
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                privacySettings.ghostMode
                  ? 'bg-amber-500 justify-end'
                  : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Lorsque le mode fantôme est activé, votre profil disparaît
            instantanément du radar de proximité et des suggestions publiques. Seuls
            vos matchs existants peuvent vous voir.
          </p>
          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs text-slate-700 font-medium">
            Statut :{' '}
            <strong
              className={
                privacySettings.ghostMode ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'
              }
            >
              {privacySettings.ghostMode
                ? '👻 Activé (Vous êtes invisible)'
                : '👁️ Désactivé (Visible dans le radar)'}
            </strong>
          </div>
        </div>

        {/* 2. Brouillage Géographique */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Protection de la Géolocalisation
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Choisissez la précision géographique affichée aux autres membres :
          </p>
          <div className="space-y-2">
            {[
              {
                id: 'exact' as DistanceFuzzingLevel,
                title: 'Distance exacte',
                desc: 'Affiche la distance kilométrique réelle (ex: 2.4 km).',
              },
              {
                id: 'approximate' as DistanceFuzzingLevel,
                title: 'Flou de protection (+/- 2 à 5 km) [Recommandé]',
                desc: 'Brouille vos coordonnées pour empêcher toute triangulation.',
              },
              {
                id: 'city_only' as DistanceFuzzingLevel,
                title: 'Ville uniquement (GPS totalement masqué)',
                desc: 'Affiche uniquement le nom de votre ville.',
              },
            ].map((fuzz) => (
              <button
                key={fuzz.id}
                id={`fuzzing-option-${fuzz.id}`}
                onClick={() =>
                  onUpdatePrivacySettings({ distanceFuzzing: fuzz.id })
                }
                className={`w-full text-left p-3 rounded-2xl border transition-all ${
                  privacySettings.distanceFuzzing === fuzz.id
                    ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 shadow-md shadow-rose-100'
                    : 'bg-white border border-rose-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/40'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{fuzz.title}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">{fuzz.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Messages Éphémères */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Messages Éphémères (Auto-Destruction)
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Supprime automatiquement l'historique des conversations après le délai
            choisi :
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'off' as EphemeralTimer, label: 'Désactivé' },
              { id: '24h' as EphemeralTimer, label: '24 heures' },
              { id: '7d' as EphemeralTimer, label: '7 jours' },
            ].map((t) => (
              <button
                key={t.id}
                id={`ephemeral-timer-${t.id}`}
                onClick={() =>
                  onUpdatePrivacySettings({ ephemeralMessages: t.id })
                }
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  privacySettings.ephemeralMessages === t.id
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200'
                    : 'bg-rose-50/80 border border-rose-200 text-slate-700 hover:bg-rose-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Floutage Photo & Sécurité Visuelle */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" /> Floutage de Photos Avant Match
            </h3>
            <button
              id="privacy-blur-photo-toggle"
              onClick={() =>
                onUpdatePrivacySettings({
                  blurPhotosUntilMatch: !privacySettings.blurPhotosUntilMatch,
                })
              }
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                privacySettings.blurPhotosUntilMatch
                  ? 'bg-rose-500 justify-end'
                  : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Vos photos de profil apparaissent avec un flou artistique doux jusqu'à ce
            qu'un match réciproque soit confirmé. Idéal pour préserver votre
            sphère privée.
          </p>
        </div>
      </div>

      {/* RGPD Data Rights & Account Purge */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 sm:p-6 shadow-xl shadow-rose-100/60 space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-rose-100 pb-3">
          <FileCheck className="w-4 h-4 text-emerald-600" /> Vos Droits RGPD & Portabilité des Données
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export button */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-rose-500" />
              Télécharger une copie de mes données (JSON)
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Recevez l'intégralité de vos informations de profil, préférences et
              statistiques dans un format structuré et interopérable.
            </p>
            <button
              id="rgpd-export-data-btn"
              onClick={handleExportData}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {exportedSuccess ? 'Fichier exporté avec succès !' : 'Exporter mes données'}
            </button>
          </div>

          {/* Purge Account */}
          <div className="p-4 bg-rose-50/60 border border-rose-200/80 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-rose-600" />
              Droit à l'oubli & Purge définitive
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Supprimez immédiatement toutes vos données, messages et historique
              de nos serveurs sans aucune conservation résiduelle.
            </p>

            {showPurgeConfirm ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-rose-600">
                  Êtes-vous absolument certain(e) ? Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <button
                    id="confirm-purge-account-btn"
                    onClick={onPurgeAccount}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-200"
                  >
                    Oui, tout supprimer
                  </button>
                  <button
                    onClick={() => setShowPurgeConfirm(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="initiate-purge-account-btn"
                onClick={() => setShowPurgeConfirm(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer mon compte & mes données
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
