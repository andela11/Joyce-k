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

export const PRESET_CITIES = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', lat: 45.764, lng: 4.8357 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Lille', lat: 50.6292, lng: 3.0573 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Nice', lat: 43.7102, lng: 7.262 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
];
