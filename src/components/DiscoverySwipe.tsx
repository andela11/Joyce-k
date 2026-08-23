import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import {
  Heart,
  X,
  Zap,
  Bot,
  Flame,
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
  Bookmark,
  Video,
  Phone,
  MessageCircle,
  Volume2,
  Lock,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, PrivacySettings, LoveLanguage } from '../types';
import { calculateDistanceKm, formatFuzzedDistance } from '../utils/geoUtils';
import { ALL_INTEREST_CATEGORIES } from '../data/categories';
import { LoveLanguageQuizModal } from './LoveLanguageQuizModal';

interface DiscoverySwipeProps {
  currentUser: UserProfile;
  profiles: UserProfile[];
  privacySettings: PrivacySettings;
  favoriteIds?: string[];
  matchedProfileIds?: string[];
  onToggleFavorite?: (profileId: string) => void;
  onLike: (profile: UserProfile, isSuperLike?: boolean) => void;
  onPass: (profile: UserProfile) => void;
  onOpenCompatibility: (profile: UserProfile) => void;
  onSelectProfileFromList?: (profile: UserProfile) => void;
  onStartCall?: (profile: UserProfile, type: 'audio' | 'video') => void;
  onStartChat?: (profile: UserProfile) => void;
  onUpdateCurrentUser?: (updated: UserProfile) => void;
}

