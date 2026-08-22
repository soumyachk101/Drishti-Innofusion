/**
 * Design tokens — Obscura "8-bit arcade on cloud paper" (light theme).
 *
 * Single source of truth for the WHOLE app. ~40 files reference the aliased
 * token vocabulary (bg-*, ink-*, edge-*, accent-500, text-h3…); remapping the
 * VALUES here re-skins every screen without touching component markup. The old
 * dark SOC-blue names are kept but now point at Obscura's light palette:
 *   canvas → Cloud Mist  ·  surfaces → Paper White / App Window
 *   accent → Signal Orange  ·  ink → Graphite Ink ramp  ·  hairline → cloud border
 * The functional risk ramp (green→red severity) stays — it's semantic, not brand.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Obscura light theme (playful privacy) ───────────────────────────
        // Cloud-mist canvas, single Signal Orange accent, graphite ink.
        primary: "#ff5e24", // Signal Orange
        "on-primary": "#ffffff", // white label on the orange fill
        "accent-blue": "#ff5e24", // legacy name kept; now Signal Orange
        ink: "#232629", // Graphite Ink
        "ink-muted": "#989ea4", // Ash Mist
        canvas: "#e3f1fe", // Cloud Mist page tint
        "surface-1": "#ffffff", // Paper White cards
        "surface-2": "#f5f5f7", // App Window chrome
        hairline: "#cfe0f0", // soft cloud border (visible on white)
        "hairline-soft": "#e3f1fe", // Cloud Mist (quieter)
        "inverse-canvas": "#232629",
        "inverse-ink": "#e3f1fe",
        // Decorative gradient stops → cloud/cream ramp.
        "gradient-magenta": "#e3f1fe",
        "gradient-violet": "#ff8a5c",
        "gradient-orange": "#ff5e24",
        "gradient-coral": "#dbced0",
        "semantic-success": "#2ec27e",
        // Severity ramp — functional security semantics, kept green→red.
        risk: { safe: "#2ec27e", low: "#e5c453", medium: "#f59e42", high: "#f0663c", critical: "#ef4655", glow: "rgba(239,70,85,0.3)" },
        status: { open: "#ff5e24", remediating: "#e5c453", resolved: "#989ea4", info: "#5c6066" },

        // ── Legacy aliases → Obscura light surfaces (app-wide back-compat) ───
        bg: {
          base: "#e3f1fe", // = canvas (Cloud Mist)
          surface: "#ffffff", // = surface-1 (Paper White)
          raised: "#f5f5f7", // = surface-2 (App Window)
          inset: "#dbe9f8", // soft cloud well (progress tracks etc.)
        },
        edge: {
          subtle: "#cfe0f0", // = hairline
          strong: "#b9cade",
        },
        // Text ramp: Graphite → Slate → Ash (3 tiers).
        "ink-primary": "#232629", // Graphite Ink
        "ink-secondary": "#5c6066", // Slate Pencil
        // `ink-muted` (#989ea4 Ash Mist) serves text-ink-muted.
        // Accent = Signal Orange ramp (primary buttons pair it with white ink).
        accent: {
          300: "#ff8a5c",
          400: "#ff7245",
          500: "#ff5e24", // Signal Orange — the one loud voice
          600: "#e04f1c", // deeper orange for hover/pressed
          glow: "rgba(255,94,36,0.15)",
        },
        md: {
          primary: "#ff5e24",
          "on-primary": "#ffffff",
          "primary-container": "#e3f1fe",
          "on-primary-container": "#232629",
          secondary: "#5c6066",
          "on-secondary": "#ffffff",
          error: "#ef4655",
          background: "#e3f1fe",
          "on-background": "#232629",
          surface: "#ffffff",
          "surface-lowest": "#e3f1fe",
        },
        // Obscura named tokens (available directly where wanted).
        "signal-orange": "#ff5e24",
        "ember-crust": "#6c3200",
        "cloud-mist": "#e3f1fe",
        "graphite-ink": "#232629",
        "paper-white": "#ffffff",
        "slate-pencil": "#5c6066",
        "ash-mist": "#989ea4",
        "blush-shadow": "#dbced0",
        "midnight-ink": "#101828",
      },
      // Bare `ring`/`ring-2` utilities default to Signal Orange.
      ringColor: { DEFAULT: "#ff5e24" },
      fontFamily: {
        // Space Grotesk = modern, executive cyber display headings.
        display: ["'Space Grotesk'", "'Clash Display'", "Manrope", "Inter", "system-ui", "sans-serif"],
        // Manrope = all body/UI/nav/labels.
        body: ["Manrope", "Inter", "system-ui", "sans-serif"],
        // JetBrains Mono kept for tabular data (IPs, money, scores).
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        roboto: ["Manrope", "system-ui", "Arial", "sans-serif"],
      },
      fontSize: {
        // Framer type scale (landing/marketing).
        "display-xxl": ["110px", { lineHeight: "0.85", letterSpacing: "-5.5px", fontWeight: "500" }],
        "display-xl": ["85px", { lineHeight: "0.95", letterSpacing: "-4.25px", fontWeight: "500" }],
        "display-lg": ["62px", { lineHeight: "1.00", letterSpacing: "-3.1px", fontWeight: "500" }],
        "display-md": ["32px", { lineHeight: "1.13", letterSpacing: "-1.0px", fontWeight: "500" }],
        headline: ["22px", { lineHeight: "1.20", letterSpacing: "-0.8px", fontWeight: "700" }],
        subhead: ["24px", { lineHeight: "1.30", letterSpacing: "-0.01px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "1.30", letterSpacing: "-0.18px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.40", letterSpacing: "-0.14px", fontWeight: "500" }],
        button: ["14px", { lineHeight: "1.00", letterSpacing: "-0.14px", fontWeight: "500" }],
        // App type scale referenced app-wide as text-{token}. Compatible with the
        // framer scale (body/caption/micro line up), kept so headings/captions
        // don't collapse to the 16px browser default.
        small: ["0.8125rem", { lineHeight: "1.45" }],
        body: ["0.9375rem", { lineHeight: "1.5" }], // 15px — matches framer body
        h3: ["1.0625rem", { lineHeight: "1.3" }],
        h2: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        h1: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
        display: ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "mono-data": ["0.9375rem", { lineHeight: "1.4" }],
        caption: ["13px", { lineHeight: "1.20", letterSpacing: "-0.13px", fontWeight: "500" }],
        micro: ["12px", { lineHeight: "1.20", letterSpacing: "-0.12px", fontWeight: "400" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "15px",
        xl: "20px",
        xxl: "30px",
        node: "12px",
        pill: "100px",
        full: "9999px",
      },
      spacing: {
        hair: "1px",
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "15px",
        lg: "20px",
        xl: "30px",
        xxl: "40px",
        section: "96px",
      },
      boxShadow: {
        "focus-ring": "0 0 0 1px rgba(255,94,36,0.15)",
        // Soft paper card lift (Obscura elevation — blue-tinted, whisper-soft).
        "light-edge":
          "rgba(15,34,52,0.01) 0px 27px 11px 0px, rgba(15,34,52,0.02) 0px 15px 9px 0px, rgba(15,34,52,0.04) 0px 7px 7px 0px, rgba(15,34,52,0.04) 0px 2px 4px 0px",
        // Signal-orange focus ring (active nav / focused primary).
        "accent-glow": "0 0 0 3px rgba(255,94,36,0.30)",
        // 8-bit "pressed pixel" offset shadows now warm (Blush Shadow).
        card: "3px 3px 0px 0px #dbced0",
        pop: "6px 6px 0px 0px #dbced0",
        neo: "4px 4px 0px 0px #232629",
        "neo-md": "6px 6px 0px 0px #232629",
        "neo-lg": "8px 8px 0px 0px #232629",
      },
      keyframes: {
        "dash-flow": { to: { strokeDashoffset: "-16" } },
        "blast-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(255,94,36,0.45)" },
          "100%": { boxShadow: "0 0 0 18px rgba(255,94,36,0)" },
        },
        shimmer: {
          "0%": { opacity: "0.45" },
          "50%": { opacity: "0.8" },
          "100%": { opacity: "0.45" },
        },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "dash-flow": "dash-flow 1s linear infinite",
        "blast-pulse": "blast-pulse 600ms ease-out 1",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "spin-slow": "spin-slow 10s linear infinite",
      },
    },
  },
  plugins: [],
};
