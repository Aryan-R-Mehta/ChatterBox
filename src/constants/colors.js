/**
 * Midnight Velocity–style palette (dark messaging UI).
 *
 * - `midnightHex` — raw values for inline styles, SVG, charts, `style={{}}`
 * - `midnightTw` — ready-made Tailwind class strings (arbitrary colors)
 * - `chatterColors` — layout-specific aliases (sidebar, main, inputs)
 *
 * Keep CSS variables in `app/globals.css` (`--mv-*`) in sync with these hex values.
 */

export const midnightHex = {
  // Surfaces (no harsh borders — rely on stepped backgrounds)
  app: "#0b1020",
  sidebar: "#111827",
  main: "#0d1324",
  navBar: "#0b1020",
  activeListItem: "#1c2d4a",
  elevated: "#151d32",
  overlay: "rgba(7, 11, 22, 0.72)",

  // Message bubbles
  bubbleIncoming: "#1a2538",
  bubbleIncomingText: "#f1f5ff",
  bubbleOutgoing: "#2f6feb",
  bubbleOutgoingText: "#ffffff",
  /** Warm panel behind media / highlights */
  mediaAccent: "#c45c3a",

  // Text
  text: "#f8fafc",
  textMuted: "#8c9bb8",
  textNavInactive: "#94a3b8",
  placeholder: "#64748b",

  // Accents
  accentBlue: "#3b8efc",
  accentOrange: "#ea7c4d",
  statusOnline: "#38bdf8",

  // Inputs & dividers
  inputBg: "#080c18",
  inputBorder: "#243047",
  hairline: "rgba(148, 163, 184, 0.14)",

  // Feedback
  danger: "#f87171",
  success: "#4ade80",
  warning: "#f59e0b",
};

/** Tailwind class fragments (single concern per key; combine in components). */
export const midnightTw = {
  bgApp: "bg-[#0b1020]",
  bgSidebar: "bg-[#111827]",
  bgMain: "bg-[#0d1324]",
  bgNav: "bg-[#0b1020]",
  bgActiveItem: "bg-[#1c2d4a]",
  bgElevated: "bg-[#151d32]",
  bgInput: "bg-[#080c18]",

  text: "text-[#f8fafc]",
  textMuted: "text-[#8c9bb8]",
  textNavInactive: "text-[#94a3b8]",
  placeholder: "placeholder:text-[#64748b]",

  borderHairline: "border-[color:rgba(148,163,184,0.14)]",
  borderInput: "border-[#243047]",

  bubbleIncoming: "bg-[#1a2538] text-[#f1f5ff]",
  bubbleOutgoing: "bg-[#2f6feb] text-[#ffffff]",

  accentBlue: "bg-[#3b8efc] text-white",
  accentBlueText: "text-[#3b8efc]",
  accentOrange: "bg-[#ea7c4d] text-white",
  statusOnline: "bg-[#38bdf8]",
};

/**
 * Chatter / two-column shell — use these in layout components.
 */
export const chatterColors = {
  page: `${midnightTw.bgApp} ${midnightTw.text}`,
  sidebar: `${midnightTw.borderHairline} border-r ${midnightTw.bgSidebar}`,
  sidebarMuted: midnightTw.textMuted,
  input: `${midnightTw.borderInput} border ${midnightTw.bgInput} ${midnightTw.text} ${midnightTw.placeholder}`,
  sectionLabel: midnightTw.textMuted,
  chatItemActive: `${midnightTw.bgActiveItem} ${midnightTw.text}`,
  chatItemIdle: `text-[#cbd5e1] hover:bg-[#1c2d4a]/50`,
  mainArea: midnightTw.bgMain,
  emptyTitle: "text-[#e2e8f0]",
  emptySubtitle: midnightTw.textMuted,
};
