import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { base44 } from "@/api/base44Client";

export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

function nativeLabel() {
  return "Android · Bingoo Connect";
}

export async function getNativePushSubscription(userId) {
  if (!userId || !isNativeAndroid()) return null;
  const list = await base44.entities.PushSubscription.filter({
    user_id: userId,
    transport: "fcm",
  });
  return list.find((item) => item.enabled) || list[0] || null;
}

async function persistToken(userId, token) {
  if (!userId || !token) return null;
  const existing = await base44.entities.PushSubscription.filter({
    user_id: userId,
    transport: "fcm",
  });

  const duplicate = existing.find((item) => item.fcm_token === token);
  const data = {
    user_id: userId,
    transport: "fcm",
    fcm_token: token,
    device_label: nativeLabel(),
    browser: "Native",
    platform: "Android",
    enabled: true,
    created_at: duplicate?.created_at || new Date().toISOString(),
  };

  if (duplicate) {
    await base44.entities.PushSubscription.update(duplicate.id, data);
    return { ...duplicate, ...data };
  }

  // One current native token per signed-in Bingoo account on this installation.
  for (const old of existing) {
    if (old.fcm_token && old.fcm_token !== token && old.enabled) {
      await base44.entities.PushSubscription.update(old.id, { enabled: false });
    }
  }
  return base44.entities.PushSubscription.create(data);
}

export async function enableNativePush(userId) {
  if (!isNativeAndroid()) return { supported: false };
  if (!userId) throw new Error("Sign in before enabling notifications.");

  let permission = await PushNotifications.checkPermissions();
  if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
    permission = await PushNotifications.requestPermissions();
  }
  if (permission.receive !== "granted") {
    return { supported: true, permission: permission.receive, enabled: false };
  }

  return new Promise(async (resolve, reject) => {
    let registrationHandle;
    let errorHandle;
    let settled = false;

    const cleanup = async () => {
      await registrationHandle?.remove?.();
      await errorHandle?.remove?.();
    };

    registrationHandle = await PushNotifications.addListener("registration", async ({ value }) => {
      if (settled) return;
      settled = true;
      try {
        const subscription = await persistToken(userId, value);
        await cleanup();
        resolve({ supported: true, permission: "granted", enabled: true, subscription });
      } catch (error) {
        await cleanup();
        reject(error);
      }
    });

    errorHandle = await PushNotifications.addListener("registrationError", async (error) => {
      if (settled) return;
      settled = true;
      await cleanup();
      reject(new Error(error?.error || "Android push registration failed."));
    });

    try {
      await PushNotifications.register();
    } catch (error) {
      if (!settled) {
        settled = true;
        await cleanup();
        reject(error);
      }
    }
  });
}

export async function disableNativePush(userId) {
  if (!isNativeAndroid() || !userId) return;
  const list = await base44.entities.PushSubscription.filter({
    user_id: userId,
    transport: "fcm",
  });
  await Promise.all(
    list.filter((item) => item.enabled).map((item) =>
      base44.entities.PushSubscription.update(item.id, { enabled: false })
    )
  );
}

export async function refreshNativePushToken(userId) {
  if (!isNativeAndroid() || !userId) return;
  const permission = await PushNotifications.checkPermissions();
  if (permission.receive !== "granted") return;
  await enableNativePush(userId);
}
