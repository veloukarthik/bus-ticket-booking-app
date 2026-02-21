"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // eslint-disable-next-line no-console
        console.log("ServiceWorker registered:", reg);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("ServiceWorker registration failed:", err);
      }
    };

    // register after page load to avoid blocking
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
