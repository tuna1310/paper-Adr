// Original SVG vector icons crafted with high aesthetic fidelity

export function coinSvg(size = 24): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="18" rx="14" ry="12" fill="#B77900" />
    <ellipse cx="16" cy="16" rx="14" ry="12" fill="#FFC107" />
    <ellipse cx="16" cy="15" rx="13" ry="11" fill="#FFD54F" />
    <ellipse cx="16" cy="15" rx="10" ry="8" fill="#FFB300" stroke="#FFE082" stroke-width="1.5" />
    <polygon points="16,10 17.5,13.5 21,14.5 18,17 19,20.5 16,18.5 13,20.5 14,17 11,14.5 14.5,13.5" fill="#FFF8E1" />
  </svg>`;
}

export function gemSvg(size = 24): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#99004C" />
    <polygon points="16,4 26,10 26,22 16,28 6,22 6,10" fill="#FF1493" />
    <polygon points="16,4 26,10 20,16 12,16 6,10" fill="#FF69B4" />
    <polygon points="16,4 20,16 16,28 12,16" fill="#FF85C0" />
    <polygon points="16,4 26,10 20,16" fill="#FFB6C1" />
    <polygon points="10,8 14,5 12,11" fill="#FFFFFF" opacity="0.8" />
  </svg>`;
}

export function gearSvg(size = 24): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm-3.5 6a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" fill="#15397E" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.8 3h4.4l.6 3.2c.7.3 1.4.7 2 1.2l3-1.4 3.1 3.1-1.4 3c.5.6.9 1.3 1.2 2l3.2.6v4.4l-3.2.6c-.3.7-.7 1.4-1.2 2l1.4 3-3.1 3.1-3-1.4c-.6.5-1.3.9-2 1.2l-.6 3.2h-4.4l-.6-3.2c-.7-.3-1.4-.7-2-1.2l-3 1.4-3.1-3.1 1.4-3c-.5-.6-.9-1.3-1.2-2l-3.2-.6v-4.4l3.2-.6c.3-.7.7-1.4 1.2-2l-1.4-3 3.1-3.1 3 1.4c.6-.5 1.3-.9 2-1.2l.6-3.2zm2.2 7a6 6 0 100 12 6 6 0 000-12z" fill="#15397E" />
  </svg>`;
}

export function avatarCubeSvg(size = 36): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- White Bunny/Character Face with Blue Ears & Eyes matching Reference -->
    <rect x="2" y="2" width="36" height="36" rx="18" fill="#FFFFFF" />
    <!-- Blue Ears -->
    <path d="M12 7c-2 0-3.5 3-2.5 7 1 3.5 3.5 5 4.5 5s2-2 1-5-1-7-3-7z" fill="#0077E6" />
    <path d="M28 7c2 0 3.5 3 2.5 7-1 3.5-3.5 5-4.5 5s-2-2-1-5 1-7 3-7z" fill="#0077E6" />
    <path d="M13 9c-1 0-1.8 1.5-1.3 3.5.5 1.8 1.8 2.5 2.3 2.5s1-1 .5-2.5-.5-3.5-1.5-3.5z" fill="#70B8FF" />
    <path d="M27 9c1 0 1.8 1.5 1.3 3.5-.5 1.8-1.8 2.5-2.3 2.5s-1-1-.5-2.5.5-3.5 1.5-3.5z" fill="#70B8FF" />
    <!-- Big Anime Eyes -->
    <ellipse cx="14" cy="22" rx="3.5" ry="5" fill="#0050C8" />
    <ellipse cx="26" cy="22" rx="3.5" ry="5" fill="#0050C8" />
    <circle cx="15" cy="20.5" r="1.5" fill="#FFFFFF" />
    <circle cx="27" cy="20.5" r="1.5" fill="#FFFFFF" />
    <!-- Cute Cheerful Mouth -->
    <path d="M18 26.5c1 1.5 3 1.5 4 0" stroke="#0050C8" stroke-width="2" stroke-linecap="round" />
  </svg>`;
}

