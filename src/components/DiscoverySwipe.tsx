import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import {
  Heart,
  X,
  Sparkles,
  Zap,
  MapPin,
  Briefcase,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Shield,
  RotateCcw,
  Star,
  Info,
} from 'lucide-react';
import { UserProfile, PrivacySettings } from '../types';
import { calculateDistanceKm, formatFuzzedDistance } from '../utils/geoUtils';
import { ALL_INTEREST_CATEGORIES } from '../data/categories';

interface DiscoverySwipeProps {
  currentUser: UserProfile;
  profiles: UserProfile[];
  privacySettings: PrivacySettings;
  onLike: (profile: UserProfile, isSuperLike?: boolean) => void;
  onPass: (profile: UserProfile) => void;
  onOpenCompatibility: (profile: UserProfile) => void;
  onSelectProfileFromList?: (profile: UserProfile) => void;
}

export const DiscoverySwipe: React.FC<DiscoverySwipeProps> = ({
  currentUser,
  profiles,
  privacySettings,
  onLike,
  onPass,
  onOpenCompatibility,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // Motion values for fluid drag gestures
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotate = useTransform(dragX, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(dragX, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-30, -120], [0, 1]);
  const superLikeOpacity = useTransform(dragY, [-30, -120], [0, 1]);

  // Filter States
  const [maxDistance, setMaxDistance] = useState(50);
  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(38);
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter the available profiles
  const filteredProfiles = profiles.filter((p) => {
    if (privacySettings.blockedUsers.includes(p.id)) return false;
    if (p.age < minAge || p.age > maxAge) return false;
    if (verifiedOnly && !p.verified) return false;
    if (
      selectedInterestFilter !== 'all' &&
      !p.interests.includes(selectedInterestFilter)
    )
      return false;

    const distance = calculateDistanceKm(
      currentUser.lat,
      currentUser.lng,
      p.lat,
      p.lng
    );
    if (distance > maxDistance) return false;

    return true;
  });

  const activeProfile = filteredProfiles[currentIndex];

  const handleNext = (liked: boolean, superLike = false) => {
    if (!activeProfile) return;
    setHistory((prev) => [...prev, currentIndex]);
    if (liked) {
      onLike(activeProfile, superLike);
    } else {
      onPass(activeProfile);
    }
    setCurrentPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const lastIdx = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIdx);
    setCurrentPhotoIndex(0);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProfile) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % activeProfile.photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProfile) return;
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + activeProfile.photos.length) % activeProfile.photos.length
    );
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!activeProfile) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext(true, false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNext(false, false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNext(true, true);
      } else if (e.key === 'Backspace' || e.key === 'z') {
        handleRewind();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, history]);

  // Handle drag end
  const handleDragEnd = (_: any, info: any) => {
    const thresholdX = 100;
    const thresholdY = -90;

    if (info.offset.y < thresholdY && Math.abs(info.offset.x) < 80) {
      // Swiped Up (Super Like)
      handleNext(true, true);
    } else if (info.offset.x > thresholdX) {
      // Swiped Right (Like)
      handleNext(true, false);
    } else if (info.offset.x < -thresholdX) {
      // Swiped Left (Pass)
      handleNext(false, false);
    }
  };

  return (
    <div id="discovery-view" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Découvrir</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold border border-rose-200">
              {filteredProfiles.length - currentIndex > 0
                ? `${filteredProfiles.length - currentIndex} profils`
                : '0 profil'}
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Matching basé sur vos passions communes & affinités de vie
          </p>
        </div>

        <button
          id="toggle-filter-drawer-btn"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
            showFilters
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white border-rose-400 shadow-md shadow-rose-200'
              : 'bg-white text-slate-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtres</span>
          {(maxDistance < 50 || minAge > 20 || maxAge < 38 || selectedInterestFilter !== 'all' || verifiedOnly) && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Filter Drawer / Accordion */}
      {showFilters && (
        <div
          id="discovery-filters-panel"
          className="mb-6 p-4 sm:p-5 bg-white border border-rose-200 rounded-3xl shadow-xl shadow-rose-100/60 space-y-4 animate-fade-in text-slate-800"
        >
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-500" /> Critères de recherche
            </h3>
            <button
              id="reset-discovery-filters-btn"
              onClick={() => {
                setMaxDistance(50);
                setMinAge(20);
                setMaxAge(38);
                setSelectedInterestFilter('all');
                setVerifiedOnly(false);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Distance max :</span>
                <span className="font-bold text-rose-600">{maxDistance} km</span>
              </div>
              <input
                id="filter-distance-slider"
                type="range"
                min="5"
                max="150"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            {/* Age Range Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Tranche d'âge :</span>
                <span className="font-bold text-rose-600">
                  {minAge} - {maxAge} ans
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="filter-min-age"
                  type="range"
                  min="18"
                  max="50"
                  value={minAge}
                  onChange={(e) => setMinAge(Math.min(Number(e.target.value), maxAge - 1))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <input
                  id="filter-max-age"
                  type="range"
                  min="20"
                  max="65"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Math.max(Number(e.target.value), minAge + 1))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Verified toggle */}
            <div className="flex items-center justify-between sm:justify-start gap-3 pt-4 sm:pt-0">
              <label
                htmlFor="filter-verified-checkbox"
                className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profils
                vérifiés uniquement
              </label>
              <input
                id="filter-verified-checkbox"
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Quick interest chips filter */}
          <div className="space-y-2 pt-2 border-t border-rose-100">
            <span className="text-xs font-bold text-slate-700">
              Filtrer par centre d'intérêt spécifique :
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                id="filter-interest-all"
                onClick={() => setSelectedInterestFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedInterestFilter === 'all'
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                    : 'bg-rose-50 text-slate-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Tous
              </button>
              {currentUser.interests.map((interest) => (
                <button
                  key={interest}
                  id={`filter-interest-${interest.replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedInterestFilter(interest)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    selectedInterestFilter === interest
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                      : 'bg-rose-50 text-slate-700 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Card Swiper Area */}
      {activeProfile ? (
        <div className="relative max-w-md mx-auto">
          {/* Card Container */}
          <div
            id={`discovery-profile-card-${activeProfile.id}`}
            className="relative bg-white border border-rose-100 rounded-[36px] overflow-hidden shadow-2xl shadow-rose-200/50 transition-all duration-300"
          >
            {/* Photo & Carousel */}
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-slate-100 overflow-hidden select-none">
              <img
                src={activeProfile.photos[currentPhotoIndex] || activeProfile.photos[0]}
                alt={activeProfile.name}
                className="w-full h-full object-cover object-center transition-opacity duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Photo indicator dashes */}
              {activeProfile.photos.length > 1 && (
                <div className="absolute top-3 inset-x-3 flex gap-1.5 z-20">
                  {activeProfile.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-200 ${
                        idx === currentPhotoIndex
                          ? 'bg-white shadow-md'
                          : 'bg-white/40 backdrop-blur-sm'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Left / Right photo touch areas */}
              {activeProfile.photos.length > 1 && (
                <>
                  <button
                    id="prev-photo-btn"
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-20"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    id="next-photo-btn"
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-20"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

              {/* Floating compatibility pill */}
              {(() => {
                const commonCount = currentUser.interests.filter((i) =>
                  activeProfile.interests.includes(i)
                ).length;
                const estimatedScore = Math.min(
                  98,
                  Math.max(65, 60 + commonCount * 9)
                );
                return (
                  <button
                    id={`card-ai-affinity-btn-${activeProfile.id}`}
                    onClick={() => onOpenCompatibility(activeProfile)}
                    className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-600 shadow-md text-xs font-bold hover:scale-105 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{estimatedScore}% d'Affinité</span>
                  </button>
                );
              })()}

              {/* Quick Info on Photo */}
              <div className="absolute bottom-4 inset-x-4 z-20 space-y-1 text-white">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
                    {activeProfile.name}, {activeProfile.age}
                  </h2>
                  {activeProfile.verified && (
                    <span
                      title="Profil vérifié par pièce d'identité et selfie"
                      className="p-1 rounded-full bg-emerald-500 text-white shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {activeProfile.astrologySign && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-medium border border-white/30">
                      {activeProfile.astrologySign}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-rose-300" />
                    {activeProfile.occupation}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-300" />
                    {formatFuzzedDistance(
                      calculateDistanceKm(
                        currentUser.lat,
                        currentUser.lng,
                        activeProfile.lat,
                        activeProfile.lng
                      ),
                      privacySettings.distanceFuzzing,
                      activeProfile.city
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details & Shared Interests */}
            <div className="p-4 sm:p-5 space-y-4 text-left bg-white">
              {/* Bio */}
              <div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  "{activeProfile.bio}"
                </p>
              </div>

              {/* Relationship Goal Banner */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 border border-rose-200">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>Recherche : {activeProfile.relationshipGoal}</span>
              </div>

              {/* Shared & Distinct Interests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600">
                    Centres d'intérêt ({activeProfile.interests.length})
                  </span>
                  <span className="text-rose-600 text-[11px] font-bold">
                    {
                      currentUser.interests.filter((i) =>
                        activeProfile.interests.includes(i)
                      ).length
                    }{' '}
                    en commun
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeProfile.interests.map((interest) => {
                    const isCommon = currentUser.interests.includes(interest);
                    return (
                      <span
                        key={interest}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${
                          isCommon
                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-sm shadow-rose-200'
                            : 'bg-rose-50 text-rose-800 font-semibold border border-rose-200'
                        }`}
                      >
                        {isCommon ? '✨ ' : ''}
                        {interest}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Interactive prompt answer */}
              {activeProfile.promptQuestion && (
                <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    {activeProfile.promptQuestion}
                  </span>
                  <p className="text-xs text-slate-700 italic font-medium">
                    {activeProfile.promptAnswer}
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar (Rewind, Pass, Super-Like, Like, Deep AI) */}
            <div className="p-4 bg-white border-t border-rose-100 flex items-center justify-center gap-3 sm:gap-4">
              {/* Rewind */}
              <button
                id="rewind-card-btn"
                onClick={handleRewind}
                disabled={history.length === 0}
                title="Annuler le dernier swipe"
                className={`p-3.5 rounded-full border transition-all ${
                  history.length > 0
                    ? 'bg-slate-50 border-slate-200 text-amber-500 hover:bg-amber-50 hover:scale-110 active:scale-95 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Pass (Cross) */}
              <button
                id={`pass-card-btn-${activeProfile.id}`}
                onClick={() => handleNext(false)}
                title="Passer au profil suivant"
                className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-rose-100"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Super-Like (Star) */}
              <button
                id={`superlike-card-btn-${activeProfile.id}`}
                onClick={() => handleNext(true, true)}
                title="Super-Like avec coup de cœur"
                className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center hover:bg-amber-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-amber-100"
              >
                <Star className="w-6 h-6 fill-amber-500" />
              </button>

              {/* Like (Heart) */}
              <button
                id={`like-card-btn-${activeProfile.id}`}
                onClick={() => handleNext(true, false)}
                title="Aimer ce profil"
                className="w-20 h-20 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-rose-300/80 border-4 border-white hover:scale-110 active:scale-90 transition-all"
              >
                <Heart className="w-8 h-8 fill-white" />
              </button>

              {/* Deep AI Analysis Button */}
              <button
                id={`deep-ai-compat-btn-${activeProfile.id}`}
                onClick={() => onOpenCompatibility(activeProfile)}
                title="Analyse IA de compatibilité"
                className="p-3.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 hover:scale-110 active:scale-95 transition-all shadow-sm"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* End of stack */
        <div
          id="discovery-empty-stack"
          className="text-center py-16 px-4 max-w-md mx-auto bg-white border border-rose-200 rounded-[36px] space-y-4 shadow-xl shadow-rose-100/50"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Vous avez vu tous les profils récents !
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Élargissez votre rayon de recherche ou découvrez les profils autour
            de vous grâce au Radar de Proximité.
          </p>
          <button
            id="reset-discovery-stack-btn"
            onClick={() => {
              setCurrentIndex(0);
              setMaxDistance(100);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all"
          >
            Recharger et élargir le rayon
          </button>
        </div>
      )}
    </div>
  );
};
