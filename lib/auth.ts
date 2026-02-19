import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}

export function requireAdminFromToken(token?: string | null) {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (!payload.isAdmin) return null;
  return payload;
}

export function getTokenFromAuthHeader(headers: Headers | Record<string, string> | undefined) {
  if (!headers) return null;
  // support Next request headers (headers.entries) or plain object
  try {
    if ((headers as Headers).get) {
      const h = (headers as Headers).get("authorization") || (headers as Headers).get("Authorization");
      return h ? h.replace("Bearer ", "") : null;
    }
  } catch (e) {}
  const h = (headers as any)["authorization"] || (headers as any)["Authorization"];
  return h ? String(h).replace("Bearer ", "") : null;
}
