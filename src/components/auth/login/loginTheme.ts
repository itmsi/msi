import type { CSSProperties } from "react";

/**
 * Login page palette. MSI blue comes from the app's `--color-primary` theme token (#0253a5);
 * the hover shade matches the shared Button component. Everything else is login-scoped.
 */
export const loginPalette = {
    primary: "var(--color-primary)",
    primaryHover: "#003061",
    primaryActive: "#00264D",
    background: "#DFE8F2",
    text: "#DFE8F2",
    textMuted: "#475569",
    border: "#D9DEE7",
    borderHover: "#B8C4D3",
    placeholder: "#94A3B8",
    disabled: "#9FB5CC",
    particle: "#397CB8",
    veil: "#9FB5CC",
    /** Wave fills, back to front. */
    waves: ["#063B70", "var(--color-primary)", "#397CB8", "#9FB5CC", "#FFFFFF"],
} as const;

/** CSS custom properties consumed by the login components' Tailwind var() utilities. */
export const loginThemeVars = {
    "--login-primary": loginPalette.primary,
    "--login-primary-hover": loginPalette.primaryHover,
    "--login-primary-active": loginPalette.primaryActive,
    "--login-bg": loginPalette.background,
    "--login-text": loginPalette.text,
    "--login-text-muted": loginPalette.textMuted,
    "--login-border": loginPalette.border,
    "--login-border-hover": loginPalette.borderHover,
    "--login-placeholder": loginPalette.placeholder,
    "--login-disabled": loginPalette.disabled,
    "--login-veil": loginPalette.veil,
    // background: `radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, #EDF2F8 45%, ${loginPalette.background} 100%)`,

    "--bp-950": "#ffffff",
    // "--bp-950": "#011d3a",
    "--bp-900": "#012a54",
    "--bp-300": "#8ebde8",
    "color": "#fff",
    background: `radial-gradient(125% 95% at 18% 8%, ${loginPalette.primary} 0%, transparent 58%), linear-gradient(160deg, var(--bp-900) 0%, var(--bp-950) 100%)`
} as CSSProperties;