export function movieClapperSvg(size = 18): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="15" rx="3" fill="#0066CC" stroke="#FFFFFF" stroke-width="2" />
    <path d="M2 9h20M7 5l-2 4M13 5l-2 4M19 5l-2 4" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
    <polygon points="10,12 16,15 10,18" fill="#FFFFFF" />
  </svg>`;
}

export function shopAwningSvg(size = 30): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10h28l-2 14H6L4 10z" fill="#E74C3C" />
    <path d="M9 10h6l-.5 14h-5L9 10zm12 0h6l-.5 14h-5L21 10z" fill="#FFFFFF" />
    <path d="M4 24c1.5 2.5 3.5 2.5 5 0 1.5 2.5 3.5 2.5 5 0 1.5 2.5 3.5 2.5 5 0 1.5 2.5 3.5 2.5 5 0 1.5 2.5 3.5 2.5 5 0 1.5 2.5 3.5 2.5 5 0" stroke="#C0392B" stroke-width="2" fill="#E74C3C" />
    <line x1="2" y1="9" x2="34" y2="9" stroke="#922B21" stroke-width="3" stroke-linecap="round" />
  </svg>`;
}

export function heroesSvg(size = 30): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Back Hero -->
    <rect x="14" y="6" width="18" height="18" rx="5" fill="#1E88E5" stroke="#0D47A1" stroke-width="2" />
    <circle cx="21" cy="13" r="2" fill="#FFFFFF" />
    <circle cx="27" cy="13" r="2" fill="#FFFFFF" />
    <!-- Front Hero -->
    <rect x="4" y="12" width="20" height="20" rx="6" fill="#FFB300" stroke="#B77900" stroke-width="2" />
    <ellipse cx="10" cy="20" rx="2.5" ry="3.5" fill="#1A1A1A" />
    <ellipse cx="18" cy="20" rx="2.5" ry="3.5" fill="#1A1A1A" />
    <circle cx="11" cy="19" r="1.2" fill="#FFFFFF" />
    <circle cx="19" cy="19" r="1.2" fill="#FFFFFF" />
    <path d="M12 25c1.5 1.5 4.5 1.5 6 0" stroke="#1A1A1A" stroke-width="1.8" stroke-linecap="round" />
  </svg>`;
}

export function playIconSvg(size = 32): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 7c0-2.3 2.5-3.8 4.6-2.6l17 9.8c2 1.2 2 4.1 0 5.3l-17 9.8C12.5 30.5 10 29 10 26.7V7z" fill="#FFFFFF" stroke="#663D00" stroke-width="2" />
  </svg>`;
}

export function missionsSvg(size = 30): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="6" width="22" height="26" rx="4" fill="#FFFFFF" stroke="#15397E" stroke-width="2.5" />
    <rect x="13" y="3" width="10" height="5" rx="2" fill="#FFC107" stroke="#15397E" stroke-width="2" />
    <path d="M12 14h12M12 20h12M12 26h7" stroke="#15397E" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="25" cy="25" r="6" fill="#2ECC71" stroke="#145A32" stroke-width="1.5" />
    <path d="M22.5 25l1.8 2 3.7-4" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;
}

