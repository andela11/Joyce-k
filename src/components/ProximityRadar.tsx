import React, { useState } from 'react';
import {
  Radio,
  MapPin,
  Locate,
  Shield,
  User,
  Heart,
  MessageCircle,
  Phone,
  CheckCircle2,
  ChevronLeft,
  Globe2,
  Check,
  X,
  Compass,
  Lock,
} from 'lucide-react';
import { UserProfile, PrivacySettings } from '../types';
import {
  calculateDistanceKm,
  formatFuzzedDistance,
  PRESET_CITIES,
} from '../utils/geoUtils';
import {
  detectCountryFromPhoneNumber,
  COUNTRY_PHONE_DATABASE,
  CountryPhoneInfo,
} from '../utils/phoneCountryUtils';
import { isGenderCompatible } from '../utils/userUtils';

interface ProximityRadarProps {
  currentUser: UserProfile;
  profiles: UserProfile[];
  privacySettings: PrivacySettings;
  matchedProfileIds?: string[];
  onUpdateUserLocation: (
    city: string,
    lat: number,
    lng: number,
    country?: string,
    phoneNumber?: string
  ) => void;
  onSelectProfile: (profile: UserProfile) => void;
  onStartChat: (profile: UserProfile) => void;
  onLike?: (profile: UserProfile) => void;
  onOpenPrivacy: () => void;
  onBackToDiscovery?: () => void;
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({
  currentUser,
  profiles,
  privacySettings,
  matchedProfileIds = [],
  onUpdateUserLocation,
  onSelectProfile,
  onStartChat,
  onLike,
  onOpenPrivacy,
  onBackToDiscovery,
}) => {
  const [radarRadius, setRadarRadius] = useState<number>(25); // in km
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [selectedPinProfile, setSelectedPinProfile] = useState<UserProfile | null>(null);
  const [showCenterUserModal, setShowCenterUserModal] = useState(false);

  // Phone number state
  const [phoneNumberInput, setPhoneNumberInput] = useState<string>(
    currentUser?.phoneNumber || '+237 6 99 88 77 66'
  );
  const [activeLocationModal, setActiveLocationModal] = useState<{
    isOpen: boolean;
    photoUrl: string;
    userName: string;
    countryName: string;
    countryFlag: string;
    phoneCode: string;
    phoneNumber: string;
    city: string;
    lat: number;
    lng: number;
    profilesCount: number;
  } | null>(null);

  // Detect country based on current phone number
  const detectedCountry: CountryPhoneInfo = detectCountryFromPhoneNumber(
    phoneNumberInput || currentUser?.phoneNumber
  );

  // Exact profile photo of the user
  const userExactPhoto =
    currentUser?.photos?.[0] ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  // Calculate distance for all profiles
  const profilesWithDistance = (profiles || [])
    .filter(
      (p) =>
        p &&
        p.id !== currentUser?.id &&
        !(privacySettings?.blockedUsers || []).includes(p.id) &&
        isGenderCompatible(currentUser, p)
    )
    .map((p) => {
      const distance = calculateDistanceKm(
        currentUser?.lat || 0,
        currentUser?.lng || 0,
        p.lat || 0,
        p.lng || 0
      );
      const userInterests = currentUser?.interests || [];
      const profileInterests = p.interests || [];
      const commonCount = userInterests.filter((i) =>
        profileInterests.includes(i)
      ).length;
      const profileCountryInfo = detectCountryFromPhoneNumber(p.phoneNumber);

      return {
        ...p,
        distance,
        commonCount,
        detectedCountry: profileCountryInfo,
      };
    })
    .sort((a, b) => a.distance - b.distance);

  const nearbyProfiles = profilesWithDistance.filter(
    (p) => p.distance <= radarRadius
  );

  // Launch localization based on phone number & GPS
  const handleLaunchLocalization = (customPhone?: string) => {
    setIsLocating(true);
    setGeoError(null);

    const phoneToUse = customPhone || phoneNumberInput || currentUser?.phoneNumber || '+237 6 99 88 77 66';
    const country = detectCountryFromPhoneNumber(phoneToUse);

    // If browser GPS is available, attempt high precision while linking to phone country
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const localizedCity = `${country.defaultCity} (${country.name})`;
          onUpdateUserLocation(
            localizedCity,
            position.coords.latitude,
            position.coords.longitude,
            country.name,
            phoneToUse
          );

          // Trigger Exact Photo & Detected Country presentation modal
          setActiveLocationModal({
            isOpen: true,
            photoUrl: userExactPhoto,
            userName: currentUser?.name || 'Vous',
            countryName: country.name,
            countryFlag: country.flag,
            phoneCode: country.code,
            phoneNumber: phoneToUse,
            city: localizedCity,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            profilesCount: nearbyProfiles.length,
          });
        },
        (error) => {
          setIsLocating(false);
          console.warn('GPS unavailable, using Phone Country Geolocation:', error);

          // Fallback to Country Geographic Center from phone number
          const localizedCity = `${country.defaultCity}, ${country.name}`;
          onUpdateUserLocation(
            localizedCity,
            country.lat,
            country.lng,
            country.name,
            phoneToUse
          );

          // Show Exact Photo & Country Banner
          setActiveLocationModal({
            isOpen: true,
            photoUrl: userExactPhoto,
            userName: currentUser?.name || 'Vous',
            countryName: country.name,
            countryFlag: country.flag,
            phoneCode: country.code,
            phoneNumber: phoneToUse,
            city: localizedCity,
            lat: country.lat,
            lng: country.lng,
            profilesCount: nearbyProfiles.length,
          });
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      const localizedCity = `${country.defaultCity}, ${country.name}`;
      onUpdateUserLocation(
        localizedCity,
        country.lat,
        country.lng,
        country.name,
        phoneToUse
      );

      setActiveLocationModal({
        isOpen: true,
        photoUrl: userExactPhoto,
        userName: currentUser?.name || 'Vous',
        countryName: country.name,
        countryFlag: country.flag,
        phoneCode: country.code,
        phoneNumber: phoneToUse,
        city: localizedCity,
        lat: country.lat,
        lng: country.lng,
        profilesCount: nearbyProfiles.length,
      });
    }
  };

