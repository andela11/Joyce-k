import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Locate,
  Shield,
  EyeOff,
  User,
  Heart,
  MessageCircle,
  Sliders,
  CheckCircle2,
  Navigation as NavIcon,
} from 'lucide-react';
import { UserProfile, PrivacySettings } from '../types';
import {
  calculateDistanceKm,
  formatFuzzedDistance,
  PRESET_CITIES,
} from '../utils/geoUtils';

interface ProximityRadarProps {
  currentUser: UserProfile;
  profiles: UserProfile[];
  privacySettings: PrivacySettings;
  onUpdateUserLocation: (city: string, lat: number, lng: number) => void;
  onSelectProfile: (profile: UserProfile) => void;
  onStartChat: (profile: UserProfile) => void;
  onOpenPrivacy: () => void;
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({
  currentUser,
  profiles,
  privacySettings,
  onUpdateUserLocation,
  onSelectProfile,
  onStartChat,
  onOpenPrivacy,
}) => {
  const [radarRadius, setRadarRadius] = useState<number>(25); // in km
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedPinProfile, setSelectedPinProfile] = useState<UserProfile | null>(null);

  // Calculate distance for all profiles
  const profilesWithDistance = profiles
    .filter((p) => !privacySettings.blockedUsers.includes(p.id))
    .map((p) => {
      const distance = calculateDistanceKm(
        currentUser.lat,
        currentUser.lng,
        p.lat,
        p.lng
      );
      const commonCount = currentUser.interests.filter((i) =>
        p.interests.includes(i)
      ).length;
      return {
        ...p,
        distance,
        commonCount,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  const nearbyProfiles = profilesWithDistance.filter(
    (p) => p.distance <= radarRadius
  );

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        onUpdateUserLocation(
          'Position Actuelle (GPS)',
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        setIsLocating(false);
        setGeoError(
          "Impossible d'accéder au GPS. Vous pouvez sélectionner une ville dans la liste."
        );
        console.warn('Geolocation error:', error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div id="proximity-radar-view" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-rose-100 rounded-[32px] p-4 sm:p-6 shadow-xl shadow-rose-100/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Radar de Proximité & Géolocalisation
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl font-medium">
            Découvrez en temps réel les célibataires partageant vos centres
            d'intérêt autour de vous, tout en protégeant vos coordonnées réelles
            grâce au chiffrement géographique.
          </p>
        </div>

        {/* Location & GPS action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="use-gps-locate-btn"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Localisation...' : 'Me Géolocaliser'}</span>
          </button>

          {/* Quick Worldwide City Presets */}
          <select
            id="city-preset-select"
            value={currentUser.city}
            onChange={(e) => {
              const city = PRESET_CITIES.find(
                (c) => `${c.name}, ${c.country}` === e.target.value || c.name === e.target.value
              );
              if (city) {
                onUpdateUserLocation(`${city.name}, ${city.country}`, city.lat, city.lng);
              }
            }}
            className="bg-rose-50/80 border border-rose-200 text-slate-800 font-semibold text-xs rounded-2xl px-3 py-2 focus:ring-rose-500 focus:border-rose-500 shadow-sm"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.name} value={`${c.name}, ${c.country}`}>
                {c.flag} {c.name}, {c.country} ({c.region})
              </option>
            ))}
          </select>
        </div>
      </div>

      {geoError && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{geoError}</span>
          <button
            onClick={() => setGeoError(null)}
            className="text-amber-700 font-bold ml-2 underline hover:text-amber-900"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Mode de confidentialité :{' '}
            <strong className="text-emerald-800 font-bold">
              {privacySettings.distanceFuzzing === 'exact'
                ? 'Distance précise'
                : privacySettings.distanceFuzzing === 'approximate'
                ? 'Flou géographique (+/- 2 à 5 km)'
                : 'Ville uniquement (GPS caché)'}
            </strong>
          </span>
        </div>
        <button
          id="radar-adjust-privacy-btn"
          onClick={onOpenPrivacy}
          className="text-rose-600 hover:text-rose-700 font-bold underline text-xs shrink-0"
        >
          Modifier
        </button>
      </div>

      {/* Main Grid: Radar Screen + Proximity List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visualizer (5 Cols on large) */}
        <div className="lg:col-span-5 bg-white border border-rose-100 rounded-[32px] p-5 shadow-xl shadow-rose-100/60 flex flex-col items-center justify-between relative overflow-hidden text-slate-800">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 via-transparent to-transparent pointer-events-none" />

          {/* Radar Header & Radius Slider */}
          <div className="w-full flex items-center justify-between mb-4 z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-rose-500" />
              Rayon de détection
            </span>
            <span className="text-xs font-black text-rose-600 bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200">
              {radarRadius} km
            </span>
          </div>

          <div className="w-full mb-6 z-10">
            <input
              id="radar-radius-slider"
              type="range"
              min="2"
              max="80"
              step="2"
              value={radarRadius}
              onChange={(e) => setRadarRadius(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>2 km (très proche)</span>
              <span>40 km</span>
              <span>80 km (région)</span>
            </div>
          </div>

          {/* Interactive Radar Screen Canvas */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-rose-200 bg-rose-50/60 shadow-inner flex items-center justify-center overflow-hidden my-2">
            {/* Concentric Rings */}
            <div className="absolute inset-4 rounded-full border border-rose-300/40" />
            <div className="absolute inset-12 rounded-full border border-rose-300/50" />
            <div className="absolute inset-20 rounded-full border border-rose-300/60" />
            <div className="absolute inset-28 rounded-full border border-rose-300/70" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-rose-300/50" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-rose-300/50" />

            {/* Rotating Radar Sweep Beam */}
            <div className="absolute inset-0 rounded-full animate-spin pointer-events-none origin-center [animation-duration:4s]">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-rose-400/30 via-rose-300/10 to-transparent rounded-tl-full" />
            </div>

            {/* Center User Blip */}
            <div className="relative z-20 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 border-2 border-white shadow-lg shadow-rose-300 flex items-center justify-center text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-slate-800 bg-white/95 px-2 py-0.5 rounded-full mt-0.5 border border-rose-200 shadow-sm">
                Vous
              </span>
            </div>

            {/* Nearby Profile Blips */}
            {nearbyProfiles.slice(0, 8).map((p, index) => {
              // Calculate simulated polar position inside circle based on index and distance ratio
              const ratio = Math.min(1, Math.max(0.2, p.distance / radarRadius));
              const angle = (index * (360 / Math.min(8, nearbyProfiles.length)) + 25) * (Math.PI / 180);
              const maxRadiusPx = 110; // max radius inside circle
              const x = Math.cos(angle) * ratio * maxRadiusPx;
              const y = Math.sin(angle) * ratio * maxRadiusPx;

              return (
                <button
                  key={p.id}
                  id={`radar-blip-${p.id}`}
                  onClick={() => setSelectedPinProfile(p)}
                  title={`${p.name} (${Math.round(p.distance)} km)`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute z-20 group transition-transform hover:scale-125"
                >
                  <div className="relative">
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-rose-400 shadow-md group-hover:border-orange-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="w-full pt-4 border-t border-rose-100 text-center z-10 text-xs text-slate-500 flex items-center justify-around">
            <div>
              <span className="font-black text-rose-600 text-base block">
                {nearbyProfiles.length}
              </span>
              <span className="font-medium">Profils dans le rayon</span>
            </div>
            <div className="h-6 w-[1px] bg-rose-100" />
            <div>
              <span className="font-black text-emerald-600 text-base block">
                {currentUser.city}
              </span>
              <span className="font-medium">Point de repère</span>
            </div>
          </div>
        </div>

        {/* Nearby Profiles List (7 Cols on large) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Profils Détectés à Proximité</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold border border-rose-200">
                {nearbyProfiles.length} trouvés
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Triés du plus proche au plus éloigné
            </span>
          </div>

          {nearbyProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {nearbyProfiles.map((profile) => {
                return (
                  <div
                    key={profile.id}
                    id={`proximity-card-${profile.id}`}
                    className="bg-white border border-rose-100 hover:border-rose-300 rounded-3xl p-4 shadow-lg shadow-rose-100/50 hover:shadow-xl transition-all group flex flex-col justify-between"
                  >
                    <div>
                      {/* Avatar + Distance + Online */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={profile.photos[0]}
                            alt={profile.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-100 group-hover:border-rose-400 transition-colors shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          {profile.isOnline && (
                            <span
                              title="En ligne"
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {profile.name}, {profile.age}
                            </h4>
                            {profile.verified && (
                              <span
                                title="Profil Certifié — Inscription complétée & photos validées"
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white shrink-0 shadow-2xs"
                              >
                                <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {profile.occupation}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-bold mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0 text-rose-500" />
                            <span>
                              {formatFuzzedDistance(
                                profile.distance,
                                privacySettings.distanceFuzzing,
                                profile.city
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Common interests pills */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {profile.interests.slice(0, 3).map((interest) => {
                          const isCommon = currentUser.interests.includes(interest);
                          return (
                            <span
                              key={interest}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isCommon
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-rose-50 text-slate-600 border border-rose-100'
                              }`}
                            >
                              {isCommon ? '✨ ' : ''}
                              {interest}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-rose-100">
                      <button
                        id={`proximity-chat-btn-${profile.id}`}
                        onClick={() => onStartChat(profile)}
                        className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                      <button
                        id={`proximity-view-profile-btn-${profile.id}`}
                        onClick={() => onSelectProfile(profile)}
                        className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-xs"
                        title="Voir le profil complet"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center bg-white border border-rose-100 rounded-[32px] p-6 space-y-3 shadow-lg shadow-rose-100/50">
              <Radio className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-slate-900">
                Aucun profil détecté dans ce rayon ({radarRadius} km)
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Augmentez le rayon du radar ou testez une autre ville comme Paris ou Lyon.
              </p>
              <button
                id="expand-radar-btn"
                onClick={() => setRadarRadius(50)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-rose-200 hover:scale-105 transition-all"
              >
                Élargir à 50 km
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
