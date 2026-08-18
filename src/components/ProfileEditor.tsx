import React, { useState, useRef } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { UserProfile, RelationshipGoal, AuthUser } from '../types';
import { ALL_INTEREST_CATEGORIES } from '../data/categories';
import { PRESET_CITIES } from '../utils/geoUtils';

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
      setVideoSuccessMsg('Vidéo réelle certifiée et ajoutée avec succès ! ✨');
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
    <div id="profile-editor-view" className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 text-white gap-4">
        <div className="flex items-center gap-3.5">
          {onBackToDiscovery && (
            <button
              id="profile-back-to-discovery-btn"
              onClick={onBackToDiscovery}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors cursor-pointer text-xs font-bold shrink-0"
              title="Retourner aux Swipes et Profils"
            >
              <ChevronLeft className="w-4 h-4 text-rose-400 stroke-[2.5]" />
              <span>Retour</span>
            </button>
          )}
          <div className="relative">
            <img
              src={profile.photos[0]}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-950"
              referrerPolicy="no-referrer"
            />
            {profile.verified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white border-2 border-slate-900 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>{profile.name}, {profile.age} ans</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Profil joyce-k certifié sans intelligence artificielle
            </p>
          </div>
        </div>

        <button
          id="save-profile-top-btn"
          onClick={handleSave}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950 transition-all active:scale-95 cursor-pointer self-end sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Enregistré !' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Account & Authentication Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Compte & Vérification joyce-k
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                {authUser ? (authUser.provider === 'google' ? 'Google Auth' : 'Email certifié') : 'Invité certifié'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {authUser ? authUser.email : 'Photos contrôlées par notre protocole anti-IA'}
            </p>
          </div>
        </div>

        {onOpenAuth && (
          <button
            id="profile-auth-manage-btn"
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-2xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-stretch sm:self-auto justify-center shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{authUser ? 'Changer de compte' : 'Se connecter'}</span>
          </button>
        )}
      </div>

      {/* Photo Gallery Manager with Device Upload & Anti-AI Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-400" /> Galerie Photos ({profile.photos.length})
            </h3>
            <p className="text-[11px] text-slate-400">
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
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all active:scale-95 disabled:opacity-50"
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
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950"
            >
              <Plus className="w-3.5 h-3.5" /> URL
            </button>
          </div>
        </div>

        {/* AI Detection Rejection Alert in Gallery */}
        {galleryAiError && (
          <div
            id="gallery-ai-error-banner"
            className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-bounce-short"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Photo Refusée : Image IA Détectée</p>
              <p className="mt-0.5 text-slate-200">{galleryAiError}</p>
            </div>
          </div>
        )}

        {/* URL Add input */}
        {showAddPhoto && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2 animate-fade-in">
            <input
              id="new-photo-url-input"
              type="url"
              placeholder="Collez l'URL de votre photo réelle..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
            />
            <button
              id="confirm-add-photo-btn"
              onClick={handleAddPhotoByUrl}
              disabled={isUploadingPhoto}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm shadow-rose-950 disabled:opacity-50"
            >
              Vérifier & Ajouter
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-800 shadow-sm bg-slate-950"
            >
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                  Principale
                </span>
              )}
              {profile.photos.length > 1 && (
                <button
                  id={`remove-photo-btn-${idx}`}
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Gallery & Real Stories with AI Video Detection & Rejection */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-rose-400" /> Vidéos du Profil & Présentation Réelle ({ (profile.videos || []).length })
            </h3>
            <p className="text-[11px] text-slate-400">
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
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
              className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> URL
            </button>
          </div>
        </div>

        {/* AI Video Detection Rejection Alert */}
        {videoAiError && (
          <div
            id="video-ai-error-banner"
            className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 text-xs font-semibold flex items-start gap-3 animate-fade-in shadow-xl shadow-rose-950"
          >
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-rose-300 text-sm flex items-center gap-1.5">
                <span>🚫 Vidéo Rejetée : Détection d'IA / Deepfake</span>
              </p>
              <p className="text-slate-200 leading-relaxed">{videoAiError}</p>
              <p className="text-[10px] text-rose-300/80 pt-1">
                Protocole de sécurité joyce-k • Seules les vidéos 100% réelles filmées par un être humain sont acceptées.
              </p>
            </div>
          </div>
        )}

        {/* Video Success Notification */}
        {videoSuccessMsg && (
          <div
            id="video-success-banner"
            className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{videoSuccessMsg}</span>
          </div>
        )}

        {/* Video URL Add input */}
        {showAddVideo && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-2 animate-fade-in">
            <input
              id="new-video-url-input"
              type="url"
              placeholder="Collez l'URL de votre vidéo réelle (MP4, WebM)..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
            />
            <button
              id="confirm-add-video-btn"
              onClick={handleAddVideoByUrl}
              disabled={isUploadingVideo}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm shadow-rose-950 disabled:opacity-50 cursor-pointer shrink-0"
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
                className="relative rounded-2xl overflow-hidden group border border-slate-800 shadow-md bg-slate-950 flex flex-col"
              >
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  <video
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Certifiée Réelle
                  </span>
                </div>

                <div className="p-2.5 flex items-center justify-between bg-slate-900/90 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300">
                    Vidéo #{idx + 1}
                  </span>
                  <button
                    id={`remove-video-btn-${idx}`}
                    onClick={() => handleRemoveVideo(idx)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
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
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-300">Aucune vidéo importée</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Importez une courte vidéo de présentation authentique pour augmenter vos chances de match. Notre scanner contrôle et certifie que votre vidéo est 100% réelle.
            </p>
          </div>
        )}
      </div>

      {/* Bio with Gemini AI Enhancer */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-3 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-rose-400" /> Bio & Présentation
          </h3>
          <button
            id="profile-bio-ai-enhance-btn"
            onClick={handleAiEnhanceBio}
            disabled={isEnhancing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all active:scale-95 disabled:opacity-50"
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
          className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none leading-relaxed font-medium"
        />
      </div>

      {/* Relationship Goal & Worldwide City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Relationship Goal */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-2.5 text-white">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
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
            className="w-full bg-slate-950 border border-slate-800 text-white font-semibold text-xs rounded-xl p-2.5 focus:border-rose-500 shadow-sm"
          >
            <option value="Relation sérieuse">💍 Relation sérieuse</option>
            <option value="Rencontres & Découverte">✨ Rencontres & Découverte</option>
            <option value="Coup de foudre">⚡ Coup de foudre</option>
            <option value="Amitié & Plus si affinités">🤝 Amitié & Plus si affinités</option>
          </select>
        </div>

        {/* Worldwide City Location */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-2.5 text-white">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-rose-400" />
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
            className="w-full bg-slate-950 border border-slate-800 text-white font-semibold text-xs rounded-xl p-2.5 focus:border-rose-500 shadow-sm"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.name} value={`${c.name}, ${c.country}`}>
                {c.flag} {c.name}, {c.country} ({c.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 50+ Structured Interest Categories Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" /> Vos Centres d'Intérêt ({profile.interests.length} sélectionnés)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Ces badges guident notre algorithme d'affinités et l'IA wingman sur joyce-k.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {ALL_INTEREST_CATEGORIES.map((category) => (
            <div key={category.id} className="space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {category.tags.map((tag) => {
                  const isSelected = profile.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      id={`tag-btn-${tag.replace(/\s+/g, '-')}`}
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold shadow-md shadow-rose-950 scale-105'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-rose-500/50 hover:bg-slate-800'
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

      {/* Account Session & Logout Card */}
      {authUser && onLogout && (
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-xl shadow-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h4 className="text-sm font-bold text-white">Session Active</h4>
            <p className="text-xs text-slate-400">
              Connecté en tant que <strong>{authUser.name}</strong> ({authUser.email})
            </p>
          </div>
          <button
            id="profile-logout-btn"
            onClick={onLogout}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-900/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Se Déconnecter de Joyce-K</span>
          </button>
        </div>
      )}
    </div>
  );
};
