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
