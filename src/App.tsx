/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { DiscoverySwipe } from './components/DiscoverySwipe';
import { ProximityRadar } from './components/ProximityRadar';
import { MessagingCenter } from './components/MessagingCenter';
import { AiWingmanCenter } from './components/AiWingmanCenter';
import { PrivacySecurityCenter } from './components/PrivacySecurityCenter';
import { ProfileEditor } from './components/ProfileEditor';
import { CompatibilityModal } from './components/CompatibilityModal';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FavoritesView } from './components/FavoritesView';
import { ActiveCallModal } from './components/ActiveCallModal';
import { BlindMatchView } from './components/BlindMatchView';
import {
  UserProfile,
  ActiveTab,
  PrivacySettings,
  AiAutoResponderSettings,
  Conversation,
  ChatMessage,
  AuthUser,
  AppNotification,
  LoveSticker,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_PRIVACY_SETTINGS,
  INITIAL_AI_SETTINGS,
  MOCK_PROFILES,
} from './data/mockProfiles';
import {
  createDedicatedUserProfile,
  fetchUserProfile,
  persistUserProfile,
  clearGuestCachedData,
  getScopedKey,
  GENDER_DEFAULT_AVATARS,
  checkIsAdmin,
  loadUserConversations,
  saveUserConversations,
  loadUserMessages,
  saveUserMessages,
  loadUserFavorites,
  saveUserFavorites,
  loadUserLiked,
  saveUserLiked,
  loadUserPassed,
  saveUserPassed,
  loadUserPrivacy,
  saveUserPrivacy,
  loadUserAiSettings,
  saveUserAiSettings,
} from './utils/userUtils';
import { auth, onAuthStateChanged, signOut, db, collection, onSnapshot } from './lib/firebase';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        const isAdmin = checkIsAdmin(parsed.email);
        return {
          ...parsed,
          isAdmin,
          name: isAdmin ? `${parsed.name.replace(/\s*\(Admin\)$/i, '')} (Admin)` : parsed.name.replace(/\s*\(Admin\)$/i, ''),
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const savedAuth = localStorage.getItem('amour_affinites_auth');
      if (savedAuth) {
        const parsedAuth: AuthUser = JSON.parse(savedAuth);
        const savedScopedProfile = localStorage.getItem(getScopedKey(parsedAuth.id, 'profile'));
        if (savedScopedProfile) {
          return JSON.parse(savedScopedProfile);
        }
        return createDedicatedUserProfile(parsedAuth);
      }
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
    }
    return createDedicatedUserProfile({
      id: 'guest_user',
      name: 'Visiteur',
      email: 'visiteur@joycek.app',
      photoUrl: GENDER_DEFAULT_AVATARS.homme,
      provider: 'guest',
      isLoggedIn: false,
      createdAt: new Date().toISOString(),
    });
  });

  // Privacy Settings (strictly scoped per user)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() =>
    loadUserPrivacy(authUser?.id)
  );

  // AI Auto-Responder Settings (strictly scoped per user)
  const [aiSettings, setAiSettings] = useState<AiAutoResponderSettings>(() =>
    loadUserAiSettings(authUser?.id)
  );

  // Available Profiles
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);

  // Favorites Profile IDs (strictly scoped per user)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    loadUserFavorites(authUser?.id)
  );

  // Liked Profile IDs (strictly scoped per user)
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>(() =>
    loadUserLiked(authUser?.id)
  );

  // Passed / Unliked Profile IDs (strictly scoped per user)
  const [passedProfileIds, setPassedProfileIds] = useState<string[]>(() =>
    loadUserPassed(authUser?.id)
  );

  // Conversations (strictly scoped per user)
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadUserConversations(authUser?.id)
  );

  // Messages (strictly scoped per user)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() =>
    loadUserMessages(authUser?.id)
  );

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const userConvs = loadUserConversations(authUser?.id);
    return userConvs.length > 0 ? userConvs[0].id : null;
  });

  // Switch all active application state to match a target user profile
  const switchUserData = useCallback((targetAuthUser: AuthUser | null, profile?: UserProfile | null) => {
    if (targetAuthUser) {
      // Clear any guest/anonymous cache before initializing authenticated session
      clearGuestCachedData();
      const uid = targetAuthUser.id;
      const loadedProfile = profile
        ? { ...profile, id: uid }
        : createDedicatedUserProfile(targetAuthUser);
      setCurrentUser(loadedProfile);
      const userConvs = loadUserConversations(uid);
      setConversations(userConvs);
      setMessages(loadUserMessages(uid));
      setFavoriteIds(loadUserFavorites(uid));
      setLikedProfileIds(loadUserLiked(uid));
      setPassedProfileIds(loadUserPassed(uid));
      setPrivacySettings(loadUserPrivacy(uid));
      setAiSettings(loadUserAiSettings(uid));
      setActiveConversationId(userConvs.length > 0 ? userConvs[0].id : null);
    } else {
      clearGuestCachedData();
      const guestProfile = createDedicatedUserProfile({
        id: 'guest_user',
        name: 'Visiteur',
        email: 'visiteur@joycek.app',
        photoUrl: GENDER_DEFAULT_AVATARS.homme,
        provider: 'guest',
        isLoggedIn: false,
        createdAt: new Date().toISOString(),
      });
      setCurrentUser(guestProfile);
      setConversations([]);
      setMessages({});
      setFavoriteIds([]);
      setLikedProfileIds([]);
      setPassedProfileIds([]);
      setPrivacySettings(INITIAL_PRIVACY_SETTINGS);
      setAiSettings(INITIAL_AI_SETTINGS);
      setActiveConversationId(null);
    }
  }, []);

  // Sync user profile from Firestore / LocalStorage on mount or when authUser changes
  useEffect(() => {
    if (!authUser?.id) return;
    fetchUserProfile(authUser.id).then((profile) => {
      if (profile && profile.id === authUser.id) {
        setCurrentUser(profile);
      }
    });
  }, [authUser?.id]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Step 1: Explicitly clear cached guest profile and artifacts
        clearGuestCachedData();

        const uid = fbUser.uid;
        const email = fbUser.email || '';
        const isAdmin = checkIsAdmin(email);

        // Fetch from Firestore first (source of truth)
        const remoteProfile = await fetchUserProfile(uid);

        // Check local scoped profile second
        let localProfile: UserProfile | null = null;
        const localScoped = localStorage.getItem(getScopedKey(uid, 'profile'));
        if (localScoped) {
          try {
            const parsed = JSON.parse(localScoped);
            if (parsed && parsed.id === uid) {
              localProfile = parsed;
            }
          } catch {
            // ignore
          }
        }

        const resolvedProfile = remoteProfile || localProfile;

        const resolvedName =
          resolvedProfile?.name ||
          fbUser.displayName ||
          email.split('@')[0] ||
          'Membre Joyce-K';
        const resolvedPhoto =
          resolvedProfile?.photos?.[0] ||
          fbUser.photoURL ||
          (resolvedProfile?.gender
            ? GENDER_DEFAULT_AVATARS[resolvedProfile.gender]
            : GENDER_DEFAULT_AVATARS.homme);

        const providerId = fbUser.providerData?.[0]?.providerId || '';
        const provider: 'email' | 'google' | 'guest' =
          providerId.includes('google') ? 'google' : 'email';

        const currentAuth: AuthUser = {
          id: uid,
          email,
          name: isAdmin ? `${resolvedName.replace(/\s*\(Admin\)$/i, '')} (Admin)` : resolvedName.replace(/\s*\(Admin\)$/i, ''),
          photoUrl: resolvedPhoto,
          provider,
          isLoggedIn: true,
          isAdmin,
          createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
        };

        setAuthUser(currentAuth);
        try {
          localStorage.setItem('amour_affinites_auth', JSON.stringify(currentAuth));
        } catch (e) {
          console.warn('Error saving auth to storage:', e);
        }

        if (resolvedProfile) {
          const syncedProfile = { ...resolvedProfile, id: uid };
          switchUserData(currentAuth, syncedProfile);
          await persistUserProfile(syncedProfile);
        } else {
          // Generate a completely unique profile document for this new UID
          const newProfile = createDedicatedUserProfile(currentAuth, {
            name: resolvedName,
            photos: [resolvedPhoto],
          });
          switchUserData(currentAuth, newProfile);
          await persistUserProfile(newProfile);
        }
      }
    });

    return () => unsubscribe();
  }, [switchUserData]);

  // Firestore Registered Users Real-time Sync for Discovery & Radar
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const dbList: UserProfile[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Partial<UserProfile>;
              const uid = docSnap.id;
              // Do not include current active user in swipe discovery deck
              if (uid && uid !== authUser?.id && uid !== currentUser?.id) {
                const gender = data.gender || 'homme';
                const defaultPhoto = GENDER_DEFAULT_AVATARS[gender] || GENDER_DEFAULT_AVATARS.homme;
                dbList.push({
                  ...data,
                  id: uid,
                  name: data.name || 'Membre Joyce-K',
                  age: data.age || 25,
                  gender,
                  interestedIn: data.interestedIn || (gender === 'homme' ? ['femme'] : ['homme']),
                  photos:
                    Array.isArray(data.photos) && data.photos.length > 0
                      ? data.photos
                      : [defaultPhoto],
                  videos: Array.isArray(data.videos) ? data.videos : [],
                  bio: data.bio || 'Membre vérifié sur Joyce-K',
                  occupation: data.occupation || 'Membre',
                  city: data.city || 'Yaoundé, Cameroun',
                  lat: data.lat || 3.848,
                  lng: data.lng || 11.5021,
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
                  promptAnswer: data.promptAnswer || 'Un lieu chaleureux et une belle discussion.',
                  phoneNumber: data.phoneNumber || '+237 6 99 88 77 66',
                  country: data.country || 'Cameroun',
                } as UserProfile);
              }
            });

            setProfiles(() => {
              const baseMocks = MOCK_PROFILES.filter(
                (m) =>
                  m.id !== authUser?.id &&
                  m.id !== currentUser?.id &&
                  !dbList.some((dbU) => dbU.id === m.id)
              );
              return [...dbList, ...baseMocks];
            });
          }
        },
        (err) => {
          console.warn('Firestore users sync warning:', err);
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore users sync setup error:', err);
    }
  }, [authUser?.id, currentUser?.id]);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback initial announcement
    }
    return [
      {
        id: 'notif_welcome',
        title: 'Bienvenue sur Joyce-K !',
        message: 'Découvrez des profils vérifiés 100% authentiques sans filtres trompeurs.',
        targetUserId: 'all',
        type: 'announcement',
        createdAt: Date.now() - 3600000 * 3,
        read: false,
        senderName: 'Équipe Joyce-K',
        actionTab: 'discovery',
      },
      {
        id: 'notif_security',
        title: 'Protection Anti-IA Active 🛡️',
        message: 'Vos photos sont sécurisées et scannées par notre moteur anti-deepfake.',
        targetUserId: 'all',
        type: 'security',
        createdAt: Date.now() - 3600000 * 8,
        read: true,
        senderName: 'Sécurité Joyce-K',
        actionTab: 'privacy',
      },
    ];
  });

  // Save notifications to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('amour_affinites_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications:', e);
    }
  }, [notifications]);

  // Firestore Notifications Real-time Sync
  useEffect(() => {
    import('./lib/firebase').then(({ db, collection, onSnapshot }) => {
      try {
        const unsub = onSnapshot(collection(db, 'notifications'), (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                title: data.title || '',
                message: data.message || '',
                targetUserId: data.targetUserId || 'all',
                targetUserName: data.targetUserName,
                type: data.type || 'announcement',
                createdAt: data.createdAt || Date.now(),
                read: data.read || false,
                senderName: data.senderName || 'Équipe Joyce-K',
                actionTab: data.actionTab || 'discovery',
              });
            });
            list.sort((a, b) => b.createdAt - a.createdAt);
            setNotifications(list);
          }
        });
        return () => unsub();
      } catch (err) {
        console.warn('Firestore notifications sync warning:', err);
      }
    });
  }, []);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSendNotificationLocal = (newNotif: AppNotification) => {
    setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
  };

  // Modals
  const [compatibilityProfile, setCompatibilityProfile] = useState<UserProfile | null>(null);
  const [celebrationProfile, setCelebrationProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    document.title = 'joyce-k';
  }, []);

  // Global Keyboard Navigation between main sections and tabs
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for Alt/Cmd combinations or standalone navigation keys
      if (e.altKey || (!e.ctrlKey && !e.metaKey)) {
        const key = e.key.toLowerCase();

        // Numeric keys 1-7 for tabs
        if (key === '1') {
          e.preventDefault();
          setActiveTab(authUser ? 'discovery' : 'landing');
        } else if (key === '2') {
          e.preventDefault();
          setActiveTab('favorites');
        } else if (key === '3') {
          e.preventDefault();
          setActiveTab('radar');
        } else if (key === '4') {
          e.preventDefault();
          setActiveTab('messages');
        } else if (key === '5') {
          e.preventDefault();
          setActiveTab('ai_wingman');
        } else if (key === '6') {
          e.preventDefault();
          setActiveTab('privacy');
        } else if (key === '7') {
          e.preventDefault();
          setActiveTab('profile');
        } else if (key === 'h' && !e.altKey) {
          // 'H' -> Home / Landing
          e.preventDefault();
          setActiveTab('landing');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('amour_affinites_auth', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('amour_affinites_auth');
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser?.id && currentUser && currentUser.id === authUser.id) {
      persistUserProfile(currentUser);
    }
  }, [authUser?.id, currentUser]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserPrivacy(authUser.id, privacySettings);
    }
  }, [authUser?.id, privacySettings]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserAiSettings(authUser.id, aiSettings);
    }
  }, [authUser?.id, aiSettings]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserConversations(authUser.id, conversations);
    }
  }, [authUser?.id, conversations]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserMessages(authUser.id, messages);
    }
  }, [authUser?.id, messages]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserFavorites(authUser.id, favoriteIds);
    }
  }, [authUser?.id, favoriteIds]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserLiked(authUser.id, likedProfileIds);
    }
  }, [authUser?.id, likedProfileIds]);

  useEffect(() => {
    if (authUser?.id) {
      saveUserPassed(authUser.id, passedProfileIds);
    }
  }, [authUser?.id, passedProfileIds]);

  // Total unread messages count
  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Mark a conversation as read (clears unread count and marks messages as read)
  const handleMarkConversationAsRead = useCallback((conversationId: string) => {
    setConversations((prev) => {
      const target = prev.find((c) => c.id === conversationId);
      if (!target || (target.unreadCount || 0) === 0) {
        return prev;
      }
      return prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    });
    setMessages((prev) => {
      const convMsgs = prev[conversationId];
      if (!convMsgs) return prev;
      const hasUnread = convMsgs.some((m) => !m.isRead);
      if (!hasUnread) return prev;
      return {
        ...prev,
        [conversationId]: convMsgs.map((m) => (m.isRead ? m : { ...m, isRead: true })),
      };
    });
  }, []);

  // Automatically mark conversation as read when activeTab is messages or activeConversationId changes
  useEffect(() => {
    if (activeTab === 'messages' && activeConversationId) {
      handleMarkConversationAsRead(activeConversationId);
    }
  }, [activeTab, activeConversationId, handleMarkConversationAsRead]);

  // List of profile IDs that are actively matched (have a mutual match / conversation)
  const matchedProfileIds = (conversations || []).map((c) => c.participant?.id).filter(Boolean);

  // Toggle favorite status of a profile
  const handleToggleFavorite = (profileId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
    );
  };

  // Quick toggle AI Auto-responder
  const handleToggleAi = () => {
    setAiSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  // Handle Like on a profile (Swipe Right or Heart click)
  const handleLikeProfile = (profile: UserProfile, isSuperLike = false) => {
    setLikedProfileIds((prev) => (prev.includes(profile.id) ? prev : [...prev, profile.id]));
    setPassedProfileIds((prev) => prev.filter((id) => id !== profile.id));

    // Check if match already exists
    const existingConv = conversations.find((c) => c.participant.id === profile.id);
    if (!existingConv) {
      const newConvId = `conv_${profile.id}`;
      const userInterests = currentUser?.interests || [];
      const profileInterests = profile.interests || [];
      const commonInterests = userInterests.filter((i) =>
        profileInterests.includes(i)
      );

      const newConv: Conversation = {
        id: newConvId,
        participant: profile,
        unreadCount: 0,
        matchedAt: Date.now(),
        isAiAutoResponding: true,
        autoRepliesCount: 0,
        commonInterests,
      };

      setConversations((prev) => [newConv, ...(prev || [])]);
      setMessages((prev) => ({
        ...prev,
        [newConvId]: [],
      }));

      // Trigger Celebration Match popup
      setCelebrationProfile(profile);
    }
  };

  // Handle Pass / Refuse on a profile (Swipe Left or Cross click)
  const handlePassProfile = (profile: UserProfile) => {
    setPassedProfileIds((prev) => (prev.includes(profile.id) ? prev : [...prev, profile.id]));
    setLikedProfileIds((prev) => prev.filter((id) => id !== profile.id));
    // Pass strictly records rejection - no match created
  };

  // Send message in active chat
  const handleSendMessage = (
    conversationId: string,
    text: string,
    isAiGenerated = false,
    mediaType: 'text' | 'audio' | 'icebreaker' | 'image' | 'sticker' = 'text',
    audioUrl?: string,
    audioDuration?: number,
    stickerData?: LoveSticker
  ) => {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      conversationId,
      senderId: 'current_user',
      receiverId: 'partner',
      text,
      timestamp: Date.now(),
      isSelf: true,
      isAiGenerated,
      isRead: false,
      mediaType,
      audioUrl,
      audioDuration,
      stickerData,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation last message & reset unread
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMessage,
            unreadCount: 0,
          };
        }
        return c;
      })
    );

    // Simulate partner reading the message after 1.8 seconds
    setTimeout(() => {
      setMessages((prev) => {
        const convMsgs = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: convMsgs.map((m) =>
            m.id === messageId ? { ...m, isRead: true } : m
          ),
        };
      });
    }, 1800);

    // If sent to a new match, simulate an incoming reply after a realistic delay
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv && !isAiGenerated) {
      setTimeout(() => {
        const partnerReplies = [
          `Merci pour ton message ! J'adore ton énergie :) Dis-moi, tu es plutôt du matin ou du soir pour nos sorties ?`,
          `Haha tellement vrai ! On a vraiment les mêmes centres d'intérêt, ça fait super plaisir.`,
          `Super phrase d'accroche ! Ça te dirait qu'on s'organise un verre cette semaine ?`,
          `J'adore ! C'est exactement ce que je cherchais ici.`,
        ];
        const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];

        const isUserCurrentlyInChat = activeTab === 'messages' && activeConversationId === conversationId;
        const incomingMsg: ChatMessage = {
          id: `msg_inc_${Date.now()}`,
          conversationId,
          senderId: conv.participant.id,
          receiverId: 'current_user',
          text: randomReply,
          timestamp: Date.now(),
          isSelf: false,
          isRead: isUserCurrentlyInChat,
          mediaType: 'text',
        };

        setMessages((prev) => {
          const updatedList = (prev[conversationId] || []).map((m) => ({
            ...m,
            isRead: true,
          }));
          return {
            ...prev,
            [conversationId]: [...updatedList, incomingMsg],
          };
        });

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: incomingMsg,
                  unreadCount: isUserCurrentlyInChat ? 0 : (c.unreadCount || 0) + 1,
                }
              : c
          )
        );
      }, 3500);
    }
  };

  // Block User (preserves conversation state in blocked mode so user can unblock anytime)
  const handleBlockUser = (userId: string) => {
    setPrivacySettings((prev) => {
      const currentBlocked = prev.blockedUsers || [];
      if (currentBlocked.includes(userId)) return prev;
      return {
        ...prev,
        blockedUsers: [...currentBlocked, userId],
      };
    });
  };

  // Unblock user
  const handleUnblockUser = (userId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedUsers: (prev.blockedUsers || []).filter((id) => id !== userId),
    }));
  };

  // Start chat with a profile from compatibility, match modal or blind match
  const handleStartChatWithProfile = (
    profile: UserProfile,
    initialMessage?: string,
    preloadedMessages?: ChatMessage[]
  ) => {
    let conv = (conversations || []).find((c) => c.participant?.id === profile.id);
    let convId = conv ? conv.id : `conv_${profile.id}`;

    // Ensure partner is included in matched/favorites list
    if (!favoriteIds.includes(profile.id)) {
      setFavoriteIds((prev) => [...prev, profile.id]);
    }

    if (!conv) {
      const userInterests = currentUser?.interests || [];
      const profileInterests = profile.interests || [];
      const commonInterests = userInterests.filter((i) =>
        profileInterests.includes(i)
      );
      const newConv: Conversation = {
        id: convId,
        participant: profile,
        unreadCount: 0,
        matchedAt: Date.now(),
        isAiAutoResponding: true,
        autoRepliesCount: 0,
        commonInterests,
        lastMessage:
          preloadedMessages && preloadedMessages.length > 0
            ? preloadedMessages[preloadedMessages.length - 1]
            : undefined,
      };
      setConversations((prev) => [newConv, ...(prev || [])]);
      setMessages((prev) => ({
        ...prev,
        [convId]: preloadedMessages && preloadedMessages.length > 0 ? preloadedMessages : [],
      }));
    } else {
      // Ensure existing conversation participant matches the exact profile object
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              participant: profile,
              lastMessage:
                preloadedMessages && preloadedMessages.length > 0
                  ? preloadedMessages[preloadedMessages.length - 1]
                  : c.lastMessage,
            };
          }
          return c;
        })
      );

      if (preloadedMessages && preloadedMessages.length > 0) {
        setMessages((prev) => {
          const currentList = prev[convId] || [];
          const merged = [...currentList];
          for (const msg of preloadedMessages) {
            if (!merged.some((m) => m.id === msg.id)) {
              merged.push({ ...msg, conversationId: convId });
            }
          }
          return { ...prev, [convId]: merged };
        });
      }
    }

    if (initialMessage) {
      handleSendMessage(convId, initialMessage, false, 'text');
    }

    setActiveConversationId(convId);
    setCompatibilityProfile(null);
    setCelebrationProfile(null);
    setActiveTab('messages');
  };

  // Start Call with Profile from anywhere in the app
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    partner: UserProfile;
  } | null>(null);

  const handleStartCallWithProfile = (profile: UserProfile, type: 'audio' | 'video') => {
    setActiveCall({ type, partner: profile });
  };

  // Handle Auth Login/Signup Success
  const handleLoginSuccess = async (user: AuthUser, fullProfile?: UserProfile) => {
    // Clear any guest/anonymous session artifacts
    clearGuestCachedData();

    setAuthUser(user);
    try {
      localStorage.setItem('amour_affinites_auth', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage auth save error:', e);
    }

    const fetched = !fullProfile ? await fetchUserProfile(user.id) : null;
    const baseProfile = fullProfile || fetched || createDedicatedUserProfile(user);
    const profileToUse: UserProfile = {
      ...baseProfile,
      id: user.id,
    };

    switchUserData(user, profileToUse);
    await persistUserProfile(profileToUse);

    // Direct Redirection: Admin -> 'admin', User -> 'discovery' (profile swipes)
    if (user.isAdmin) {
      setActiveTab('admin');
    } else {
      setActiveTab('discovery');
    }
  };

  // Handle Logout (returns to landing page with clean slate)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    localStorage.removeItem('amour_affinites_auth');
    setAuthUser(null);
    switchUserData(null);
    setActiveTab('landing');
  };

  // Save profile changes
  const handleSaveProfile = async (updated: UserProfile) => {
    setCurrentUser(updated);
    await persistUserProfile(updated);
  };

  // Purge Account (RGPD)
  const handlePurgeAccount = () => {
    if (authUser?.id) {
      localStorage.removeItem(getScopedKey(authUser.id, 'profile'));
      localStorage.removeItem(getScopedKey(authUser.id, 'convs'));
      localStorage.removeItem(getScopedKey(authUser.id, 'messages'));
      localStorage.removeItem(getScopedKey(authUser.id, 'favorites'));
      localStorage.removeItem(getScopedKey(authUser.id, 'liked'));
      localStorage.removeItem(getScopedKey(authUser.id, 'passed'));
      localStorage.removeItem(getScopedKey(authUser.id, 'privacy'));
      localStorage.removeItem(getScopedKey(authUser.id, 'ai'));
    }
    localStorage.removeItem('amour_affinites_auth');
    setAuthUser(null);
    switchUserData(null);
    setActiveTab('landing');
  };

  const handleOpenAuthModal = (mode?: any) => {
    const validMode = (typeof mode === 'string' && (mode === 'login' || mode === 'signup')) ? mode : 'signup';
    setAuthInitialMode(validMode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        favoritesCount={favoriteIds.length}
        privacySettings={privacySettings}
        aiSettings={aiSettings}
        onToggleAi={handleToggleAi}
        authUser={authUser}
        onOpenAuth={handleOpenAuthModal}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        activeConversationId={activeConversationId}
        conversations={conversations}
        onStartCall={handleStartCallWithProfile}
      />

      {/* Main Content Area based on Active Tab */}
      <main className={`flex-1 ${authUser && activeTab !== 'landing' && activeTab !== 'messages' ? 'pb-16 lg:pb-0' : ''}`}>
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuthModal}
            onEnterApp={(tab) => setActiveTab(tab || 'discovery')}
            sampleProfiles={profiles}
          />
        )}

        {activeTab === 'discovery' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800 w-full overflow-x-clip">
            <DiscoverySwipe
              currentUser={currentUser}
              profiles={profiles}
              privacySettings={privacySettings}
              favoriteIds={favoriteIds}
              matchedProfileIds={matchedProfileIds}
              onToggleFavorite={handleToggleFavorite}
              onLike={handleLikeProfile}
              onPass={handlePassProfile}
              onOpenCompatibility={(profile) => setCompatibilityProfile(profile)}
              onStartCall={handleStartCallWithProfile}
              onStartChat={handleStartChatWithProfile}
              onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
            />
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800 w-full overflow-x-clip">
            <FavoritesView
              currentUser={currentUser}
              profiles={profiles}
              allProfiles={profiles}
              favoriteIds={favoriteIds}
              matchedProfileIds={matchedProfileIds}
              privacySettings={privacySettings}
              onToggleFavorite={handleToggleFavorite}
              onOpenCompatibility={(profile) => setCompatibilityProfile(profile)}
              onStartChat={(profile) => handleStartChatWithProfile(profile)}
              onLike={handleLikeProfile}
              onStartCall={handleStartCallWithProfile}
              onGoToDiscovery={() => setActiveTab('discovery')}
              onExploreMore={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800 w-full overflow-x-clip">
            <ProximityRadar
              currentUser={currentUser}
              profiles={profiles}
              privacySettings={privacySettings}
              matchedProfileIds={matchedProfileIds}
              onUpdateUserLocation={(city, lat, lng, country, phoneNumber) => {
                const updated = {
                  ...currentUser,
                  city,
                  lat,
                  lng,
                  ...(country ? { country } : {}),
                  ...(phoneNumber ? { phoneNumber } : {}),
                };
                setCurrentUser(updated);
                persistUserProfile(updated);
              }}
              onSelectProfile={(profile) => setCompatibilityProfile(profile)}
              onStartChat={(profile) => handleStartChatWithProfile(profile)}
              onLike={handleLikeProfile}
              onOpenPrivacy={() => setActiveTab('privacy')}
              onBackToDiscovery={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-rose-50/60 h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)] flex flex-col text-slate-800 overflow-hidden">
            <MessagingCenter
              currentUser={currentUser}
              conversations={conversations}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              messages={messages}
              onSendMessage={handleSendMessage}
              privacySettings={privacySettings}
              onUpdatePrivacySettings={(newSet) =>
                setPrivacySettings((prev) => ({ ...prev, ...newSet }))
              }
              aiSettings={aiSettings}
              onToggleAi={handleToggleAi}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
              onMarkAsRead={handleMarkConversationAsRead}
              onBackToDiscovery={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'ai_wingman' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <AiWingmanCenter
              currentUser={currentUser}
              aiSettings={aiSettings}
              onUpdateAiSettings={(newSettings) =>
                setAiSettings((prev) => ({ ...prev, ...newSettings }))
              }
              onUpdateUserBio={(newBio) =>
                setCurrentUser((prev) => ({ ...prev, bio: newBio }))
              }
              onBackToDiscovery={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'blind_match' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <BlindMatchView
              currentUser={currentUser}
              profiles={profiles}
              onMatchRevealed={(partner) => {
                // Add partner to favorites / matches
                if (!favoriteIds.includes(partner.id)) {
                  setFavoriteIds((prev) => [...prev, partner.id]);
                }
              }}
              onOpenDirectChat={(partner, blindMsgs) => {
                handleStartChatWithProfile(partner, undefined, blindMsgs);
              }}
            />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <PrivacySecurityCenter
              currentUser={currentUser}
              privacySettings={privacySettings}
              onUpdatePrivacySettings={(newSettings) =>
                setPrivacySettings((prev) => ({ ...prev, ...newSettings }))
              }
              onPurgeAccount={handlePurgeAccount}
              onUnblockUser={handleUnblockUser}
              onBackToDiscovery={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pb-8 bg-white min-h-[calc(100vh-70px)] text-slate-800">
            <ProfileEditor
              userProfile={currentUser}
              onSaveProfile={handleSaveProfile}
              authUser={authUser}
              onOpenAuth={handleOpenAuthModal}
              onLogout={handleLogout}
              onBackToDiscovery={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            authUser={authUser}
            allProfiles={profiles}
            onUpdateProfiles={setProfiles}
            onEnterApp={(tab) => setActiveTab(tab || 'discovery')}
            onSendNotificationLocal={handleSendNotificationLocal}
          />
        )}
      </main>

      {/* Deep Compatibility Analysis Modal */}
      {compatibilityProfile && (
        <CompatibilityModal
          userProfile={currentUser}
          targetProfile={compatibilityProfile}
          matchedProfileIds={matchedProfileIds}
          onClose={() => setCompatibilityProfile(null)}
          onStartChat={(profile, initialMsg) =>
            handleStartChatWithProfile(profile, initialMsg)
          }
          onLike={handleLikeProfile}
        />
      )}

      {/* Match Celebration Popup */}
      {celebrationProfile && (
        <MatchCelebrationModal
          userProfile={currentUser}
          matchedProfile={celebrationProfile}
          onClose={() => setCelebrationProfile(null)}
          onSendMessage={(target, initialMsg) =>
            handleStartChatWithProfile(target, initialMsg)
          }
          onStartCall={(target, type) => {
            setCelebrationProfile(null);
            handleStartCallWithProfile(target, type);
          }}
        />
      )}

      {/* Real Interactive Audio / Video WebRTC Call Modal */}
      {activeCall && (
        <ActiveCallModal
          callType={activeCall.type}
          partner={activeCall.partner}
          currentUser={currentUser}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* Authentication Modal (Email / Google / SignUp / Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
