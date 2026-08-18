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
  Sparkles,
  Gift,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ActiveTab, PrivacySettings, AiAutoResponderSettings, AuthUser, AppNotification } from '../types';
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const isLandingMode = !authUser || activeTab === 'landing';

  // Calculate unread notifications
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Close notifications dropdown when clicking outside
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
        return <Sparkles className="w-4 h-4 text-amber-500" />;
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
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-orange-100/90 text-slate-800 px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center shadow-xs transition-all"
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              id="brand-logo-btn"
              onClick={() => setActiveTab(authUser ? 'discovery' : 'landing')}
              className="cursor-pointer select-none group flex items-center gap-1 hover:opacity-90 transition-all"
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

          {/* Center: Desktop Navigation Tabs (Visible on lg+ screens) */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-3xl px-2">
            <nav
              id="main-nav-tabs"
              className="flex items-center gap-1 bg-orange-50/70 border border-orange-200/80 rounded-2xl p-1 shadow-inner overflow-x-auto no-scrollbar"
            >
              {isLandingMode ? (
                // LANDING PAGE SECTIONS (Public Navigation)
                landingNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      id={`landing-nav-btn-${item.id}`}
                      onClick={() => handleLandingNavClick(item.targetId)}
                      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-600 hover:bg-white transition-all select-none shrink-0 cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-rose-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })
              ) : (
                // AUTHENTICATED APP TABS (Connected Navigation)
                authenticatedTabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`nav-tab-${tab.id}`}
                      onClick={() => handleTabClick(tab.id)}
                      title={`Onglet : ${tab.label}`}
                      className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm shadow-rose-200'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                      <span>{tab.label}</span>
                      {tab.badge !== null && (
                        <span
                          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-white text-rose-600'
                              : typeof tab.badge === 'number'
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </nav>
          </div>

          {/* Right: Actions & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {authUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* If on landing, allow returning to app */}
                {activeTab === 'landing' && (
                  <button
                    id="header-enter-app-btn"
                    onClick={() => setActiveTab('discovery')}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">App</span>
                  </button>
                )}

                {/* Admin Portal Button for Admin Users */}
                {authUser.isAdmin && (
                  <button
                    id="header-admin-portal-btn"
                    onClick={() => setActiveTab('admin')}
                    title="Accéder au panneau d'administration"
                    className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-slate-900 text-rose-400 border-slate-700 shadow-sm'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="hidden md:inline">Admin</span>
                  </button>
                )}

                {/* Notification Center Bell Popover */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    id="header-notifications-bell-btn"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    title="Notifications & Annonces"
                    className="relative p-2 rounded-full border border-orange-200 bg-white hover:bg-orange-50 text-slate-700 transition-all cursor-pointer shadow-xs"
                  >
                    <Bell className="w-4 h-4 text-slate-700" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                        {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Panel (Responsive positioning) */}
                  {notificationsOpen && (
                    <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-1 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-3xl bg-white border border-rose-100 shadow-2xl shadow-rose-950/20 py-3 z-50 animate-fade-in text-slate-800">
                      <div className="px-4 pb-2.5 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-rose-100 text-rose-600">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">
                              Notifications & Alertes
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {unreadNotifsCount} non lue{unreadNotifsCount > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {onClearAllNotifications && notifications.length > 0 && (
                          <button
                            onClick={onClearAllNotifications}
                            className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                          >
                            Tout marquer lu
                          </button>
                        )}
                      </div>

                      {/* Notification list items */}
                      <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-rose-50 px-2 py-1">
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
                              className={`p-3 rounded-2xl transition-all cursor-pointer my-1 ${
                                !notif.read
                                  ? 'bg-rose-50/80 hover:bg-rose-100/80 border border-rose-100'
                                  : 'hover:bg-slate-50 opacity-80'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="p-2 rounded-xl bg-white shadow-xs border border-rose-100 shrink-0 mt-0.5">
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="font-bold text-xs text-slate-900 truncate">
                                      {notif.title}
                                    </h5>
                                    {!notif.read && (
                                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5">
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
                          <div className="text-center py-6 px-4 text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                            <p className="text-xs font-semibold">Aucune notification</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Vous êtes à jour sur vos actualités et messages.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Auto-Responder quick pill toggle (desktop only) */}
                <button
                  id="header-toggle-ai-quick-btn"
                  onClick={onToggleAi}
                  title={
                    aiSettings.enabled
                      ? 'Répondeur IA Actif'
                      : 'Activer le Répondeur IA'
                  }
                  className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                    aiSettings.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border-orange-200 hover:text-slate-900 hover:bg-orange-50'
                  }`}
                >
                  <Bot className={`w-3.5 h-3.5 ${aiSettings.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>IA : {aiSettings.enabled ? 'ON' : 'OFF'}</span>
                </button>

                {/* Ghost mode badge indicator (desktop only) */}
                {privacySettings.ghostMode && (
                  <div
                    id="header-ghost-mode-indicator"
                    onClick={() => setActiveTab('privacy')}
                    title="Mode Fantôme actif"
                    className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 cursor-pointer hover:bg-orange-200 transition-colors shadow-xs"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-orange-600" />
                    <span>Fantôme</span>
                  </div>
                )}

                {/* User Profile Pill */}
                <button
                  id="header-auth-user-btn"
                  onClick={() => setActiveTab('profile')}
                  title={`Profil de ${authUser.name}`}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold border border-orange-200 bg-orange-50/70 text-slate-800 hover:border-rose-300 hover:bg-white transition-all shadow-xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[80px] sm:max-w-[110px]">{authUser.name}</span>
                </button>

                {/* Logout Button (Desktop) */}
                {onLogout && (
                  <button
                    id="header-logout-btn"
                    onClick={onLogout}
                    title="Se déconnecter"
                    className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all shadow-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span className="hidden xl:inline">Déconnexion</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-orange-50 text-slate-800 border border-orange-200 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Connexion</span>
                </button>

                <button
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-sm shadow-rose-200 transition-all active:scale-[0.98] cursor-pointer shrink-0"
                >
                  <span>S'inscrire</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Hamburger Button (visible on < lg) */}
            <button
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-orange-200 text-slate-700 hover:bg-orange-50 active:bg-orange-100 cursor-pointer shrink-0"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
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
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-50 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-orange-100 bg-orange-50/40">
              <div className="flex items-center gap-2">
                <JoyceKLogo size="sm" variant="light-bg" showTagline={false} />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-orange-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 flex-1">
              {/* Authenticated User Status Card */}
              {authUser && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {authUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {authUser.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {authUser.email}
                        </div>
                      </div>
                    </div>

                    {authUser.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-rose-400 border border-slate-700">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* Quick Feature Toggles in Mobile Drawer */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-100/80">
                    <button
                      onClick={onToggleAi}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border cursor-pointer ${
                        aiSettings.enabled
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-600 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Répondeur IA</span>
                      </div>
                      <span className="font-bold text-[10px]">
                        {aiSettings.enabled ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        handleTabClick('privacy');
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between border cursor-pointer ${
                        privacySettings.ghostMode
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-white text-slate-600 border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-orange-600" />
                        <span>Fantôme</span>
                      </div>
                      <span className="font-bold text-[10px]">
                        {privacySettings.ghostMode ? 'ACTIF' : 'NON'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
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
                          className="w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50/70 border border-transparent hover:border-rose-100 transition-all text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-50 text-rose-500">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
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
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-orange-50/80 border border-transparent hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl ${
                                isActive ? 'bg-white/20 text-white' : 'bg-orange-50 text-rose-500'
                              }`}
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                            </div>
                            <span>{tab.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {tab.badge !== null && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  isActive
                                    ? 'bg-white text-rose-600'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {tab.badge}
                              </span>
                            )}
                            <ChevronRight
                              className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
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
            <div className="p-4 border-t border-orange-100 bg-orange-50/30 space-y-2">
              {authUser ? (
                <>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter de Joyce-K</span>
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
                    className="py-2.5 rounded-xl bg-white border border-orange-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5 text-rose-500" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-xs shadow-sm"
                  >
                    <span>S'inscrire</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Visible on < lg screens when authenticated and in app, hidden during active chat on mobile) */}
      {authUser && activeTab !== 'landing' && !(activeTab === 'messages' && activeConversationId) && (
        <nav
          id="mobile-bottom-nav"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-orange-100 px-2 py-1.5 shadow-lg shadow-slate-900/10 flex items-center justify-around select-none"
        >
          {mobileBottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`bottom-nav-tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] transition-all cursor-pointer ${
                  isActive
                    ? 'text-rose-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {tab.badge !== null && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-rose-600" />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
};
