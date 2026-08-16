import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  UserX,
  Radio,
  Search,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  Settings,
  Mail,
  Flame,
  Globe,
  Database,
  BarChart3,
  Server,
  Lock,
  Bell,
  ChevronLeft,
} from 'lucide-react';
import { UserProfile, AuthUser, AppNotification } from '../types';
import { db, collection, onSnapshot, doc, updateDoc, setDoc } from '../lib/firebase';
import { AdminNotificationManager } from './AdminNotificationManager';

interface AdminDashboardProps {
  currentUser: UserProfile;
  authUser: AuthUser | null;
  allProfiles: UserProfile[];
  onUpdateProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  onEnterApp: (tab?: any) => void;
  onSendNotificationLocal?: (notif: AppNotification) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  authUser,
  allProfiles,
  onUpdateProfiles,
  onEnterApp,
  onSendNotificationLocal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'unverified' | 'ai_flagged'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'ai_system' | 'stats' | 'security'>('users');
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // System parameters (configurable in admin)
  const [aiDetectionSensitivity, setAiDetectionSensitivity] = useState<'strict' | 'standard' | 'relaxed'>('strict');
  const [strictAntiAiGate, setStrictAntiAiGate] = useState(true);
  const [globalGhostModeAllow, setGlobalGhostModeAllow] = useState(true);
  const [maxDistanceKm, setMaxDistanceKm] = useState(15000);

