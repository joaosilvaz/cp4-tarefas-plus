// src/services/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const perm = await Notifications.getPermissionsAsync();
  if (perm.status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

export async function listScheduled() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  console.log("🔔 Agendadas:", all);
  return all;
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("🔕 Todas as notificações agendadas foram canceladas.");
}
