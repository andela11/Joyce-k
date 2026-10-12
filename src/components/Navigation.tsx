import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Radio,
  MessageCircleHeart,
  Bot,
  ShieldCheck,
  User,
  EyeOff,
  LogIn,
  LogOut,
  ShieldAlert,
  Heart,
  Home,
  Users,
  Layers,
  MessageSquareQuote,
  Globe2,
  Mail,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Shield,
  Zap,
  Gift,
  Clock,
  ExternalLink,
  ChevronRight,
  Phone,
  Video,
  Sun,
  Moon,
} from 'lucide-react';
import { ActiveTab, PrivacySettings, AiAutoResponderSettings, AuthUser, AppNotification, Conversation, UserProfile } from '../types';
import { JoyceKLogo } from './JoyceKLogo';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
  favoritesCount?: number;
  privacySettings: PrivacySettings;
  aiSettings: AiAutoResponderSettings;
  onToggleAi: () => void;
  authUser: AuthUser | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onClearAllNotifications?: () => void;
  activeConversationId?: string | null;
  conversations?: Conversation[];
  onStartCall?: (profile: UserProfile, type: 'audio' | 'video') => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  favoritesCount = 0,
  privacySettings,
  aiSettings,
  onToggleAi,
  authUser,
  onOpenAuth,
  onLogout,
  notifications = [],
  onMarkNotificationRead,
  onClearAllNotifications,
  activeConversationId = null,
  conversations = [],
  onStartCall,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const isLandingMode = !authUser || activeTab === 'landing';

  // Calculate unread notifications
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'announcement':
        return <Bell className="w-4 h-4 text-rose-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case 'feature':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-purple-500" />;
      case 'match_alert':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-rose-500" />;
    }
  };

  // Navigation items for the Public Landing Page (Visitors or when on landing page)
  const landingNavItems = [
    {
      id: 'hero-section',
      label: 'Accueil',
      icon: Home,
      targetId: 'hero-section',
    },
    {
      id: 'members-section',
      label: 'Membres Réels',
      icon: Users,
      targetId: 'members-section',
    },
    {
      id: 'features-section',
      label: 'Fonctionnalités',
      icon: Layers,
      targetId: 'features-section',
    },
    {
      id: 'testimonials-section',
      label: 'Témoignages',
      icon: MessageSquareQuote,
      targetId: 'testimonials-section',
    },
    {
      id: 'radar-preview-section',
      label: 'Radar Monde',
      icon: Globe2,
      targetId: 'radar-preview-section',
    },
    {
      id: 'contact-section',
      label: 'Contact',
      icon: Mail,
      targetId: 'contact-section',
    },
  ];

  // Navigation items for Authenticated System (Inside the app)
  const authenticatedTabs = [
    {
      id: 'discovery' as ActiveTab,
      label: 'Découvrir',
      icon: Flame,
      badge: null,
    },
    {
      id: 'favorites' as ActiveTab,
      label: 'Favoris',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'radar' as ActiveTab,
      label: 'Radar Monde',
      icon: Radio,
      badge: null,
    },
    {
      id: 'messages' as ActiveTab,
      label: 'Messages',
      icon: MessageCircleHeart,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'ai_wingman' as ActiveTab,
      label: 'IA Wingman',
      icon: Bot,
      badge: aiSettings.enabled ? 'ON' : null,
    },
    {
      id: 'blind_match' as ActiveTab,
      label: 'Blind-Match',
      icon: EyeOff,
      badge: '21h',
    },
    {
      id: 'privacy' as ActiveTab,
      label: 'Sécurité & IA',
      icon: ShieldCheck,
      badge: privacySettings.ghostMode ? 'Fantôme' : null,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Mon Profil',
      icon: User,
      badge: null,
    },
    ...(authUser?.isAdmin
      ? [
          {
            id: 'admin' as ActiveTab,
            label: 'Admin',
            icon: ShieldAlert,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  // Core 5 bottom mobile tabs for authenticated user
  const mobileBottomTabs = [
    {
      id: 'discovery' as ActiveTab,
      label: 'Découvrir',
      icon: Flame,
      badge: null,
    },
    {
      id: 'favorites' as ActiveTab,
      label: 'Favoris',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'radar' as ActiveTab,
      label: 'Radar',
      icon: Radio,
      badge: null,
    },
    {
      id: 'messages' as ActiveTab,
      label: 'Messages',
      icon: MessageCircleHeart,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profil',
      icon: User,
      badge: null,
    },
  ];

  const handleLandingNavClick = (targetId: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTabClick = (tabId: ActiveTab) => {
    setMobileMenuOpen(false);
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header
        id="main-app-header"
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0d1017]/95 backdrop-blur-md text-slate-800 dark:text-slate-100 px-4 sm:px-6 lg:px-8 h-16 flex items-center shadow-xs dark:border-b dark:border-slate-800/80 transition-colors"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              id="brand-logo-btn"
              onClick={() => setActiveTab(authUser ? 'discovery' : 'landing')}
              className="cursor-pointer select-none flex items-center hover:opacity-90 transition-opacity"
              title="Joyce-K — Accueil"
            >
              <div className="sm:hidden">
                <JoyceKLogo size="sm" variant="light-bg" showTagline={false} />
              </div>
              <div className="hidden sm:block">
                <JoyceKLogo size="md" variant="light-bg" showTagline={false} />
              </div>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
            {isLandingMode ? (
              // LANDING PAGE SECTIONS (Public Navigation)
              <nav
                id="main-nav-tabs"
                className="flex items-center gap-6"
              >
                {landingNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`landing-nav-btn-${item.id}`}
                      onClick={() => handleLandingNavClick(item.targetId)}
                      className="group flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-rose-300 transition-colors select-none shrink-0 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors stroke-[1.75px]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            ) : (
              // AUTHENTICATED APP TABS (Connected Navigation)
              <nav
                id="main-nav-tabs"
                className="flex items-center gap-1 overflow-x-auto no-scrollbar"
              >
                {authenticatedTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`nav-tab-${tab.id}`}
                      onClick={() => handleTabClick(tab.id)}
                      title={`Onglet : ${tab.label}`}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all select-none shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 dark:bg-rose-500/20 text-white dark:text-rose-200 font-semibold shadow-xs dark:border dark:border-rose-400/40'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {Icon && (
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 stroke-[1.75px] ${
                            isActive ? 'text-rose-400 dark:text-rose-300' : 'text-slate-400 dark:text-slate-400'
                          }`}
                        />
                      )}
                      <span>{tab.label}</span>
                      {tab.badge !== null && (
                        <span
                          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                            isActive
                              ? 'bg-rose-500 text-white'
                              : typeof tab.badge === 'number'
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right: Actions & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button (Dark / Light Mode) */}
            {onToggleDarkMode && (
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleDarkMode}
                title={darkMode ? 'Basculer vers le mode clair' : 'Basculer vers le mode sombre (Chic Parisien)'}
                className="relative p-2 rounded-full text-slate-600 dark:text-rose-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer select-none"
                aria-label="Basculer le mode sombre"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 stroke-[1.75px] text-rose-300 hover:text-rose-200 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 stroke-[1.75px] text-slate-600 hover:text-rose-600 transition-transform hover:-rotate-12" />
                )}
              </button>
            )}

            {authUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* If on landing, allow returning to app */}
                {activeTab === 'landing' && (
                  <button
                    id="header-enter-app-btn"
                    onClick={() => setActiveTab('discovery')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0 stroke-[1.75px]" />
                    <span>Ouvrir l'application</span>
                  </button>
                )}

                {/* Admin Portal Button for Admin Users */}
                {authUser.isAdmin && (
                  <button
                    id="header-admin-portal-btn"
                    onClick={() => setActiveTab('admin')}
                    title="Panneau d'administration"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-slate-900 dark:bg-rose-900/60 text-white shadow-xs dark:border dark:border-rose-700/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[1.75px]" />
                    <span className="hidden md:inline">Admin</span>
                  </button>
                )}

                {/* Notification Bell */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    id="header-notifications-bell-btn"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    title="Notifications"
                    className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4 stroke-[1.75px]" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
                    )}
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {notificationsOpen && (
                    <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-2xl bg-white dark:bg-[#131620] shadow-xl shadow-slate-900/10 dark:shadow-black/50 py-3 z-50 animate-fade-in text-slate-800 dark:text-slate-100 dark:border dark:border-slate-800">
                      <div className="px-4 pb-3 flex items-center justify-between bg-slate-50 dark:bg-[#191d29] rounded-t-2xl">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                            <Bell className="w-4 h-4 stroke-[1.75px]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                              Notifications
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {unreadNotifsCount} non lue{unreadNotifsCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {onClearAllNotifications && notifications.length > 0 && (
                          <button
                            onClick={() => onClearAllNotifications()}
                            className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium hover:underline cursor-pointer"
                          >
                            Tout marquer lu
                          </button>
                        )}
                      </div>

                      {/* Notification list items */}
                      <div className="max-h-72 sm:max-h-80 overflow-y-auto px-2 py-1 space-y-1">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                if (onMarkNotificationRead) onMarkNotificationRead(notif.id);
                                if (notif.actionTab) {
                                   setActiveTab(notif.actionTab);
                                   setNotificationsOpen(false);
                                }
                              }}
                              className={`p-3 rounded-xl transition-all cursor-pointer ${
                                !notif.read
                                  ? 'bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/70 dark:hover:bg-rose-950/50'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-2xs shrink-0 mt-0.5">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                                      {notif.title}
                                    </h5>
                                    {!notif.read && (
                                      <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400">Nouveau</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 mt-1.5">
                                    <span>{notif.senderName}</span>
                                    <span>
                                      {new Date(notif.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 px-4 text-slate-400 dark:text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400 dark:text-slate-500 stroke-[1.5px]" />
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Aucune notification</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              Vous êtes à jour.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Wingman toggle pill */}
                <button
                  id="header-toggle-ai-quick-btn"
                  onClick={() => onToggleAi?.()}
                  title={
                    aiSettings.enabled
                      ? 'Répondeur IA Actif'
                      : 'Activer le Répondeur IA'
                  }
                  className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    aiSettings.enabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 dark:border dark:border-emerald-800/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Bot className={`w-3.5 h-3.5 stroke-[1.75px] ${aiSettings.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>IA : {aiSettings.enabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Ghost mode badge */}
                {privacySettings.ghostMode && (
                  <div
                    id="header-ghost-mode-indicator"
                    onClick={() => setActiveTab('privacy')}
                    title="Mode Fantôme actif"
                    className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/80 dark:border dark:border-amber-800/40 transition-colors"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[1.75px]" />
                    <span>Fantôme</span>
                  </div>
                )}

                {/* User Profile Pill */}
                <button
                  id="header-auth-user-btn"
                  onClick={() => setActiveTab('profile')}
                  title={`Profil de ${authUser.name}`}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer dark:border dark:border-slate-700/60"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-rose-600 text-white font-semibold flex items-center justify-center text-[10px]">
                    {authUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{authUser.name}</span>
                </button>

                {/* Logout Button */}
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={() => onLogout()}
                    title="Se déconnecter"
                    className="hidden lg:flex items-center p-2 rounded-full text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.75px]" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 sm:px-4 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
                >
                  Connexion
                </button>

                <button
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
                >
                  S'inscrire
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Hamburger Button */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-slate-200 cursor-pointer shrink-0"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75px] text-slate-900 dark:text-white" /> : <Menu className="w-5 h-5 stroke-[1.75px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Modal Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-[#0d1017] dark:border-l dark:border-slate-800/80 shadow-2xl flex flex-col z-50 overflow-y-auto text-slate-800 dark:text-slate-100">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#0d1017] border-b border-slate-100 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <JoyceKLogo size="sm" variant="light-bg" showTagline={false} />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 stroke-[1.75px]" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-5 flex-1">
              {/* Authenticated User Status Card */}
              {authUser && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-rose-600 text-white font-semibold flex items-center justify-center text-sm">
                        {authUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                          {authUser.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {authUser.email}
                        </div>
                      </div>
                    </div>

                    {authUser.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-900 dark:bg-rose-900/60 text-white">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Quick Feature Toggles in Mobile Drawer */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onToggleAi?.()}
                      className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                        aiSettings.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 dark:border dark:border-emerald-800/40'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[1.75px]" />
                        <span>IA Répondeur</span>
                      </div>
                      <span className="font-semibold text-[10px]">
                        {aiSettings.enabled ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabClick('privacy');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                        privacySettings.ghostMode
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 dark:border dark:border-amber-800/40'
                          : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 stroke-[1.75px]" />
                        <span>Fantôme</span>
                      </div>
                      <span className="font-semibold text-[10px]">
                        {privacySettings.ghostMode ? 'ACTIF' : 'NON'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dark Mode Selector in Drawer */}
              {onToggleDarkMode && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {darkMode ? (
                      <Moon className="w-4 h-4 text-rose-300 stroke-[1.75px]" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500 stroke-[1.75px]" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {darkMode ? 'Mode Sombre Chic' : 'Mode Clair Lumineux'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Nuances de gris profonds & rose poudré
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleDarkMode}
                    className={`relative w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      darkMode ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Navigation Links */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Navigation
                </p>

                {isLandingMode ? (
                  <div className="space-y-1">
                    {landingNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleLandingNavClick(item.targetId)}
                          className="w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-slate-400 dark:text-slate-400 stroke-[1.75px]" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 stroke-[1.75px]" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {authenticatedTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-slate-100 dark:bg-rose-950/40 text-slate-900 dark:text-rose-200 font-semibold dark:border dark:border-rose-900/40'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {Icon && (
                              <Icon
                                className={`w-4 h-4 stroke-[1.75px] ${
                                  isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-400'
                                }`}
                              />
                            )}
                            <span>{tab.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {tab.badge !== null && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  isActive
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {tab.badge}
                              </span>
                            )}
                            <ChevronRight
                              className={`w-4 h-4 stroke-[1.75px] ${
                                isActive ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 bg-white dark:bg-[#0d1017] border-t border-slate-100 dark:border-slate-800 space-y-2">
              {authUser ? (
                <>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 stroke-[1.75px]" />
                      <span>Déconnexion</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.75px]" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm shadow-sm shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>S'inscrire</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {authUser && activeTab !== 'landing' && !(activeTab === 'messages' && activeConversationId) && (
        <nav
          id="mobile-bottom-nav"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0d1017]/95 backdrop-blur-md px-3 py-2 shadow-lg shadow-slate-900/10 dark:shadow-black/50 dark:border-t dark:border-slate-800/80 flex items-center justify-around select-none"
        >
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`bottom-nav-tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] transition-all cursor-pointer ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2px]' : 'stroke-[1.75px]'}`} />
                  {tab.badge !== null && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white font-semibold text-[9px] flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};