export function globeSvg(size = 30): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="14" fill="#00BCD4" stroke="#15397E" stroke-width="2.5" />
    <path d="M18 4c7 4 10 9 10 14s-3 10-10 14M18 4c-7 4-10 9-10 14s3 10 10 14" stroke="#15397E" stroke-width="1.5" />
    <ellipse cx="18" cy="18" rx="14" ry="5" stroke="#15397E" stroke-width="1.5" />
    <!-- Continents green patches -->
    <path d="M12 11c2-3 7-1 8 2s-3 5-6 4-3-4-2-6z" fill="#4CAF50" />
    <path d="M14 21c3-1 6 2 7 5s-4 4-6 3-3-4-1-8z" fill="#4CAF50" />
    <path d="M22 13c2-1 4 0 4 2s-2 3-3 2-1-3-1-4z" fill="#4CAF50" />
  </svg>`;
}

export function chestSvg(size = 48): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Shadow -->
    <ellipse cx="32" cy="56" rx="24" ry="6" fill="rgba(0,0,0,0.3)" />
    <!-- Chest Body -->
    <rect x="10" y="28" width="44" height="24" rx="4" fill="#795548" stroke="#3E2723" stroke-width="3" />
    <!-- Chest Lid (curved dome) -->
    <path d="M8 28c0-10 8-18 24-18s24 8 24 18H8z" fill="#8D6E63" stroke="#3E2723" stroke-width="3" />
    <!-- Gold bands -->
    <path d="M18 13v39M46 13v39" stroke="#FFD54F" stroke-width="4" />
    <line x1="8" y1="28" x2="56" y2="28" stroke="#FFD54F" stroke-width="3" />
    <!-- Lock Latch -->
    <rect x="28" y="24" width="8" height="10" rx="2" fill="#FFC107" stroke="#FFA000" stroke-width="1.5" />
    <circle cx="32" cy="28" r="1.5" fill="#3E2723" />
    <line x1="32" y1="29.5" x2="32" y2="32" stroke="#3E2723" stroke-width="1.2" />
  </svg>`;
}

export function lockSvg(size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10V7a5 5 0 0110 0v3" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" />
    <rect x="4" y="10" width="16" height="12" rx="3" fill="#FFFFFF" stroke="#0E2963" stroke-width="1.5" />
    <circle cx="12" cy="15" r="1.5" fill="#0E2963" />
    <path d="M12 16.5v2" stroke="#0E2963" stroke-width="1.5" stroke-linecap="round" />
  </svg>`;
}

export function starSvg(size = 24): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="12,2 15,8.5 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,8.5" fill="#FFD700" stroke="#B77900" stroke-width="1.5" stroke-linejoin="round" />
    <polygon points="12,4 14.5,9.5 20,10.2 16,14 17.2,19.5 12,16.8 6.8,19.5 8,14 4,10.2 9.5,9.5" fill="#FFEAA7" />
  </svg>`;
}

export function flagNicaraguaSvg(width = 36, height = 24): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 1.5px solid #FFFFFF;">
    <rect width="60" height="13.3" fill="#0067C6" />
    <rect y="13.3" width="60" height="13.4" fill="#FFFFFF" />
    <rect y="26.7" width="60" height="13.3" fill="#0067C6" />
    <!-- Emblem -->
    <polygon points="30,16 35,24 25,24" fill="none" stroke="#FFD700" stroke-width="1" />
    <circle cx="30" cy="20" r="1.5" fill="#4CAF50" />
  </svg>`;
}

export function carChibiSvg(width = 80, height = 50): string {
  return `<svg width="${width}" height="${height}" viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Shadow -->
    <ellipse cx="45" cy="54" rx="38" ry="5" fill="rgba(0,0,0,0.25)" />
    <!-- Car Body -->
    <path d="M12 36l8-16h48l12 16c2 1 3 3 3 5v8c0 2-2 4-4 4H10c-2 0-4-2-4-4v-8c0-2 1-4 3-5z" fill="#FFA502" stroke="#B33939" stroke-width="2.5" />
    <!-- Cabin Windows -->
    <path d="M23 23h20v11H18l5-11zm24 0h18l7 11H47V23z" fill="#70A1FF" stroke="#1E3799" stroke-width="1.8" />
    <path d="M25 25l15 8M50 25l15 8" stroke="#FFFFFF" stroke-width="1.5" opacity="0.7" />
    <!-- Roof Rack / Spoiler -->
    <rect x="25" y="16" width="40" height="3" rx="1.5" fill="#E58E26" stroke="#B33939" stroke-width="1.5" />
    <!-- Headlight -->
    <ellipse cx="80" cy="39" rx="3.5" ry="4" fill="#FFEAA7" stroke="#E58E26" stroke-width="1" />
    <ellipse cx="10" cy="39" rx="3" ry="3.5" fill="#FF4757" stroke="#B33939" stroke-width="1" />
    <!-- Big Chunky Wheels -->
    <circle cx="24" cy="48" r="9" fill="#2F3542" stroke="#1E272C" stroke-width="2.5" />
    <circle cx="24" cy="48" r="4.5" fill="#A4B0BE" />
    <circle cx="66" cy="48" r="9" fill="#2F3542" stroke="#1E272C" stroke-width="2.5" />
    <circle cx="66" cy="48" r="4.5" fill="#A4B0BE" />
  </svg>`;
}

export function homeHouseSvg(size = 28): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.5L12 3L21 10.5V20C21 20.8 20.3 21.5 19.5 21.5H14.5V15H9.5V21.5H4.5C3.7 21.5 3 20.8 3 20V10.5Z" fill="#0B5CAD" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round" />
    <path d="M9.5 21.5V15H14.5V21.5" fill="#46B3FF" />
  </svg>`;
}

