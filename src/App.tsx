/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DiscoverySwipe } from './components/DiscoverySwipe';
import { ProximityRadar } from './components/ProximityRadar';
import { MessagingCenter } from './components/MessagingCenter';
import { AiWingmanCenter } from './components/AiWingmanCenter';
import { PrivacySecurityCenter } from './components/PrivacySecurityCenter';
import { ProfileEditor } from './components/ProfileEditor';
import { CompatibilityModal } from './components/CompatibilityModal';
import { MatchCelebrationModal } from './components/MatchCelebrationModal';
import {
  UserProfile,
  ActiveTab,
  PrivacySettings,
  AiAutoResponderSettings,
  Conversation,
  ChatMessage,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_PRIVACY_SETTINGS,
  INITIAL_AI_SETTINGS,
  MOCK_PROFILES,
} from './data/mockProfiles';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('discovery');

  // User Profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_user');
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage:', e);
      return INITIAL_USER_PROFILE;
    }
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    try {
      const saved = localStorage.getItem('amour_affinites_privacy');
      return saved ? JSON.parse(saved) : INITIAL_PRIVACY_SETTINGS;
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

  // Sync to LocalStorage
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

  // Total unread messages count
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

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
      const commonInterests = currentUser.interests.filter((i) =>
        profile.interests.includes(i)
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

      setConversations((prev) => [newConv, ...prev]);
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
      blockedUsers: [...prev.blockedUsers, userId],
    }));
    setConversations((prev) => prev.filter((c) => c.participant.id !== userId));
    setActiveConversationId(null);
  };

  // Unblock user
  const handleUnblockUser = (userId: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter((id) => id !== userId),
    }));
  };

  // Start chat with a profile from compatibility or match modal
  const handleStartChatWithProfile = (profile: UserProfile, initialMessage?: string) => {
    let conv = conversations.find((c) => c.participant.id === profile.id);
    let convId = conv ? conv.id : `conv_${profile.id}`;

    if (!conv) {
      const commonInterests = currentUser.interests.filter((i) =>
        profile.interests.includes(i)
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
      setConversations((prev) => [newConv, ...prev]);
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

  // Purge Account (RGPD)
  const handlePurgeAccount = () => {
    localStorage.clear();
    setCurrentUser(INITIAL_USER_PROFILE);
    setPrivacySettings(INITIAL_PRIVACY_SETTINGS);
    setAiSettings(INITIAL_AI_SETTINGS);
    setConversations([]);
    setMessages({});
    setActiveTab('discovery');
  };

  return (
    <div className="min-h-screen bg-rose-50/60 text-slate-800 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        privacySettings={privacySettings}
        aiSettings={aiSettings}
        onToggleAi={handleToggleAi}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 pb-8">
        {activeTab === 'discovery' && (
          <DiscoverySwipe
            currentUser={currentUser}
            profiles={profiles}
            privacySettings={privacySettings}
            onLike={handleLikeProfile}
            onPass={handlePassProfile}
            onOpenCompatibility={(profile) => setCompatibilityProfile(profile)}
          />
        )}

        {activeTab === 'radar' && (
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
        )}

        {activeTab === 'messages' && (
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
          />
        )}

        {activeTab === 'ai_wingman' && (
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
        )}

        {activeTab === 'privacy' && (
          <PrivacySecurityCenter
            currentUser={currentUser}
            privacySettings={privacySettings}
            onUpdatePrivacySettings={(newSettings) =>
              setPrivacySettings((prev) => ({ ...prev, ...newSettings }))
            }
            onPurgeAccount={handlePurgeAccount}
            onUnblockUser={handleUnblockUser}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditor
            userProfile={currentUser}
            onSaveProfile={(updated) => setCurrentUser(updated)}
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
    </div>
  );
}
