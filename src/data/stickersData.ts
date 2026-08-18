import { LoveSticker } from '../types';

export const DEFAULT_LOVE_STICKERS: LoveSticker[] = [
  // Amour & Romance
  {
    id: 'stk_coup_de_foudre',
    emoji: '💘',
    title: 'Coup de foudre',
    subtitle: 'Mon cœur a fait boum !',
    gradient: 'from-rose-500 via-pink-500 to-rose-600',
    category: 'love',
  },
  {
    id: 'stk_papillons',
    emoji: '🦋',
    title: 'Papillons dans le ventre',
    subtitle: 'Chaque fois que tu m\'écris',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-400',
    category: 'love',
  },
  {
    id: 'stk_coeur_fort',
    emoji: '💓',
    title: 'Mon cœur bat fort',
    subtitle: 'Rien que pour toi',
    gradient: 'from-rose-600 via-red-500 to-pink-600',
    category: 'love',
  },
  {
    id: 'stk_calin',
    emoji: '🤗',
    title: 'Envie d\'un gros câlin',
    subtitle: 'Douceur & Tendresse',
    gradient: 'from-orange-400 via-rose-400 to-pink-500',
    category: 'love',
  },
  {
    id: 'stk_pensee_toi',
    emoji: '🌸',
    title: 'Je pense fort à toi',
    subtitle: 'Une douce pensée aujourd\'hui',
    gradient: 'from-pink-400 via-rose-400 to-purple-400',
    category: 'love',
  },
  {
    id: 'stk_craquer',
    emoji: '🥰',
    title: 'Tu me fais craquer',
    subtitle: 'Totalement sous le charme',
    gradient: 'from-rose-500 via-amber-400 to-pink-500',
    category: 'love',
  },

  // Bonheur & Joie
  {
    id: 'stk_soleil',
    emoji: '☀️',
    title: 'Mon rayon de soleil',
    subtitle: 'Tu illumines ma journée',
    gradient: 'from-amber-400 via-orange-400 to-pink-500',
    category: 'joy',
  },
  {
    id: 'stk_sourire',
    emoji: '😄',
    title: 'Sourire contagieux',
    subtitle: 'Impossible de ne pas sourire',
    gradient: 'from-yellow-400 via-amber-500 to-rose-400',
    category: 'joy',
  },
  {
    id: 'stk_danse_joie',
    emoji: '💃',
    title: 'Danse de la joie !',
    subtitle: 'Trop heureux(se) de te parler',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    category: 'joy',
  },
  {
    id: 'stk_ondes_positives',
    emoji: '✨',
    title: 'Ondes 100% positives',
    subtitle: 'Une belle énergie partagée',
    gradient: 'from-amber-300 via-rose-400 to-purple-500',
    category: 'joy',
  },
  {
    id: 'stk_etoile',
    emoji: '🌟',
    title: 'Tu es une pépite',
    subtitle: 'Une rencontre magique',
    gradient: 'from-amber-400 via-yellow-300 to-orange-500',
    category: 'joy',
  },

  // Rendez-vous & Moments partagés
  {
    id: 'stk_cafe',
    emoji: '☕',
    title: 'Un café ensemble ?',
    subtitle: 'Dis-moi quand tu es dispo !',
    gradient: 'from-amber-600 via-orange-500 to-rose-500',
    category: 'date',
  },
  {
    id: 'stk_trinquer',
    emoji: '🥂',
    title: 'Trinquons à nous deux !',
    subtitle: 'Au plaisir de trinquer en vrai',
    gradient: 'from-yellow-500 via-amber-400 to-rose-400',
    category: 'date',
  },
  {
    id: 'stk_coucher_soleil',
    emoji: '🌅',
    title: 'Coucher de soleil à deux',
    subtitle: 'Le cadre parfait',
    gradient: 'from-orange-500 via-rose-500 to-purple-600',
    category: 'date',
  },
  {
    id: 'stk_gourmandise',
    emoji: '🧁',
    title: 'Un moment sucré ?',
    subtitle: 'Gourmandise & Rires',
    gradient: 'from-pink-400 via-rose-300 to-orange-300',
    category: 'date',
  },

  // Compliments & Mots Doux
  {
    id: 'stk_magnifique',
    emoji: '🌹',
    title: 'Une rose pour toi',
    subtitle: 'Tu es magnifique',
    gradient: 'from-rose-600 via-red-500 to-pink-500',
    category: 'compliment',
  },
  {
    id: 'stk_coup_de_coeur',
    emoji: '💖',
    title: 'Vrai coup de cœur',
    subtitle: 'Notre feeling est incroyable',
    gradient: 'from-rose-500 via-fuchsia-500 to-pink-400',
    category: 'compliment',
  },
  {
    id: 'stk_trop_mignon',
    emoji: '😻',
    title: 'Trop mignon(ne) !',
    subtitle: 'Tu as un charme fou',
    gradient: 'from-pink-500 via-rose-400 to-orange-400',
    category: 'compliment',
  },
  {
    id: 'stk_lettre_amour',
    emoji: '💌',
    title: 'Un petit mot doux',
    subtitle: 'Juste pour illuminer ton cœur',
    gradient: 'from-rose-400 via-pink-400 to-purple-400',
    category: 'compliment',
  },
];

