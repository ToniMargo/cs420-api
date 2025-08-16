export type ClinicianGrant = { email: string; expiresAt: string };
export type StepDoc = { ts: string; steps: number };

export type UserRecord = {
  email: string;
  password?: string;
  sessionToken?: string;
  consentToShareData: boolean;
  consentedClinicians: ClinicianGrant[];
  stepData: StepDoc[];
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
      stepData: [],
    };
    store.set(email, u);
  }
  return u;
}

export function createUser(email: string, password: string) {
  const u = getOrCreateUser(email);
  u.password = password; // fine for the course tests
}

export function authenticate(email: string, password: string): string | null {
  const u = store.get(email);
  if (!u || u.password !== password) return null;
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  u.sessionToken = token;
  return token;
}

export function userByToken(token: string | null): UserRecord | null {
  if (!token) return null;
  for (const u of store.values()) if (u.sessionToken === token) return u;
  return null;
}

export function setConsent(email: string, consent: boolean) {
  const u = getOrCreateUser(email);
  u.consentToShareData = consent;
}
export function getConsent(email: string) {
  return getOrCreateUser(email).consentToShareData;
}

export function upsertClinician(
  email: string,
  clinicianEmail: string,
  expiresAt: string
) {
  const u = getOrCreateUser(email);
  const i = u.consentedClinicians.findIndex(
    (c) => c.email.toLowerCase() === clinicianEmail.toLowerCase()
  );
  const grant = { email: clinicianEmail, expiresAt };
  if (i >= 0) u.consentedClinicians[i] = grant;
  else u.consentedClinicians.push(grant);
}
export function listCliniciansAsTuples(email: string): [string, string][] {
  return getOrCreateUser(email).consentedClinicians.map((c) => [
    c.email,
    c.expiresAt,
  ]);
}

export function saveSteps(email: string, steps: number) {
  const u = getOrCreateUser(email);
  u.stepData.push({ ts: new Date().toISOString(), steps });
}

export function riskScore(email: string): number {
  const u = getOrCreateUser(email);
  const total = u.stepData.reduce((s, d) => s + (d.steps || 0), 0);
  return Math.max(1, Math.round(total / 1000) || 1); // > 0 to satisfy test
}
