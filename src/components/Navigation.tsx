import React from 'react';
import {
  Flame,
  Radio,
  MessageCircleHeart,
  Bot,
  ShieldCheck,
  User,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, PrivacySettings, AiAutoResponderSettings } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
  privacySettings: PrivacySettings;
  aiSettings: AiAutoResponderSettings;
  onToggleAi: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  privacySettings,
  aiSettings,
  onToggleAi,
}) => {
  const tabs = [
    {
      id: 'discovery' as ActiveTab,
      label: 'Découvrir',
      icon: Flame,
      badge: null,
    },
    {
      id: 'radar' as ActiveTab,
      label: 'Proximité',
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
      label: 'IA Répondeur',
      icon: Bot,
      badge: aiSettings.enabled ? 'ON' : null,
    },
    {
      id: 'privacy' as ActiveTab,
      label: 'Vie Privée',
      icon: ShieldCheck,
      badge: privacySettings.ghostMode ? 'Fantôme' : null,
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Profil',
      icon: User,
      badge: null,
    },
  ];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 px-3 sm:px-6 py-2.5 shadow-sm shadow-rose-100/60"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => setActiveTab('discovery')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 p-0.5 shadow-md shadow-rose-200 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900">
                Amour & Affinités
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                IA & Privé
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Matching par affinités & IA wingman
            </p>
          </div>
        </div>

        {/* Quick status indicators */}
        <div className="flex items-center gap-2">
          {/* AI Auto-Responder quick pill toggle */}
          <button
            id="header-toggle-ai-quick-btn"
            onClick={onToggleAi}
            title={
              aiSettings.enabled
                ? 'Répondeur IA Actif (Répond si vous êtes indisponible)'
                : 'Activer le Répondeur IA'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              aiSettings.enabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${aiSettings.enabled ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden md:inline">IA Répondeur :</span>
            <span className="font-bold">{aiSettings.enabled ? 'ACTIF' : 'PAUSE'}</span>
          </button>

          {/* Ghost mode badge indicator */}
          {privacySettings.ghostMode && (
            <div
              id="header-ghost-mode-indicator"
              onClick={() => setActiveTab('privacy')}
              title="Mode Fantôme actif : vous n'apparaissez pas dans le radar public"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Mode Fantôme</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav
          id="main-nav-tabs"
          className="flex items-center gap-1 sm:gap-1.5 bg-rose-50/80 border border-rose-200/60 rounded-2xl p-1 shadow-inner"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-200 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-rose-600'
                        : typeof tab.badge === 'number'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
