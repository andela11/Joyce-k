export interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  tags: string[];
}

export const ALL_INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'passions',
    name: 'Voyages & Découvertes',
    icon: '✈️',
    tags: [
      'Voyages sac au dos',
      'Road trips',
      'Week-ends improvisés',
      'Randonnée alpine',
      'Cités historiques',
      'Plages secrètes',
      'Camping sauvage',
      'Vanlife',
    ],
  },
  {
    id: 'gastronomie',
    name: 'Gastronomie & Art de vivre',
    icon: '🍷',
    tags: [
      'Dégustation de vins',
      'Cuisine italienne',
      'Brunchs du dimanche',
      'Street food asiatique',
      'Pâtisserie maison',
      'Cocktails signature',
      'Marchés locaux',
      'Bistronomie',
      'Café de spécialité',
    ],
  },
  {
    id: 'art_culture',
    name: 'Art & Culture',
    icon: '🎨',
    tags: [
      'Musées & Expos',
      'Photographie argentique',
      'Théâtre contemporain',
      'Cinéma d\'auteur',
      'Concerts live',
      'Littérature & Poésie',
      'Architecture urbaine',
      'Festivals de musique',
      'Opéra & Jazz',
    ],
  },
  {
    id: 'sport_wellness',
    name: 'Sport & Bien-être',
    icon: '🏃',
    tags: [
      'Course à pied',
      'Yoga Vinyasa',
      'Escalade & Bloc',
      'Pilates',
      'Surf & Océan',
      'Cyclisme',
      'Crossfit',
      'Méditation',
      'Natation',
    ],
  },
  {
    id: 'lifestyle_tech',
    name: 'Tech, Jeux & Geek',
    icon: '🎮',
    tags: [
      'Jeux de société',
      'Jeux vidéo indés',
      'Intelligence Artificielle',
      'Science-Fiction',
      'Astronomie & Étoiles',
      'Podcasts culturels',
      'Écologie & Zéro déchet',
      'Plantes d\'intérieur',
    ],
  },
  {
    id: 'valeurs',
    name: 'Valeurs & Tempérament',
    icon: '💫',
    tags: [
      'Sens de l\'humour',
      'Spontanéité',
      'Fidélité & Confiance',
      'Amour des animaux',
      'Bienveillance',
      'Esprit d\'aventure',
      'Calme & Sérénité',
      'Curiosité insatiable',
    ],
  },
];

export const ALL_INTERESTS_FLAT = ALL_INTEREST_CATEGORIES.flatMap((c) => c.tags);
