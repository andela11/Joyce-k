import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Radio,
  Bot,
  Heart,
  Globe2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Send,
  Mail,
  MapPin,
  Building2,
  UserCheck,
  ChevronRight,
  Star,
  Quote,
  Flame,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { JoyceKLogo } from './JoyceKLogo';
import { HeartExplosionTitle } from './HeartExplosionTitle';
import { ActiveTab, UserProfile } from '../types';
import { PRESET_CITIES } from '../utils/geoUtils';
import { AnimatedFooter } from './AnimatedFooter';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onEnterApp: (tab?: ActiveTab) => void;
  sampleProfiles?: UserProfile[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterApp,
  sampleProfiles = [],
}) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('Renseignement');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactStatus('sending');
    setTimeout(() => {
      setContactStatus('sent');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 800);
  };

  // Diverse smiling faces representing all ethnicities
  const smilingFaces = [
    {
      name: 'Amina',
      age: 26,
      city: 'Paris & Dakar',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      passion: 'Art & Musique',
    },
    {
      name: 'Lucas',
      age: 29,
      city: 'Yaoundé',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
      passion: 'Tech & Voyages',
    },
    {
      name: 'Mei',
      age: 25,
      city: 'Tokyo & Lyon',
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
      passion: 'Gastronomie & Photo',
    },
    {
      name: 'Antoine',
      age: 31,
      city: 'Bruxelles',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
      passion: 'Architecture & Design',
    },
    {
      name: 'Fatou',
      age: 27,
      city: 'Dakar',
      photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
      passion: 'Entrepreneuriat',
    },
    {
      name: 'Camila',
      age: 28,
      city: 'Montréal',
      photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80',
      passion: 'Nature & Cinéma',
    },
    {
      name: 'Yassine',
      age: 30,
      city: 'Casablanca & Paris',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
      passion: 'Sports & Littérature',
    },
    {
      name: 'Chloé',
      age: 24,
      city: 'Genève',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
      passion: 'Yoga & Randonnée',
    },
    {
      name: 'Malik',
      age: 32,
      city: 'Abidjan',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
      passion: 'Finance & Jazz',
    },
    {
      name: 'Linh',
      age: 27,
      city: 'Montréal & Singapour',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
      passion: 'Peinture & Mer',
    },
  ];

  // Authentic Testimonials
  const testimonials = [
    {
      id: 1,
      names: 'Aminata & Alexandre',
      location: 'Dakar — Paris',
      photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80',
      rating: 5,
      quote:
        "Après des mois de déceptions sur d'autres applications remplies de faux profils, Joyce-K a été une vraie révélation. La certification des photos nous a tout de suite rassurés. Nous fêtons notre premier anniversaire ensemble !",
      date: 'Couple formé en 2025',
    },
    {
      id: 2,
      names: 'Sophie & Cyrille',
      location: 'Bruxelles — Yaoundé',
      photo: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=800&auto=format&fit=crop&q=80',
      rating: 5,
      quote:
        "Le radar international et l'analyse d'affinités basées sur nos passions communes nous ont connectés instantanément. Une application moderne, fluide et profondément humaine.",
      date: 'Fiancés en 2026',
    },
    {
      id: 3,
      names: 'Mei & David',
      location: 'Tokyo — Lyon',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&auto=format&fit=crop&q=80',
      rating: 5,
      quote:
        "Le respect de la vie privée avec le mode fantôme et l'absence totale de robots publicitaires font toute la différence. On parle à des gens réels avec de vraies intentions.",
      date: 'Ensemble depuis 8 mois',
    },
    {
      id: 4,
      names: 'Camila & Julien',
      location: 'Montréal — Abidjan',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      rating: 5,
      quote:
        "La clarté de l'interface et le Wingman IA pour débloquer nos conversations nous ont permis de briser la glace en toute sincérité. Merci à l'équipe Joyce-K !",
      date: 'Couple certifié',
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      badge: 'Anti-IA Garanti',
      title: 'Certification & Zéro Photo IA',
      description:
        "Toutes les photos sont vérifiées par nos protocoles d'authenticité. Les images générées par IA (Midjourney, DALL-E, avatars synthétiques) sont strictement bloquées à l'inscription.",
    },
    {
      icon: Radio,
      badge: 'Radar Mondial',
      title: 'Radar de Proximité & Monde',
      description:
        "Localisez instantanément les personnes compatibles autour de vous ou explorez les grandes capitales du monde entier (Europe, Afrique, Amériques, Asie, Caraïbes).",
    },
    {
      icon: Heart,
      badge: 'Affinités Profondes',
      title: 'Matching Basé sur vos Passions',
      description:
        "Plus de 50 badges d'intérêts et calcul de compatibilité multidimensionnelle : projets de vie, univers culturel, rythmes et valeurs partagées.",
    },
    {
      icon: Bot,
      badge: 'Coach & Répondeur',
      title: 'IA Wingman & Auto-Répondeur',
      description:
        "Un assistant intelligent pour sublimer votre présentation, vous suggérer des amorces percutantes et répondre en douceur à vos matchs lorsque vous êtes indisponible.",
    },
    {
      icon: Lock,
      badge: 'Vie Privée RGPD',
      title: 'Mode Fantôme & Sécurité Absolue',
      description:
        "Floutage automatique des photos, messages éphémères, protection anti-capture et suppression intégrale des données en un clic (conformité RGPD stricte).",
    },
    {
      icon: Globe2,
      badge: 'International',
      title: 'Couverture Internationale',
      description:
        "De Paris à Yaoundé, de Dakar à Montréal, de Bruxelles à Abidjan et Tokyo : connectez-vous avec des célibataires authentiques sans frontières.",
    },
  ];

  return (
    <div id="joyce-k-landing-page" className="w-full bg-white dark:bg-[#0b0d12] text-slate-800 dark:text-slate-100 selection:bg-rose-500 selection:text-white transition-colors duration-200">
      {/* 1. HERO SECTION WITH PHOTO COVER BACKGROUND CLEARLY VISIBLE */}
      <section id="hero-section" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 flex items-center justify-center min-h-[640px]">
        {/* Background Cover Photo with High Clarity & Vibrancy */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600&auto=format&fit=crop&q=85"
            alt="Joyce-K Rencontres Authentiques"
            className="w-full h-full object-cover object-center scale-100 filter brightness-105 dark:brightness-90 contrast-[1.03] transition-all duration-1000"
            referrerPolicy="no-referrer"
          />

          {/* Clean, Lighter Gradient & Vignette Overlay in light, deep charcoal in dark */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80 dark:from-[#0b0d12]/85 dark:via-[#0b0d12]/75 dark:to-[#0b0d12]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 dark:from-[#0b0d12] dark:via-transparent dark:to-[#0b0d12]/50" />

          {/* Gentle warm accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-200/25 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-7">
            {/* Prominent Centered Brand Logo */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="p-4 sm:p-5 rounded-[28px] bg-white/95 dark:bg-[#131620]/90 dark:border dark:border-slate-800/80 backdrop-blur-md shadow-xl shadow-slate-900/5 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-center text-center">
                <JoyceKLogo size="xl" variant="light-bg" showTagline={true} />
              </div>
            </div>

            {/* Main Catchphrase with Interactive Heart Explosion on Hover */}
            <div className="space-y-3.5 max-w-2xl mx-auto flex flex-col items-center">
              <HeartExplosionTitle
                title="Jusqu'à la rencontre authentique"
                titleClassName="text-3xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight leading-tight sm:leading-[1.15] drop-shadow-sm text-slate-900 dark:text-white"
              />
              <p className="text-sm sm:text-base md:text-lg text-slate-800 dark:text-slate-200 font-normal font-sans max-w-xl mx-auto leading-relaxed drop-shadow-xs bg-white/60 dark:bg-[#131620]/75 dark:border dark:border-slate-800/60 backdrop-blur-[2px] p-2 rounded-xl">
                Découvrez la première plateforme de rencontres internationales certifiée 100% personnes réelles. Sans faux profils ni IA trompeuse.
              </p>
            </div>

            {/* Quick Trust Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-800 dark:text-slate-200 font-medium font-sans pt-1">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#151924]/90 dark:border dark:border-slate-800 backdrop-blur-md shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Photos Réelles Certifiées
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#151924]/90 dark:border dark:border-slate-800 backdrop-blur-md shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-rose-500" />
                Radar Mondial & Local
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#151924]/90 dark:border dark:border-slate-800 backdrop-blur-md shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Confidentialité & Mode Fantôme
              </span>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full sm:w-auto font-sans">
              <button
                id="hero-signup-popup-btn"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm sm:text-base shadow-sm shadow-rose-600/20 flex items-center justify-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Créer mon compte</span>
              </button>

              <button
                id="hero-login-popup-btn"
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white dark:bg-[#151924] dark:border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1b2030] text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </button>
            </div>

            {/* Quick Worldwide Coverage Preview */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-[#131620]/80 dark:border dark:border-slate-800 backdrop-blur-xs px-4 py-2 rounded-full shadow-xs">
              <Globe2 className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>
                Actif dans plus de 25 grandes métropoles mondiales (Paris, Yaoundé, Dakar, Montréal, Abidjan, Bruxelles, Genève...)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DIVERSE RADIANT SMILING FACES MARQUEE */}
      <section id="members-section" className="py-8 bg-slate-50 dark:bg-[#0e1118] dark:border-y dark:border-slate-800/80 overflow-hidden relative transition-colors">
        <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Membres certifiés actifs à travers le monde
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
            Profils vérifiés avec photos réelles
          </span>
        </div>

        {/* Continuous Horizontal Scrolling Strip */}
        <div className="relative w-full overflow-hidden mask-fade z-10">
          <div className="animate-marquee flex gap-4 py-2">
            {/* Duplicated list for seamless looping */}
            {[...smilingFaces, ...smilingFaces].map((person, idx) => (
              <div
                key={idx}
                onClick={() => onOpenAuth('signup')}
                className="w-56 p-3 rounded-2xl bg-white dark:bg-[#151924] dark:border dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center gap-3 shrink-0 cursor-pointer group"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                      {person.name}, {person.age}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 truncate font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                    {person.city}
                  </p>
                  <span className="inline-block text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {person.passion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRESENTATION DES FONCTIONNALITÉS */}
      <section id="features-section" className="py-20 md:py-24 bg-white dark:bg-[#0b0d12] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-[#151924] dark:border dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans">
              Fonctionnalités Clés
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              Tout ce dont vous avez besoin pour des rencontres réelles
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal font-sans max-w-xl mx-auto leading-relaxed">
              Une expérience fluide conçue pour favoriser des conversations authentiques et spontanées.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  id={`feature-card-${idx}`}
                  className="p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800/80 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#1c2233] flex items-center justify-center text-slate-700 dark:text-rose-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-all shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white dark:bg-[#1c2233] text-slate-600 dark:text-slate-300 shadow-2xs font-sans">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal font-sans">
                      {f.description}
                    </p>
                  </div>

                  <div
                    onClick={() => onOpenAuth('signup')}
                    className="mt-6 pt-3.5 flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 cursor-pointer transition-all font-sans"
                  >
                    <span>Découvrir</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REAL TESTIMONIALS SECTION */}
      <section id="testimonials-section" className="py-16 md:py-24 bg-slate-50 dark:bg-[#0e1118] dark:border-y dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white dark:bg-[#151924] dark:border dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs font-sans">
              Témoignages & Expériences
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              Ils ont trouvé l'amour sur Joyce-K
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-normal font-sans">
              Des célibataires qui partagent leur parcours authentique.
            </p>
          </div>
        </div>

        {/* Testimonials Continuous Marquee */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee-slow flex gap-6 px-4 py-2">
            {[...testimonials, ...testimonials].map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 p-6 rounded-3xl bg-white dark:bg-[#151924] dark:border dark:border-slate-800 shadow-xs hover:shadow-md flex flex-col justify-between shrink-0 space-y-4 group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, starIdx) => (
                        <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-sans">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-serif">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                    <img
                      src={item.photo}
                      alt={item.names}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif text-slate-900 dark:text-white">
                      {item.names}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal font-sans flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RADAR & PRÉSENCE MONDIALE */}
      <section id="radar-preview-section" className="py-20 md:py-24 bg-white dark:bg-[#0b0d12] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#151924] dark:border dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold font-sans">
                <Radio className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Radar & Présence Mondiale</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight leading-snug">
                Trouvez des personnes qui partagent votre vision du monde.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal font-sans">
                Que vous soyez à Paris, Yaoundé, Douala, Bruxelles, Dakar, Abidjan, Montréal ou Genève, notre radar vous permet de visualiser facilement les profils à proximité et certifiés.
              </p>

              <div className="space-y-3 font-sans">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1c2233] flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5 shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif text-slate-900 dark:text-white">Vérification de profil</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Aucun faux profil ni robot. Vous échangez uniquement avec de vrais utilisateurs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1c2233] flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5 shadow-xs">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif text-slate-900 dark:text-white">Échanges fluides & respectueux</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Notes vocales, messagerie instantanée et suggestions d'intérêts communs.</p>
                  </div>
                </div>
              </div>

              <button
                id="landing-radar-cta-btn"
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3.5 rounded-full bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer font-sans"
              >
                <span>Accéder au radar mondial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Preview Card Showcase */}
            <div className="relative font-sans">
              <div className="bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold font-serif text-slate-900 dark:text-white">Villes & Régions Actives</span>
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-[#1c2233] px-2.5 py-0.5 rounded-full shadow-xs">
                    Disponibles
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {PRESET_CITIES.slice(0, 8).map((city) => (
                    <div
                      key={city.name}
                      onClick={() => onOpenAuth('signup')}
                      className="p-3 rounded-2xl bg-white dark:bg-[#181d2a] dark:border dark:border-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 cursor-pointer transition-all flex items-center justify-between shadow-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{city.flag}</span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{city.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{city.country}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {city.region}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer transition-colors"
                  >
                    <span>Voir tous les profils de votre région</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTIE CONTACT */}
      <section id="contact-section" className="py-16 md:py-24 bg-white dark:bg-[#0b0d12] transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 dark:border dark:border-rose-900/50 text-rose-800 dark:text-rose-300 font-sans">
              Support & Contact
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              Une question ou suggestion ? Contactez-nous
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal font-sans">
              Notre équipe d'assistance et de développement est à votre disposition pour vous répondre rapidement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-sans">
            {/* Contact Info Box */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800/80 space-y-5 shadow-xs">
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white pb-1">
                Informations Joyce-K
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c2233] flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Éditeur & Entreprise</p>
                    <p className="text-slate-600 dark:text-slate-400">Blink-services</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c2233] flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Concepteur & Fondateur</p>
                    <p className="text-slate-600 dark:text-slate-400">Junior Andela</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c2233] flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Siège & Localisation</p>
                    <p className="text-slate-600 dark:text-slate-400">Yaoundé, Cameroun</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1c2233] flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Adresse E-mail de Contact</p>
                    <a
                      href="mailto:blinkservices513@gmail.com"
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold underline"
                    >
                      blinkservices513@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#131620] dark:border dark:border-slate-800/80 shadow-xs">
              {contactStatus === 'sent' ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Message envoyé avec succès !</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Merci pour votre message. L'équipe Blink-services vous répondra sur votre adresse dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setContactStatus('idle')}
                    className="mt-4 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-rose-600 text-xs font-medium text-white hover:bg-slate-800 dark:hover:bg-rose-500 cursor-pointer shadow-xs"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">Envoyez-nous un message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Votre Nom
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Alexandre Martin"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181d2a] dark:border dark:border-slate-700/80 focus:bg-white dark:focus:bg-[#1c2233] focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 dark:text-white font-medium shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Votre Adresse E-mail
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nom@exemple.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181d2a] dark:border dark:border-slate-700/80 focus:bg-white dark:focus:bg-[#1c2233] focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 dark:text-white font-medium shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Sujet de votre demande
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181d2a] dark:border dark:border-slate-700/80 focus:bg-white dark:focus:bg-[#1c2233] focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 dark:text-white font-medium shadow-2xs"
                    >
                      <option value="Renseignement">Renseignement général</option>
                      <option value="Vérification Photo">Question sur la certification photo & Anti-IA</option>
                      <option value="Support Technique">Assistance technique / Compte</option>
                      <option value="Partenariat">Partenariat & Blink-services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Votre Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Expliquez-nous votre demande en détail..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#181d2a] dark:border dark:border-slate-700/80 focus:bg-white dark:focus:bg-[#1c2233] focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs text-slate-900 dark:text-white leading-relaxed font-medium shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4 stroke-[1.75px]" />
                    <span>{contactStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. MODERN ANIMATED FOOTER */}
      <AnimatedFooter onOpenAuth={onOpenAuth} />
    </div>
  );
};
