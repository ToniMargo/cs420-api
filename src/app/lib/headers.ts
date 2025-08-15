export function readSessionToken(h: Headers) {
  return h.get("suresteps.session.token") || h.get("suresteps-session-token");
}
