import React, { useState, useEffect } from 'react';
import {
  Smile,
  Heart,
  Plus,
  Trash2,
  Send,
  X,
  Search,
  Check,
  Palette,
  Layers,
  Wand2,
} from 'lucide-react';
import { LoveSticker } from '../types';
import {
  DEFAULT_LOVE_STICKERS,
  EMOJI_CATEGORIES,
  STICKER_GRADIENTS,
  STICKER_ICONS_LIBRARY,
} from '../data/stickersData';

interface EmojiStickerPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onSendSticker: (sticker: LoveSticker) => void;
  onClose: () => void;
}

export const EmojiStickerPicker: React.FC<EmojiStickerPickerProps> = ({
  onSelectEmoji,
  onSendSticker,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'emojis' | 'stickers' | 'creator'>('stickers');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>('all');
  const [customStickers, setCustomStickers] = useState<LoveSticker[]>([]);

  // Sticker Creator Form State
  const [customEmoji, setCustomEmoji] = useState('💖');
  const [customTitle, setCustomTitle] = useState('Pensée pour toi');
  const [customSubtitle, setCustomSubtitle] = useState('Tu illumines ma journée');
  const [customGradient, setCustomGradient] = useState(STICKER_GRADIENTS[0].value);
  const [creatorSuccessNotice, setCreatorSuccessNotice] = useState(false);

  // Load custom stickers from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amour_custom_stickers');
      if (saved) {
        setCustomStickers(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load custom stickers:', e);
    }
  }, []);

  // Save custom stickers to LocalStorage
  const saveCustomStickersList = (list: LoveSticker[]) => {
    setCustomStickers(list);
    try {
      localStorage.setItem('amour_custom_stickers', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to persist custom stickers:', e);
    }
  };

  // Handle Save New Custom Sticker
  const handleSaveCustomSticker = (andSend: boolean = false) => {
    if (!customTitle.trim()) return;

    const newSticker: LoveSticker = {
      id: `custom_stk_${Date.now()}`,
      emoji: customEmoji || '💖',
      title: customTitle.trim(),
      subtitle: customSubtitle.trim() || undefined,
      gradient: customGradient,
      isCustom: true,
      category: 'custom',
    };

    const updated = [newSticker, ...customStickers];
    saveCustomStickersList(updated);

    if (andSend) {
      onSendSticker(newSticker);
      onClose();
    } else {
      setCreatorSuccessNotice(true);
      setTimeout(() => {
        setCreatorSuccessNotice(false);
        setActiveTab('stickers');
        setSelectedStickerCategory('custom');
      }, 900);
    }
  };

  // Delete Custom Sticker
  const handleDeleteCustomSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customStickers.filter((s) => s.id !== id);
    saveCustomStickersList(updated);
  };

  // Filtered Stickers
  const allAvailableStickers = [...customStickers, ...DEFAULT_LOVE_STICKERS];
  const filteredStickers = allAvailableStickers.filter((stk) => {
    if (selectedStickerCategory === 'all') return true;
    if (selectedStickerCategory === 'custom') return stk.isCustom;
    return stk.category === selectedStickerCategory;
  });

  return (
    <div
      id="emoji-sticker-picker-container"
      className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border border-rose-200 shadow-2xl shadow-rose-950/20 flex flex-col overflow-hidden animate-fade-in"
      style={{ maxHeight: '420px' }}
    >
      {/* Top Header & Tabs */}
      <div className="p-3 border-b border-rose-100 flex items-center justify-between bg-rose-50/70 shrink-0">
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-rose-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('stickers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'stickers'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Stickers Amour</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emojis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'emojis'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Émojis rapides</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'creator'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          title="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STICKERS AMOUR & JOIE                                              */}
      {/* ========================================================================= */}
      {activeTab === 'stickers' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Category Filter Pills */}
          <div className="px-3 py-2 border-b border-rose-100/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white shrink-0">
            <button
              type="button"
              onClick={() => setSelectedStickerCategory('all')}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedStickerCategory === 'all'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-slate-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Tous ({allAvailableStickers.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStickerCategory('love')}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedStickerCategory === 'love'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-slate-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              ❤️ Amour
            </button>
            <button
              type="button"
              onClick={() => setSelectedStickerCategory('joy')}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedStickerCategory === 'joy'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-slate-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              ☀️ Joie & Bonheur
            </button>
            <button
              type="button"
              onClick={() => setSelectedStickerCategory('date')}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedStickerCategory === 'date'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-slate-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              ☕ Rendez-vous
            </button>
            <button
              type="button"
              onClick={() => setSelectedStickerCategory('compliment')}
              className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                selectedStickerCategory === 'compliment'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                  : 'bg-rose-50 text-slate-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              🌸 Mots Doux
            </button>
            {customStickers.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStickerCategory('custom')}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                  selectedStickerCategory === 'custom'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
              >
                Mes Créations ({customStickers.length})
              </button>
            )}
          </div>

          {/* Stickers Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 min-h-0">
            {filteredStickers.map((sticker) => (
              <div
                key={sticker.id}
                onClick={() => {
                  onSendSticker(sticker);
                  onClose();
                }}
                className={`group relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br ${sticker.gradient} text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95 flex flex-col justify-between select-none min-h-[96px] border border-white/20`}
              >
                {/* Decorative glowing backdrops */}
                <span className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/20 blur-sm group-hover:scale-125 transition-transform" />

                <div className="flex items-start justify-between">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-6">
                    {sticker.emoji}
                  </span>

                  {sticker.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomSticker(sticker.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-black/30 hover:bg-black/50 text-white/90 transition-opacity"
                      title="Supprimer mon sticker"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <h5 className="font-black text-xs sm:text-sm text-white leading-tight drop-shadow-xs truncate">
                    {sticker.title}
                  </h5>
                  {sticker.subtitle && (
                    <p className="text-[10px] text-white/90 leading-tight font-medium truncate mt-0.5">
                      {sticker.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Add Custom Card in Grid */}
            <button
              type="button"
              onClick={() => setActiveTab('creator')}
              className="rounded-2xl p-3 border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 hover:bg-rose-100/60 text-rose-600 flex flex-col items-center justify-center gap-1.5 transition-all text-center min-h-[96px] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-rose-200/70 flex items-center justify-center text-rose-600 shadow-2xs">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Personnaliser un sticker</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RAPID EMOJIS                                                       */}
      {/* ========================================================================= */}
      {activeTab === 'emojis' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Quick Search */}
          <div className="p-2.5 border-b border-rose-100 bg-white shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
                placeholder="Rechercher un émoji (cœur, rire, bisou...)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-rose-400"
              />
              {emojiSearch && (
                <button
                  type="button"
                  onClick={() => setEmojiSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Emoji Lists by Category */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {EMOJI_CATEGORIES.map((cat) => {
              const matches = cat.emojis.filter((emoji) => {
                if (!emojiSearch) return true;
                return cat.name.toLowerCase().includes(emojiSearch.toLowerCase());
              });

              if (matches.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                    {matches.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onSelectEmoji(emoji);
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xl hover:bg-rose-100 hover:scale-125 transition-all cursor-pointer select-none active:scale-95"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOM STICKER CREATOR / STUDIO                                    */}
      {/* ========================================================================= */}
      {activeTab === 'creator' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Live Preview Box */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1.5 flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-rose-500" />
              <span>Aperçu de votre Sticker en direct</span>
            </span>

            <div
              className={`w-52 sm:w-60 rounded-2xl p-4 bg-gradient-to-br ${customGradient} text-white shadow-xl shadow-rose-500/20 border border-white/30 text-center space-y-1 relative overflow-hidden transform transition-all duration-300 hover:scale-105`}
            >
              <span className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20 blur-md pointer-events-none" />
              <div className="text-4xl filter drop-shadow-md animate-bounce my-1">
                {customEmoji || '💖'}
              </div>
              <h4 className="font-black text-sm sm:text-base leading-tight drop-shadow-xs">
                {customTitle || 'Titre du sticker'}
              </h4>
              {customSubtitle && (
                <p className="text-xs text-white/90 font-medium leading-tight">
                  {customSubtitle}
                </p>
              )}
            </div>
          </div>

          {creatorSuccessNotice && (
            <div className="p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-bounce">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Sticker enregistré dans votre collection !</span>
            </div>
          )}

          {/* Form Controls */}
          <div className="space-y-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
            {/* Choose Emoji / Icon */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                1. Choisissez une icône / émoji :
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {STICKER_ICONS_LIBRARY.map((icon, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomEmoji(icon)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-all cursor-pointer ${
                      customEmoji === icon
                        ? 'bg-rose-500 text-white border-rose-600 scale-110 shadow-xs'
                        : 'bg-white border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                2. Message d'amour ou de joie (Titre) :
              </label>
              <input
                type="text"
                maxLength={35}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Coup de cœur, Un café ?, Bisous..."
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500 font-bold"
              />
            </div>

            {/* Custom Subtitle Input */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                3. Sous-titre ou dédicace (Optionnel) :
              </label>
              <input
                type="text"
                maxLength={45}
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="Ex: Pour ma personne préférée, Hâte de te voir !"
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Gradient Theme Picker */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                4. Ambiance & Dégradé de couleurs :
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {STICKER_GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCustomGradient(g.value)}
                    className={`h-7 rounded-xl bg-gradient-to-r ${g.value} border-2 transition-all cursor-pointer relative flex items-center justify-center ${
                      customGradient === g.value
                        ? 'border-slate-900 scale-105 shadow-xs'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    title={g.name}
                  >
                    {customGradient === g.value && (
                      <Check className="w-3 h-3 text-white drop-shadow-xs stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Save or Send Now */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveCustomSticker(false)}
                disabled={!customTitle.trim()}
                className="flex-1 py-2 rounded-xl bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Enregistrer dans ma collection</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveCustomSticker(true)}
                disabled={!customTitle.trim()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-rose-300"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer directement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