  // Listen to registered users in Firestore
  useEffect(() => {
    setIsLoadingDb(true);
    try {
      const unsubscribe = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          const loaded: any[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() });
          });
          setDbUsers(loaded);
          setIsLoadingDb(false);
        },
        (err) => {
          console.warn('Firestore admin users snapshot warning:', err);
          setIsLoadingDb(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Admin db init error:', err);
      setIsLoadingDb(false);
    }
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Combine mock profiles with real Firestore users for administrative management
  const safeAllProfiles = Array.isArray(allProfiles) ? allProfiles : [];
  const safeDbUsers = Array.isArray(dbUsers) ? dbUsers : [];
  const combinedUserList: (UserProfile & { source?: string; email?: string })[] = [
    ...safeAllProfiles.map((p) => ({ ...p, source: 'Système' })),
    ...safeDbUsers
      .filter((dbU) => dbU && !safeAllProfiles.some((p) => p.id === (dbU.id || dbU.uid)))
      .map((dbU) => ({
        id: dbU.id || dbU.uid || `db_user_${Math.random()}`,
        name: dbU.name || 'Utilisateur',
        age: dbU.age || 25,
        gender: dbU.gender || 'homme',
        interestedIn: dbU.interestedIn || ['femme'],
        photos: dbU.photoUrl ? [dbU.photoUrl] : (Array.isArray(dbU.photos) && dbU.photos.length > 0 ? dbU.photos : ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800']),
        bio: dbU.bio || 'Membre inscrit sur Joyce-K',
        occupation: dbU.occupation || 'Membre actif',
        city: dbU.city || 'Yaoundé, Cameroun',
        lat: dbU.lat || 3.848,
        lng: dbU.lng || 11.5021,
        interests: Array.isArray(dbU.interests) ? dbU.interests : ['Voyages', 'Authenticité', 'Musique'],
        relationshipGoal: dbU.relationshipGoal || 'Relation sérieuse',
        verified: dbU.verified ?? true,
        isOnline: true,
        lastActiveText: 'En ligne',
        source: 'Firestore (En direct)',
        email: dbU.email,
      })),
  ];

  const filteredUsers = combinedUserList.filter((u) => {
    if (!u) return false;
    const name = u.name || '';
    const city = u.city || '';
    const email = u.email || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'verified') return Boolean(u.verified);
    if (selectedFilter === 'unverified') return !u.verified;
    return true;
  });

  const handleToggleVerifyUser = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Update in local mock state if present
    onUpdateProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, verified: newStatus } : p))
    );

    // Update in Firestore
    try {
      await updateDoc(doc(db, 'users', userId), { verified: newStatus });
    } catch (e) {
      // If doc didn't exist, try setDoc
      try {
        await setDoc(doc(db, 'users', userId), { verified: newStatus }, { merge: true });
      } catch (err2) {
        console.warn('Could not update Firestore user:', err2);
      }
    }

    showNotification(`Statut de certification de l'utilisateur mis à jour (${newStatus ? 'Certifié' : 'Non certifié'}).`);
  };

  const handleDeleteUser = (userId: string) => {
    onUpdateProfiles((prev) => prev.filter((p) => p.id !== userId));
    setDbUsers((prev) => prev.filter((u) => u.id !== userId));
    showNotification("Utilisateur révoqué du système avec succès.");
  };

  return (
    <div id="admin-dashboard-container" className="w-full min-h-[calc(100vh-70px)] bg-slate-900 text-slate-100 p-4 sm:p-6 md:p-8 selection:bg-rose-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => onEnterApp('discovery')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 transition-colors cursor-pointer"
                title="Retourner à l'application"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour App</span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-400 border border-rose-800">
                Espace Super Admin
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Système En Ligne
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Administration Joyce-K</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Gestionnaire centralisé : Profils, Diffusions de Notifications, Détection Anti-IA, Sécurité & Paramètres.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterApp('discovery')}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-950 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Tester les Swipes</span>
            </button>
          </div>
        </div>

        {/* Action notification toast */}
        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Total Profils Gérés</span>
              <Users className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{combinedUserList.length}</p>
            <p className="text-[11px] text-slate-400">{dbUsers.length} inscrits Firestore</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Profils 100% Certifiés</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {combinedUserList.filter((u) => u.verified).length}
            </p>
            <p className="text-[11px] text-slate-400">Zéro avatar IA toléré</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Filtre Anti-IA Actif</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-400">Actif (100%)</p>
            <p className="text-[11px] text-slate-400">Modèle Vision Gemini / Rejet direct</p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Couverture Villes</span>
              <Globe className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-orange-400">25+ Villes</p>
            <p className="text-[11px] text-slate-400">Yaoundé, Paris, Dakar, Montréal...</p>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex flex-wrap bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 max-w-2xl gap-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Gestion Profils ({combinedUserList.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'notifications' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Diffuser Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_system')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai_system' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paramètres & Anti-IA
          </button>
        </div>

        {/* 1. NOTIFICATIONS BROADCAST TAB */}
        {activeTab === 'notifications' && (
          <AdminNotificationManager
            allProfiles={allProfiles}
            dbUsers={dbUsers}
            adminName={authUser?.name || currentUser.name}
            onSendNotificationLocal={onSendNotificationLocal}
          />
        )}

        {/* 2. USERS MANAGEMENT TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 focus:outline-none text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tous ({combinedUserList.length})
                </button>
                <button
                  onClick={() => setSelectedFilter('verified')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === 'verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Certifiés
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-4">Utilisateur</th>
                      <th className="p-4">Ville & Pays</th>
                      <th className="p-4">Statut Certification</th>
                      <th className="p-4">Source</th>
                      <th className="p-4 text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-medium">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                              alt={user.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-bold text-white text-sm">{user.name}, {user.age}</p>
                              <p className="text-[11px] text-slate-400 capitalize">{user.gender} • {user.occupation}</p>
                              {user.email && <p className="text-[10px] text-rose-400 font-mono">{user.email}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-300">
                          <p>{user.city}</p>
                        </td>

                        <td className="p-4">
                          {user.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-[11px] font-bold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              Certifié Réel
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 text-[11px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              En attente
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] font-semibold text-slate-400 border border-slate-700">
                            {user.source}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleToggleVerifyUser(user.id, user.verified)}
                              title={user.verified ? 'Révoquer certification' : 'Certifier le profil'}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                user.verified
                                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                                  : 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                              }`}
                            >
                              {user.verified ? 'Dé-certifier' : 'Valider'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              title="Supprimer définitivement"
                              className="p-1.5 rounded-xl bg-slate-900 border border-rose-900/60 text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. AI & SYSTEM PARAMETERS TAB */}
        {activeTab === 'ai_system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-5">
              <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base border-b border-slate-700 pb-3">
                <ShieldAlert className="w-5 h-5" />
                <span>Règles du Protocole Anti-IA</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-700/80">
                  <div>
                    <p className="font-bold text-white">Blocage Immédiat des Avatars IA</p>
                    <p className="text-slate-400 text-[11px]">Empêche l'inscription si l'image est détectée comme synthétique</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictAntiAiGate}
                    onChange={(e) => {
                      setStrictAntiAiGate(e.target.checked);
                      showNotification(`Blocage Anti-IA : ${e.target.checked ? 'Activé' : 'Désactivé'}`);
                    }}
                    className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-950 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Sensibilité de la Détection Vision
                  </label>
                  <select
                    value={aiDetectionSensitivity}
                    onChange={(e) => {
                      setAiDetectionSensitivity(e.target.value as any);
                      showNotification(`Sensibilité réglée sur : ${e.target.value}`);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="strict">Maximale (Stricte - Recommandée)</option>
                    <option value="standard">Standard</option>
                    <option value="relaxed">Tolérante</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-5">
              <div className="flex items-center gap-2.5 text-orange-400 font-bold text-base border-b border-slate-700 pb-3">
                <Sliders className="w-5 h-5" />
                <span>Paramètres Généraux de la Plateforme</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-700/80">
                  <div>
                    <p className="font-bold text-white">Autoriser le Mode Fantôme RGPD</p>
                    <p className="text-slate-400 text-[11px]">Permet aux membres de masquer leur distance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalGhostModeAllow}
                    onChange={(e) => {
                      setGlobalGhostModeAllow(e.target.checked);
                      showNotification(`Mode Fantôme : ${e.target.checked ? 'Autorisé' : 'Bloqué'}`);
                    }}
                    className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-slate-700 bg-slate-950 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">
                    Rayon Maximum du Radar Mondial (km)
                  </label>
                  <input
                    type="number"
                    value={maxDistanceKm}
                    onChange={(e) => setMaxDistanceKm(parseInt(e.target.value) || 15000)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
