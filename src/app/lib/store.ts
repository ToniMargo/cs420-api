// Simple in-memory "DB" that survives within a warm lambda.
// Good enough for sequential vitest calls.
export type ClinicianGrant = { email: string; expiresAt: string };
export type UserRecord = {
  email: string;
  sessionToken?: string;
  consentToShareData: boolean;
  consentedClinicians: ClinicianGrant[];
};

const g = globalThis as unknown as { __store?: Map<string, UserRecord> };
const store = (g.__store ??= new Map<string, UserRecord>());

export function getOrCreateUser(email: string): UserRecord {
  let u = store.get(email);
  if (!u) {
    u = {
      email,
      consentToShareData: false,
      consentedClinicians: [],
    };
    store.set(email, u);
  }
  return u;
}

export function setConsent(email: string, consent: boolean) {
  const u = getOrCreateUser(email);
  u.consentToShareData = consent;
}

export function getConsent(email: string): boolean {
  return getOrCreateUser(email).consentToShareData;
}

export function upsertClinician(
  email: string,
  clinicianEmail: string,
  expiresAt: string
) {
  const u = getOrCreateUser(email);
  const idx = u.consentedClinicians.findIndex(
    (c) => c.email.toLowerCase() === clinicianEmail.toLowerCase()
  );
  const grant = { email: clinicianEmail, expiresAt };
  if (idx >= 0) u.consentedClinicians[idx] = grant;
  else u.consentedClinicians.push(grant);
}

export function listCliniciansAsTuples(email: string): [string, string][] {
  const u = getOrCreateUser(email);
  return u.consentedClinicians.map((c) => [c.email, c.expiresAt]);
}
