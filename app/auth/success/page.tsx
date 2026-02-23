"use client";

import { Suspense, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/app/providers/UserProvider";

function AuthSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useUser();

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      const session = await getSession();
      const appToken = session?.appToken;
      if (!cancelled && appToken) {
        localStorage.setItem("token", appToken);
        setUser({
          id: session.user?.id ?? 0,
          email: session.user?.email ?? "",
          isAdmin: Boolean(session.user?.isAdmin),
          organizationId: session.user?.organizationId ?? undefined,
          name: session.user?.name ?? undefined,
        });
      }

      if (!cancelled) {
        const callbackUrl = params.get("callbackUrl") || "/";
        router.replace(callbackUrl);
      }
    }

    syncSession();
    return () => {
      cancelled = true;
    };
  }, [params, router, setUser]);

  return (
    <div className="mx-auto max-w-3xl p-6 text-center">
      <h1 className="text-2xl font-semibold">Signing you in...</h1>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl p-6 text-center">
          <h1 className="text-2xl font-semibold">Signing you in...</h1>
        </div>
      }
    >
      <AuthSuccessContent />
    </Suspense>
  );
}
