import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Camera,
  MapPin,
  Briefcase,
  Heart,
  Plus,
  Check,
  RefreshCw,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { UserProfile, RelationshipGoal } from '../types';
import { ALL_INTEREST_CATEGORIES } from '../data/categories';
import { PRESET_CITIES } from '../utils/geoUtils';

interface ProfileEditorProps {
  userProfile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  userProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleInterest = (interest: string) => {
    setProfile((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
    });
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setProfile((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhotoUrl.trim()],
    }));
    setNewPhotoUrl('');
    setShowAddPhoto(false);
  };

  const handleRemovePhoto = (idx: number) => {
    if (profile.photos.length <= 1) return;
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx),
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
      <div className="flex items-center justify-between bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={profile.photos[0]}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-200"
              referrerPolicy="no-referrer"
            />
            {profile.verified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white border-2 border-white shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>{profile.name}, {profile.age} ans</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Personnalisez vos centres d'intérêt pour maximiser les affinités
            </p>
          </div>
        </div>

        <button
          id="save-profile-top-btn"
          onClick={handleSave}
          className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-200 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Enregistré !' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Photo Gallery Manager */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-3.5">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-500" /> Vos Photos ({profile.photos.length})
          </h3>
          <button
            id="open-add-photo-btn"
            onClick={() => setShowAddPhoto(!showAddPhoto)}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une photo
          </button>
        </div>

        {showAddPhoto && (
          <div className="p-3 bg-rose-50/80 rounded-2xl border border-rose-200 flex items-center gap-2 animate-fade-in">
            <input
              id="new-photo-url-input"
              type="url"
              placeholder="Collez l'URL de votre photo (ex: Unsplash ou HTTPS)..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="flex-1 bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium shadow-xs"
            />
            <button
              id="confirm-add-photo-btn"
              onClick={handleAddPhoto}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-sm shadow-rose-200"
            >
              Ajouter
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-rose-100 shadow-sm"
            >
              <img
                src={photo}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  Principale
                </span>
              )}
              {profile.photos.length > 1 && (
                <button
                  id={`remove-photo-btn-${idx}`}
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bio with Gemini AI Enhancer */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-3">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" /> Bio & Présentation
          </h3>
          <button
            id="profile-bio-ai-enhance-btn"
            onClick={handleAiEnhanceBio}
            disabled={isEnhancing}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-200 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Sublimation en cours...' : 'Sublimer avec l\'IA'}</span>
          </button>
        </div>

        <textarea
          id="profile-bio-textarea"
          rows={3}
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          placeholder="Décrivez votre univers, ce qui vous fait vibrer..."
          className="w-full bg-rose-50/60 border border-rose-200 focus:border-rose-500 rounded-2xl p-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed font-medium"
        />
      </div>

      {/* Relationship Goal & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Relationship Goal */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-2.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500" />
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
            className="w-full bg-rose-50/70 border border-rose-200 text-slate-800 font-semibold text-xs rounded-xl p-2.5 focus:ring-rose-500 shadow-sm"
          >
            <option value="Relation sérieuse">💍 Relation sérieuse</option>
            <option value="Rencontres & Découverte">✨ Rencontres & Découverte</option>
            <option value="Coup de foudre">⚡ Coup de foudre</option>
            <option value="Amitié & Plus si affinités">🤝 Amitié & Plus si affinités</option>
          </select>
        </div>

        {/* City Location */}
        <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-2.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            Votre ville de base :
          </label>
          <select
            id="profile-city-select"
            value={profile.city}
            onChange={(e) => {
              const selected = PRESET_CITIES.find((c) => c.name === e.target.value);
              if (selected) {
                setProfile({
                  ...profile,
                  city: selected.name,
                  lat: selected.lat,
                  lng: selected.lng,
                });
              }
            }}
            className="w-full bg-rose-50/70 border border-rose-200 text-slate-800 font-semibold text-xs rounded-xl p-2.5 focus:ring-rose-500 shadow-sm"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                📍 {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 50+ Structured Interest Categories Selection */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 space-y-5">
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Vos Centres d'Intérêt ({profile.interests.length} sélectionnés)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Ces badges sont la clé de voûte de notre moteur d'affinités et de l'IA.
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
                  const isSelected = profile.interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      id={`tag-btn-${tag.replace(/\s+/g, '-')}`}
                      onClick={() => toggleInterest(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-md shadow-rose-200 scale-105'
                          : 'bg-rose-50/80 border border-rose-200 text-slate-700 hover:border-rose-300 hover:bg-rose-100'
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
    </div>
  );
};