export function rerollArrowsSvg(size = 22): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12H1.5L5.2 15.8L9 12H6.5C6.5 8.96 8.96 6.5 12 6.5C13.57 6.5 14.98 7.16 15.98 8.22L17.65 6.35Z" fill="#1C97FF" />
    <path d="M6.35 17.65A7.95 7.95 0 0 0 12 20C16.42 20 20 16.42 20 12H22.5L18.8 8.2L15 12H17.5C17.5 15.04 15.04 17.5 12 17.5C10.43 17.5 9.02 16.84 8.02 15.78L6.35 17.65Z" fill="#1C97FF" />
  </svg>`;
}

export function lockPadlockSvg(size = 32): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14V10C10 6.7 12.7 4 16 4C19.3 4 22 6.7 22 10V14" stroke="#FFFFFF" stroke-width="3.6" stroke-linecap="round" />
    <rect x="6.5" y="13" width="19" height="15" rx="4" fill="#FFFFFF" />
    <circle cx="16" cy="19.5" r="2.1" fill="#146CC2" />
    <rect x="14.9" y="20.5" width="2.2" height="4" rx="1" fill="#146CC2" />
  </svg>`;
}

const FLAG_PALETTES: Record<string, [string, string, string, 'h' | 'v' | 'dot']> = {
  VN: ['#DA251D', '#DA251D', '#FFD700', 'dot'],
  JP: ['#FFFFFF', '#FFFFFF', '#BC002D', 'dot'],
  KR: ['#FFFFFF', '#0047A0', '#CD2E3A', 'dot'],
  CN: ['#DE2910', '#DE2910', '#FFDE00', 'dot'],
  TH: ['#A51931', '#F4F5F8', '#2D2A4A', 'h'],
  IN: ['#FF9933', '#FFFFFF', '#138808', 'h'],
  ID: ['#FF0000', '#FFFFFF', '#FFFFFF', 'h'],
  SG: ['#EF3340', '#FFFFFF', '#FFFFFF', 'h'],
  US: ['#B22234', '#FFFFFF', '#3C3B6E', 'h'],
  CA: ['#FF0000', '#FFFFFF', '#FF0000', 'v'],
  MX: ['#006847', '#FFFFFF', '#CE1126', 'v'],
  BR: ['#009C3B', '#FFDF00', '#002776', 'dot'],
  AR: ['#74ACDF', '#FFFFFF', '#74ACDF', 'h'],
  NI: ['#0067C6', '#FFFFFF', '#0067C6', 'h'],
  FR: ['#0055A4', '#FFFFFF', '#EF4135', 'v'],
  GB: ['#012169', '#FFFFFF', '#C8102E', 'dot'],
  DE: ['#000000', '#DD0000', '#FFCE00', 'h'],
  IT: ['#009246', '#FFFFFF', '#CE2B37', 'v'],
  ES: ['#AA151B', '#F1BF00', '#AA151B', 'h'],
  RU: ['#FFFFFF', '#0039A6', '#D52B1E', 'h'],
  AU: ['#00008B', '#FFFFFF', '#FF0000', 'dot'],
  NZ: ['#00247D', '#FFFFFF', '#CC142B', 'dot'],
  AQ: ['#D8F1FF', '#FFFFFF', '#1B82D8', 'dot'],
};

