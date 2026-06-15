const PALETTE = [
  'blush-1',
  'blush-2',
  'sage-1',
  'sage-2',
  'mist-1',
  'mist-2',
  'butter-1',
  'butter-2',
  'peach-1',
  'peach-2',
  'lavender-1',
  'lavender-2',
  'mint-1',
  'mint-2',
  'sky-1',
  'sky-2',
] as const;

export type PastelToken = (typeof PALETTE)[number];

const tokenClasses: Record<PastelToken, string> = {
  'blush-1': 'bg-rose-200',
  'blush-2': 'bg-pink-200',
  'sage-1': 'bg-emerald-200',
  'sage-2': 'bg-green-200',
  'mist-1': 'bg-cyan-200',
  'mist-2': 'bg-sky-200',
  'butter-1': 'bg-amber-200',
  'butter-2': 'bg-yellow-200',
  'peach-1': 'bg-orange-200',
  'peach-2': 'bg-amber-200',
  'lavender-1': 'bg-violet-200',
  'lavender-2': 'bg-fuchsia-200',
  'mint-1': 'bg-teal-200',
  'mint-2': 'bg-lime-200',
  'sky-1': 'bg-blue-200',
  'sky-2': 'bg-indigo-200',
};

const tokenContrast: Record<PastelToken, { iconContrast: number; backgroundContrast: number }> = {
  'blush-1': { iconContrast: 3.4, backgroundContrast: 1.7 },
  'blush-2': { iconContrast: 3.2, backgroundContrast: 1.6 },
  'sage-1': { iconContrast: 3.5, backgroundContrast: 1.8 },
  'sage-2': { iconContrast: 3.3, backgroundContrast: 1.7 },
  'mist-1': { iconContrast: 3.4, backgroundContrast: 1.7 },
  'mist-2': { iconContrast: 3.1, backgroundContrast: 1.5 },
  'butter-1': { iconContrast: 3.6, backgroundContrast: 1.9 },
  'butter-2': { iconContrast: 3.2, backgroundContrast: 1.6 },
  'peach-1': { iconContrast: 3.3, backgroundContrast: 1.6 },
  'peach-2': { iconContrast: 3.1, backgroundContrast: 1.5 },
  'lavender-1': { iconContrast: 3.4, backgroundContrast: 1.7 },
  'lavender-2': { iconContrast: 3.2, backgroundContrast: 1.6 },
  'mint-1': { iconContrast: 3.5, backgroundContrast: 1.8 },
  'mint-2': { iconContrast: 3.2, backgroundContrast: 1.6 },
  'sky-1': { iconContrast: 3.4, backgroundContrast: 1.7 },
  'sky-2': { iconContrast: 3.2, backgroundContrast: 1.6 },
};

export function getApprovedPastelPalette() {
  return [...PALETTE];
}

export function pickPastelToken(seed?: string): PastelToken {
  if (!seed) {
    return PALETTE[Math.floor(Math.random() * PALETTE.length)];
  }

  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}

export function getPastelClassName(token: PastelToken) {
  return tokenClasses[token];
}

export function getPastelContrast(token: PastelToken) {
  return tokenContrast[token];
}
