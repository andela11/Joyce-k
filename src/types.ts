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

export type LoveLanguage =
  | 'words' // Paroles valorisantes
  | 'quality_time' // Moments de qualité
  | 'gifts' // Cadeaux sincères
  | 'acts_of_service' // Petites attentions & Services rendus
  | 'physical_touch'; // Contact & Tendresse

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'femme' | 'homme' | 'non-binaire';
  interestedIn: ('femme' | 'homme' | 'non-binaire')[];
  photos: string[];
  videos?: string[];
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
  voiceBioPrompt?: string;
  voiceBioAudioUrl?: string;
  voiceBioDurationSeconds?: number;
  loveLanguage?: LoveLanguage;
  loveLanguageLabel?: string;
  phoneNumber?: string;
  country?: string;
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
export type CallReceptionPreference = 'all' | 'no_video' | 'no_audio' | 'none';

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
  callReception: CallReceptionPreference; // 'all' | 'no_video' | 'no_audio' | 'none'
  allowAudioCalls: boolean;
  allowVideoCalls: boolean;
}

export interface LoveSticker {
  id: string;
  emoji: string;
  title: string;
  subtitle?: string;
  gradient: string;
  textColor?: string;
  category?: 'love' | 'joy' | 'date' | 'compliment' | 'custom';
  isCustom?: boolean;
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
  mediaType?: 'text' | 'audio' | 'icebreaker' | 'image' | 'sticker';
  audioUrl?: string;
  audioDuration?: number;
  imageBlurred?: boolean;
  stickerData?: LoveSticker;
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
  phoneNumber?: string;
  country?: string;
  provider: 'google' | 'email' | 'guest';
  isLoggedIn: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  targetUserId?: string; // 'all' or specific user ID
  targetUserName?: string;
  type: 'announcement' | 'security' | 'feature' | 'reward' | 'match_alert';
  createdAt: number;
  read?: boolean;
  senderName: string;
  actionTab?: ActiveTab;
}

export interface DateIdea {
  id: string;
  title: string;
  theme: string;
  locationType: string;
  description: string;
  icebreakerQuestion: string;
  estimatedDuration: string;
  suggestedTimeSlot: string;
  tags: string[];
}

export interface SafeDateGuardian {
  contactName: string;
  contactPhone: string;
  meetingLocation: string;
  startTime: string;
  durationMinutes: number;
  active: boolean;
  lastCheckIn?: number;
  status: 'safe' | 'alert' | 'pending';
}

export interface BlindMatchSession {
  partner: UserProfile;
  dailyQuestion: string;
  timeRemainingSeconds: number;
  userRevealed: boolean;
  partnerRevealed: boolean;
  revealed: boolean;
}

export type ActiveTab =
  | 'landing'
  | 'discovery'
  | 'favorites'
  | 'radar'
  | 'messages'
  | 'ai_wingman'
  | 'blind_match'
  | 'privacy'
  | 'profile'
  | 'admin';
