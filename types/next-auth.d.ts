import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    appToken?: string;
    user?: DefaultSession["user"] & {
      id?: number;
      isAdmin?: boolean;
      organizationId?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appToken?: string;
    appUserId?: number;
    appUserEmail?: string;
    appIsAdmin?: boolean;
    appOrganizationId?: number;
  }
}