export const DiscoverySwipe: React.FC<DiscoverySwipeProps> = ({
  currentUser,
  profiles,
  privacySettings,
  favoriteIds = [],
  matchedProfileIds = [],
  onToggleFavorite,
  onLike,
  onPass,
  onOpenCompatibility,
  onStartCall,
  onStartChat,
  onUpdateCurrentUser,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [showSuperLikeBurst, setShowSuperLikeBurst] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'like' | 'pass' | 'superlike'; name: string } | null>(null);

  const lastTapRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Motion values for fluid horizontal drag gestures only
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-240, 240], [-16, 16]);
  const likeOpacity = useTransform(dragX, [15, 70], [0, 1]);
  const nopeOpacity = useTransform(dragX, [-15, -70], [0, 1]);

  // Background card deck reaction while dragging
  const nextCardScale = useTransform(dragX, [-200, 0, 200], [1, 0.94, 1]);
  const nextCardOpacity = useTransform(dragX, [-200, 0, 200], [1, 0.72, 1]);
  const nextCardY = useTransform(dragX, [-200, 0, 200], [0, 12, 0]);

  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState(20000);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter the available profiles
  const filteredProfiles = (profiles || []).filter((p) => {
    if (!p) return false;
    if (currentUser?.id && p.id === currentUser.id) return false;
    if ((privacySettings?.blockedUsers || []).includes(p.id)) return false;
    if (p.age < minAge || p.age > maxAge) return false;
    if (verifiedOnly && !p.verified) return false;
    if (
      selectedInterestFilter !== 'all' &&
      !(p.interests || []).includes(selectedInterestFilter)
    )
      return false;

    // Region filter
    if (selectedRegion !== 'all') {
      const pCity = (p.city || '').toLowerCase();
      if (selectedRegion === 'Europe' && !pCity.includes('france') && !pCity.includes('belgique') && !pCity.includes('suisse') && !pCity.includes('royaume-uni') && !pCity.includes('allemagne') && !pCity.includes('espagne') && !pCity.includes('italie') && !pCity.includes('paris') && !pCity.includes('bruxelles') && !pCity.includes('genève') && !pCity.includes('londres') && !pCity.includes('berlin') && !pCity.includes('madrid') && !pCity.includes('rome')) {
        return false;
      }
      if (selectedRegion === 'Afrique' && !pCity.includes('côte d\'ivoire') && !pCity.includes('sénégal') && !pCity.includes('cameroun') && !pCity.includes('maroc') && !pCity.includes('rd congo') && !pCity.includes('abidjan') && !pCity.includes('dakar') && !pCity.includes('yaoundé') && !pCity.includes('casablanca') && !pCity.includes('kinshasa') && !pCity.includes('tunisie') && !pCity.includes('algérie')) {
        return false;
      }
      if (selectedRegion === 'Amériques' && !pCity.includes('canada') && !pCity.includes('états-unis') && !pCity.includes('montréal') && !pCity.includes('québec') && !pCity.includes('new york') && !pCity.includes('brésil') && !pCity.includes('guadeloupe') && !pCity.includes('martinique')) {
        return false;
      }
      if (selectedRegion === 'Asie & Moyen-Orient' && !pCity.includes('japon') && !pCity.includes('tokyo') && !pCity.includes('émirats') && !pCity.includes('dubaï') && !pCity.includes('singapour')) {
        return false;
      }
    }

    if (maxDistance < 20000) {
      const distance = calculateDistanceKm(
        currentUser?.lat || 0,
        currentUser?.lng || 0,
        p.lat || 0,
        p.lng || 0
      );
      if (distance > maxDistance) return false;
    }

    return true;
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  const activeProfile = filteredProfiles[currentIndex];
  const nextProfile = filteredProfiles[currentIndex + 1];

  const handleNext = (liked: boolean, superLike = false) => {
    if (!activeProfile) return;
    
    // Set exit animation direction
    const dir = superLike ? 'up' : liked ? 'right' : 'left';
    setSwipeDirection(dir);

    // Show instant feedback toast
    setFeedbackToast({
      type: superLike ? 'superlike' : liked ? 'like' : 'pass',
      name: activeProfile.name,
    });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 1600);

    setHistory((prev) => [...prev, currentIndex]);
    
    // Reset motion value
    dragX.set(0);

    if (liked) {
      onLike(activeProfile, superLike);
    } else {
      onPass(activeProfile);
    }
    setCurrentPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const triggerSuperLikeBurst = () => {
    if (!activeProfile || showSuperLikeBurst) return;
    setShowSuperLikeBurst(true);
    setTimeout(() => {
      setShowSuperLikeBurst(false);
      handleNext(true, true);
    }, 320);
  };

  const handleDoubleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    // If the user was just dragging the card, do not treat it as a tap/superlike
    if (isDraggingRef.current) return;

    if (e && 'preventDefault' in e) {
      // Prevent browser default double-tap zoom
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
    }
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    if (timeSinceLastTap > 0 && timeSinceLastTap < 340) {
      // Confirmed double tap on photo
      triggerSuperLikeBurst();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const lastIdx = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIdx);
    setCurrentPhotoIndex(0);
    dragX.set(0);
    setSwipeDirection(null);
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDraggingRef.current || !activeProfile) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % activeProfile.photos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDraggingRef.current || !activeProfile) return;
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
      } else if (e.key === 'ArrowUp' || e.key === 's') {
        e.preventDefault();
        triggerSuperLikeBurst();
      } else if (e.key === 'Backspace' || e.key === 'z') {
        handleRewind();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, history]);

  // Handle horizontal & vertical gesture completion with velocity detection
  const handleDragEnd = (_: any, info: any) => {
    const ox = info.offset.x;
    const vx = info.velocity.x;
    const oy = info.offset.y;
    const vy = info.velocity.y;

    // Prevent immediate click handlers on release
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 160);

    // Vertical drag up -> Super-Like
    if (oy < -70 || (oy < -25 && vy < -250)) {
      triggerSuperLikeBurst();
      return;
    }

    // Horizontal drag right -> Like
    if (ox > 45 || (ox > 15 && vx > 180)) {
      handleNext(true, false);
      return;
    }

    // Horizontal drag left -> Pass / Unlike
    if (ox < -45 || (ox < -15 && vx < -180)) {
      handleNext(false, false);
      return;
    }

    // Card snapped back to center
    dragX.set(0);
  };

  return (
    <div id="discovery-view" className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-clip">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
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
            joyce-k : Affinités mondiales authentiques sans photos IA
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
          {(maxDistance < 20000 || selectedRegion !== 'all' || minAge > 18 || maxAge < 45 || selectedInterestFilter !== 'all' || verifiedOnly) && (
            <span className="w-2 h-2 rounded-full bg-rose-400" />
          )}
        </button>
      </div>

      {/* World Region Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
        {[
          { id: 'all', label: '🌍 Toutes les régions' },
          { id: 'Europe', label: '🇪🇺 Europe' },
          { id: 'Afrique', label: '🌍 Afrique' },
          { id: 'Amériques', label: '🌎 Amériques' },
          { id: 'Asie & Moyen-Orient', label: '🌏 Asie & Orient' },
        ].map((reg) => (
          <button
            key={reg.id}
            id={`region-pill-${reg.id}`}
            onClick={() => {
              setSelectedRegion(reg.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 shadow-xs ${
              selectedRegion === reg.id
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-200 scale-[1.02]'
                : 'bg-white border border-rose-200 text-slate-700 hover:bg-rose-50'
            }`}
          >
            {reg.label}
          </button>
        ))}
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
                className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white shrink-0">
                  <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
                <span>Profils certifiés uniquement (Coche bleue)</span>
              </label>
              <input
                id="filter-verified-checkbox"
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
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
              {(currentUser?.interests || []).map((interest) => (
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
        <div className="relative w-full max-w-md mx-auto overflow-x-clip px-1 py-1">
          {/* Action Feedback Banner Toast */}
          <AnimatePresence>
            {feedbackToast && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.9 }}
                className={`absolute top-3 inset-x-4 z-40 py-2 px-4 rounded-2xl text-xs font-black shadow-lg text-center backdrop-blur-md flex items-center justify-center gap-2 pointer-events-none ${
                  feedbackToast.type === 'like'
                    ? 'bg-emerald-500/95 text-white shadow-emerald-200'
                    : feedbackToast.type === 'superlike'
                    ? 'bg-amber-500/95 text-white shadow-amber-200'
                    : 'bg-rose-600/95 text-white shadow-rose-200'
                }`}
              >
                {feedbackToast.type === 'like' && (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Vous avez aimé {feedbackToast.name} ❤️</span>
                  </>
                )}
                {feedbackToast.type === 'superlike' && (
                  <>
                    <Star className="w-4 h-4 fill-white" />
                    <span>Super-Like envoyé à {feedbackToast.name} ⭐</span>
                  </>
                )}
                {feedbackToast.type === 'pass' && (
                  <>
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>Profil refusé / passé : {feedbackToast.name} ✖️</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Card Preview (Deck Depth Effect with dynamic scale/opacity reacting to drag) */}
          {nextProfile && (
            <motion.div
              aria-hidden="true"
              style={{
                scale: nextCardScale,
                opacity: nextCardOpacity,
                y: nextCardY,
              }}
              className="absolute inset-x-1 inset-y-1 bg-white/90 border border-rose-100/80 rounded-[36px] overflow-hidden shadow-lg shadow-rose-100/40 pointer-events-none z-0 will-change-transform"
            >
              <div className="aspect-[3/4] sm:aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                <img
                  src={nextProfile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                  alt={nextProfile.name}
                  className="w-full h-full object-cover object-center filter blur-[0.5px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          )}

          {/* Active Card with High Performance Framer Motion Drag and Exit Transitions */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={activeProfile.id}
              id={`discovery-profile-card-${activeProfile.id}`}
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              dragMomentum={false}
              onDragStart={() => {
                isDraggingRef.current = true;
              }}
              onDragEnd={handleDragEnd}
              style={{ x: dragX, rotate }}
              initial={{ scale: 0.95, opacity: 0.8, y: 12 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                transition: { type: 'spring', stiffness: 420, damping: 28 },
              }}
              exit={{
                x: swipeDirection === 'right' ? 360 : swipeDirection === 'left' ? -360 : 0,
                y: swipeDirection === 'up' ? -360 : 0,
                scale: swipeDirection === 'up' ? 1.05 : 0.92,
                opacity: 0,
                rotate: swipeDirection === 'right' ? 14 : swipeDirection === 'left' ? -14 : 0,
                transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
              }}
              className="relative w-full bg-white border border-rose-100 rounded-[36px] overflow-hidden shadow-2xl shadow-rose-200/60 cursor-grab active:cursor-grabbing z-10 select-none will-change-transform touch-pan-y"
            >
              {/* Floating Swiping Stamps (Like, Nope) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-8 left-8 z-30 pointer-events-none border-4 border-emerald-500 text-emerald-500 font-black text-2xl tracking-wider px-4 py-1.5 rounded-2xl -rotate-12 bg-white/90 backdrop-blur-md shadow-xl"
              >
                LIKE ❤️
              </motion.div>

              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute top-8 right-8 z-30 pointer-events-none border-4 border-rose-500 text-rose-500 font-black text-2xl tracking-wider px-4 py-1.5 rounded-2xl rotate-12 bg-white/90 backdrop-blur-md shadow-xl"
              >
                PASSER ✖️
              </motion.div>

              {/* Super Like Double-Tap Celebration Burst Animation */}
              <AnimatePresence>
                {showSuperLikeBurst && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
                    exit={{ scale: 1.3, opacity: 0 }}
                    className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs pointer-events-none"
                  >
                    <div className="p-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-2xl shadow-amber-300 animate-bounce">
                      <Star className="w-16 h-16 fill-white" />
                    </div>
                    <span className="text-3xl font-black text-white drop-shadow-md mt-3 uppercase tracking-wider">
                      SUPER LIKE !
                    </span>
                    <span className="text-xs text-amber-200 font-bold mt-1">
                      Coup de cœur envoyé ⭐
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Photo & Carousel (Supports double tap/click for Super Like) */}
              <div
                className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-slate-100 overflow-hidden cursor-pointer"
                onClick={() => handleDoubleTap()}
                onDoubleClick={() => triggerSuperLikeBurst()}
                title="Tapez 2 fois pour Super Liker ⭐"
              >
                <img
                  src={activeProfile.photos?.[currentPhotoIndex] || activeProfile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                  alt={activeProfile.name}
                  className="w-full h-full object-cover object-center transition-opacity duration-300 pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                {/* Photo indicator dashes */}
                {(activeProfile.photos || []).length > 1 && (
                  <div className="absolute top-3 inset-x-3 flex gap-1.5 z-20">
                    {(activeProfile.photos || []).map((_, idx) => (
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
                      onClick={() => prevPhoto()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-20"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      id="next-photo-btn"
                      onClick={() => nextPhoto()}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-20"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Bottom Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

                {/* Floating Top Buttons: Dedicated Favorite Heart & AI Affinity Pill */}
                <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
                  {/* Dedicated Favorite Heart Button */}
                  <button
                    id={`card-favorite-btn-${activeProfile.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFavorite) {
                        onToggleFavorite(activeProfile.id);
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    title={favoriteIds.includes(activeProfile.id) ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md text-xs font-black transition-all transform hover:scale-105 active:scale-90 cursor-pointer ${
                      favoriteIds.includes(activeProfile.id)
                        ? 'bg-rose-600 text-white border border-rose-500 shadow-rose-400/50'
                        : 'bg-white/95 text-rose-600 border border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform ${
                        favoriteIds.includes(activeProfile.id) ? 'fill-white text-white scale-110' : 'text-rose-500'
                      }`}
                    />
                    <span>{favoriteIds.includes(activeProfile.id) ? 'Favori ❤️' : 'Sauvegarder'}</span>
                  </button>

                  {/* Floating compatibility pill */}
                  {(() => {
                    const userInterests = currentUser?.interests || [];
                    const profileInterests = activeProfile.interests || [];
                    const commonCount = userInterests.filter((i) =>
                      profileInterests.includes(i)
                    ).length;
                    const estimatedScore = Math.min(
                      98,
                      Math.max(65, 60 + commonCount * 9)
                    );
                    return (
                      <button
                        id={`card-ai-affinity-btn-${activeProfile.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCompatibility(activeProfile);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-600 shadow-md text-xs font-bold hover:scale-105 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>{estimatedScore}% d'Affinité</span>
                      </button>
                    );
                  })()}
                </div>

                {/* Quick Info on Photo */}
                <div className="absolute bottom-4 inset-x-4 z-20 space-y-1 text-white pointer-events-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
                      {activeProfile.name}, {activeProfile.age}
                    </h2>
                    {activeProfile.verified && (
                      <span
                        id={`verified-badge-pill-${activeProfile.id}`}
                        title="Profil Certifié Joyce-K — Inscription complétée & photos réelles validées"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[11px] shadow-lg shadow-blue-500/30 border border-white/90 backdrop-blur-xs select-none"
                      >
                        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                        <span>Certifié</span>
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

              {/* Profile Details & Shared Interests (Smoothly scrollable down) */}
              <div className="p-4 sm:p-5 space-y-4 text-left bg-white">
                {/* Double tap hint */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Tapez 2 fois pour Super-Liker
                  </span>
                  <span className="text-slate-400 font-medium">Défilement libre vers le bas ↓</span>
                </div>

                {/* Bio */}
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    "{activeProfile.bio}"
                  </p>
                </div>

                {/* Relationship Goal & Love Language Banners */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 border border-rose-200">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Recherche : {activeProfile.relationshipGoal}</span>
                  </div>

                  {activeProfile.loveLanguageLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsQuizModalOpen(true);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 border border-purple-200 shadow-2xs transition-all cursor-pointer"
                      title="Cliquez pour comparer vos langages de l'amour"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>Langage : {activeProfile.loveLanguageLabel}</span>
                    </button>
                  )}
                </div>

                {/* Verified Trust Banner with Blue Check */}
                {activeProfile.verified && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold flex items-center gap-1.5 text-blue-950">
                        <span>Profil Vérifié & Certifié</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-200/80 text-blue-900 font-extrabold uppercase">Coche Bleue</span>
                      </div>
                      <p className="text-[11px] text-blue-800/90 font-medium">Inscription complétée et photos réelles validées avec succès.</p>
                    </div>
                  </div>
                )}

                {/* Shared & Distinct Interests */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600">
                      Centres d'intérêt ({(activeProfile.interests || []).length})
                    </span>
                    <span className="text-rose-600 text-[11px] font-bold">
                      {
                        (currentUser?.interests || []).filter((i) =>
                          (activeProfile.interests || []).includes(i)
                        ).length
                      }{' '}
                      en commun
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(activeProfile.interests || []).map((interest) => {
                      const isCommon = (currentUser?.interests || []).includes(interest);
                      return (
                        <span
                          key={interest}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            isCommon
                              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-sm shadow-rose-200'
                              : 'bg-rose-50 text-rose-800 font-semibold border border-rose-200'
                          }`}
                        >
                          {isCommon ? '• ' : ''}
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

                {/* Profile Authenticated Real Videos */}
                {activeProfile.videos && activeProfile.videos.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-rose-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-rose-500" />
                        <span>Vidéos Réelles & Stories ({activeProfile.videos.length})</span>
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                        ✓ Anti-IA Validé
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeProfile.videos.map((vidSrc, vidIdx) => (
                        <div
                          key={vidIdx}
                          className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900"
                        >
                          <video
                            src={vidSrc}
                            controls
                            playsInline
                            className="w-full aspect-video object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Status & Discussion Action Bar */}
                <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
                  {matchedProfileIds.includes(activeProfile.id) ? (
                    <button
                      id={`swipe-chat-btn-${activeProfile.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onStartChat) onStartChat(activeProfile);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      title={`Ouvrir la messagerie avec ${activeProfile.name}`}
                      className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-200 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Match Mutuel Confirmé • Discuter avec {activeProfile.name}</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        id={`swipe-like-match-btn-${activeProfile.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNext(true, false);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        title={`Liker ${activeProfile.name} pour tenter un match`}
                        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-rose-200 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 shrink-0 fill-white" />
                        <span>Liker pour matcher avec {activeProfile.name}</span>
                      </button>
                      <p className="text-[10px] text-center text-slate-500 font-medium flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Messagerie privée débloquée uniquement après un Match mutuel</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar (Rewind, Pass, Favorite, Super-Like, Like, Deep AI) */}
              <div className="p-4 bg-white border-t border-rose-100 flex items-center justify-center gap-2.5 sm:gap-3.5">
                {/* Rewind */}
                <button
                  id="rewind-card-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRewind();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  disabled={history.length === 0}
                  title="Annuler le dernier swipe (Touche Ret.Arr)"
                  className={`p-3 sm:p-3.5 rounded-full border transition-all ${
                    history.length > 0
                      ? 'bg-slate-50 border-slate-200 text-amber-500 hover:bg-amber-50 hover:scale-110 active:scale-95 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Pass (Cross) */}
                <button
                  id={`pass-card-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext(false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Passer au profil suivant (Flèche Gauche)"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-rose-100 cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </button>

                {/* Favorite Toggle Button */}
                <button
                  id={`favorite-action-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleFavorite) {
                      onToggleFavorite(activeProfile.id);
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title={favoriteIds.includes(activeProfile.id) ? 'Retirer des favoris' : 'Sauvegarder en Favori'}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110 active:scale-90 ${
                    favoriteIds.includes(activeProfile.id)
                      ? 'bg-rose-600 border-rose-500 text-white shadow-rose-200'
                      : 'bg-rose-50/80 border-rose-200 text-rose-500 hover:bg-rose-100 shadow-rose-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${favoriteIds.includes(activeProfile.id) ? 'fill-white' : ''}`} />
                </button>

                {/* Super-Like (Star or Double-tap) */}
                <button
                  id={`superlike-card-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerSuperLikeBurst();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Super-Like avec coup de cœur (Tapez 2 fois ou Flèche Haut)"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center hover:bg-amber-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-amber-100 cursor-pointer"
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500" />
                </button>

                {/* Like (Heart) */}
                <button
                  id={`like-card-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext(true, false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Aimer ce profil (Flèche Droite)"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-rose-300/80 border-4 border-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
                >
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
                </button>

                {/* Deep AI Analysis Button */}
                <button
                  id={`deep-ai-compat-btn-${activeProfile.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCompatibility(activeProfile);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Analyse IA de compatibilité"
                  className="p-3 sm:p-3.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* End of stack */
        <div
          id="discovery-empty-stack"
          className="text-center py-16 px-4 max-w-md mx-auto bg-white border border-rose-200 rounded-[36px] space-y-4 shadow-xl shadow-rose-100/50"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
            <Flame className="w-8 h-8" />
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

      {/* Love Language Quiz Modal */}
      <LoveLanguageQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        currentUser={currentUser}
        targetProfile={activeProfile}
        onSaveLoveLanguage={(lang, label) => {
          if (onUpdateCurrentUser) {
            onUpdateCurrentUser({
              ...currentUser,
              loveLanguage: lang,
              loveLanguageLabel: label,
            });
          }
        }}
      />
    </div>
  );
};
