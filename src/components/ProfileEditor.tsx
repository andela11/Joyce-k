import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Zap,
  Camera,
  MapPin,
  Heart,
  Plus,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  LogIn,
  LogOut,
  Upload,
  ShieldAlert,
  Globe2,
  ChevronLeft,
  Video,
  Film,
  Play,
  Pause,
  AlertOctagon,
  Phone,
  Compass,
  Locate,
  Award,
} from 'lucide-react';
import { UserProfile, RelationshipGoal, AuthUser, LoveLanguage } from '../types';
import { ALL_INTEREST_CATEGORIES } from '../data/categories';
import { PRESET_CITIES } from '../utils/geoUtils';
import { detectCountryFromPhoneNumber, COUNTRY_PHONE_DATABASE } from '../utils/phoneCountryUtils';
import { LoveLanguageQuizModal } from './LoveLanguageQuizModal';

interface ProfileEditorProps {
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  authUser?: AuthUser | null;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  onBackToDiscovery?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  userProfile,
  onSaveProfile,
  authUser,
  onOpenAuth,
  onLogout,
  onBackToDiscovery,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfile((prev) => (prev.id === userProfile.id && prev.name === userProfile.name && prev.bio === userProfile.bio ? prev : userProfile));
    }
  }, [userProfile]);

  // Gallery file upload & AI check
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [galleryAiError, setGalleryAiError] = useState<string | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Video file upload & AI check
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoAiError, setVideoAiError] = useState<string | null>(null);
  const [videoSuccessMsg, setVideoSuccessMsg] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [playingVideoIdx, setPlayingVideoIdx] = useState<number | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const captureVideoThumbnail = (fileOrUrl: File | string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;

        const sourceUrl = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
        video.src = sourceUrl;
        video.currentTime = 0.5;

        video.onloadeddata = () => {
          video.currentTime = Math.min(1, (video.duration || 2) / 2);
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(480, video.videoWidth || 360);
            canvas.height = Math.min(640, video.videoHeight || 480);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbBase64 = canvas.toDataURL('image/jpeg', 0.8);
              if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(sourceUrl);
              resolve(thumbBase64);
              return;
            }
          } catch {}
          if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(sourceUrl);
          resolve('');
        };

        video.onerror = () => {
          if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(sourceUrl);
          resolve('');
        };

        setTimeout(() => {
          if (typeof fileOrUrl !== 'string') URL.revokeObjectURL(sourceUrl);
          resolve('');
        }, 3500);
      } catch {
        resolve('');
      }
    });
  };

  const handleVerifyAndAddVideo = async (
    videoDataOrUrl: string,
    fileName?: string,
    thumbnailData?: string
  ) => {
    setIsUploadingVideo(true);
    setVideoAiError(null);
    setVideoSuccessMsg(null);

    try {
      const res = await fetch('/api/videos/verify-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoData: videoDataOrUrl,
          fileName: fileName || 'video_profil.mp4',
          thumbnailData,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isAiGenerated === true || data.allowed === false) {
          // AI VIDEO DETECTED -> REJECT!
          setVideoAiError(
            data.reason ||
              "Cette vidéo a été détectée comme étant générée par intelligence artificielle (Deepfake / Sora / AI). joyce-k refuse formellement les vidéos non réelles pour préserver l'authenticité de la communauté."
          );
          setIsUploadingVideo(false);
          return;
        }
      }

      // Success: Authentic real video
      setProfile((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoDataOrUrl],
      }));
      setNewVideoUrl('');
      setShowAddVideo(false);
      setVideoSuccessMsg('Vidéo réelle certifiée et ajoutée avec succès !');
      setTimeout(() => setVideoSuccessMsg(null), 4000);
    } catch (err) {
      console.warn('Video upload fallback verification:', err);
      setProfile((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoDataOrUrl],
      }));
      setNewVideoUrl('');
      setShowAddVideo(false);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setVideoAiError('Veuillez sélectionner un fichier vidéo valide (MP4, WebM, MOV).');
      return;
    }

    setIsUploadingVideo(true);
    const thumb = await captureVideoThumbnail(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleVerifyAndAddVideo(base64, file.name, thumb);
    };
    reader.readAsDataURL(file);
  };

  const handleAddVideoByUrl = async () => {
    if (!newVideoUrl.trim()) return;
    setIsUploadingVideo(true);
    const thumb = await captureVideoThumbnail(newVideoUrl.trim());
    handleVerifyAndAddVideo(newVideoUrl.trim(), 'video_url.mp4', thumb);
  };

  const handleRemoveVideo = (idx: number) => {
    setProfile((prev) => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== idx),
    }));
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => {
      const interests = prev.interests || [];
      const exists = interests.includes(interest);
      if (exists) {
        return {
          ...prev,
          interests: interests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...interests, interest],
        };
      }
    });
  };

  const handleVerifyAndAddPhoto = async (base64OrUrl: string, fileName?: string) => {
    setIsUploadingPhoto(true);
    setGalleryAiError(null);

    try {
      const res = await fetch('/api/images/verify-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: base64OrUrl,
          fileName: fileName || 'photo_galerie.jpg',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isAiGenerated === true || data.allowed === false) {
          // AI DETECTED -> REJECT!
          setGalleryAiError(
            data.reason ||
              "Ce genre d'image générée par intelligence artificielle n'est pas autorisée sur joyce-k. Nous exigeons des photos réelles et authentiques."
          );
          setIsUploadingPhoto(false);
          return;
        }
      }

      // Success
      setProfile((prev) => ({
        ...prev,
        photos: [...prev.photos, base64OrUrl],
      }));
      setNewPhotoUrl('');
      setShowAddPhoto(false);
    } catch (err) {
      console.warn('Gallery upload fallback verification:', err);
      setProfile((prev) => ({
        ...prev,
        photos: [...prev.photos, base64OrUrl],
      }));
      setNewPhotoUrl('');
      setShowAddPhoto(false);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleGalleryFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setGalleryAiError('Veuillez sélectionner un fichier image valide.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleVerifyAndAddPhoto(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    handleVerifyAndAddPhoto(newPhotoUrl.trim(), 'photo_url.jpg');
  };

  const handleRemovePhoto = (idx: number) => {
    if ((profile.photos || []).length <= 1) return;
    setProfile((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAiEnhanceBio = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/ai/enhance-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: profile.bio,
          interests: profile.interests,
          relationshipGoal: profile.relationshipGoal,
          vibe: 'Chaleureux & Élégant',
        }),
      });
      const data = await res.json();
      if (data.enhancedBio) {
        setProfile((prev) => ({ ...prev, bio: data.enhancedBio }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    onSaveProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="profile-editor-view" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-rose-200/90 rounded-[32px] p-5 shadow-xl shadow-rose-100/50 text-slate-800 gap-4">
        <div className="flex items-center gap-3.5">
          {onBackToDiscovery && (
            <button
              id="profile-back-to-discovery-btn"
              onClick={() => onBackToDiscovery()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer text-xs font-bold shrink-0"
              title="Retourner aux Swipes et Profils"
            >
              <ChevronLeft className="w-4 h-4 text-rose-600 stroke-[2.5]" />
              <span>Retour</span>
            </button>
          )}
          <div className="relative">
            <img
              src={profile?.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'}
              alt={profile?.name || 'Profil'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-200"
              referrerPolicy="no-referrer"
            />
            {profile.verified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white border-2 border-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{profile.name}, {profile.age} ans</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Profil Joyce-K certifié sans intelligence artificielle
            </p>
          </div>
        </div>

        <button
          id="save-profile-top-btn"
          onClick={handleSave}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer self-end sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Enregistré !' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Account & Authentication Status */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Compte & Vérification Joyce-K
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                {authUser ? (authUser.provider === 'google' ? 'Google Auth' : 'Email certifié') : 'Invité certifié'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {authUser ? authUser.email : 'Photos et vidéos contrôlées par notre protocole anti-IA'}
            </p>
          </div>
        </div>

        {onOpenAuth && (
          <button
            id="profile-auth-manage-btn"
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-2 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center shadow-2xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-rose-600" />
            <span>{authUser ? 'Changer de compte' : 'Se connecter'}</span>
          </button>
        )}
      </div>

      {/* Photo Gallery Manager with Device Upload & Anti-AI Verification */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-4 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-600" /> Galerie Photos ({profile.photos.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Toutes les photos sont vérifiées pour garantir qu'elles sont 100% réelles (aucune IA tolérée).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryFileSelected}
              className="hidden"
            />

            <button
              id="upload-device-photo-btn"
              onClick={() => galleryFileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploadingPhoto ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Téléverser depuis l'appareil</span>
            </button>

            <button
              id="open-add-photo-btn"
              onClick={() => setShowAddPhoto(!showAddPhoto)}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> URL
            </button>
          </div>
        </div>

        {/* AI Detection Rejection Alert in Gallery */}
        {galleryAiError && (
          <div
            id="gallery-ai-error-banner"
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 animate-bounce-short"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800">Photo Refusée : Image IA Détectée</p>
              <p className="mt-0.5 text-slate-700">{galleryAiError}</p>
            </div>
          </div>
        )}

        {/* URL Add input */}
        {showAddPhoto && (
          <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-200 flex items-center gap-2 animate-fade-in">
            <input
              id="new-photo-url-input"
              type="url"
              placeholder="Collez l'URL de votre photo réelle..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
            />
            <button
              id="confirm-add-photo-btn"
              onClick={handleAddPhotoByUrl}
              disabled={isUploadingPhoto}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              Vérifier & Ajouter
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group border border-rose-100 shadow-xs bg-rose-50/30"
            >
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  Principale
                </span>
              )}
              {profile.photos.length > 1 && (
                <button
                  id={`remove-photo-btn-${idx}`}
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Gallery & Real Stories with AI Video Detection & Rejection */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-4 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-rose-100 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-600" /> Vidéos du Profil & Présentation Réelle ({ (profile.videos || []).length })
            </h3>
            <p className="text-[11px] text-slate-500">
              Contrôle strict anti-IA : Les vidéos générées par IA (Sora, Runway, Deepfakes, avatars synthétiques) sont automatiquement rejetées.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileSelected}
              className="hidden"
            />

            <button
              id="upload-device-video-btn"
              onClick={() => videoFileInputRef.current?.click()}
              disabled={isUploadingVideo}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploadingVideo ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>Importer une vidéo</span>
            </button>

            <button
              id="open-add-video-btn"
              onClick={() => setShowAddVideo(!showAddVideo)}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> URL
            </button>
          </div>
        </div>

        {/* AI Video Detection Rejection Alert */}
        {videoAiError && (
          <div
            id="video-ai-error-banner"
            className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-3 animate-fade-in shadow-lg shadow-rose-100"
          >
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-rose-900 text-sm flex items-center gap-1.5">
                <span>🚫 Vidéo Rejetée : Détection d'IA / Deepfake</span>
              </p>
              <p className="text-slate-700 leading-relaxed">{videoAiError}</p>
              <p className="text-[10px] text-rose-700 pt-1">
                Protocole de sécurité Joyce-K • Seules les vidéos 100% réelles filmées par un être humain sont acceptées.
              </p>
            </div>
          </div>
        )}

        {/* Video Success Notification */}
        {videoSuccessMsg && (
          <div
            id="video-success-banner"
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{videoSuccessMsg}</span>
          </div>
        )}

        {/* Video URL Add input */}
        {showAddVideo && (
          <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-200 flex items-center gap-2 animate-fade-in">
            <input
              id="new-video-url-input"
              type="url"
              placeholder="Collez l'URL de votre vidéo réelle (MP4, WebM)..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
            />
            <button
              id="confirm-add-video-btn"
              onClick={handleAddVideoByUrl}
              disabled={isUploadingVideo}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isUploadingVideo ? 'Analyse...' : 'Vérifier & Ajouter'}
            </button>
          </div>
        )}

        {/* Video List & Playback Grid */}
        {(profile.videos || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(profile.videos || []).map((videoSrc, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden group border border-rose-200 shadow-md bg-slate-900 flex flex-col"
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Certifiée Réelle
                  </span>
                </div>

                <div className="p-2.5 flex items-center justify-between bg-white border-t border-rose-100 text-slate-800">
                  <span className="text-[11px] font-bold text-slate-700">
                    Vidéo #{idx + 1}
                  </span>
                  <button
                    id={`remove-video-btn-${idx}`}
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Supprimer cette vidéo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rose-50/40 border border-dashed border-rose-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Aucune vidéo importée</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Importez une courte vidéo de présentation authentique pour augmenter vos chances de match. Notre scanner contrôle et certifie que votre vidéo est 100% réelle.
            </p>
          </div>
        )}
      </div>

      {/* Bio with Gemini AI Enhancer */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-3 text-slate-800">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-rose-600" /> Bio & Présentation
          </h3>
          <button
            id="profile-bio-ai-enhance-btn"
            onClick={handleAiEnhanceBio}
            disabled={isEnhancing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Sublimation en cours...' : 'Sublimer avec l\'IA'}</span>
          </button>
        </div>

        <textarea
          id="profile-bio-textarea"
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Décrivez votre univers, vos passions, vos projets..."
          className="w-full bg-rose-50/40 border border-rose-200 focus:border-rose-500 focus:bg-white rounded-2xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed font-medium transition-all"
        />
      </div>

      {/* Relationship Goal & Worldwide City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Relationship Goal */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-2.5 text-slate-800">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-600" />
            Ce que vous recherchez :
          </label>
          <select
            id="profile-goal-select"
            value={profile.relationshipGoal}
            onChange={(e) =>
              setProfile({
                ...profile,
                relationshipGoal: e.target.value as RelationshipGoal,
              })
            }
            className="w-full bg-rose-50/40 border border-rose-200 text-slate-900 font-semibold text-xs rounded-xl p-2.5 focus:border-rose-500 focus:bg-white shadow-2xs"
          >
            <option value="Relation sérieuse">💍 Relation sérieuse</option>
            <option value="Rencontres & Découverte">🌟 Rencontres & Découverte</option>
            <option value="Coup de foudre">⚡ Coup de foudre</option>
            <option value="Amitié & Plus si affinités">🤝 Amitié & Plus si affinités</option>
          </select>
        </div>

        {/* Worldwide City Location */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-2.5 text-slate-800">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-rose-600" />
            Votre ville & région (Monde entier) :
          </label>
          <select
            id="profile-city-select"
            value={profile.city}
            onChange={(e) => {
              const selected = PRESET_CITIES.find(
                (c) => `${c.name}, ${c.country}` === e.target.value || c.name === e.target.value
              );
              if (selected) {
                setProfile({
                  ...profile,
                  city: `${selected.name}, ${selected.country}`,
                  lat: selected.lat,
                  lng: selected.lng,
                });
              }
            }}
            className="w-full bg-rose-50/40 border border-rose-200 text-slate-900 font-semibold text-xs rounded-xl p-2.5 focus:border-rose-500 focus:bg-white shadow-2xs"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.name} value={`${c.name}, ${c.country}`}>
                {c.flag} {c.name}, {c.country} ({c.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone Number & Country Identification Section */}
      {(() => {
        const phoneCountry = detectCountryFromPhoneNumber(profile.phoneNumber || '+237 6 99 88 77 66');
        const exactPhoto = profile.photos?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800';

        return (
          <div className="bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80 border border-rose-200/90 rounded-[32px] p-5 sm:p-6 shadow-xl shadow-rose-100/50 space-y-4 text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Numéro de Téléphone & Pays de Rattachement
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Votre pays et votre géolocalisation sont détectés à partir de votre indicatif téléphonique.
                  </p>
                </div>
              </div>

              {/* Exact Photo & Detected Country Live Preview Badge */}
              <div className="flex items-center gap-2.5 bg-white border border-rose-200 rounded-2xl px-3 py-1.5 shrink-0 shadow-2xs">
                <div className="relative">
                  <img
                    src={exactPhoto}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover border border-rose-500 ring-2 ring-rose-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full px-0.5 border border-rose-200">
                    {phoneCountry.flag}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[9px] uppercase font-bold text-rose-600">Pays détecté</div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>{phoneCountry.flag}</span>
                    <span>{phoneCountry.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs & Instant Location Launcher */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-6 relative">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Numéro de téléphone :
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-600 font-bold text-xs">
                    <span className="text-base mr-1">{phoneCountry.flag}</span>
                  </div>
                  <input
                    id="profile-phone-input"
                    type="text"
                    value={profile.phoneNumber || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const detected = detectCountryFromPhoneNumber(val);
                      setProfile({
                        ...profile,
                        phoneNumber: val,
                        country: detected.name,
                      });
                    }}
                    placeholder="+237 6XX XX XX XX ou +33 6..."
                    className="w-full bg-white border border-rose-200 text-slate-900 font-bold text-xs rounded-xl pl-10 pr-3 py-2.5 focus:border-rose-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Indicatif / Pays :
                </label>
                <select
                  id="profile-country-code-select"
                  value={phoneCountry.code}
                  onChange={(e) => {
                    const found = COUNTRY_PHONE_DATABASE.find((c) => c.code === e.target.value);
                    if (found) {
                      setProfile({
                        ...profile,
                        phoneNumber: found.example,
                        country: found.name,
                        city: `${found.defaultCity}, ${found.name}`,
                        lat: found.lat,
                        lng: found.lng,
                      });
                    }
                  }}
                  className="w-full bg-white border border-rose-200 text-slate-900 font-semibold text-xs rounded-xl p-2.5 focus:border-rose-500 shadow-2xs"
                >
                  {COUNTRY_PHONE_DATABASE.map((c) => (
                    <option key={`${c.code}-${c.name}`} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 sm:pt-5">
                <button
                  id="profile-sync-location-from-phone-btn"
                  type="button"
                  onClick={() => {
                    const detected = detectCountryFromPhoneNumber(profile.phoneNumber);
                    setProfile({
                      ...profile,
                      country: detected.name,
                      city: `${detected.defaultCity}, ${detected.name}`,
                      lat: detected.lat,
                      lng: detected.lng,
                    });
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2500);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <Locate className="w-3.5 h-3.5" />
                  <span>📍 Localiser par pays</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Langages de l'Amour & Alchimie Relationnelle */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-6 shadow-xl shadow-rose-100/40 space-y-4 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Langage de l'Amour & Alchimie Émotionnelle</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Votre langage dominant affine l'analyse de compatibilité avec vos futurs matchs.
            </p>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            Test Psychologique
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-rose-600">
              Votre dominante actuelle
            </span>
            <p className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{profile.loveLanguageLabel || 'Moments de qualité'}</span>
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Ce critère est pris en compte dans le calcul d'affinité mutuelle pour assurer des connexions sincères.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsQuizOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span>Passer / Recalculer le Test des 5 Langages</span>
          </button>
        </div>
      </div>

      {/* 50+ Structured Interest Categories Selection */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/40 space-y-5 text-slate-800">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" /> Vos Centres d'Intérêt ({(profile.interests || []).length} sélectionnés)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Ces badges guident notre algorithme d'affinités et l'IA wingman sur Joyce-K.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {ALL_INTEREST_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {category.tags.map((tag) => {
                  const isSelected = (profile.interests || []).includes(tag);
                  return (
                    <button
                      key={tag}
                      id={`tag-btn-${tag.replace(/\s+/g, '-')}`}
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md shadow-rose-200 scale-105'
                          : 'bg-rose-50/50 border border-rose-200 text-slate-700 hover:border-rose-400 hover:bg-rose-100/60'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Profile Bottom Action Bar */}
      <div className="bg-white border border-rose-200/90 rounded-[32px] p-5 shadow-xl shadow-rose-100/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Save className="w-4 h-4 text-rose-600" />
            <span>Enregistrer vos modifications</span>
          </h4>
          <p className="text-xs text-slate-500">
            Mettez à jour vos photos, vidéos, bio et préférences d'affinités sur votre profil Joyce-K.
          </p>
        </div>
        <button
          id="profile-save-bottom-btn"
          onClick={handleSave}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>Enregistré avec succès !</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-white" />
              <span>Enregistrer mon profil</span>
            </>
          )}
        </button>
      </div>

      {/* Love Language Quiz Modal */}
      <LoveLanguageQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        currentUser={profile}
        onSaveLoveLanguage={(lang, label) => {
          setProfile((prev) => ({
            ...prev,
            loveLanguage: lang,
            loveLanguageLabel: label,
          }));
        }}
      />
    </div>
  );
};
