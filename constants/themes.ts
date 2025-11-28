export type ColorTheme = {
  name: string;
  softRose: string;
  warmSand: string;
  deepSlate: string;
  lightRose: string;
  accentRose: string;
  white: string;
  lightGray: string;
  mediumGray: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
};

export const THEMES: Record<string, ColorTheme> = {
  classic: {
    name: "Classic Rose",
    softRose: "#E8B4B8",
    warmSand: "#F5E6D3",
    deepSlate: "#2C3E50",
    lightRose: "#FAE8E9",
    accentRose: "#D4898D",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#2C3E50",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
  lavender: {
    name: "Lavender Dreams",
    softRose: "#D4C5E8",
    warmSand: "#F0EAF5",
    deepSlate: "#2C2E50",
    lightRose: "#EDE7F6",
    accentRose: "#9575CD",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#2C2E50",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
  ocean: {
    name: "Ocean Breeze",
    softRose: "#B4D8E8",
    warmSand: "#D3EBF5",
    deepSlate: "#1A3A52",
    lightRose: "#E0F2F7",
    accentRose: "#4A90A4",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#1A3A52",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
  sunset: {
    name: "Sunset Glow",
    softRose: "#FFB4A2",
    warmSand: "#FFF4E6",
    deepSlate: "#4A2C2A",
    lightRose: "#FFE4D9",
    accentRose: "#FF8A65",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#4A2C2A",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
  mint: {
    name: "Mint Fresh",
    softRose: "#B5E8D3",
    warmSand: "#E8F5F0",
    deepSlate: "#1E4D3D",
    lightRose: "#D5F4E6",
    accentRose: "#4DB38A",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#1E4D3D",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
  peachy: {
    name: "Peachy Keen",
    softRose: "#FFDAB9",
    warmSand: "#FFF5E6",
    deepSlate: "#5C3D2E",
    lightRose: "#FFEBD6",
    accentRose: "#FFB88C",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    mediumGray: "#E9ECEF",
    textPrimary: "#5C3D2E",
    textSecondary: "#6C757D",
    success: "#52C41A",
    warning: "#FAAD14",
  },
};

export const THEME_KEYS = Object.keys(THEMES) as (keyof typeof THEMES)[];
