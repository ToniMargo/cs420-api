export function readSessionToken(headers: Headers): string | null {
  // Support both names (Vercel may rewrite dotted names)
  return (
    headers.get("suresteps.session.token") ||
    headers.get("suresteps-session-token") ||
    null
  );
}
