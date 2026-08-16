import React, { useState } from 'react';
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
} from 'lucide-react';
import { ActiveTab, PrivacySettings, AiAutoResponderSettings, AuthUser } from '../types';
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingMode = !authUser || activeTab === 'landing';

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
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-orange-100/90 text-slate-800 px-3 sm:px-6 py-2.5 shadow-sm transition-all"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2.5 md:gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <div
            id="brand-logo-btn"
            onClick={() => setActiveTab(authUser ? 'discovery' : 'landing')}
            className="cursor-pointer select-none group flex items-center gap-2 hover:opacity-95 transition-all"
            title="Joyce-K — Accueil"
          >
            <JoyceKLogo size="md" variant="light-bg" showTagline={false} />
          </div>
        </div>

        {/* Center: Dynamic Navigation Items based on mode (Landing page vs Authenticated App) */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <nav
            id="main-nav-tabs"
            className="flex items-center gap-1 sm:gap-1.5 bg-orange-50/60 border border-orange-200/70 rounded-2xl p-1 shadow-inner overflow-x-auto no-scrollbar shrink-0"
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
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-white transition-all select-none shrink-0 cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
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
                    title={`Raccourci clavier : ${idx + 1}`}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-200'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    <span>{tab.label}</span>
                    <span
                      className={`hidden xl:inline text-[9px] px-1 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-orange-100/70 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
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

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2">
          {authUser ? (
            <div className="flex items-center gap-2">
              {/* If on landing, allow returning to app */}
              {activeTab === 'landing' && (
                <button
                  id="header-enter-app-btn"
                  onClick={() => setActiveTab('discovery')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ouvrir l'App</span>
                </button>
              )}

              {/* AI Auto-Responder quick pill toggle (desktop only) */}
              <button
                id="header-toggle-ai-quick-btn"
                onClick={onToggleAi}
                title={
                  aiSettings.enabled
                    ? 'Répondeur IA Actif'
                    : 'Activer le Répondeur IA'
                }
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                  aiSettings.enabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs hover:bg-emerald-100'
                    : 'bg-white text-slate-600 border-orange-200 hover:text-slate-900 hover:bg-orange-50'
                }`}
              >
                <Bot className={`w-3.5 h-3.5 ${aiSettings.enabled ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>IA : {aiSettings.enabled ? 'ON' : 'OFF'}</span>
              </button>

              {/* Ghost mode badge indicator */}
              {privacySettings.ghostMode && (
                <div
                  id="header-ghost-mode-indicator"
                  onClick={() => setActiveTab('privacy')}
                  title="Mode Fantôme actif"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 cursor-pointer hover:bg-orange-200 transition-colors shadow-xs"
                >
                  <EyeOff className="w-3.5 h-3.5 text-orange-600" />
                  <span>Fantôme</span>
                </div>
              )}

              {/* User Profile Button */}
              <button
                id="header-auth-user-btn"
                onClick={() => setActiveTab('profile')}
                title={`Profil de ${authUser.name}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-200 bg-orange-50/60 text-slate-800 hover:border-rose-300 hover:bg-white transition-all shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[100px]">{authUser.name}</span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  title="Se déconnecter"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-all shadow-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="header-login-btn"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-orange-50 text-slate-800 border border-orange-200 transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-500" />
                <span>Connexion</span>
              </button>

              <button
                id="header-signup-btn"
                onClick={() => onOpenAuth('signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-200 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>S'inscrire</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl border border-orange-200 text-slate-700 hover:bg-orange-50 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-orange-100 pb-2 space-y-1 animate-fade-in">
          {isLandingMode ? (
            <div className="grid grid-cols-2 gap-1.5">
              {landingNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLandingNavClick(item.targetId)}
                    className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold bg-orange-50/50 text-slate-800 hover:bg-rose-50 hover:text-rose-600 text-left cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-rose-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {authenticatedTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      isActive
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-orange-50/50 text-slate-800 hover:bg-orange-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== null && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-rose-600 font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
