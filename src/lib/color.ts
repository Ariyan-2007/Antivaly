const HEX_RE = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

export function isValidHexColor(value: string | null | undefined): value is string {
  return !!value && HEX_RE.test(value.trim());
}

function normalizeHex(hex: string): string {
  const raw = hex.trim().replace("#", "");
  if (raw.length === 3) {
    return raw
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return raw;
}

/** Picks black or white foreground text for a given hex background, via relative luminance. */
export function contrastForeground(hex: string): "#0a0a0a" | "#ffffff" {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.5 ? "#0a0a0a" : "#ffffff";
}