export const EMOJI_CATEGORIES = [
  {
    id: 'love',
    name: 'Amour & Cœurs',
    icon: '❤️',
    emojis: [
      '❤️', '💖', '💕', '💓', '💗', '💘', '💝', '💞', '💟', '💌',
      '💋', '💍', '🌹', '💐', '🌸', '🌷', '🌺', '🌻', '🕊️', '🧸',
      '💑', '👩‍❤️‍👨', '💏', '🔥', '✨', '💎', '🍓', '🍒', '🍫', '🎁'
    ],
  },
  {
    id: 'joy',
    name: 'Sourires & Joie',
    icon: '😊',
    emojis: [
      '🥰', '😍', '😘', '😚', '😋', '😜', '🤩', '😄', '😃', '😀',
      '😁', '😆', '🥹', '🥳', '🤗', '😇', '😻', '☀️', '🌟', '🌈',
      '✨', '🎉', '💫', '🪄', '🦋', '🎈', '💖', '💃', '🕺', '🧁'
    ],
  },
  {
    id: 'humor',
    name: 'Rires & Fun',
    icon: '😂',
    emojis: [
      '🤣', '😂', '😅', '🤭', '🤫', '😜', '🤪', '🙃', '🤠', '🙈',
      '🙉', '🙊', '😎', '🥳', '🙌', '👏', '✌️', '🤞', '🫶', '🍿'
    ],
  },
  {
    id: 'dates',
    name: 'Rendez-vous & Sorties',
    icon: '🥂',
    emojis: [
      '🥂', '🍸', '🍷', '🍾', '☕', '🍵', '🍫', '🍓', '🍕', '🍣',
      '🍰', '🧁', '🍦', '🏖️', '🚗', '🎡', '🎟️', '🎬', '🎵', '🌅'
    ],
  },
];

export const STICKER_GRADIENTS = [
  { id: 'grad_rose', name: 'Romance Rose', value: 'from-rose-500 via-pink-500 to-rose-600' },
  { id: 'grad_sunset', name: 'Rayon de Soleil', value: 'from-amber-400 via-orange-500 to-rose-500' },
  { id: 'grad_passion', name: 'Violet Passion', value: 'from-purple-600 via-fuchsia-500 to-pink-500' },
  { id: 'grad_pastel', name: 'Douceur Pastel', value: 'from-pink-400 via-rose-300 to-amber-200' },
  { id: 'grad_ocean', name: 'Ciel & Étoiles', value: 'from-blue-600 via-indigo-500 to-purple-600' },
  { id: 'grad_mint', name: 'Menthe Fraîche', value: 'from-emerald-400 via-teal-500 to-cyan-500' },
  { id: 'grad_gold', name: 'Or & Lumière', value: 'from-yellow-400 via-amber-500 to-orange-500' },
  { id: 'grad_ruby', name: 'Rubis Intense', value: 'from-red-600 via-rose-600 to-pink-600' },
];

export const STICKER_ICONS_LIBRARY = [
  '❤️', '💖', '💘', '💓', '💕', '🌹', '💐', '🌸', '☀️', '🌟',
  '✨', '🦋', '🤗', '🥰', '😍', '😘', '☕', '🥂', '🧁', '💌',
  '🧸', '🍓', '💍', '🎁', '🌈', '🕊️', '🌅', '🔥', '💃', '💎',
  '🍕', '🚗', '🎬', '🎶', '🥳', '🤩', '😻', '🌴', '🏖️', '🍫'
];
