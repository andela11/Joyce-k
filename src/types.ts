export type RelationshipGoal =
  | 'Relation sérieuse'
  | 'Rencontres & Découverte'
  | 'Coup de foudre'
  | 'Amitié & Plus si affinités';

export interface LocationData {
  city: string;
  lat: number;
  lng: number;
  fuzzedDistanceKm?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'femme' | 'homme' | 'non-binaire';
  interestedIn: ('femme' | 'homme' | 'non-binaire')[];
  photos: string[];
  bio: string;
  occupation: string;
  city: string;
  lat: number;
  lng: number;
  interests: string[];
  relationshipGoal: RelationshipGoal;
  astrologySign?: string;
  languages?: string[];
  heightCm?: number;
  verified: boolean;
  isOnline: boolean;
  lastActiveText: string;
  promptQuestion?: string;
  promptAnswer?: string;
}

export type PersonalityTone =
  | 'charmant_esprit'
  | 'romantique_doux'
  | 'humour_petillant'
  | 'mysterieux'
  | 'direct_bienveillant';

export type FlirtingLevel = 'subtil' | 'amical' | 'seducteur';

export interface AiAutoResponderSettings {
  enabled: boolean;
  personalityTone: PersonalityTone;
  flirtingLevel: FlirtingLevel;
  awayMessage: string;
  responseDelaySeconds: number;
  allowSharingHobbies: boolean;
  customPromptInstructions: string;
  maxAutoRepliesPerChat: number;
  notifyOnTakeover: boolean;
}

export type DistanceFuzzingLevel = 'exact' | 'approximate' | 'city_only';
export type EphemeralTimer = 'off' | '24h' | '7d';

export interface PrivacySettings {
  ghostMode: boolean; // Hide from public radar
  distanceFuzzing: DistanceFuzzingLevel; // exact / +2-5km / city only
  blurPhotosUntilMatch: boolean; // Blurred photo until both like
  ephemeralMessages: EphemeralTimer;
  antiScreenshot: boolean;
  pinLockEnabled: boolean;
  pinCode?: string;
  readReceipts: boolean;
  onlineStatusVisible: boolean;
  blockedUsers: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
  isAiGenerated?: boolean;
  isRead: boolean;
  expiresAt?: number;
  mediaType?: 'text' | 'audio' | 'icebreaker' | 'image';
  audioDuration?: number;
  imageBlurred?: boolean;
}

export interface Conversation {
  id: string;
  participant: UserProfile;
  lastMessage?: ChatMessage;
  unreadCount: number;
  matchedAt: number;
  isAiAutoResponding: boolean;
  autoRepliesCount: number;
  commonInterests: string[];
}

export interface CompatibilityReport {
  score: number;
  summary: string;
  strengths: string[];
  icebreaker: string;
  commonInterests: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  provider: 'google' | 'email' | 'guest';
  isLoggedIn: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

export type ActiveTab =
  | 'landing'
  | 'discovery'
  | 'favorites'
  | 'radar'
  | 'messages'
  | 'ai_wingman'
  | 'privacy'
  | 'profile'
  | 'admin';
