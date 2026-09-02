import { browser } from 'wxt/browser';
import type { Loop } from '../types/loop';

export async function showLeaseExpiredNotification(loop: Loop) {
  await browser.notifications.create(`lease-expired:${loop.id}`, {
    type: 'basic',
    title: 'RevisitLoop',
    message: `Lease expired: ${loop.purpose}`,
    iconUrl: browser.runtime.getURL('/icon/128.png'),
  });
}

export async function showContextReminderNotification(loop: Loop) {
  await browser.notifications.create(`context-reminder:${loop.id}`, {
    type: 'basic',
    title: 'RevisitLoop',
    message: `You're back on this site: ${loop.purpose}`,
    iconUrl: browser.runtime.getURL('/icon/128.png'),
  });
}