export interface CountryPhoneInfo {
  name: string;
  code: string;
  flag: string;
  iso2: string;
  defaultCity: string;
  lat: number;
  lng: number;
  formatPlaceholder: string;
  example: string;
}

export const COUNTRY_PHONE_DATABASE: CountryPhoneInfo[] = [
  // Afrique Centrale
  {
    name: 'Cameroun',
    code: '+237',
    flag: '🇨🇲',
    iso2: 'CM',
    defaultCity: 'Yaoundé',
    lat: 3.848,
    lng: 11.5021,
    formatPlaceholder: '+237 6XX XX XX XX',
    example: '+237 6 99 88 77 66',
  },
  {
    name: 'Gabon',
    code: '+241',
    flag: '🇬🇦',
    iso2: 'GA',
    defaultCity: 'Libreville',
    lat: 0.4162,
    lng: 9.4673,
    formatPlaceholder: '+241 0X XX XX XX',
    example: '+241 07 12 34 56',
  },
  {
    name: 'Congo-Brazzaville',
    code: '+242',
    flag: '🇨🇬',
    iso2: 'CG',
    defaultCity: 'Brazzaville',
    lat: -4.2634,
    lng: 15.2429,
    formatPlaceholder: '+242 0X XXX XX XX',
    example: '+242 06 123 45 67',
  },
  {
    name: 'RD Congo',
    code: '+243',
    flag: '🇨🇩',
    iso2: 'CD',
    defaultCity: 'Kinshasa',
    lat: -4.4419,
    lng: 15.2663,
    formatPlaceholder: '+243 8X XXX XXXX',
    example: '+243 81 234 5678',
  },
  {
    name: 'Tchad',
    code: '+235',
    flag: '🇹🇩',
    iso2: 'TD',
    defaultCity: "N'Djaména",
    lat: 12.1348,
    lng: 15.0557,
    formatPlaceholder: '+235 6X XX XX XX',
    example: '+235 66 12 34 56',
  },
  {
    name: 'Centrafrique',
    code: '+236',
    flag: '🇨🇫',
    iso2: 'CF',
    defaultCity: 'Bangui',
    lat: 4.3947,
    lng: 18.5582,
    formatPlaceholder: '+236 7X XX XX XX',
    example: '+236 75 12 34 56',
  },
  {
    name: 'Guinée Équatoriale',
    code: '+240',
    flag: '🇬🇶',
    iso2: 'GQ',
    defaultCity: 'Malabo',
    lat: 3.7504,
    lng: 8.7371,
    formatPlaceholder: '+240 222 XX XX XX',
    example: '+240 222 12 34 56',
  },

  // Afrique de l'Ouest
  {
    name: 'Côte d\'Ivoire',
    code: '+225',
    flag: '🇨🇮',
    iso2: 'CI',
    defaultCity: 'Abidjan',
    lat: 5.3599,
    lng: -4.0083,
    formatPlaceholder: '+225 0X XX XX XX XX',
    example: '+225 07 12 34 56 78',
  },
  {
    name: 'Sénégal',
    code: '+221',
    flag: '🇸🇳',
    iso2: 'SN',
    defaultCity: 'Dakar',
    lat: 14.7167,
    lng: -17.4677,
    formatPlaceholder: '+221 7X XXX XX XX',
    example: '+221 77 123 45 67',
  },
  {
    name: 'Bénin',
    code: '+229',
    flag: '🇧🇯',
    iso2: 'BJ',
    defaultCity: 'Cotonou',
    lat: 6.3703,
    lng: 2.4183,
    formatPlaceholder: '+229 9X XX XX XX',
    example: '+229 97 12 34 56',
  },
  {
    name: 'Togo',
    code: '+228',
    flag: '🇹🇬',
    iso2: 'TG',
    defaultCity: 'Lomé',
    lat: 6.1375,
    lng: 1.2123,
    formatPlaceholder: '+228 9X XX XX XX',
    example: '+228 90 12 34 56',
  },
  {
    name: 'Mali',
    code: '+223',
    flag: '🇲🇱',
    iso2: 'ML',
    defaultCity: 'Bamako',
    lat: 12.6392,
    lng: -8.0029,
    formatPlaceholder: '+223 7X XX XX XX',
    example: '+223 76 12 34 56',
  },
  {
    name: 'Burkina Faso',
    code: '+226',
    flag: '🇧🇫',
    iso2: 'BF',
    defaultCity: 'Ouagadougou',
    lat: 12.3714,
    lng: -1.5197,
    formatPlaceholder: '+226 7X XX XX XX',
    example: '+226 70 12 34 56',
  },
  {
    name: 'Guinée',
    code: '+224',
    flag: '🇬🇳',
    iso2: 'GN',
    defaultCity: 'Conakry',
    lat: 9.6412,
    lng: -13.5784,
    formatPlaceholder: '+224 6XX XX XX XX',
    example: '+224 622 12 34 56',
  },
  {
    name: 'Niger',
    code: '+227',
    flag: '🇳🇪',
    iso2: 'NE',
    defaultCity: 'Niamey',
    lat: 13.5116,
    lng: 2.1254,
    formatPlaceholder: '+227 9X XX XX XX',
    example: '+227 96 12 34 56',
  },

  // Afrique du Nord
  {
    name: 'Maroc',
    code: '+212',
    flag: '🇲🇦',
    iso2: 'MA',
    defaultCity: 'Casablanca',
    lat: 33.5731,
    lng: -7.5898,
    formatPlaceholder: '+212 6XX XX XX XX',
    example: '+212 6 12 34 56 78',
  },
  {
    name: 'Algérie',
    code: '+213',
    flag: '🇩🇿',
    iso2: 'DZ',
    defaultCity: 'Alger',
    lat: 36.7538,
    lng: 3.0588,
    formatPlaceholder: '+213 5XX XX XX XX',
    example: '+213 550 12 34 56',
  },
  {
    name: 'Tunisie',
    code: '+216',
    flag: '🇹🇳',
    iso2: 'TN',
    defaultCity: 'Tunis',
    lat: 36.8065,
    lng: 10.1815,
    formatPlaceholder: '+216 2X XXX XXX',
    example: '+216 20 123 456',
  },

  // Afrique de l'Est & Australe
  {
    name: 'Madagascar',
    code: '+261',
    flag: '🇲🇬',
    iso2: 'MG',
    defaultCity: 'Antananarivo',
    lat: -18.8792,
    lng: 47.5079,
    formatPlaceholder: '+261 3X XX XXX XX',
    example: '+261 34 12 345 67',
  },
  {
    name: 'Rwanda',
    code: '+250',
    flag: '🇷🇼',
    iso2: 'RW',
    defaultCity: 'Kigali',
    lat: -1.9441,
    lng: 30.0619,
    formatPlaceholder: '+250 78X XXX XXX',
    example: '+250 788 123 456',
  },
  {
    name: 'Kenya',
    code: '+254',
    flag: '🇰🇪',
    iso2: 'KE',
    defaultCity: 'Nairobi',
    lat: -1.2921,
    lng: 36.8219,
    formatPlaceholder: '+254 7XX XXX XXX',
    example: '+254 712 345 678',
  },
  {
    name: 'Afrique du Sud',
    code: '+27',
    flag: '🇿🇦',
    iso2: 'ZA',
    defaultCity: 'Johannesburg',
    lat: -26.2041,
    lng: 28.0473,
    formatPlaceholder: '+27 8X XXX XXXX',
    example: '+27 82 123 4567',
  },
  {
    name: 'Île Maurice',
    code: '+230',
    flag: '🇲🇺',
    iso2: 'MU',
    defaultCity: 'Port-Louis',
    lat: -20.1609,
    lng: 57.5012,
    formatPlaceholder: '+230 5XXX XXXX',
    example: '+230 5250 1234',
  },

  // Europe
  {
    name: 'France',
    code: '+33',
    flag: '🇫🇷',
    iso2: 'FR',
    defaultCity: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    formatPlaceholder: '+33 6 XX XX XX XX',
    example: '+33 6 12 34 56 78',
  },
  {
    name: 'Belgique',
    code: '+32',
    flag: '🇧🇪',
    iso2: 'BE',
    defaultCity: 'Bruxelles',
    lat: 50.8503,
    lng: 4.3517,
    formatPlaceholder: '+32 4XX XX XX XX',
    example: '+32 470 12 34 56',
  },
  {
    name: 'Suisse',
    code: '+41',
    flag: '🇨🇭',
    iso2: 'CH',
    defaultCity: 'Genève',
    lat: 46.2044,
    lng: 6.1432,
    formatPlaceholder: '+41 7X XXX XX XX',
    example: '+41 79 123 45 67',
  },
  {
    name: 'Royaume-Uni',
    code: '+44',
    flag: '🇬🇧',
    iso2: 'GB',
    defaultCity: 'Londres',
    lat: 51.5074,
    lng: -0.1278,
    formatPlaceholder: '+44 7XXX XXXXXX',
    example: '+44 7911 123456',
  },
  {
    name: 'Allemagne',
    code: '+49',
    flag: '🇩🇪',
    iso2: 'DE',
    defaultCity: 'Berlin',
    lat: 52.52,
    lng: 13.405,
    formatPlaceholder: '+49 1XX XXXXXXXX',
    example: '+49 151 12345678',
  },
  {
    name: 'Espagne',
    code: '+34',
    flag: '🇪🇸',
    iso2: 'ES',
    defaultCity: 'Madrid',
    lat: 40.4168,
    lng: -3.7038,
    formatPlaceholder: '+34 6XX XX XX XX',
    example: '+34 612 34 56 78',
  },
  {
    name: 'Italie',
    code: '+39',
    flag: '🇮🇹',
    iso2: 'IT',
    defaultCity: 'Rome',
    lat: 41.9028,
    lng: 12.4964,
    formatPlaceholder: '+39 3XX XXXXXXX',
    example: '+39 320 1234567',
  },
  {
    name: 'Portugal',
    code: '+351',
    flag: '🇵🇹',
    iso2: 'PT',
    defaultCity: 'Lisbonne',
    lat: 38.7223,
    lng: -9.1393,
    formatPlaceholder: '+351 9X XXX XXXX',
    example: '+351 91 234 5678',
  },
  {
    name: 'Luxembourg',
    code: '+352',
    flag: '🇱🇺',
    iso2: 'LU',
    defaultCity: 'Luxembourg',
    lat: 49.6116,
    lng: 6.1319,
    formatPlaceholder: '+352 6XX XX XX XX',
    example: '+352 621 12 34 56',
  },

  // Amériques & Caraïbes
  {
    name: 'Canada',
    code: '+1',
    flag: '🇨🇦',
    iso2: 'CA',
    defaultCity: 'Montréal',
    lat: 45.5017,
    lng: -73.5673,
    formatPlaceholder: '+1 (514) XXX-XXXX',
    example: '+1 514 123 4567',
  },
  {
    name: 'États-Unis',
    code: '+1',
    flag: '🇺🇸',
    iso2: 'US',
    defaultCity: 'New York',
    lat: 40.7128,
    lng: -74.006,
    formatPlaceholder: '+1 (XXX) XXX-XXXX',
    example: '+1 212 555 0199',
  },
  {
    name: 'Haïti',
    code: '+509',
    flag: '🇭🇹',
    iso2: 'HT',
    defaultCity: 'Port-au-Prince',
    lat: 18.5944,
    lng: -72.3074,
    formatPlaceholder: '+509 3X XX XXXX',
    example: '+509 34 12 3456',
  },
  {
    name: 'Martinique',
    code: '+596',
    flag: '🇲🇶',
    iso2: 'MQ',
    defaultCity: 'Fort-de-France',
    lat: 14.6161,
    lng: -61.0588,
    formatPlaceholder: '+596 696 XX XX XX',
    example: '+596 696 12 34 56',
  },
  {
    name: 'Guadeloupe',
    code: '+590',
    flag: '🇬🇵',
    iso2: 'GP',
    defaultCity: 'Pointe-à-Pitre',
    lat: 16.2413,
    lng: -61.5331,
    formatPlaceholder: '+590 690 XX XX XX',
    example: '+590 690 12 34 56',
  },
  {
    name: 'La Réunion',
    code: '+262',
    flag: '🇷🇪',
    iso2: 'RE',
    defaultCity: 'Saint-Denis',
    lat: -20.8821,
    lng: 55.4507,
    formatPlaceholder: '+262 692 XX XX XX',
    example: '+262 692 12 34 56',
  },
  {
    name: 'Brésil',
    code: '+55',
    flag: '🇧🇷',
    iso2: 'BR',
    defaultCity: 'Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    formatPlaceholder: '+55 21 9XXXX-XXXX',
    example: '+55 21 98765 4321',
  },

  // Moyen-Orient, Asie & Océanie
  {
    name: 'Émirats Arabes Unis',
    code: '+971',
    flag: '🇦🇪',
    iso2: 'AE',
    defaultCity: 'Dubaï',
    lat: 25.2048,
    lng: 55.2708,
    formatPlaceholder: '+971 5X XXX XXXX',
    example: '+971 50 123 4567',
  },
  {
    name: 'Liban',
    code: '+961',
    flag: '🇱🇧',
    iso2: 'LB',
    defaultCity: 'Beyrouth',
    lat: 33.8938,
    lng: 35.5018,
    formatPlaceholder: '+961 7X XXX XXX',
    example: '+961 70 123 456',
  },
  {
    name: 'Australie',
    code: '+61',
    flag: '🇦🇺',
    iso2: 'AU',
    defaultCity: 'Sydney',
    lat: -33.8688,
    lng: 151.2093,
    formatPlaceholder: '+61 4XX XXX XXX',
    example: '+61 412 345 678',
  },
];

