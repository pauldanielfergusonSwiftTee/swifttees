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

        let permission = await PushNotifications.checkPermissions();

        if (permission.receive === "prompt") {
          permission = await PushNotifications.requestPermissions();
        }

        if (permission.receive !== "granted") {
          console.log("Push notification permission not granted");
          return;
        }

        await PushNotifications.addListener(
          "registration",
          (token) => {
            console.log("APNs registration successful");
            console.log("APNs token:", token.value);
          }
        );

        await PushNotifications.addListener(
          "registrationError",
          (error) => {
            console.error("APNs registration error:", error);
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
          }
        );

        await PushNotifications.register();
      } catch (error) {
        console.error("Native push setup failed:", error);
      }
    };

    setupPushNotifications();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  return null;
}