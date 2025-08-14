// src/lib/consentStore.ts
export type ClinicianGrant = { email: string; expiresAt: string };

// Singleton-ish in-memory stores (OK for coursework/dev; not durable)
const g = globalThis as unknown as {
  __consentStore?: Map<string, boolean>;
  __clinicianStore?: Map<string, ClinicianGrant[]>;
};

export const consentStore = g.__consentStore ?? new Map<string, boolean>();
export const clinicianStore =
  g.__clinicianStore ?? new Map<string, ClinicianGrant[]>();

g.__consentStore = consentStore;
g.__clinicianStore = clinicianStore;

export function getSessionToken(headers: Headers): string | null {
  // Test sends this exact header
  return (
    headers.get("suresteps.session.token") ||
    headers.get("suresteps-session-token")
  );
}

export function oneYearFromNowISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}