export function countryFlagSvg(code: string, width = 34, height = 22): string {
  const upper = (code || 'VN').toUpperCase();
  let hash = 0;
  for (let i = 0; i < upper.length; i++) hash = (hash * 31 + upper.charCodeAt(i)) | 0;
  const fallbackPalette: [string, string, string, 'h' | 'v' | 'dot'] = [
    ['#0067C6', '#E53935', '#009688', '#F9A825'][Math.abs(hash) % 4],
    '#FFFFFF',
    ['#1565C0', '#2E7D32', '#C62828', '#EF6C00'][Math.abs(hash >> 2) % 4],
    Math.abs(hash) % 2 === 0 ? 'h' : 'v',
  ];
  const [c1, c2, c3, mode] = FLAG_PALETTES[upper] ?? fallbackPalette;
  let inner = '';
  if (mode === 'v') {
    inner = `<rect width="20" height="40" fill="${c1}"/><rect x="20" width="20" height="40" fill="${c2}"/><rect x="40" width="20" height="40" fill="${c3}"/>`;
  } else if (mode === 'dot') {
    inner = `<rect width="60" height="40" fill="${c1}"/><circle cx="30" cy="20" r="10.5" fill="${c3}" stroke="${c2}" stroke-width="2"/>`;
  } else {
    inner = `<rect width="60" height="13.4" fill="${c1}"/><rect y="13.3" width="60" height="13.4" fill="${c2}"/><rect y="26.6" width="60" height="13.4" fill="${c3}"/>`;
  }
  return `<svg width="${width}" height="${height}" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" style="border-radius:4px;overflow:hidden;border:1.5px solid #FFFFFF;box-shadow:0 2px 5px rgba(0,0,0,0.28);display:block;flex-shrink:0;">${inner}</svg>`;
}

export function skinCubeSvg(color: string, secondaryColor = '#FFFFFF', pattern = 'solid', size = 56): string {
  const c = color || '#FF4757';
  const s = secondaryColor || '#FFFFFF';
  const accent = pattern === 'crown' || pattern === 'king' || pattern === 'royal'
    ? `<polygon points="18,16 23,8 30,14 37,8 42,16" fill="#FFD200" stroke="#A66000" stroke-width="1.6" />`
    : pattern === 'stripes' || pattern === 'rainbow'
    ? `<rect x="13" y="21" width="34" height="5" fill="${s}" opacity="0.85"/><rect x="13" y="31" width="34" height="5" fill="${s}" opacity="0.85"/>`
    : pattern === 'star' || pattern === 'stars'
    ? `<polygon points="30,20 32.8,26 39,26.8 34.4,31 35.6,37 30,34 24.4,37 25.6,31 21,26.8 27.2,26" fill="${s}"/>`
    : `<circle cx="24" cy="28" r="3" fill="#1C2833"/><circle cx="36" cy="28" r="3" fill="#1C2833"/><circle cx="23" cy="27" r="1" fill="#FFFFFF"/><circle cx="35" cy="27" r="1" fill="#FFFFFF"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="52" rx="18" ry="4" fill="rgba(0,0,0,0.22)" />
    <rect x="11" y="16" width="38" height="33" rx="9" fill="${c}" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
    <rect x="11" y="13" width="38" height="29" rx="9" fill="${c}" />
    <path d="M16 17C20 14 40 14 44 17" stroke="rgba(255,255,255,0.55)" stroke-width="3" stroke-linecap="round" />
    ${accent}
    <circle cx="30" cy="40" r="1.8" fill="${s}" opacity="0.8" />
  </svg>`;
}
