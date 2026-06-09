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
  'blush-1': 'bg-blush/80',
  'blush-2': 'bg-blush/60',
  'sage-1': 'bg-sage/80',
  'sage-2': 'bg-sage/60',
  'mist-1': 'bg-mist/80',
  'mist-2': 'bg-mist/50',
  'butter-1': 'bg-butter/80',
  'butter-2': 'bg-butter/60',
  'peach-1': 'bg-blush/70',
  'peach-2': 'bg-blush/50',
  'lavender-1': 'bg-mist/70',
  'lavender-2': 'bg-mist/60',
  'mint-1': 'bg-sage/70',
  'mint-2': 'bg-sage/55',
  'sky-1': 'bg-mist/75',
  'sky-2': 'bg-mist/65',
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
