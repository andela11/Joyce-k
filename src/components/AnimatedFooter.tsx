import React from 'react';
import {
  Mail,
  MapPin,
  Building2,
} from 'lucide-react';
import { JoyceKLogo } from './JoyceKLogo';

interface AnimatedFooterProps {
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const AnimatedFooter: React.FC<AnimatedFooterProps> = ({ onOpenAuth }) => {
  return (
    <footer
      id="main-app-footer"
      className="bg-slate-950 text-slate-300 pt-16 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 & 2: Brand Identity & Mission */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <JoyceKLogo size="md" variant="dark-bg" showTagline={true} />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              La référence des rencontres internationales authentiques. Une plateforme sécurisée,
              conçue pour connecter des célibataires sérieux autour de valeurs sincères et d'une affinité réelle.
            </p>
          </div>

          {/* Col 3: Navigation & Découverte */}
          <div className="space-y-4 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('hero-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-rose-400 transition-colors cursor-pointer text-left"
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
                  className="hover:text-rose-400 transition-colors cursor-pointer text-left"
                >
                  Radar de Proximité
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('testimonials-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-rose-400 transition-colors cursor-pointer text-left"
                >
                  Témoignages & Avis
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Sécurité & Éthique */}
          <div className="space-y-4 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">
              Sécurité & Éthique
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Modération humaine 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Scan anti-faux profils IA</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Blocage & signalement instantané</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Confidentialité stricte des échanges</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Charte de respect mutuel</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Éditeur & Contact Entreprise */}
          <div className="space-y-4 font-sans">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans">
              Contact & Éditeur
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[11px] text-slate-500">Édité & développé par</div>
                <div className="font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-rose-400" />
                  Blink-services
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Fondateur</div>
                <div className="font-medium text-slate-300">Junior Andela</div>
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

        {/* Flat Divider without glow */}
        <div className="w-full h-px bg-slate-800" />

        {/* Bottom Bar: Copyright & Disclaimers */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <p>
              © {new Date().getFullYear()}{' '}
              <strong className="text-slate-200 font-semibold">Joyce-K</strong> by{' '}
              <strong className="text-slate-200 font-semibold">Blink-services</strong>. Tous droits réservés.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Conditions Générales
            </span>
            <span>•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Politique de Confidentialité
            </span>
            <span>•</span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Mentions Légales
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
