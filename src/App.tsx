/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import {
  UserProfile,
  ActiveTab,
  PrivacySettings,
  AiAutoResponderSettings,
  Conversation,
  ChatMessage,
  AuthUser,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_PRIVACY_SETTINGS,
  INITIAL_AI_SETTINGS,
  MOCK_PROFILES,
} from './data/mockProfiles';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');

  // Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_USER_PROFILE,
          ...parsed,
          interests: Array.isArray(parsed.interests) ? parsed.interests : INITIAL_USER_PROFILE.interests,
          photos: Array.isArray(parsed.photos) && parsed.photos.length > 0 ? parsed.photos : INITIAL_USER_PROFILE.photos,
        };
      }
      return INITIAL_USER_PROFILE;
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
      return INITIAL_USER_PROFILE;
    }
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_privacy');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PRIVACY_SETTINGS,
          ...parsed,
          blockedUsers: Array.isArray(parsed.blockedUsers) ? parsed.blockedUsers : [],
        };
      }
      return INITIAL_PRIVACY_SETTINGS;
    } catch (e) {
      console.warn('Failed to parse privacy settings from localStorage:', e);
      return INITIAL_PRIVACY_SETTINGS;
    }
  });

  // AI Auto-Responder Settings
  const [aiSettings, setAiSettings] = useState<AiAutoResponderSettings>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_ai');
      return saved ? JSON.parse(saved) : INITIAL_AI_SETTINGS;
    } catch (e) {
      console.warn('Failed to parse ai settings from localStorage:', e);
      return INITIAL_AI_SETTINGS;
    }
  });

  // Available Profiles
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_PROFILES);

  // Favorites Profile IDs
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse favorites from localStorage:', e);
    }
    // Pre-loaded favorite with Camille and Aminata
    return ['user_1', 'user_2'];
  });

  // Conversations and Messages
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_convs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse conversations from localStorage:', e);
    }

    // Initial pre-loaded conversation with Camille to test right away
    const camille = MOCK_PROFILES[0];
    return [
      {
        id: 'conv_user_1',
        participant: camille,
        unreadCount: 1,
        matchedAt: Date.now() - 3600000 * 2,
        isAiAutoResponding: true,
        autoRepliesCount: 0,
        commonInterests: ['Photographie argentique', 'Musées & Expos', 'Cuisine italienne'],
      },
    ];
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse messages from localStorage:', e);
    }

    // Initial chat history with Camille
    return {
      conv_user_1: [
        {
          id: 'msg_1',
          conversationId: 'conv_user_1',
          senderId: 'user_1',
          receiverId: 'current_user',
          text: "Coucou Alexandre ! J'ai vu qu'on adorait tous les deux la photo argentique et les expos d'art. Tu développes tes propres pellicules ?",
          timestamp: Date.now() - 3600000 * 2,
          isSelf: false,
          isRead: false,
        },
      ],
    };
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv_user_1');

  // Modals
  const [compatibilityProfile, setCompatibilityProfile] = useState<UserProfile | null>(null);
  const [celebrationProfile, setCelebrationProfile] = useState<UserProfile | null>(null);

  // Sync to LocalStorage & Firebase Auth state listener
  useEffect(() => {
    import('./lib/firebase').then(({ auth, onAuthStateChanged, db, doc, getDoc }) => {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const emailLower = (fbUser.email || '').toLowerCase();
          const isAdmin =
            emailLower === 'andelacyrille11@gmail.com' ||
            emailLower === 'blinkservices513@gmail.com' ||
            emailLower.includes('admin');

          const userObj: AuthUser = {
            id: fbUser.uid,
            email: fbUser.email || '',
            name: isAdmin ? `${fbUser.displayName || fbUser.email?.split('@')[0] || 'Junior Andela'} (Admin)` : (fbUser.displayName || fbUser.email?.split('@')[0] || 'Alexandre'),
            photoUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
            provider: (fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email') as 'email' | 'google' | 'guest',
            isLoggedIn: true,
            isAdmin,
            createdAt: fbUser.metadata?.creationTime || new Date().toISOString(),
          };
          setAuthUser(userObj);

          // Sync user profile from Firestore if available
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setCurrentUser((prev) => ({
                ...prev,
                name: data.name || prev.name,
                age: data.age || prev.age,
                gender: data.gender || prev.gender,
                city: data.city || prev.city,
                lat: data.lat || prev.lat,
                lng: data.lng || prev.lng,
                photos: data.photoUrl ? [data.photoUrl, ...prev.photos.slice(1)] : prev.photos,
                verified: true,
              }));
            }
          } catch (e) {
            console.warn('Firestore profile sync warning:', e);
          }
        }
      });
      return () => unsubscribe();
    });
  }, []);

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
    localStorage.setItem('amour_affinites_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('amour_affinites_privacy', JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem('amour_affinites_ai', JSON.stringify(aiSettings));
  }, [aiSettings]);

  useEffect(() => {
    localStorage.setItem('amour_affinites_convs', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('amour_affinites_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('amour_affinites_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Total unread messages count
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

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

  // Handle Like on a profile
  const handleLikeProfile = (profile: UserProfile, isSuperLike = false) => {
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

  const handlePassProfile = (profile: UserProfile) => {
    // Profile passed
  };

  // Send message in active chat
  const handleSendMessage = (
    conversationId: string,
    text: string,
    isAiGenerated = false,
    mediaType: 'text' | 'audio' | 'icebreaker' = 'text'
  ) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      conversationId,
      senderId: 'current_user',
      receiverId: 'partner',
      text,
      timestamp: Date.now(),
      isSelf: true,
      isAiGenerated,
      isRead: true,
      mediaType,
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

    // If sent to a new match, simulate an incoming reply after a realistic delay
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv && !isAiGenerated) {
      setTimeout(() => {
        const partnerReplies = [
          `Merci pour ton message ! J'adore ton énergie :) Dis-moi, tu es plutôt du matin ou du soir pour nos sorties ?`,
          `Haha tellement vrai ! On a vraiment les mêmes centres d'intérêt, ça fait super plaisir.`,
          `Super phrase d'accroche ! Ça te dirait qu'on s'organise un verre cette semaine ?`,
          `J'adore ! C'est exactement ce que je cherchais ici ✨`,
        ];
        const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)];

        const incomingMsg: ChatMessage = {
          id: `msg_inc_${Date.now()}`,
          conversationId,
          senderId: conv.participant.id,
          receiverId: 'current_user',
          text: randomReply,
          timestamp: Date.now(),
          isSelf: false,
          isRead: false,
          mediaType: 'text',
        };

        setMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), incomingMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: incomingMsg, unreadCount: c.unreadCount + 1 }
              : c
          )
        );
      }, 3500);
    }
  };

  // Block User
  const handleBlockUser = (userId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedUsers: [...(prev.blockedUsers || []), userId],
    }));
    setConversations((prev) => (prev || []).filter((c) => c.participant?.id !== userId));
    setActiveConversationId(null);
  };

  // Unblock user
  const handleUnblockUser = (userId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedUsers: (prev.blockedUsers || []).filter((id) => id !== userId),
    }));
  };

  // Start chat with a profile from compatibility or match modal
  const handleStartChatWithProfile = (profile: UserProfile, initialMessage?: string) => {
    let conv = (conversations || []).find((c) => c.participant?.id === profile.id);
    let convId = conv ? conv.id : `conv_${profile.id}`;

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
      };
      setConversations((prev) => [newConv, ...(prev || [])]);
      setMessages((prev) => ({ ...prev, [convId]: [] }));
    }

    if (initialMessage) {
      handleSendMessage(convId, initialMessage, false, 'text');
    }

    setActiveConversationId(convId);
    setCompatibilityProfile(null);
    setCelebrationProfile(null);
    setActiveTab('messages');
  };

  // Handle Auth Login/Signup Success
  const handleLoginSuccess = (user: AuthUser, updatedProfile?: Partial<UserProfile>) => {
    setAuthUser(user);
    if (updatedProfile) {
      setCurrentUser((prev) => ({
        ...prev,
        name: updatedProfile.name || prev.name,
        age: updatedProfile.age || prev.age,
        gender: updatedProfile.gender || prev.gender,
        verified: updatedProfile.verified !== undefined ? updatedProfile.verified : prev.verified,
      }));
    }

    // Direct Redirection: Admin -> 'admin', User -> 'discovery' (profile swipes)
    if (user.isAdmin) {
      setActiveTab('admin');
    } else {
      setActiveTab('discovery');
    }
  };

  // Handle Logout (returns to landing page)
  const handleLogout = async () => {
    try {
      const { auth, signOut } = await import('./lib/firebase');
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
    localStorage.removeItem('amour_affinites_auth');
    setAuthUser(null);
    setActiveTab('landing');
  };

  // Purge Account (RGPD)
  const handlePurgeAccount = () => {
    localStorage.clear();
    setAuthUser(null);
    setCurrentUser(INITIAL_USER_PROFILE);
    setPrivacySettings(INITIAL_PRIVACY_SETTINGS);
    setAiSettings(INITIAL_AI_SETTINGS);
    setConversations([]);
    setMessages({});
    setActiveTab('landing');
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setAuthInitialMode(mode);
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
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuthModal}
            onEnterApp={(tab) => setActiveTab(tab || 'discovery')}
            sampleProfiles={profiles}
          />
        )}

        {activeTab === 'discovery' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <DiscoverySwipe
              currentUser={currentUser}
              profiles={profiles}
              privacySettings={privacySettings}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onLike={handleLikeProfile}
              onPass={handlePassProfile}
              onOpenCompatibility={(profile) => setCompatibilityProfile(profile)}
            />
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <FavoritesView
              currentUser={currentUser}
              profiles={profiles}
              allProfiles={profiles}
              favoriteIds={favoriteIds}
              privacySettings={privacySettings}
              onToggleFavorite={handleToggleFavorite}
              onOpenCompatibility={(profile) => setCompatibilityProfile(profile)}
              onStartChat={(profile) => handleStartChatWithProfile(profile)}
              onGoToDiscovery={() => setActiveTab('discovery')}
              onExploreMore={() => setActiveTab('discovery')}
            />
          </div>
        )}

        {activeTab === 'radar' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <ProximityRadar
              currentUser={currentUser}
              profiles={profiles}
              privacySettings={privacySettings}
              onUpdateUserLocation={(city, lat, lng) =>
                setCurrentUser((prev) => ({ ...prev, city, lat, lng }))
              }
              onSelectProfile={(profile) => setCompatibilityProfile(profile)}
              onStartChat={(profile) => handleStartChatWithProfile(profile)}
              onOpenPrivacy={() => setActiveTab('privacy')}
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-rose-50/60 h-[calc(100vh-65px)] flex flex-col text-slate-800">
            <MessagingCenter
              currentUser={currentUser}
              conversations={conversations}
              activeConversationId={activeConversationId}
              setActiveConversationId={setActiveConversationId}
              messages={messages}
              onSendMessage={handleSendMessage}
              privacySettings={privacySettings}
              aiSettings={aiSettings}
              onToggleAi={handleToggleAi}
              onBlockUser={handleBlockUser}
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
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pb-8 bg-rose-50/60 min-h-[calc(100vh-70px)] text-slate-800">
            <ProfileEditor
              userProfile={currentUser}
              onSaveProfile={(updated) => setCurrentUser(updated)}
              authUser={authUser}
              onOpenAuth={handleOpenAuthModal}
              onLogout={handleLogout}
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
          />
        )}
      </main>

      {/* Deep Compatibility Analysis Modal */}
      {compatibilityProfile && (
        <CompatibilityModal
          userProfile={currentUser}
          targetProfile={compatibilityProfile}
          onClose={() => setCompatibilityProfile(null)}
          onStartChat={(profile, initialMsg) =>
            handleStartChatWithProfile(profile, initialMsg)
          }
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
