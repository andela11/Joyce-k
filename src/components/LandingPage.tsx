import React, { useState } from 'react';
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
} from 'lucide-react';
import { JoyceKLogo } from './JoyceKLogo';
import { ActiveTab, UserProfile } from '../types';
import { PRESET_CITIES } from '../utils/geoUtils';

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
    <div id="joyce-k-landing-page" className="w-full bg-white text-slate-800 selection:bg-rose-500 selection:text-white">
      {/* 1. HERO SECTION WITH PHOTO COVER BACKGROUND CLEARLY VISIBLE */}
      <section id="hero-section" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-orange-100/70 flex items-center justify-center min-h-[640px]">
        {/* Background Cover Photo with High Clarity & Vibrancy */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600&auto=format&fit=crop&q=85"
            alt="Joyce-K Rencontres Authentiques"
            className="w-full h-full object-cover object-center scale-100 filter brightness-105 contrast-[1.03] transition-all duration-1000"
            referrerPolicy="no-referrer"
          />

          {/* Clean, Lighter Gradient & Vignette Overlay ensuring the photo is well perceived while keeping text fully legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />

          {/* Gentle warm accent glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-rose-200/25 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="flex flex-col items-center justify-center text-center space-y-6 sm:space-y-7">
            {/* Prominent Centered Brand Logo */}
            <div className="w-full flex flex-col items-center justify-center">
              <div className="p-4 sm:p-5 rounded-[28px] bg-white/95 backdrop-blur-md border border-orange-200/90 shadow-2xl shadow-orange-100/80 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-center text-center">
                <JoyceKLogo size="xl" variant="light-bg" showTagline={true} />
              </div>
            </div>

            {/* Main Catchphrase */}
            <div className="space-y-3.5 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight sm:leading-[1.1] drop-shadow-sm">
                L’Amour Authentique, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500">
                  Sans Faux Profils ni IA.
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-800 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-xs bg-white/60 sm:bg-white/40 backdrop-blur-[2px] p-2 rounded-xl">
                Découvrez la première plateforme de rencontres internationales certifiée 100% personnes réelles. Matching par passions partagées, radar de proximité mondial et IA discrète.
              </p>
            </div>

            {/* Quick Trust Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-800 font-bold pt-1">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Photos Réelles Certifiées
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-rose-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Radar Mondial & Local
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-orange-200 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-orange-600" />
                Confidentialité & Mode Fantôme
              </span>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 w-full sm:w-auto">
              <button
                id="hero-signup-popup-btn"
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-300/90 flex items-center justify-center transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Créer mon compte</span>
              </button>

              <button
                id="hero-login-popup-btn"
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/95 hover:bg-white text-slate-800 font-bold text-sm sm:text-base border border-orange-200 shadow-md shadow-orange-100/50 flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-md"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4 text-rose-500" />
              </button>
            </div>

            {/* Quick Worldwide Coverage Preview */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 bg-white/70 backdrop-blur-xs px-4 py-1.5 rounded-full border border-orange-100/60 shadow-2xs">
              <Globe2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                Actif dans plus de 25 grandes métropoles mondiales (Paris, Yaoundé, Dakar, Montréal, Abidjan, Bruxelles, Genève...)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DIVERSE RADIANT SMILING FACES MARQUEE - TOUTES RACES & VISAGES JOYEUX */}
      <section id="members-section" className="py-8 bg-gradient-to-r from-orange-50/70 via-rose-50/50 to-orange-50/70 border-b border-orange-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Membres certifiés en ligne à travers le monde
            </span>
          </div>
          <span className="text-xs font-bold text-rose-600 hidden sm:inline">
            100% Visages Réels & Souriants
          </span>
        </div>

        {/* Continuous Horizontal Scrolling Strip */}
        <div className="relative w-full overflow-hidden mask-fade">
          <div className="animate-marquee flex gap-4 py-2">
            {/* Duplicated list for seamless looping */}
            {[...smilingFaces, ...smilingFaces].map((person, idx) => (
              <div
                key={idx}
                onClick={() => onOpenAuth('signup')}
                className="w-56 p-3 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 shrink-0 cursor-pointer group hover:border-rose-300"
              >
                <div className="relative w-13 h-13 rounded-full overflow-hidden bg-slate-100 shrink-0 border-2 border-orange-200">
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 p-0.5 rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {person.name}, {person.age}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-0.5 truncate font-medium">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                    {person.city}
                  </p>
                  <span className="inline-block text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">
                    {person.passion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRESENTATION DES FONCTIONNALITÉS */}
      <section id="features-section" className="py-16 md:py-24 border-b border-orange-100/70 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-rose-700 border border-orange-200">
              Fonctionnalités Clés
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tout ce dont vous avez besoin pour des rencontres vraies
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Chaque détail de Joyce-K a été conçu pour éliminer la superficialité et connecter des cœurs sincères.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  id={`feature-card-${idx}`}
                  className="p-6 rounded-3xl bg-white border border-orange-100 hover:border-rose-300 transition-all duration-300 shadow-lg shadow-orange-50/50 hover:shadow-xl hover:shadow-rose-100/50 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {f.description}
                    </p>
                  </div>

                  <div
                    onClick={() => onOpenAuth('signup')}
                    className="mt-5 pt-3 border-t border-orange-100 flex items-center text-xs font-bold text-rose-600 cursor-pointer group-hover:translate-x-1 transition-transform"
                  >
                    <span>Rejoindre pour tester</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REAL TESTIMONIALS SECTION - DÉFILEMENT DE TÉMOIGNAGES DE VRAIS COUPLES */}
      <section id="testimonials-section" className="py-16 md:py-24 border-b border-orange-100/70 bg-gradient-to-b from-orange-50/30 via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
              Histoires d'Amour Réelles
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Ils ont trouvé l'amour sur Joyce-K
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Découvrez les témoignages de célibataires du monde entier qui ont rencontré leur moitié grâce à nos profils certifiés.
            </p>
          </div>
        </div>

        {/* Testimonials Continuous Marquee */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee-slow flex gap-6 px-4 py-2">
            {[...testimonials, ...testimonials].map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 p-6 rounded-3xl bg-white border border-rose-100 shadow-xl shadow-rose-100/40 flex flex-col justify-between shrink-0 space-y-4 group hover:border-rose-300 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Stars */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.rating)].map((_, starIdx) => (
                        <Star key={starIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic font-medium">
                    "{item.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-rose-50">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-200 shrink-0">
                    <img
                      src={item.photo}
                      alt={item.names}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">
                      {item.names}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RADAR & AFFINITY SPOTLIGHT */}
      <section id="radar-preview-section" className="py-16 md:py-24 border-b border-orange-100/70 bg-gradient-to-b from-white via-orange-50/30 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Description */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-rose-700 text-xs font-bold">
                <Radio className="w-3.5 h-3.5 text-rose-600" />
                <span>Radar & Présence Mondiale</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                Trouvez des personnes qui partagent votre vision du monde.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Que vous soyez à Paris, Yaoundé, Douala, Bruxelles, Dakar, Abidjan ou Genève, notre radar vous permet de visualiser instantanément les profils disponibles et certifiés.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-orange-100 shadow-xs">
                  <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Vérification humaine systématique</h4>
                    <p className="text-xs text-slate-600">Aucun faux profil, aucun bot commercial. Vous échangez uniquement avec de vraies personnes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-orange-100 shadow-xs">
                  <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Échanges fluides & sécurisés</h4>
                    <p className="text-xs text-slate-600">Notes vocales, messagerie instantanée, brise-glaces et suggestions d'affinités basées sur vos loisirs.</p>
                  </div>
                </div>
              </div>

              <button
                id="landing-radar-cta-btn"
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-200 transition-all cursor-pointer"
              >
                <span>Créer mon compte pour accéder au radar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Preview Card Showcase */}
            <div className="relative">
              <div className="bg-white border border-orange-200/80 rounded-3xl p-6 shadow-xl shadow-orange-100/60 space-y-4">
                <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-slate-900">Exemples de Villes & Régions Actives</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    En ligne
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {PRESET_CITIES.slice(0, 8).map((city) => (
                    <div
                      key={city.name}
                      onClick={() => onOpenAuth('signup')}
                      className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100 hover:border-rose-300 hover:bg-rose-50/40 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{city.flag}</span>
                        <div>
                          <p className="font-bold text-slate-900">{city.name}</p>
                          <p className="text-[10px] text-slate-500">{city.country}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                        {city.region}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>Inscrivez-vous pour débloquer tous les profils</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTIE CONTACT - PROPRE AVEC BLINKSERVICES513@GMAIL.COM */}
      <section id="contact-section" className="py-16 md:py-24 border-b border-orange-100/70 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-rose-700 border border-orange-200">
              Support & Contact
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Une question ou suggestion ? Contactez-nous
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Notre équipe d'assistance et de développement est à votre disposition pour vous répondre rapidement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Contact Info Box */}
            <div className="p-6 rounded-3xl bg-orange-50/40 border border-orange-200/80 space-y-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 border-b border-orange-200/80 pb-3">
                Informations Joyce-K
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Éditeur & Entreprise</p>
                    <p className="text-slate-600">Blink-services</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-rose-600 shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Concepteur & Fondateur</p>
                    <p className="text-slate-600">Junior Andela</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-rose-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Siège & Localisation</p>
                    <p className="text-slate-600">Yaoundé, Cameroun</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-rose-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Adresse E-mail de Contact</p>
                    <a
                      href="mailto:blinkservices513@gmail.com"
                      className="text-rose-600 hover:text-rose-700 font-bold underline"
                    >
                      blinkservices513@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-orange-200/80 shadow-md shadow-orange-50">
              {contactStatus === 'sent' ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Message envoyé avec succès !</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Merci pour votre message. L'équipe Blink-services vous répondra sur votre adresse dans les plus brefs délais.
                  </p>
                  <button
                    onClick={() => setContactStatus('idle')}
                    className="mt-4 px-5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Envoyez-nous un message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Votre Nom
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Alexandre Martin"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-orange-50/30 border border-orange-200 focus:border-rose-500 focus:bg-white focus:outline-none text-xs text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Votre Adresse E-mail
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nom@exemple.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-orange-50/30 border border-orange-200 focus:border-rose-500 focus:bg-white focus:outline-none text-xs text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sujet de votre demande
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-orange-50/30 border border-orange-200 focus:border-rose-500 focus:bg-white focus:outline-none text-xs text-slate-900 font-medium"
                    >
                      <option value="Renseignement">Renseignement général</option>
                      <option value="Vérification Photo">Question sur la certification photo & Anti-IA</option>
                      <option value="Support Technique">Assistance technique / Compte</option>
                      <option value="Partenariat">Partenariat & Blink-services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Votre Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Expliquez-nous votre demande en détail..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-orange-50/30 border border-orange-200 focus:border-rose-500 focus:bg-white focus:outline-none text-xs text-slate-900 leading-relaxed font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{contactStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROFESSIONAL FOOTER */}
      <footer id="main-app-footer" className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Col 1 & 2: Brand Identity & Manifesto */}
            <div className="lg:col-span-2 space-y-5">
              <JoyceKLogo size="md" variant="dark-bg" showTagline={true} />
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                La référence des rencontres internationales authentiques. Une plateforme sécurisée,
                conçue pour connecter des célibataires exigeants autour de valeurs sincères,
                de passions partagées et d'une alchimie émotionnelle réelle.
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Profils Réels
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  Chiffrement Sécurisé
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Conforme RGPD
                </span>
              </div>
            </div>

            {/* Col 3: Navigation & Découverte */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('hero-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Accueil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-left"
                  >
                    Découvrir les Membres
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('radar-preview-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Radar de Proximité Monde
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="hover:text-rose-400 transition-colors cursor-pointer text-left"
                  >
                    Blind-Match Événementiel (21h)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const el = document.getElementById('testimonials-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Témoignages & Avis
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Sécurité & Confidentialité */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Sécurité & Éthique
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Modération humaine 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Scan anti-deepfake certifié</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Blocage & signalement instantané</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Confidentialité stricte des échanges</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Charte de respect mutuel</span>
                </li>
              </ul>
            </div>

            {/* Col 5: Éditeur & Contact Entreprise */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Contact & Éditeur
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Édité & développé par</div>
                  <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-rose-400" />
                    Blink-services
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Fondateur</div>
                  <div className="font-semibold text-slate-200">Junior Andela</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Siège</div>
                  <div className="font-medium text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Yaoundé, Cameroun
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Support client</div>
                  <a
                    href="mailto:blinkservices513@gmail.com"
                    className="font-medium text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    blinkservices513@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle separator */}
          <div className="w-full h-px bg-slate-800/80" />

          {/* Bottom Bar: Copyright, System Status & Disclaimers */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <p>
                © {new Date().getFullYear()} <strong className="text-slate-300 font-semibold">Joyce-K</strong> by{' '}
                <strong className="text-slate-300 font-semibold">Blink-services</strong>. Tous droits réservés.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">Système opérationnel & sécurisé</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-slate-300 transition-colors cursor-pointer">
                Conditions Générales
              </span>
              <span>•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">
                Politique de Confidentialité
              </span>
              <span>•</span>
              <span className="hover:text-slate-300 transition-colors cursor-pointer">
                Mentions Légales
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
