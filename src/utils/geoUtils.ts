import { DistanceFuzzingLevel } from '../types';

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function formatFuzzedDistance(
  distanceKm: number,
  fuzzing: DistanceFuzzingLevel,
  city: string
): string {
  if (fuzzing === 'city_only') {
    return `${city} (Distance masquée)`;
  }
  if (fuzzing === 'approximate') {
    // Add deterministic slight fuzz
    const approximateRange = Math.max(1, Math.round(distanceKm / 5) * 5);
    return `~${approximateRange} km (${city})`;
  }
  if (distanceKm < 1) {
    return `À moins de 1 km (${city})`;
  }
  return `À ${distanceKm} km (${city})`;
}

export interface WorldCity {
  name: string;
  country: string;
  region: 'Europe' | 'Afrique' | 'Amériques' | 'Asie & Moyen-Orient' | 'Océanie & Caraïbes';
  lat: number;
  lng: number;
  flag: string;
}

export const PRESET_CITIES: WorldCity[] = [
  // Europe
  { name: 'Paris', country: 'France', region: 'Europe', lat: 48.8566, lng: 2.3522, flag: '🇫🇷' },
  { name: 'Lyon', country: 'France', region: 'Europe', lat: 45.764, lng: 4.8357, flag: '🇫🇷' },
  { name: 'Marseille', country: 'France', region: 'Europe', lat: 43.2965, lng: 5.3698, flag: '🇫🇷' },
  { name: 'Bruxelles', country: 'Belgique', region: 'Europe', lat: 50.8503, lng: 4.3517, flag: '🇧🇪' },
  { name: 'Genève', country: 'Suisse', region: 'Europe', lat: 46.2044, lng: 6.1432, flag: '🇨🇭' },
  { name: 'Londres', country: 'Royaume-Uni', region: 'Europe', lat: 51.5074, lng: -0.1278, flag: '🇬🇧' },
  { name: 'Berlin', country: 'Allemagne', region: 'Europe', lat: 52.52, lng: 13.405, flag: '🇩🇪' },
  { name: 'Madrid', country: 'Espagne', region: 'Europe', lat: 40.4168, lng: -3.7038, flag: '🇪🇸' },
  { name: 'Rome', country: 'Italie', region: 'Europe', lat: 41.9028, lng: 12.4964, flag: '🇮🇹' },
  { name: 'Lisbonne', country: 'Portugal', region: 'Europe', lat: 38.7223, lng: -9.1393, flag: '🇵🇹' },

  // Afrique (Afrique Centrale, de l'Ouest, du Nord, etc.)
  { name: 'Abidjan', country: 'Côte d\'Ivoire', region: 'Afrique', lat: 5.3599, lng: -4.0083, flag: '🇨🇮' },
  { name: 'Dakar', country: 'Sénégal', region: 'Afrique', lat: 14.7167, lng: -17.4677, flag: '🇸🇳' },
  { name: 'Yaoundé', country: 'Cameroun', region: 'Afrique', lat: 3.848, lng: 11.5021, flag: '🇨🇲' },
  { name: 'Douala', country: 'Cameroun', region: 'Afrique', lat: 4.0511, lng: 9.7679, flag: '🇨🇲' },
  { name: 'Kinshasa', country: 'RD Congo', region: 'Afrique', lat: -4.4419, lng: 15.2663, flag: '🇨🇩' },
  { name: 'Casablanca', country: 'Maroc', region: 'Afrique', lat: 33.5731, lng: -7.5898, flag: '🇲🇦' },
  { name: 'Tunis', country: 'Tunisie', region: 'Afrique', lat: 36.8065, lng: 10.1815, flag: '🇹🇳' },
  { name: 'Alger', country: 'Algérie', region: 'Afrique', lat: 36.7538, lng: 3.0588, flag: '🇩🇿' },
  { name: 'Libreville', country: 'Gabon', region: 'Afrique', lat: 0.4162, lng: 9.4673, flag: '🇬🇦' },
  { name: 'Cotonou', country: 'Bénin', region: 'Afrique', lat: 6.3703, lng: 2.4183, flag: '🇧🇯' },
  { name: 'Lomé', country: 'Togo', region: 'Afrique', lat: 6.1375, lng: 1.2123, flag: '🇹🇬' },
  { name: 'Bamako', country: 'Mali', region: 'Afrique', lat: 12.6392, lng: -8.0029, flag: '🇲🇱' },
  { name: 'Brazzaville', country: 'Congo', region: 'Afrique', lat: -4.2634, lng: 15.2429, flag: '🇨🇬' },
  { name: 'Johannesburg', country: 'Afrique du Sud', region: 'Afrique', lat: -26.2041, lng: 28.0473, flag: '🇿🇦' },

  // Amériques
  { name: 'Montréal', country: 'Canada', region: 'Amériques', lat: 45.5017, lng: -73.5673, flag: '🇨🇦' },
  { name: 'Québec', country: 'Canada', region: 'Amériques', lat: 46.8139, lng: -71.208, flag: '🇨🇦' },
  { name: 'New York', country: 'États-Unis', region: 'Amériques', lat: 40.7128, lng: -74.006, flag: '🇺🇸' },
  { name: 'Miami', country: 'États-Unis', region: 'Amériques', lat: 25.7617, lng: -80.1918, flag: '🇺🇸' },
  { name: 'San Francisco', country: 'États-Unis', region: 'Amériques', lat: 37.7749, lng: -122.4194, flag: '🇺🇸' },
  { name: 'Rio de Janeiro', country: 'Brésil', region: 'Amériques', lat: -22.9068, lng: -43.1729, flag: '🇧🇷' },
  { name: 'Buenos Aires', country: 'Argentine', region: 'Amériques', lat: -34.6037, lng: -58.3816, flag: '🇦🇷' },

  // Asie & Moyen-Orient
  { name: 'Dubaï', country: 'Émirats Arabes Unis', region: 'Asie & Moyen-Orient', lat: 25.2048, lng: 55.2708, flag: '🇦🇪' },
  { name: 'Tokyo', country: 'Japon', region: 'Asie & Moyen-Orient', lat: 35.6762, lng: 139.6503, flag: '🇯🇵' },
  { name: 'Beyrouth', country: 'Liban', region: 'Asie & Moyen-Orient', lat: 33.8938, lng: 35.5018, flag: '🇱🇧' },
  { name: 'Singapour', country: 'Singapour', region: 'Asie & Moyen-Orient', lat: 1.3521, lng: 103.8198, flag: '🇸🇬' },

  // Océanie & Caraïbes / Outre-Mer
  { name: 'Fort-de-France', country: 'Martinique', region: 'Océanie & Caraïbes', lat: 14.6161, lng: -61.0588, flag: '🇲🇶' },
  { name: 'Pointe-à-Pitre', country: 'Guadeloupe', region: 'Océanie & Caraïbes', lat: 16.2413, lng: -61.5331, flag: '🇬🇵' },
  { name: 'Saint-Denis', country: 'La Réunion', region: 'Océanie & Caraïbes', lat: -20.8821, lng: 55.4507, flag: '🇷🇪' },
  { name: 'Nouméa', country: 'Nouvelle-Calédonie', region: 'Océanie & Caraïbes', lat: -22.2758, lng: 166.458, flag: '🇳🇨' },
  { name: 'Sydney', country: 'Australie', region: 'Océanie & Caraïbes', lat: -33.8688, lng: 151.2093, flag: '🇦🇺' },
];

export const WORLD_REGIONS = [
  'Toutes les régions',
  'Europe',
  'Afrique',
  'Amériques',
  'Asie & Moyen-Orient',
  'Océanie & Caraïbes',
] as const;

