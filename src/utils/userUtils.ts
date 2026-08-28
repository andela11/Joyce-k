import { UserProfile, AuthUser, PrivacySettings, AiAutoResponderSettings, Conversation } from '../types';
import { db, doc, getDoc, setDoc } from '../lib/firebase';
import { INITIAL_PRIVACY_SETTINGS, INITIAL_AI_SETTINGS } from '../data/mockProfiles';

export const SUPER_ADMIN_EMAIL = 'andelacyrille11@gmail.com';

/**
 * Strict single administrator validation.
 * ONLY andelacyrille11@gmail.com is granted administrator rights.
 * All other accounts are strictly standard users.
 */
export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

export const GENDER_DEFAULT_AVATARS = {
  homme: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
  femme: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  'non-binaire': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
};

/**
 * Creates a dedicated, unique UserProfile for a newly authenticated user.
 */
export function createDedicatedUserProfile(
  user: AuthUser,
  initialData?: Partial<UserProfile>
): UserProfile {
  const gender = initialData?.gender || 'homme';
  const name = user.name.replace(/\s*\(Admin\)$/i, '').trim() || 'Nouveau Membre';
  const defaultPhoto = user.photoUrl || GENDER_DEFAULT_AVATARS[gender] || GENDER_DEFAULT_AVATARS.homme;

  const defaultInterestedIn: ('femme' | 'homme' | 'non-binaire')[] =
    initialData?.interestedIn ||
    (gender === 'homme' ? ['femme'] : gender === 'femme' ? ['homme'] : ['femme', 'homme']);

  return {
    id: user.id,
    name,
    age: initialData?.age || 25,
    gender,
    interestedIn: defaultInterestedIn,
    photos:
      initialData?.photos && initialData.photos.length > 0
        ? initialData.photos
        : [defaultPhoto],
    videos: initialData?.videos || [],
    bio:
      initialData?.bio ||
      `Bonjour ! Je m'appelle ${name}, ravi(e) d'échanger et de faire des rencontres authentiques sur Joyce-K.`,
    occupation: initialData?.occupation || 'Membre Joyce-K',
    city: initialData?.city || 'Paris, France',
    lat: initialData?.lat || 48.8566,
    lng: initialData?.lng || 2.3522,
    interests:
      initialData?.interests && initialData.interests.length > 0
        ? initialData.interests
        : ['Café & Brunch', 'Voyages', 'Musique', 'Cuisine du monde'],
    relationshipGoal: initialData?.relationshipGoal || 'Relation sérieuse',
    astrologySign: initialData?.astrologySign || 'Balance ♎',
    languages: initialData?.languages || ['Français'],
    heightCm: initialData?.heightCm || 175,
    verified: true,
    isOnline: true,
    lastActiveText: 'En ligne maintenant',
    promptQuestion: initialData?.promptQuestion || 'Le rendez-vous idéal pour moi c’est...',
    promptAnswer:
      initialData?.promptAnswer ||
      'Un lieu chaleureux, une bonne discussion sans filtre et beaucoup de rires.',
    voiceBioPrompt: initialData?.voiceBioPrompt || 'Ce qui me fait craquer...',
    voiceBioDurationSeconds: initialData?.voiceBioDurationSeconds || 10,
    loveLanguage: initialData?.loveLanguage || 'quality_time',
    loveLanguageLabel: initialData?.loveLanguageLabel || 'Moments de qualité',
    phoneNumber: initialData?.phoneNumber || user?.phoneNumber || '+237 6 99 88 77 66',
    country: initialData?.country || user?.country || 'Cameroun',
  };
}

/**
 * Storage key helper scoped by user ID to prevent account data collisions.
 */
export function getScopedKey(uid: string, key: string): string {
  return `joycek_${key}_${uid}`;
}

/**
 * Load user-scoped conversations
 */
export function loadUserConversations(uid?: string | null): Conversation[] {
  if (!uid) return [];
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'convs'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped conversations:', e);
  }
  return [];
}

/**
 * Save user-scoped conversations
 */
export function saveUserConversations(uid: string | undefined | null, convs: Conversation[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'convs'), JSON.stringify(convs));
  } catch (e) {
    console.warn('Error saving scoped conversations:', e);
  }
}

/**
 * Load user-scoped messages
 */
export function loadUserMessages(uid?: string | null): Record<string, any[]> {
  if (!uid) return {};
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'messages'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped messages:', e);
  }
  return {};
}

/**
 * Save user-scoped messages
 */
