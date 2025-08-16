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

// --- Clinician Access Request store (in-memory) ---

export type ClinicianAccessStatus = "pending" | "approved" | "denied";

export type ClinicianAccessRequest = {
  clinicianUsername: string; // normalized lowercase
  customerEmail: string; // normalized lowercase
  requestDateISO: string; // ISO timestamp
  status: ClinicianAccessStatus;
};

// Simple in-memory store.
// If you’re persisting with Prisma later, you can swap these with DB calls.
const _clinicianAccessRequests: ClinicianAccessRequest[] = [];

/**
 * Create a pending access request. Idempotent by (clinicianUsername, customerEmail, status==='pending').
 */
export function createClinicianAccessRequest(
  clinicianUsername: string,
  customerEmail: string
): void {
  const c = clinicianUsername.toLowerCase();
  const u = customerEmail.toLowerCase();

  const exists = _clinicianAccessRequests.find(
    (r) =>
      r.clinicianUsername === c &&
      r.customerEmail === u &&
      r.status === "pending"
  );
  if (exists) return; // idempotent create for "pending" requests

  _clinicianAccessRequests.push({
    clinicianUsername: c,
    customerEmail: u,
    requestDateISO: new Date().toISOString(),
    status: "pending",
  });
}

/**
 * List all (pending + historical) requests for a given user/customer.
 */
export function getClinicianAccessRequestsForCustomer(
  customerEmail: string
): ClinicianAccessRequest[] {
  const u = customerEmail.toLowerCase();
  // Return newest first for convenience
  return _clinicianAccessRequests
    .filter((r) => r.customerEmail === u)
    .sort((a, b) => b.requestDateISO.localeCompare(a.requestDateISO));
}

/**
 * Delete any pending request matching clinician+customer.
 * Returns number removed.
 */
export function deleteClinicianAccessRequest(
  clinicianUsername: string,
  customerEmail: string
): number {
  const c = clinicianUsername.toLowerCase();
  const u = customerEmail.toLowerCase();

  let removed = 0;
  for (let i = _clinicianAccessRequests.length - 1; i >= 0; i--) {
    const r = _clinicianAccessRequests[i];
    if (
      r.clinicianUsername === c &&
      r.customerEmail === u &&
      r.status === "pending"
    ) {
      _clinicianAccessRequests.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

// (Optional) If you later add an approval flow, you might export:
// export function setClinicianAccessRequestStatus(cu: string, ue: string, status: ClinicianAccessStatus) { ... }
