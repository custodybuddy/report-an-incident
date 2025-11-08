export const SEVERITY_THEMES = {
  high: {
    card: 'bg-[#2C0F12] border-[#FFB3B3]/60 shadow-[0_10px_25px_rgba(255,59,59,0.25)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD7A3]',
    accent: 'text-[#FFD700]',
  },
  medium: {
    card: 'bg-[#2A1A04] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(244,232,131,0.2)]',
    label: 'text-[#FFD700]',
    value: 'text-[#F4E883]',
    accent: 'text-[#FFD700]',
  },
  low: {
    card: 'bg-[#0a2a1f] border-[#6fe0b1]/50 shadow-[0_10px_25px_rgba(0,128,96,0.2)]',
    label: 'text-[#F4E883]',
    value: 'text-[#CFEFDA]',
    accent: 'text-[#F4E883]',
  },
  default: {
    card: 'bg-[#01192C] border-[#F4E883]/60 shadow-[0_10px_25px_rgba(0,0,0,0.35)]',
    label: 'text-[#FFD700]',
    value: 'text-[#FFD700]',
    accent: 'text-[#FFD700]',
  },
} as const;

export type SeverityThemeKey = keyof typeof SEVERITY_THEMES;
export type SeverityTheme = (typeof SEVERITY_THEMES)[SeverityThemeKey];

export const getSeverityTheme = (severity: string | null | undefined): SeverityTheme => {
  const normalized = (severity ?? '').toLowerCase() as SeverityThemeKey;
  return SEVERITY_THEMES[normalized] ?? SEVERITY_THEMES.default;
};
