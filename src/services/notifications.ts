// src/services/notifications.ts
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Mostra alerta mesmo com o app em primeiro plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Chame uma vez no boot do app (ex.: _layout.tsx)
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

function toDate(input: Date | string | number): Date {
    if (input instanceof Date) return input;
    if (typeof input === "number") return new Date(input);
    // string
    // aceita "YYYY-MM-DDTHH:mm:ssZ" ou "YYYY-MM-DD HH:mm"
    const str = input.includes(" ") ? input.replace(" ", "T") : input;
    const d = new Date(str);
    if (isNaN(d.getTime())) throw new Error("Data inválida para notificação");
    return d;
}

// ✅ Export que estava faltando
export async function scheduleTaskReminder(title: string, when: Date | string | number) {
    const date = toDate(when);
    if (date.getTime() <= Date.now()) {
        // evita agendar no passado; jogamos 5s pra frente para testes
        date.setSeconds(date.getSeconds() + 5);
    }

    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: "Lembrete de tarefa",
            body: title,
        },
        trigger: { date },
    });

    return id;
}

// Utilitários para teste/inspeção
export async function listScheduled() {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    console.log("🔔 Agendadas:", all);
    return all;
}

export async function cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🔕 Todas as notificações agendadas foram canceladas.");
}