/**
 * Detect country information from any international phone number string.
 * Supports: "+237...", "00237...", "237...", "+33...", "+1...", etc.
 */
export function detectCountryFromPhoneNumber(phoneNumber?: string | null): CountryPhoneInfo {
  if (!phoneNumber || typeof phoneNumber !== 'string' || !phoneNumber.trim()) {
    // Default to Cameroon as first class or France
    return COUNTRY_PHONE_DATABASE[0]; // Cameroun
  }

  // Normalize: remove spaces, dots, hyphens, brackets
  let cleaned = phoneNumber.trim().replace(/[\s\.\-\(\)]/g, '');

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  } else if (!cleaned.startsWith('+')) {
    // If user entered without +, check if it starts with known country codes
    cleaned = '+' + cleaned;
  }

  // Sort database by code length descending to match +237, +225 before +2 or +1
  const sorted = [...COUNTRY_PHONE_DATABASE].sort((a, b) => b.code.length - a.code.length);

  for (const country of sorted) {
    if (cleaned.startsWith(country.code)) {
      return country;
    }
  }

  // Fallback: check if the phone contains the dialing code without +
  const digitsOnly = cleaned.replace(/\+/g, '');
  for (const country of sorted) {
    const codeDigits = country.code.replace('+', '');
    if (digitsOnly.startsWith(codeDigits)) {
      return country;
    }
  }

  // Fallback default
  return {
    name: 'International',
    code: '+',
    flag: '🌐',
    iso2: 'UN',
    defaultCity: 'Monde',
    lat: 48.8566,
    lng: 2.3522,
    formatPlaceholder: '+XXX XXXXXXXX',
    example: '+237 6 99 88 77 66',
  };
}

/**
 * Format a phone number cleanly with the country dial code
 */
export function formatPhoneNumberClean(phone: string): string {
  if (!phone) return '';
  const country = detectCountryFromPhoneNumber(phone);
  let cleaned = phone.trim().replace(/[\s\.\-\(\)]/g, '');
  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2);
  if (!cleaned.startsWith('+') && country.code !== '+') {
    if (!cleaned.startsWith(country.code.replace('+', ''))) {
      cleaned = country.code + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  return cleaned;
}