  return (
    <div id="proximity-radar-view" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner with Phone Number & Country Localization Launcher */}
      <div className="bg-white border border-rose-100 rounded-[32px] p-4 sm:p-6 shadow-xl shadow-rose-100/60 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {onBackToDiscovery && (
                <button
                  id="radar-back-to-discovery-btn"
                  onClick={() => onBackToDiscovery()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer mr-1"
                  title="Retourner aux Swipes"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
              )}
              <div className="p-2 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Radar de Proximité & Localisation par Numéro
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-xl font-medium">
              Lancez la géolocalisation pour identifier instantanément votre pays d'après votre numéro de téléphone et afficher votre photo de profil certifiée.
            </p>
          </div>

          {/* Quick Info Badge: Detected Country from Phone */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-2.5 sm:px-4 shrink-0">
            <div className="relative">
              <img
                src={userExactPhoto}
                alt={currentUser?.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-rose-400 shadow-md ring-2 ring-rose-200"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full p-0.5 shadow-xs border border-rose-200">
                {detectedCountry.flag}
              </span>
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 flex items-center gap-1">
                <Globe2 className="w-3 h-3" />
                Pays détecté (Téléphone)
              </div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>{detectedCountry.flag}</span>
                <span>{detectedCountry.name}</span>
                <span className="text-xs font-bold text-slate-400">({detectedCountry.code})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar: Phone input & Launch Localization Button */}
        <div className="pt-3 border-t border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-rose-50/40 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-[32px]">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Phone Number Input with Auto Country Detection */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-rose-500 font-bold text-xs">
                <Phone className="w-4 h-4 mr-1.5" />
                <span className="text-base mr-1">{detectedCountry.flag}</span>
              </div>
              <input
                id="radar-phone-number-input"
                type="text"
                value={phoneNumberInput}
                onChange={(e) => setPhoneNumberInput(e.target.value)}
                placeholder="Ex: +237 6 99 88 77 66 ou +33 6..."
                className="w-full bg-white border border-rose-200 text-slate-900 font-bold text-xs rounded-2xl pl-16 pr-3 py-2.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 shadow-sm"
              />
            </div>

            {/* Country Selector shortcut */}
            <select
              id="radar-country-selector"
              value={detectedCountry.code}
              onChange={(e) => {
                const found = COUNTRY_PHONE_DATABASE.find((c) => c.code === e.target.value);
                if (found) {
                  setPhoneNumberInput(found.example);
                }
              }}
              className="bg-white border border-rose-200 text-slate-800 font-bold text-xs rounded-2xl px-3 py-2.5 focus:ring-rose-500 focus:border-rose-500 shadow-sm shrink-0"
            >
              {COUNTRY_PHONE_DATABASE.map((c) => (
                <option key={`${c.code}-${c.name}`} value={c.code}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Big Launch Localization Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="launch-phone-localization-btn"
              onClick={() => handleLaunchLocalization()}
              disabled={isLocating}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Locate className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Localisation en cours...' : '📍 Lancer la Localisation'}</span>
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
              className="hidden sm:block bg-white border border-rose-200 text-slate-800 font-semibold text-xs rounded-2xl px-3 py-2.5 focus:ring-rose-500 focus:border-rose-500 shadow-sm"
            >
              {PRESET_CITIES.map((c) => (
                <option key={c.name} value={`${c.name}, ${c.country}`}>
                  {c.flag} {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Geolocation Notice or Error */}
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
                : 'Ville uniquement (GPS protégé)'}
            </strong>
          </span>
        </div>
        <button
          id="radar-adjust-privacy-btn"
          onClick={() => onOpenPrivacy?.()}
          className="text-rose-600 hover:text-rose-700 font-bold underline text-xs shrink-0 cursor-pointer"
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

            {/* Center User Blip - SHOWS EXACT PROFILE PHOTO & COUNTRY BADGE */}
            <button
              id="center-user-profile-blip"
              onClick={() => setShowCenterUserModal(true)}
              className="relative z-30 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110"
              title="Voir mon profil géolocalisé et mon pays"
            >
              {/* Pulsing Aura */}
              <span className="absolute -inset-2 rounded-full bg-rose-500/20 animate-ping" />

              {/* Exact User Profile Photo */}
              <div className="relative">
                <img
                  src={userExactPhoto}
                  alt={currentUser?.name || 'Vous'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xl ring-2 ring-rose-500 group-hover:ring-orange-500"
                  referrerPolicy="no-referrer"
                />
                {/* Mini Country Flag overlay */}
                <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full px-1 py-0.2 shadow-sm border border-rose-200">
                  {detectedCountry.flag}
                </span>
              </div>

              {/* Name & Country Badge */}
              <div className="flex items-center gap-1 text-[9px] font-black text-slate-800 bg-white/95 px-2 py-0.5 rounded-full mt-1 border border-rose-200 shadow-sm">
                <span>{currentUser?.name || 'Vous'}</span>
                <span className="text-rose-600">({detectedCountry.name})</span>
              </div>
            </button>

            {/* Nearby Profile Blips */}
            {nearbyProfiles.slice(0, 8).map((p, index) => {
              const ratio = Math.min(1, Math.max(0.2, p.distance / radarRadius));
              const angle = (index * (360 / Math.min(8, nearbyProfiles.length)) + 25) * (Math.PI / 180);
              const maxRadiusPx = 110;
              const x = Math.cos(angle) * ratio * maxRadiusPx;
              const y = Math.sin(angle) * ratio * maxRadiusPx;

              return (
                <button
                  key={p.id}
                  id={`radar-blip-${p.id}`}
                  onClick={() => setSelectedPinProfile(p)}
                  title={`${p.name} (${Math.round(p.distance)} km) - ${p.detectedCountry?.name || ''}`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className="absolute z-20 group transition-transform hover:scale-125 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
                      alt={p.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-rose-400 shadow-md group-hover:border-orange-500"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 text-[9px] bg-white rounded-full px-0.5 border border-slate-200 shadow-2xs">
                      {p.detectedCountry?.flag || '🌍'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats & Coordinates */}
          <div className="w-full pt-4 border-t border-rose-100 text-center z-10 text-xs text-slate-500 flex items-center justify-around">
            <div>
              <span className="font-black text-rose-600 text-base block">
                {nearbyProfiles.length}
              </span>
              <span className="font-medium">Profils dans le rayon</span>
            </div>
            <div className="h-6 w-[1px] bg-rose-100" />
            <div>
              <span className="font-black text-emerald-600 text-sm block flex items-center justify-center gap-1">
                <span>{detectedCountry.flag}</span>
                <span>{currentUser.city}</span>
              </span>
              <span className="font-medium">Position active</span>
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
                      {/* Avatar + Distance + Country */}
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800'}
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
                          <span
                            title={`Pays : ${profile.detectedCountry?.name || ''}`}
                            className="absolute -bottom-1 -left-1 text-xs bg-white rounded-full px-1 shadow-2xs border border-rose-200"
                          >
                            {profile.detectedCountry?.flag || '🌍'}
                          </span>
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
                        {(profile.interests || []).slice(0, 3).map((interest) => {
                          const isCommon = (currentUser?.interests || []).includes(interest);
                          return (
                            <span
                              key={interest}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                isCommon
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'bg-rose-50 text-slate-600 border border-rose-100'
                              }`}
                            >
                              {isCommon ? '• ' : ''}
                              {interest}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-rose-100">
                      {matchedProfileIds.includes(profile.id) ? (
                        <button
                          id={`proximity-chat-btn-${profile.id}`}
                          onClick={() => onStartChat(profile)}
                          className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition-all active:scale-95 cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Message (Match)</span>
                        </button>
                      ) : (
                        <button
                          id={`proximity-like-btn-${profile.id}`}
                          onClick={() => {
                            if (onLike) onLike(profile);
                            else onSelectProfile(profile);
                          }}
                          className="flex-1 py-2 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer"
                        >
                          <Heart className="w-3.5 h-3.5 fill-white" />
                          <span>Liker • Matcher</span>
                        </button>
                      )}
                      <button
                        id={`proximity-view-profile-btn-${profile.id}`}
                        onClick={() => onSelectProfile(profile)}
                        className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-xs cursor-pointer"
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
                Augmentez le rayon du radar ou testez une autre ville/pays via votre numéro de téléphone.
              </p>
              <button
                id="expand-radar-btn"
                onClick={() => setRadarRadius(50)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-rose-200 hover:scale-105 transition-all cursor-pointer"
              >
                Élargir à 50 km
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Active Localization Result Modal (Showing Exact Photo + Country from Phone) */}
      {activeLocationModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-[36px] max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Accent */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-rose-100 text-rose-600">
                  <Compass className="w-5 h-5 animate-spin" />
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Géolocalisation & Pays Identifié
                </h3>
              </div>
              <button
                onClick={() => setActiveLocationModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exact Profile Photo Card & Country Badge */}
            <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-b from-rose-50/80 to-white border border-rose-100 rounded-3xl p-5 shadow-inner">
              <div className="relative">
                {/* Glowing Radar Rings around Exact Photo */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 opacity-30 animate-pulse blur-sm" />
                <img
                  src={activeLocationModal.photoUrl}
                  alt={activeLocationModal.userName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 z-20 text-2xl bg-white rounded-full p-1 shadow-md border-2 border-rose-200">
                  {activeLocationModal.countryFlag}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 flex items-center justify-center gap-1.5">
                  <span>{activeLocationModal.userName}</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
                </h4>
                <p className="text-xs font-bold text-slate-500">Photo de profil certifiée</p>
              </div>

              {/* Identified Country Badge */}
              <div className="w-full bg-white border border-rose-200 rounded-2xl p-3 shadow-xs space-y-1">
                <div className="text-[10px] uppercase font-black tracking-wider text-rose-600 flex items-center justify-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  Pays identifié d'après votre numéro de téléphone :
                </div>
                <div className="text-base font-black text-slate-900 flex items-center justify-center gap-2">
                  <span className="text-xl">{activeLocationModal.countryFlag}</span>
                  <span>{activeLocationModal.countryName}</span>
                  <span className="text-xs font-bold text-slate-400">({activeLocationModal.phoneCode})</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-center gap-2">
                  <Phone className="w-3 h-3 text-rose-500" />
                  <span>{activeLocationModal.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Location Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-slate-400 font-medium block text-[10px]">Position active</span>
                <span className="font-bold text-slate-900">{activeLocationModal.city}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-slate-400 font-medium block text-[10px]">Radar proximité</span>
                <span className="font-bold text-rose-600">{activeLocationModal.profilesCount} profil(s)</span>
              </div>
            </div>

            {/* Confirm & Close Button */}
            <button
              onClick={() => setActiveLocationModal(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black text-xs shadow-lg shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Parfait, Explorer les profils à proximité
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Center User Details Modal */}
      {showCenterUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-[36px] max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-800 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Votre balise de géolocalisation
              </h3>
              <button
                onClick={() => setShowCenterUserModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <img
                  src={userExactPhoto}
                  alt={currentUser?.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-rose-400 shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 text-xl bg-white rounded-full p-0.5 shadow border border-rose-200">
                  {detectedCountry.flag}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">{currentUser?.name}</h4>
                <p className="text-xs font-semibold text-rose-600">
                  {detectedCountry.flag} {detectedCountry.name} ({detectedCountry.code})
                </p>
              </div>

              <div className="w-full text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Téléphone :</span>
                  <span className="font-bold text-slate-800">{phoneNumberInput}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ville actuelle :</span>
                  <span className="font-bold text-slate-800">{currentUser.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Statut Radar :</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Actif & Synchronisé
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCenterUserModal(false);
                handleLaunchLocalization();
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Relancer la localisation
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Selected Pin Profile Details */}
      {selectedPinProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-[36px] max-w-sm w-full p-6 shadow-2xl space-y-4 text-slate-800 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Profil détecté sur le radar
              </h3>
              <button
                onClick={() => setSelectedPinProfile(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <img
                  src={selectedPinProfile.photos?.[0]}
                  alt={selectedPinProfile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-400 shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 text-base bg-white rounded-full px-1 shadow border border-rose-200">
                  {detectCountryFromPhoneNumber(selectedPinProfile.phoneNumber).flag}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">
                  {selectedPinProfile.name}, {selectedPinProfile.age}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{selectedPinProfile.occupation}</p>
                <p className="text-xs font-bold text-rose-600 mt-0.5">
                  📍 {selectedPinProfile.city}
                </p>
              </div>

              <div className="w-full flex items-center gap-2 pt-2">
                {matchedProfileIds.includes(selectedPinProfile.id) ? (
                  <button
                    onClick={() => {
                      const prof = selectedPinProfile;
                      setSelectedPinProfile(null);
                      onStartChat(prof);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Discuter (Match Confirmé)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const prof = selectedPinProfile;
                      setSelectedPinProfile(null);
                      if (onLike) onLike(prof);
                      else onSelectProfile(prof);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>Liker pour Matcher</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    const prof = selectedPinProfile;
                    setSelectedPinProfile(null);
                    onSelectProfile(prof);
                  }}
                  className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Voir profil complet"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
