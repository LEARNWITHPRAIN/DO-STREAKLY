"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("DO STREAKLY Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("DO STREAKLY Service Worker registration failed:", err);
        });
    }
  }, []);

  return null;
}
