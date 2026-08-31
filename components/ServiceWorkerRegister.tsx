"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Swift Tees service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error(
            "Swift Tees service worker registration failed:",
            error
          );
        });
    }
  }, []);

  return null;
}