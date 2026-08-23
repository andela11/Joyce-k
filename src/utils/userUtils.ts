import { UserProfile, AuthUser, PrivacySettings, AiAutoResponderSettings } from '../types';
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
 * Saves a user profile to both Firestore and LocalStorage (isolated per UID).
 */
export async function persistUserProfile(profile: UserProfile): Promise<void> {
  if (!profile || !profile.id) return;

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
  } catch (dbErr) {
    console.warn('Firestore user profile sync error:', dbErr);
  }
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
      const normalizedProfile: UserProfile = {
        ...data,
        id: uid,
        name: data.name || 'Membre Joyce-K',
        age: data.age || 25,
        gender: data.gender || 'homme',
        interestedIn: data.interestedIn || ['femme'],
        photos: Array.isArray(data.photos) && data.photos.length > 0
          ? data.photos
          : [GENDER_DEFAULT_AVATARS[data.gender || 'homme'] || GENDER_DEFAULT_AVATARS.homme],
        videos: Array.isArray(data.videos) ? data.videos : [],
        bio: data.bio || '',
        occupation: data.occupation || 'Membre',
        city: data.city || 'Paris, France',
        lat: data.lat || 48.8566,
        lng: data.lng || 2.3522,
        interests: Array.isArray(data.interests) ? data.interests : ['Voyages', 'Musique'],
        relationshipGoal: data.relationshipGoal || 'Relation sérieuse',
        astrologySign: data.astrologySign || 'Balance ♎',
        languages: Array.isArray(data.languages) ? data.languages : ['Français'],
        heightCm: data.heightCm || 175,
        verified: data.verified ?? true,
        isOnline: data.isOnline ?? true,
        lastActiveText: data.lastActiveText || 'En ligne maintenant',
      };
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
      const normalizedProfile: UserProfile = {
        ...data,
        id: uid,
        name: data.name || 'Membre Joyce-K',
        age: data.age || 25,
        gender: data.gender || 'homme',
        interestedIn: data.interestedIn || ['femme'],
        photos: Array.isArray(data.photos) && data.photos.length > 0
          ? data.photos
          : [GENDER_DEFAULT_AVATARS[data.gender || 'homme'] || GENDER_DEFAULT_AVATARS.homme],
        videos: Array.isArray(data.videos) ? data.videos : [],
        bio: data.bio || '',
        occupation: data.occupation || 'Membre',
        city: data.city || 'Paris, France',
        lat: data.lat || 48.8566,
        lng: data.lng || 2.3522,
        interests: Array.isArray(data.interests) ? data.interests : ['Voyages', 'Musique'],
        relationshipGoal: data.relationshipGoal || 'Relation sérieuse',
        astrologySign: data.astrologySign || 'Balance ♎',
        languages: Array.isArray(data.languages) ? data.languages : ['Français'],
        heightCm: data.heightCm || 175,
        verified: data.verified ?? true,
        isOnline: data.isOnline ?? true,
        lastActiveText: data.lastActiveText || 'En ligne maintenant',
      };
      return normalizedProfile;
    }
  } catch (e) {
    console.warn('LocalStorage parse error:', e);
  }

  return null;
}
