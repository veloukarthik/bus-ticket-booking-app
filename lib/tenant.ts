import { verifyToken } from "@/lib/auth";

export type TenantAuthPayload = {
  userId: number;
  email?: string;
  isAdmin?: boolean;
  organizationId: number;
};

export function parseBearerToken(headers: Headers | Record<string, string> | undefined) {
  if (!headers) return null;
  try {
    if ((headers as Headers).get) {
      const h = (headers as Headers).get("authorization") || (headers as Headers).get("Authorization");
      return h ? h.replace("Bearer ", "") : null;
    }
  } catch {}
  const h = (headers as any)["authorization"] || (headers as any)["Authorization"];
  return h ? String(h).replace("Bearer ", "") : null;
}

export function getTenantFromToken(token?: string | null): TenantAuthPayload | null {
  if (!token) return null;
  const payload = verifyToken(token) as TenantAuthPayload | null;
  if (!payload) return null;
  if (!payload.organizationId) return null;
  return payload;
}

export function resolveOrganizationId(req: Request, fallback = true): number | null {
  const token = parseBearerToken(req.headers as any);
  const fromToken = getTenantFromToken(token);
  if (fromToken?.organizationId) return fromToken.organizationId;

  const url = new URL(req.url);
  const orgIdParam = Number(url.searchParams.get("orgId"));
  if (!Number.isNaN(orgIdParam) && orgIdParam > 0) return orgIdParam;

  if (fallback) {
    const envOrgId = Number(process.env.DEFAULT_ORGANIZATION_ID || "1");
    if (!Number.isNaN(envOrgId) && envOrgId > 0) return envOrgId;
  }
  return null;
}
