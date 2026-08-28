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
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Video,
  MessageCircle,
  Lock,
  Award,
} from 'lucide-react';
import { UserProfile, PrivacySettings } from '../types';
import { calculateDistanceKm, formatFuzzedDistance } from '../utils/geoUtils';
import { isGenderCompatible } from '../utils/userUtils';
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

interface SwipeCardProps {
  profile: UserProfile;
  currentUser: UserProfile;
  privacySettings: PrivacySettings;
  favoriteIds: string[];
  matchedProfileIds: string[];
  currentPhotoIndex: number;
  showSuperLikeBurst: boolean;
  onPrevPhoto: (e: React.MouseEvent) => void;
  onNextPhoto: (e: React.MouseEvent) => void;
  onDoubleTap: (e?: React.MouseEvent | React.TouchEvent) => void;
  onTriggerSuperLike: () => void;
  onToggleFavorite?: (profileId: string) => void;
  onOpenCompatibility: (profile: UserProfile) => void;
  onStartChat?: (profile: UserProfile) => void;
  onOpenQuiz: () => void;
  onSwipeComplete: (direction: 'left' | 'right' | 'up') => void;
  onRewind: () => void;
  canRewind: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  currentUser,
  privacySettings,
  favoriteIds,
  matchedProfileIds,
  currentPhotoIndex,
  showSuperLikeBurst,
  onPrevPhoto,
  onNextPhoto,
  onDoubleTap,
  onTriggerSuperLike,
  onToggleFavorite,
  onOpenCompatibility,
  onStartChat,
  onOpenQuiz,
  onSwipeComplete,
  onRewind,
  canRewind,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -80], [0, 1]);

  const isDraggingRef = useRef(false);

  const handleDragEnd = (_: any, info: any) => {
    isDraggingRef.current = false;

    const ox = info.offset.x;
    const vx = info.velocity.x;

    if (ox > 50 || (ox > 15 && vx > 150)) {
      onSwipeComplete('right');
      return;
    }

    if (ox < -50 || (ox < -15 && vx < -150)) {
      onSwipeComplete('left');
      return;
    }
  };

  const userInterests = currentUser?.interests || [];
  const profileInterests = profile.interests || [];
  const commonCount = userInterests.filter((i) => profileInterests.includes(i)).length;
  const estimatedScore = Math.min(98, Math.max(65, 60 + commonCount * 9));
  const isFavorite = favoriteIds.includes(profile.id);
  const isMatched = matchedProfileIds.includes(profile.id);

  return (
    <motion.div
      key={profile.id}
      id={`discovery-profile-card-${profile.id}`}
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin={true}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.96, opacity: 0, y: 10 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
      className="relative w-full bg-white border border-rose-100 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-rose-200/60 cursor-grab active:cursor-grabbing z-10 select-none touch-pan-y"
    >
      {/* Floating Dynamic Swiping Stamps (Like, Nope) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-8 z-30 pointer-events-none border-4 border-emerald-500 text-emerald-500 font-black text-2xl tracking-wider px-4 py-1.5 rounded-2xl -rotate-12 bg-white/95 backdrop-blur-md shadow-xl"
      >
        LIKE ❤️
      </motion.div>

      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-8 z-30 pointer-events-none border-4 border-rose-500 text-rose-500 font-black text-2xl tracking-wider px-4 py-1.5 rounded-2xl rotate-12 bg-white/95 backdrop-blur-md shadow-xl"
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

      {/* Photo & Carousel Area */}
      <div
        className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-slate-100 overflow-hidden cursor-pointer"
        onClick={(e) => {
          if (isDraggingRef.current) return;
          onDoubleTap(e);
        }}
        title="Tapez 2 fois pour Super-Liker ⭐"
      >
        <img
          src={
            profile.photos?.[currentPhotoIndex] ||
            profile.photos?.[0] ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
          }
          alt={profile.name}
          className="w-full h-full object-cover object-center transition-opacity duration-300 pointer-events-none"
          referrerPolicy="no-referrer"
        />

        {/* Photo indicator dashes */}
        {(profile.photos || []).length > 1 && (
          <div className="absolute top-3 inset-x-3 flex gap-1.5 z-20">
            {(profile.photos || []).map((_, idx) => (
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

        {/* Left / Right photo switch buttons */}
        {profile.photos && profile.photos.length > 1 && (
          <>
            <button
              id={`prev-photo-btn-${profile.id}`}
              onClick={onPrevPhoto}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all z-20"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id={`next-photo-btn-${profile.id}`}
              onClick={onNextPhoto}
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

        {/* Floating Top Action Pills: Favorite & AI Affinity */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-auto">
          <button
            id={`card-favorite-btn-${profile.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite(profile.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title={isFavorite ? 'Retirer des Favoris' : 'Sauvegarder en Favori'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-md text-xs font-black transition-all transform hover:scale-105 active:scale-90 cursor-pointer ${
              isFavorite
                ? 'bg-rose-600 text-white border border-rose-500 shadow-rose-400/50'
                : 'bg-white/95 text-rose-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                isFavorite ? 'fill-white text-white scale-110' : 'text-rose-500'
              }`}
            />
            <span>{isFavorite ? 'Favori ❤️' : 'Sauvegarder'}</span>
          </button>

          <button
            id={`card-ai-affinity-btn-${profile.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCompatibility(profile);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 text-rose-600 shadow-md text-xs font-bold hover:scale-105 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>{estimatedScore}% d'Affinité</span>
          </button>
        </div>

        {/* Quick Info on Photo */}
        <div className="absolute bottom-4 inset-x-4 z-20 space-y-1 text-white pointer-events-none">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-black tracking-tight drop-shadow-md">
              {profile.name}, {profile.age}
            </h2>
            {profile.verified && (
              <span
                id={`verified-badge-pill-${profile.id}`}
                title="Profil Certifié Joyce-K — Inscription complétée & photos réelles validées"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[11px] shadow-lg shadow-blue-500/30 border border-white/90 backdrop-blur-xs select-none"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Certifié</span>
              </span>
            )}
            {profile.astrologySign && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-medium border border-white/30">
                {profile.astrologySign}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-rose-300" />
              {profile.occupation}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-300" />
              {formatFuzzedDistance(
                calculateDistanceKm(
                  currentUser.lat,
                  currentUser.lng,
                  profile.lat,
                  profile.lng
                ),
                privacySettings.distanceFuzzing,
                profile.city
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details & Interests */}
      <div className="p-4 sm:p-5 space-y-4 text-left bg-white">
        {/* Double-tap hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100">
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Tapez 2 fois pour Super-Liker
          </span>
          <span className="text-slate-400 font-medium">Défilement libre vers le bas ↓</span>
        </div>

        {/* Bio */}
        <div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            "{profile.bio}"
          </p>
        </div>

        {/* Relationship Goal & Love Language */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-xs font-bold text-rose-700 border border-rose-200">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Recherche : {profile.relationshipGoal}</span>
          </div>

          {profile.loveLanguageLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenQuiz();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 border border-purple-200 shadow-2xs transition-all cursor-pointer"
              title="Comparer vos langages de l'amour"
            >
              <Award className="w-3.5 h-3.5 text-purple-600" />
              <span>Langage : {profile.loveLanguageLabel}</span>
            </button>
          )}
        </div>

        {/* Verified Blue Badge Banner */}
        {profile.verified && (
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

        {/* Shared Interests */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600">
              Centres d'intérêt ({(profile.interests || []).length})
            </span>
            <span className="text-rose-600 text-[11px] font-bold">
              {commonCount} en commun
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(profile.interests || []).map((interest) => {
              const isCommon = userInterests.includes(interest);
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
        {profile.promptQuestion && (
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-1">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              {profile.promptQuestion}
            </span>
            <p className="text-xs text-slate-700 italic font-medium">
              {profile.promptAnswer}
            </p>
          </div>
        )}

        {/* Real Authenticated Videos */}
        {profile.videos && profile.videos.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-rose-100">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-600 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span>Vidéos Réelles ({profile.videos.length})</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
                ✓ Anti-IA Validé
              </span>
            </div>

            <div className="space-y-3">
              {profile.videos.map((vidSrc, vidIdx) => (
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

        {/* Chat / Match Status Action */}
        <div className="pt-2 border-t border-rose-100 flex flex-col gap-2">
          {isMatched ? (
            <button
              id={`swipe-chat-btn-${profile.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onStartChat) onStartChat(profile);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-200 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Match Mutuel Confirmé • Discuter avec {profile.name}</span>
            </button>
          ) : (
            <div className="space-y-1.5">
              <button
                id={`swipe-like-match-btn-${profile.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSwipeComplete('right');
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-rose-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 shrink-0 fill-white" />
                <span>Liker pour matcher avec {profile.name}</span>
              </button>
              <p className="text-[10px] text-center text-slate-500 font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Messagerie débloquée dès le match</span>
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
            onRewind();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={!canRewind}
          title="Annuler le dernier swipe"
          className={`p-3 sm:p-3.5 rounded-full border transition-all ${
            canRewind
              ? 'bg-slate-50 border-slate-200 text-amber-500 hover:bg-amber-50 hover:scale-110 active:scale-95 shadow-sm cursor-pointer'
              : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
          }`}
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Pass (Cross) */}
        <button
          id={`pass-card-btn-${profile.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSwipeComplete('left');
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Passer au profil suivant"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-rose-100 cursor-pointer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Favorite Toggle Button */}
        <button
          id={`favorite-action-btn-${profile.id}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(profile.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title={isFavorite ? 'Retirer des favoris' : 'Sauvegarder en Favori'}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110 active:scale-90 ${
            isFavorite
              ? 'bg-rose-600 border-rose-500 text-white shadow-rose-200'
              : 'bg-rose-50/80 border-rose-200 text-rose-500 hover:bg-rose-100 shadow-rose-50'
          }`}
        >
          <Heart className={`w-5 h-5 sm:w-6 sm:h-6 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Super-Like (Star) */}
        <button
          id={`superlike-card-btn-${profile.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onTriggerSuperLike();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Super-Like"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center hover:bg-amber-100 hover:scale-110 active:scale-90 transition-all shadow-md shadow-amber-100 cursor-pointer"
        >
          <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500" />
        </button>

        {/* Like (Heart) */}
        <button
          id={`like-card-btn-${profile.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSwipeComplete('right');
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Aimer ce profil"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-rose-300/80 border-4 border-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
        >
          <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
        </button>

        {/* Deep AI Analysis Button */}
        <button
          id={`deep-ai-compat-btn-${profile.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenCompatibility(profile);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Analyse IA de compatibilité"
          className="p-3 sm:p-3.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 hover:bg-violet-100 hover:scale-110 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </motion.div>
  );
};

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
  const [showSuperLikeBurst, setShowSuperLikeBurst] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'like' | 'pass' | 'superlike';
    name: string;
  } | null>(null);

  const lastTapRef = useRef<number>(0);
  const isSwipingLockRef = useRef(false);

  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState(20000);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(45);
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // When filters or gender change, safely reset deck to start
  useEffect(() => {
    setCurrentIndex(0);
    setCurrentPhotoIndex(0);
  }, [selectedRegion, maxDistance, minAge, maxAge, selectedInterestFilter, verifiedOnly, currentUser?.gender]);

  // Filter the available profiles cleanly
  const filteredProfiles = (profiles || []).filter((p) => {
    if (!p) return false;
    if (currentUser?.id && p.id === currentUser.id) return false;
    if ((privacySettings?.blockedUsers || []).includes(p.id)) return false;

    // Strict Rule: Men always encounter Women, and Women always encounter Men
    if (!isGenderCompatible(currentUser, p)) return false;

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
      if (
        selectedRegion === 'Europe' &&
        !pCity.includes('france') &&
        !pCity.includes('belgique') &&
        !pCity.includes('suisse') &&
        !pCity.includes('royaume-uni') &&
        !pCity.includes('allemagne') &&
        !pCity.includes('espagne') &&
        !pCity.includes('italie') &&
        !pCity.includes('paris') &&
        !pCity.includes('bruxelles') &&
        !pCity.includes('genève') &&
        !pCity.includes('londres') &&
        !pCity.includes('berlin') &&
        !pCity.includes('madrid') &&
        !pCity.includes('rome')
      ) {
        return false;
      }
      if (
        selectedRegion === 'Afrique' &&
        !pCity.includes("côte d'ivoire") &&
        !pCity.includes('sénégal') &&
        !pCity.includes('cameroun') &&
        !pCity.includes('maroc') &&
        !pCity.includes('rd congo') &&
        !pCity.includes('abidjan') &&
        !pCity.includes('dakar') &&
        !pCity.includes('yaoundé') &&
        !pCity.includes('casablanca') &&
        !pCity.includes('kinshasa') &&
        !pCity.includes('tunisie') &&
        !pCity.includes('algérie')
      ) {
        return false;
      }
      if (
        selectedRegion === 'Amériques' &&
        !pCity.includes('canada') &&
        !pCity.includes('états-unis') &&
        !pCity.includes('montréal') &&
        !pCity.includes('québec') &&
        !pCity.includes('new york') &&
        !pCity.includes('brésil') &&
        !pCity.includes('guadeloupe') &&
        !pCity.includes('martinique')
      ) {
        return false;
      }
      if (
        selectedRegion === 'Asie & Moyen-Orient' &&
        !pCity.includes('japon') &&
        !pCity.includes('tokyo') &&
        !pCity.includes('émirats') &&
        !pCity.includes('dubaï') &&
        !pCity.includes('singapour')
      ) {
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

  const activeProfile =
    currentIndex < filteredProfiles.length ? filteredProfiles[currentIndex] : null;
  const nextProfile =
    currentIndex + 1 < filteredProfiles.length ? filteredProfiles[currentIndex + 1] : null;

  const handleSwipeAction = (direction: 'left' | 'right' | 'up') => {
    if (!activeProfile || isSwipingLockRef.current) return;
    isSwipingLockRef.current = true;

    const liked = direction === 'right' || direction === 'up';
    const superLike = direction === 'up';

    setFeedbackToast({
      type: superLike ? 'superlike' : liked ? 'like' : 'pass',
      name: activeProfile.name,
    });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 1400);

    setHistory((prev) => [...prev, currentIndex]);

    if (liked) {
      onLike(activeProfile, superLike);
    } else {
      onPass(activeProfile);
    }

    setCurrentPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);

    setTimeout(() => {
      isSwipingLockRef.current = false;
    }, 180);
  };

  const triggerSuperLikeBurst = () => {
    if (!activeProfile || showSuperLikeBurst) return;
    setShowSuperLikeBurst(true);
    setTimeout(() => {
      setShowSuperLikeBurst(false);
      handleSwipeAction('up');
    }, 320);
  };

  const handleDoubleTap = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'preventDefault' in e) {
      try {
        e.preventDefault();
      } catch {
        // ignore
      }
    }
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    if (timeSinceLastTap > 0 && timeSinceLastTap < 340) {
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
  };

  const nextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeProfile) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % activeProfile.photos.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeProfile) return;
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + activeProfile.photos.length) % activeProfile.photos.length
    );
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (!activeProfile) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipeAction('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipeAction('left');
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

  return (
    <div
      id="discovery-view"
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-x-clip"
    >
      {/* Top Filter Header Bar */}
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            showFilters
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white border-rose-400 shadow-md shadow-rose-200'
              : 'bg-white text-slate-700 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtres</span>
          {(maxDistance < 20000 ||
            selectedRegion !== 'all' ||
            minAge > 18 ||
            maxAge < 45 ||
            selectedInterestFilter !== 'all' ||
            verifiedOnly) && <span className="w-2 h-2 rounded-full bg-rose-400" />}
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
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer ${
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
          className="mb-6 p-4 sm:p-5 bg-white border border-rose-200 rounded-3xl shadow-xl shadow-rose-100/60 space-y-4 text-slate-800"
        >
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Critères de recherche
              </h3>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <span>🎯 Ciblage :</span>
                <span>
                  {currentUser?.gender === 'homme'
                    ? 'Femmes'
                    : currentUser?.gender === 'femme'
                    ? 'Hommes'
                    : 'Tous'}
                </span>
              </span>
            </div>
            <button
              id="reset-discovery-filters-btn"
              onClick={() => {
                setMaxDistance(20000);
                setMinAge(18);
                setMaxAge(45);
                setSelectedInterestFilter('all');
                setVerifiedOnly(false);
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Distance max :</span>
                <span className="font-bold text-rose-600">
                  {maxDistance >= 20000 ? 'Illimité (Monde)' : `${maxDistance} km`}
                </span>
              </div>
              <input
                id="filter-distance-slider"
                type="range"
                min="10"
                max="20000"
                step="50"
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
                <span>Profils certifiés uniquement</span>
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
                    <span>Profil passé : {feedbackToast.name} ✖️</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Background Preview Card (Deck Depth Effect) */}
          {nextProfile && (
            <div
              aria-hidden="true"
              className="absolute inset-x-2 inset-y-2 bg-white/90 border border-rose-100/80 rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-lg shadow-rose-100/40 pointer-events-none z-0 scale-[0.96] opacity-75 translate-y-3"
            >
              <div className="aspect-[3/4] sm:aspect-[4/5] w-full bg-slate-100 overflow-hidden">
                <img
                  src={
                    nextProfile.photos?.[0] ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'
                  }
                  alt={nextProfile.name}
                  className="w-full h-full object-cover object-center filter blur-[0.5px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Active Card with Isolated Motion State */}
          <AnimatePresence mode="wait">
            <SwipeCard
              key={activeProfile.id}
              profile={activeProfile}
              currentUser={currentUser}
              privacySettings={privacySettings}
              favoriteIds={favoriteIds}
              matchedProfileIds={matchedProfileIds}
              currentPhotoIndex={currentPhotoIndex}
              showSuperLikeBurst={showSuperLikeBurst}
              onPrevPhoto={prevPhoto}
              onNextPhoto={nextPhoto}
              onDoubleTap={handleDoubleTap}
              onTriggerSuperLike={triggerSuperLikeBurst}
              onToggleFavorite={onToggleFavorite}
              onOpenCompatibility={onOpenCompatibility}
              onStartChat={onStartChat}
              onOpenQuiz={() => setIsQuizModalOpen(true)}
              onSwipeComplete={handleSwipeAction}
              onRewind={handleRewind}
              canRewind={history.length > 0}
            />
          </AnimatePresence>
        </div>
      ) : (
        /* End of stack view */
        <div
          id="discovery-empty-stack"
          className="text-center py-16 px-4 max-w-md mx-auto bg-white border border-rose-200 rounded-[36px] space-y-4 shadow-xl shadow-rose-100/50"
        >
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500">
            <Flame className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Vous avez vu tous les profils disponibles !
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Vous pouvez réinitialiser la pile pour revoir les profils ou élargir votre rayon
            de recherche.
          </p>
          <button
            id="reset-discovery-stack-btn"
            onClick={() => {
              setCurrentIndex(0);
              setHistory([]);
              setMaxDistance(20000);
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            Recharger tous les profils
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
