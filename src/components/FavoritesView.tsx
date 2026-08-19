import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Bot,
  MessageCircle,
  MapPin,
  Briefcase,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Flame,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Compass,
  Phone,
  Video,
} from 'lucide-react';
import { UserProfile, PrivacySettings } from '../types';
import { calculateDistanceKm, formatFuzzedDistance } from '../utils/geoUtils';

interface FavoritesViewProps {
  currentUser: UserProfile;
  profiles?: UserProfile[];
  allProfiles?: UserProfile[];
  favoriteIds?: string[];
  onToggleFavorite: (profileId: string) => void;
  onOpenCompatibility: (profile: UserProfile) => void;
  onStartChat: (profile: UserProfile) => void;
  onStartCall?: (profile: UserProfile, type: 'audio' | 'video') => void;
  onGoToDiscovery?: () => void;
  onExploreMore?: () => void;
  privacySettings?: PrivacySettings;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  currentUser,
  profiles,
  allProfiles,
  favoriteIds = [],
  onToggleFavorite,
  onOpenCompatibility,
  onStartChat,
  onStartCall,
  onGoToDiscovery,
  onExploreMore,
  privacySettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [activePhotoIndices, setActivePhotoIndices] = useState<{ [key: string]: number }>({});

  const profilesList = profiles || allProfiles || [];
  const safeFavoriteIds = Array.isArray(favoriteIds) ? favoriteIds : [];
  const favoriteProfiles = profilesList.filter((p) => p && safeFavoriteIds.includes(p.id));

  const filteredFavorites = favoriteProfiles.filter((p) => {
    if (!p) return false;
    const name = p.name || '';
    const city = p.city || '';
    const interests = p.interests || [];
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interests.some((i) => (i || '').toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterGoal !== 'all' && p.relationshipGoal !== filterGoal) return false;
    return true;
  });

  const handleNextPhoto = (profileId: string, totalPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndices((prev) => ({
      ...prev,
      [profileId]: ((prev[profileId] || 0) + 1) % totalPhotos,
    }));
  };

  const handlePrevPhoto = (profileId: string, totalPhotos: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIndices((prev) => ({
      ...prev,
      [profileId]: ((prev[profileId] || 0) - 1 + totalPhotos) % totalPhotos,
    }));
  };

