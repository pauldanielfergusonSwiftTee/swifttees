"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export default function NativePushRegister() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const setupPushNotifications = async () => {
      try {
        console.log(
          "Native app detected - setting up push notifications"
        );

        let permission =
          await PushNotifications.checkPermissions();

        if (permission.receive === "prompt") {
          permission =
            await PushNotifications.requestPermissions();
        }

        if (permission.receive !== "granted") {
          console.log(
            "Push notification permission not granted"
          );
          return;
        }

        await PushNotifications.addListener(
          "registration",
          async (token) => {
            console.log("APNs registration successful");

            try {
              const response = await fetch(
                "/api/push/native-subscribe",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    deviceToken: token.value,
                    platform: "ios",
                  }),
                }
              );

              if (!response.ok) {
                const error = await response.text();

                console.error(
                  "Could not save native push subscription:",
                  error
                );

                return;
              }

              console.log(
                "Native push subscription saved"
              );
            } catch (error) {
              console.error(
                "Native push subscription request failed:",
                error
              );
            }
          }
        );

        await PushNotifications.addListener(
          "registrationError",
          (error) => {
            console.error(
              "APNs registration error:",
              error
            );
          }
        );

        await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log(
              "Push notification received:",
              notification
            );
          }
        );

        await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            console.log(
              "Push notification opened:",
              action
            );

            const url = action.notification.data?.url;

if (
  typeof url === "string" &&
  url.startsWith("/")
) {
  const targetUrl = `https://swifttees.co.uk${url}`;

  console.log(
    "Opening push notification URL:",
    targetUrl
  );

  setTimeout(() => {
    window.location.replace(targetUrl);
  }, 750);
}
          }
        );

        await PushNotifications.register();
      } catch (error) {
        console.error(
          "Native push setup failed:",
          error
        );
      }
    };

    setupPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return null;
}