export function saveUserMessages(uid: string | undefined | null, messages: Record<string, any[]>): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'messages'), JSON.stringify(messages));
  } catch (e) {
    console.warn('Error saving scoped messages:', e);
  }
}

/**
 * Load user-scoped favorites
 */
export function loadUserFavorites(uid?: string | null): string[] {
  if (!uid) return [];
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'favorites'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped favorites:', e);
  }
  return [];
}

/**
 * Save user-scoped favorites
 */
export function saveUserFavorites(uid: string | undefined | null, favorites: string[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'favorites'), JSON.stringify(favorites));
  } catch (e) {
    console.warn('Error saving scoped favorites:', e);
  }
}

/**
 * Load user-scoped liked profiles
 */
export function loadUserLiked(uid?: string | null): string[] {
  if (!uid) return [];
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'liked'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped liked:', e);
  }
  return [];
}

/**
 * Save user-scoped liked profiles
 */
export function saveUserLiked(uid: string | undefined | null, liked: string[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'liked'), JSON.stringify(liked));
  } catch (e) {
    console.warn('Error saving scoped liked:', e);
  }
}

/**
 * Load user-scoped passed profiles
 */
export function loadUserPassed(uid?: string | null): string[] {
  if (!uid) return [];
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'passed'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped passed:', e);
  }
  return [];
}

/**
 * Save user-scoped passed profiles
 */
export function saveUserPassed(uid: string | undefined | null, passed: string[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'passed'), JSON.stringify(passed));
  } catch (e) {
    console.warn('Error saving scoped passed:', e);
  }
}

/**
 * Load user-scoped privacy settings
 */
export function loadUserPrivacy(uid?: string | null): PrivacySettings {
  if (!uid) return INITIAL_PRIVACY_SETTINGS;
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'privacy'));
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_PRIVACY_SETTINGS,
        ...parsed,
        blockedUsers: Array.isArray(parsed.blockedUsers) ? parsed.blockedUsers : [],
      };
    }
  } catch (e) {
    console.warn('Error loading scoped privacy:', e);
  }
  return INITIAL_PRIVACY_SETTINGS;
}

/**
 * Save user-scoped privacy settings
 */
export function saveUserPrivacy(uid: string | undefined | null, privacy: PrivacySettings): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'privacy'), JSON.stringify(privacy));
  } catch (e) {
    console.warn('Error saving scoped privacy:', e);
  }
}

/**
 * Load user-scoped AI responder settings
 */
export function loadUserAiSettings(uid?: string | null): AiAutoResponderSettings {
  if (!uid) return INITIAL_AI_SETTINGS;
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'ai'));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Error loading scoped ai settings:', e);
  }
  return INITIAL_AI_SETTINGS;
}

/**
 * Save user-scoped AI responder settings
 */
export function saveUserAiSettings(uid: string | undefined | null, ai: AiAutoResponderSettings): void {
  if (!uid) return;
  try {
    localStorage.setItem(getScopedKey(uid, 'ai'), JSON.stringify(ai));
  } catch (e) {
    console.warn('Error saving scoped ai settings:', e);
  }
}

/**
 * Determines whether a target profile matches the gender matching rules for the current user.
 * Rule: Men always encounter Women, Women always encounter Men.
 */
export function isGenderCompatible(
  currentUser: Partial<UserProfile> | null | undefined,
  targetProfile: Partial<UserProfile> | null | undefined
): boolean {
  if (!currentUser || !targetProfile) return true;
  
  const userGender = currentUser.gender || 'homme';
  const targetGender = targetProfile.gender || 'femme';

  // Strict Rule: Men always meet Women and vice-versa
  if (userGender === 'homme') {
    return targetGender === 'femme';
  }
  if (userGender === 'femme') {
    return targetGender === 'homme';
  }

  // Non-binary or custom interestedIn preferences
  if (currentUser.interestedIn && currentUser.interestedIn.length > 0) {
    return currentUser.interestedIn.includes(targetGender as any);
  }

  return true;
}

/**
 * Helper to normalize a profile object safely while preserving all customized user fields.
 */