  return (
    <div id="joyce-k-favorites-view" className="w-full min-h-[calc(100vh-70px)] bg-slate-50 text-slate-800 p-4 sm:p-6 md:p-8 selection:bg-rose-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-[32px] bg-white border border-rose-100 shadow-xl shadow-rose-100/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {onGoToDiscovery && (
                <button
                  id="favorites-back-btn"
                  onClick={onGoToDiscovery}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Retourner aux Swipes"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                Coups de Cœur
              </span>
              <span className="text-xs font-bold text-slate-500">
                {favoriteProfiles.length} profil{favoriteProfiles.length > 1 ? 's' : ''} sauvegardé{favoriteProfiles.length > 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Mes Profils Favoris</span>
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Retrouvez tous les profils réels qui vous ont marqué(e) dans le swipe. Analysez votre affinité IA ou engagez la conversation dès que vous êtes prêt(e).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToDiscovery}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 flex items-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Découvrir de nouveaux profils</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        {favoriteProfiles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-rose-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, passion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-orange-50/30 border border-orange-200 focus:border-rose-500 focus:bg-white focus:outline-none text-xs text-slate-900 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-600 shrink-0 hidden md:inline">Objectif :</span>
              <button
                onClick={() => setFilterGoal('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterGoal === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Tous ({favoriteProfiles.length})
              </button>
              <button
                onClick={() => setFilterGoal('Relation sérieuse')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterGoal === 'Relation sérieuse'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Relation sérieuse
              </button>
              <button
                onClick={() => setFilterGoal('Rencontres & Découverte')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterGoal === 'Rencontres & Découverte'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Découverte
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {favoriteProfiles.length === 0 ? (
          <div className="text-center py-20 px-6 max-w-lg mx-auto bg-white border border-rose-100 rounded-[36px] space-y-5 shadow-xl shadow-rose-100/50">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-100 to-orange-100 border border-rose-200 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <Heart className="w-10 h-10 fill-rose-500 text-rose-500 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Aucun favori pour le moment
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Lorsque vous parcourez les profils dans le <strong>Discovery Swipe</strong>, cliquez sur l'icône de <strong>cœur rose/doré</strong> pour sauvegarder vos profils préférés et les retrouver ici à tout moment.
              </p>
            </div>
            <button
              onClick={onGoToDiscovery || onExploreMore}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Commencer à explorer</span>
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-14 px-4 bg-white border border-rose-100 rounded-3xl space-y-3">
            <p className="text-sm font-bold text-slate-700">Aucun favori ne correspond à vos filtres.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterGoal('all');
              }}
              className="text-xs font-bold text-rose-600 underline cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((profile) => {
              const currentPhotoIdx = activePhotoIndices[profile.id] || 0;
              const photos = profile.photos || [];
              const photo = photos[currentPhotoIdx] || photos[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';
              const userInterests = currentUser?.interests || [];
              const profileInterests = profile.interests || [];
              const commonCount = userInterests.filter((i) =>
                profileInterests.includes(i)
              ).length;
              const affinityScore = Math.min(98, Math.max(65, 60 + commonCount * 9));

              return (
                <div
                  key={profile.id}
                  id={`favorite-card-${profile.id}`}
                  className="rounded-[32px] bg-white border border-rose-100 overflow-hidden shadow-lg shadow-rose-100/50 hover:shadow-2xl hover:shadow-rose-200/60 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={photo}
                      alt={profile.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                      {/* Affinity pill */}
                      <button
                        onClick={() => onOpenCompatibility(profile)}
                        className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-600 text-[11px] font-bold shadow-md flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>{affinityScore}% Affinité</span>
                      </button>

                      {/* Favorite button toggle */}
                      <button
                        onClick={() => onToggleFavorite(profile.id)}
                        title="Retirer des favoris"
                        className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-md transition-transform transform hover:scale-110 active:scale-90 cursor-pointer"
                      >
                        <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    {/* Photo Switcher buttons if multiple photos */}
                    {profile.photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => handlePrevPhoto(profile.id, profile.photos.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleNextPhoto(profile.id, profile.photos.length, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-10"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-14 inset-x-3 flex gap-1 z-10">
                          {profile.photos.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                idx === currentPhotoIdx ? 'bg-white' : 'bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Info on photo bottom */}
                    <div className="absolute bottom-3 inset-x-3.5 text-white z-10 space-y-0.5 pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xl font-black tracking-tight drop-shadow-md">
                          {profile.name}, {profile.age}
                        </h3>
                        {profile.verified && (
                          <span
                            title="Profil Certifié Joyce-K — Inscription complétée & photos réelles validées"
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] shadow-sm border border-white/80"
                          >
                            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                            <span>Certifié</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-orange-300" />
                          {formatFuzzedDistance(
                            calculateDistanceKm(currentUser.lat, currentUser.lng, profile.lat, profile.lng),
                            privacySettings.distanceFuzzing,
                            profile.city
                          )}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">{profile.occupation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between bg-white">
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-600 line-clamp-2 italic font-medium">
                        "{profile.bio}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-rose-50 pt-2">
                        <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          {profile.relationshipGoal}
                        </span>
                        <span className="text-rose-600 font-bold">
                          {commonCount} affinité{commonCount > 1 ? 's' : ''} en commun
                        </span>
                      </div>

                      {/* Common Interests tags */}
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.slice(0, 3).map((interest) => (
                          <span
                            key={interest}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              currentUser.interests.includes(interest)
                                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {interest}
                          </span>
                        ))}
                        {profile.interests.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                            +{profile.interests.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Direct Audio & Video Calls + Chat + AI Affinity) */}
                    <div className="pt-2.5 border-t border-rose-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Audio Call */}
                        <button
                          id={`fav-audio-call-${profile.id}`}
                          onClick={() => {
                            if (onStartCall) onStartCall(profile, 'audio');
                          }}
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                          title={`Appel audio avec ${profile.name}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Appel Audio</span>
                        </button>

                        {/* Video Call */}
                        <button
                          id={`fav-video-call-${profile.id}`}
                          onClick={() => {
                            if (onStartCall) onStartCall(profile, 'video');
                          }}
                          className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                          title={`Appel vidéo avec ${profile.name}`}
                        >
                          <Video className="w-3.5 h-3.5 text-rose-600" />
                          <span>Appel Vidéo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onOpenCompatibility(profile)}
                          className="py-2.5 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-violet-200"
                        >
                          <Bot className="w-3.5 h-3.5 text-violet-600" />
                          <span>Affinité IA</span>
                        </button>

                        <button
                          onClick={() => onStartChat(profile)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Discuter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
