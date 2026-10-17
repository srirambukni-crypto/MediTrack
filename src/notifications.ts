import { DoseItem } from './types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendDoseNotification(dose: DoseItem): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const title = `Time for ${dose.m.name}`;
  const details = [dose.m.dose, dose.m.person ? `For: ${dose.m.person}` : '', dose.m.notes]
    .filter(Boolean)
    .join(' · ');

  const options: NotificationOptions = {
    body: details || 'Your scheduled medication dose is due now.',
    tag: dose.key,
    icon: '/favicon.ico',
    requireInteraction: true,
  };

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification(title, options))
        .catch(() => new Notification(title, options));
    } else {
      new Notification(title, options);
    }
  } catch (err) {
    console.warn('Could not display system notification:', err);
  }
}