function normalizeProfileObject(uid: string, data: Partial<UserProfile>): UserProfile {
  const gender = data.gender || 'homme';
  const defaultPhoto = GENDER_DEFAULT_AVATARS[gender] || GENDER_DEFAULT_AVATARS.homme;

  const defaultInterestedIn: ('femme' | 'homme' | 'non-binaire')[] =
    gender === 'homme' ? ['femme'] : gender === 'femme' ? ['homme'] : ['femme', 'homme'];

  return {
    ...data,
    id: uid,
    name: data.name || 'Membre Joyce-K',
    age: data.age || 25,
    gender,
    interestedIn: data.interestedIn && data.interestedIn.length > 0 ? data.interestedIn : defaultInterestedIn,
    photos:
      Array.isArray(data.photos) && data.photos.length > 0
        ? data.photos
        : [defaultPhoto],
    videos: Array.isArray(data.videos) ? data.videos : [],
    bio: data.bio || '',
    occupation: data.occupation || 'Membre Joyce-K',
    city: data.city || 'Paris, France',
    lat: data.lat || 48.8566,
    lng: data.lng || 2.3522,
    interests:
      Array.isArray(data.interests) && data.interests.length > 0
        ? data.interests
        : ['Voyages', 'Musique', 'Café & Brunch'],
    relationshipGoal: data.relationshipGoal || 'Relation sérieuse',
    astrologySign: data.astrologySign || 'Balance ♎',
    languages:
      Array.isArray(data.languages) && data.languages.length > 0
        ? data.languages
        : ['Français'],
    heightCm: data.heightCm || 175,
    verified: data.verified ?? true,
    isOnline: data.isOnline ?? true,
    lastActiveText: data.lastActiveText || 'En ligne maintenant',
    promptQuestion: data.promptQuestion || 'Le rendez-vous idéal pour moi c’est...',
    promptAnswer:
      data.promptAnswer ||
      'Un lieu chaleureux, une bonne discussion sans filtre et beaucoup de rires.',
    voiceBioPrompt: data.voiceBioPrompt || 'Ce qui me fait craquer...',
    voiceBioDurationSeconds: data.voiceBioDurationSeconds || 10,
    loveLanguage: data.loveLanguage || 'quality_time',
    loveLanguageLabel: data.loveLanguageLabel || 'Moments de qualité',
    phoneNumber: data.phoneNumber || '+237 6 99 88 77 66',
    country: data.country || 'Cameroun',
  };
}

/**
 * Clears all cached guest session data and temporary keys before initializing an authenticated session.
 */
export function clearGuestCachedData(): void {
  try {
    const guestKeys = [
      getScopedKey('guest_user', 'profile'),
      getScopedKey('guest_user', 'convs'),
      getScopedKey('guest_user', 'messages'),
      getScopedKey('guest_user', 'favorites'),
      getScopedKey('guest_user', 'liked'),
      getScopedKey('guest_user', 'passed'),
      getScopedKey('guest_user', 'privacy'),
      getScopedKey('guest_user', 'ai'),
      'joycek_guest_session',
      'joycek_temp_profile',
    ];
    guestKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
  } catch (e) {
    console.warn('Error clearing guest cache:', e);
  }
}

/**
 * Saves a user profile to both Firestore and LocalStorage (isolated per UID).
 */
export async function persistUserProfile(profile: UserProfile): Promise<void> {
  if (!profile || !profile.id || profile.id === 'guest_user') return;

  // 1. LocalStorage scoped by UID
  try {
    localStorage.setItem(getScopedKey(profile.id, 'profile'), JSON.stringify(profile));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 2. Firestore Document Sync
  try {
    const userDocRef = doc(db, 'users', profile.id);
    await setDoc(
      userDocRef,
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore user profile sync warning:', err);
  }
}

/**
 * Generates a clean, deterministic, unique UID derived from a normalized email address.
 * Ensures strict uniqueness and isolation per account without generic fallbacks.
 */
export function generateUniqueUidFromEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const safePrefix = clean.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'u';
  return `uid_${safePrefix}_${hex}`;
}

/**
 * Fetches the user profile: checks Firestore first, then local scoped storage.
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;

  // 1. Try Firestore
  try {
    const userDocSnap = await getDoc(doc(db, 'users', uid));
    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as Partial<UserProfile>;
      const normalizedProfile = normalizeProfileObject(uid, data);
      // Also cache in scoped local storage
      localStorage.setItem(getScopedKey(uid, 'profile'), JSON.stringify(normalizedProfile));
      return normalizedProfile;
    }
  } catch (dbErr) {
    console.warn('Firestore fetch profile error:', dbErr);
  }

  // 2. Fallback to scoped LocalStorage
  try {
    const saved = localStorage.getItem(getScopedKey(uid, 'profile'));
    if (saved) {
      const data = JSON.parse(saved) as Partial<UserProfile>;
      const normalizedProfile = normalizeProfileObject(uid, data);
      return normalizedProfile;
    }
  } catch (e) {
    console.warn('LocalStorage parse error:', e);
  }

  return null;
}
