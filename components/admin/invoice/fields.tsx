import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A8602A]/40 disabled:bg-gray-50";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#A8602A]"
      />
      {label}
    </label>
  );
}

/** Common ISO 3166-1 alpha-2 codes for the country picker (free input is allowed too). */
export const COUNTRY_CODES = [
  "ID", "US", "GB", "DE", "NL", "FR", "BE", "IT", "ES", "PT", "CH", "AT", "SE", "NO", "DK", "FI", "IE", "PL",
  "AU", "NZ", "SG", "MY", "TH", "VN", "PH", "JP", "KR", "CN", "HK", "TW", "IN", "AE", "SA", "QA", "KW", "TR",
  "CA", "MX", "BR", "AR", "CL", "ZA", "EG", "IL", "RU",
];

/** Default time zone per country, used to pre-fill the buyer's zone. */
export const COUNTRY_TIMEZONES: Record<string, string> = {
  ID: "Asia/Jakarta", US: "America/New_York", GB: "Europe/London", DE: "Europe/Berlin", NL: "Europe/Amsterdam",
  FR: "Europe/Paris", BE: "Europe/Brussels", IT: "Europe/Rome", ES: "Europe/Madrid", PT: "Europe/Lisbon",
  CH: "Europe/Zurich", AT: "Europe/Vienna", SE: "Europe/Stockholm", NO: "Europe/Oslo", DK: "Europe/Copenhagen",
  FI: "Europe/Helsinki", IE: "Europe/Dublin", PL: "Europe/Warsaw", AU: "Australia/Sydney", NZ: "Pacific/Auckland",
  SG: "Asia/Singapore", MY: "Asia/Kuala_Lumpur", TH: "Asia/Bangkok", VN: "Asia/Ho_Chi_Minh", PH: "Asia/Manila",
  JP: "Asia/Tokyo", KR: "Asia/Seoul", CN: "Asia/Shanghai", HK: "Asia/Hong_Kong", TW: "Asia/Taipei",
  IN: "Asia/Kolkata", AE: "Asia/Dubai", SA: "Asia/Riyadh", QA: "Asia/Qatar", KW: "Asia/Kuwait",
  TR: "Europe/Istanbul", CA: "America/Toronto", MX: "America/Mexico_City", BR: "America/Sao_Paulo",
  AR: "America/Argentina/Buenos_Aires", CL: "America/Santiago", ZA: "Africa/Johannesburg", EG: "Africa/Cairo",
  IL: "Asia/Jerusalem", RU: "Europe/Moscow",
};

export function countryLabel(code: string) {
  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
