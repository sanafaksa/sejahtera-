/** Display helpers for countries and Indonesian provinces. */

/** ISO 3166-2:ID subdivision codes (as sent by x-vercel-ip-country-region). */
const ID_PROVINCES: Record<string, string> = {
  AC: "Aceh",
  BA: "Bali",
  BB: "Kepulauan Bangka Belitung",
  BE: "Bengkulu",
  BT: "Banten",
  GO: "Gorontalo",
  JA: "Jambi",
  JB: "Jawa Barat",
  JI: "Jawa Timur",
  JK: "DKI Jakarta",
  JT: "Jawa Tengah",
  KB: "Kalimantan Barat",
  KI: "Kalimantan Timur",
  KR: "Kepulauan Riau",
  KS: "Kalimantan Selatan",
  KT: "Kalimantan Tengah",
  KU: "Kalimantan Utara",
  LA: "Lampung",
  MA: "Maluku",
  MU: "Maluku Utara",
  NB: "Nusa Tenggara Barat",
  NT: "Nusa Tenggara Timur",
  PA: "Papua",
  PB: "Papua Barat",
  PD: "Papua Barat Daya",
  PE: "Papua Pegunungan",
  PS: "Papua Selatan",
  PT: "Papua Tengah",
  RI: "Riau",
  SA: "Sulawesi Utara",
  SB: "Sumatera Barat",
  SG: "Sulawesi Tenggara",
  SN: "Sulawesi Selatan",
  SR: "Sulawesi Barat",
  SS: "Sumatera Selatan",
  ST: "Sulawesi Tengah",
  SU: "Sumatera Utara",
  YO: "DI Yogyakarta",
};

export function provinceName(code: string | null | undefined): string {
  if (!code) return "Tidak diketahui";
  return ID_PROVINCES[code.toUpperCase()] ?? code;
}

let displayNames: Intl.DisplayNames | null = null;

export function countryName(code: string | null | undefined): string {
  if (!code) return "Tidak diketahui";
  try {
    displayNames ??= new Intl.DisplayNames(["id"], { type: "region" });
    return displayNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export function countryFlag(code: string | null | undefined): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

/** Google Maps search link for a place, e.g. mapsUrl(["Boyolali","Jawa Tengah"]). */
export function mapsUrl(parts: Array<string | null | undefined>): string {
  const q = parts.filter((p) => p && p !== "??").join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
