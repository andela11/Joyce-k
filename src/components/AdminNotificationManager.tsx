import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Sparkles,
  Shield,
  Gift,
  Flame,
  Radio,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Users,
  User,
  Clock,
} from 'lucide-react';
import { AppNotification, UserProfile, ActiveTab } from '../types';
import { db, collection, onSnapshot, setDoc, doc } from '../lib/firebase';

interface AdminNotificationManagerProps {
  allProfiles: UserProfile[];
  dbUsers: any[];
  adminName: string;
  onSendNotificationLocal?: (notif: AppNotification) => void;
}

export const AdminNotificationManager: React.FC<AdminNotificationManagerProps> = ({
  allProfiles,
  dbUsers,
  adminName,
  onSendNotificationLocal,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUserId, setTargetUserId] = useState<'all' | string>('all');
  const [type, setType] = useState<AppNotification['type']>('announcement');
  const [actionTab, setActionTab] = useState<ActiveTab | ''>('discovery');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Combine unique users
  const uniqueUsers = [
    ...dbUsers.map((u) => ({ id: u.id, name: u.name || u.email || 'Utilisateur', email: u.email })),
    ...allProfiles.map((p) => ({ id: p.id, name: p.name, email: `${p.name.toLowerCase()}@joyce-k.com` })),
  ].filter((u, index, self) => index === self.findIndex((t) => t.id === u.id));

  // Listen to notifications in Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            message: data.message || '',
            targetUserId: data.targetUserId || 'all',
            targetUserName: data.targetUserName || 'Tous les membres',
            type: data.type || 'announcement',
            createdAt: data.createdAt || Date.now(),
            senderName: data.senderName || 'Équipe Joyce-K',
            actionTab: data.actionTab || 'discovery',
          });
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
        setNotifications(list);
      });
      return () => unsub();
    } catch (err) {
      console.warn('Notifications onSnapshot error:', err);
    }
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    setSendSuccess(null);

    const targetUserObj = targetUserId === 'all'
      ? null
      : uniqueUsers.find((u) => u.id === targetUserId);

    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newNotif: AppNotification = {
      id: notifId,
      title: title.trim(),
      message: message.trim(),
      targetUserId: targetUserId,
      targetUserName: targetUserObj ? targetUserObj.name : 'Tous les membres',
      type: type,
      createdAt: Date.now(),
      senderName: adminName || 'Administration Joyce-K',
      actionTab: actionTab ? (actionTab as ActiveTab) : undefined,
    };

    try {
      // 1. Save to Firestore
      await setDoc(doc(db, 'notifications', notifId), newNotif);
    } catch (err) {
      console.warn('Could not write notification to Firestore, using local sync:', err);
    }

    // 2. Also notify local app state
    if (onSendNotificationLocal) {
      onSendNotificationLocal(newNotif);
    }

    setIsSending(false);
    setSendSuccess(`Notification "${title}" diffusée avec succès aux destinataires !`);
    setTitle('');
    setMessage('');
    setTimeout(() => setSendSuccess(null), 5000);
  };

  const getBadgeIcon = (notifType: AppNotification['type']) => {
    switch (notifType) {
      case 'announcement':
        return <Bell className="w-4 h-4 text-rose-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'feature':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-400" />;
      case 'match_alert':
        return <Flame className="w-4 h-4 text-orange-400" />;
    }
  };

  const presetTemplates = [
    {
      label: '🚀 Bienvenue sur Joyce-K',
      title: 'Bienvenue sur Joyce-K !',
      message: 'Explorez dès maintenant les profils certifiés 100% authentiques sans filtres IA et découvrez vos affinités réelles.',
      type: 'announcement' as const,
      tab: 'discovery' as ActiveTab,
    },
    {
      label: '🛡️ Rappel Sécurité & Anti-IA',
      title: 'Certification et Protection RGPD',
      message: 'Votre compte est protégé par notre chiffrement sécurisé. Vos photos sont scannées et certifiées garanties sans IA.',
      type: 'security' as const,
      tab: 'privacy' as ActiveTab,
    },
    {
      label: '✨ Nouveau : IA Répondeur',
      title: 'Activez votre Répondeur IA',
      message: 'Ne ratez aucun match pendant vos absences : configurez votre Wingman numérique personnalisé dès aujourd\'hui !',
      type: 'feature' as const,
      tab: 'ai_wingman' as ActiveTab,
    },
    {
      label: '📡 Célibataires à Proximité',
      title: 'Nouveaux célibataires près de vous !',
      message: 'Plusieurs personnes partagent vos centres d\'intérêt dans votre région. Consultez le radar de proximité.',
      type: 'match_alert' as const,
      tab: 'radar' as ActiveTab,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Alert */}
      {sendSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{sendSuccess}</span>
        </div>
      )}

      {/* Main Grid: Broadcast Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/80">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Diffuser une Notification</h3>
                <p className="text-[11px] text-slate-400">
                  Envoyez un message instantané à toute la communauté ou à un membre spécifique
                </p>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Modèles rapides pré-remplis :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {presetTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTitle(tpl.title);
                    setMessage(tpl.message);
                    setType(tpl.type);
                    setActionTab(tpl.tab);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700/80 text-left text-[11px] font-semibold text-slate-300 hover:text-white transition-all cursor-pointer truncate"
                  title={tpl.message}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Target selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Destinataire(s)
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="all">📢 Tous les utilisateurs (Diffusion globale)</option>
                  {uniqueUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.email || u.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Type de message
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AppNotification['type'])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
                >
                  <option value="announcement">📢 Annonce Officielle</option>
                  <option value="security">🛡️ Alerte Sécurité & RGPD</option>
                  <option value="feature">✨ Nouveauté Plateforme</option>
                  <option value="reward">🎁 Cadeau / Avantage</option>
                  <option value="match_alert">🔥 Alerte Matchs & Activité</option>
                </select>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Titre de la notification *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Événement Spécial Joyce-K ce week-end..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Contenu du message *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Rédigez votre message à l'attention des utilisateurs..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none resize-none"
              />
            </div>

            {/* Action Tab Redirect */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Redirection au clic (Bouton d'action)
              </label>
              <select
                value={actionTab}
                onChange={(e) => setActionTab(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option value="discovery">🔥 Découvrir des profils (Swipes)</option>
                <option value="radar">📡 Radar de Proximité</option>
                <option value="messages">💬 Messagerie Sécurisée</option>
                <option value="ai_wingman">🤖 IA Répondeur & Wingman</option>
                <option value="privacy">🛡️ Confidentialité & RGPD</option>
                <option value="profile">👤 Mon Profil</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSending || !title.trim() || !message.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Envoi en cours...' : 'Envoyer la Notification aux Utilisateurs'}</span>
            </button>
          </form>
        </div>

        {/* Right: Notification History Feed (5 cols) */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-400" />
              <h4 className="font-bold text-white text-sm">
                Historique des Envois ({notifications.length})
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
              Temps Réel
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                        {getBadgeIcon(notif.type)}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white leading-tight">
                          {notif.title}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleString([], {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700 shrink-0">
                      {notif.targetUserId === 'all' ? '📢 Tous' : `👤 ${notif.targetUserName}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Par : {notif.senderName}</span>
                    {notif.actionTab && (
                      <span className="text-rose-400 font-semibold">
                        Lien : #{notif.actionTab}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs font-medium">Aucune notification envoyée pour l'instant.</p>
                <p className="text-[10px] mt-1">Utilisez le formulaire pour envoyer votre premier message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
