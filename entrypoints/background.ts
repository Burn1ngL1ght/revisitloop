import { browser } from 'wxt/browser';
import { updateWaitingBadge } from '@/services/badge';
import { restoreLeaseAlarms } from '@/services/leaseScheduler';
import { showLeaseExpiredNotification } from '@/services/notifications';
import { getLoopById, updateLoopStatus } from '@/storage/loops';
import { getSettings } from '@/storage/settings';
import { triggerContextReminders } from '@/services/contextReminder';

async function openOnboardingIfNeeded() {
  const settings = await getSettings();

  if (settings.onboardingCompleted) {
    return;
  }

  await browser.tabs.create({
    url: browser.runtime.getURL('/onboarding.html')
  });
}

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') {
    return;
  }

  if (import.meta.env.DEV) {
    return;
  }

  void openOnboardingIfNeeded();
});

async function initializeBackground() {
  await restoreLeaseAlarms();
  await updateWaitingBadge();
}

async function checkTabForContextReminder(url?: string) {
  if (!url) {
    return;
  }

  const triggeredLoops = await triggerContextReminders(url);

  if (triggeredLoops.length === 0) {
    return;
  }

  console.log('Context reminders triggered:', {
    url,
    loops: triggeredLoops,
  });
}

export default defineBackground(() => {
  console.log('RevisitLoop background initialized.');

  void initializeBackground();

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('lease:')) {
      return;
    }

    const loopId = alarm.name.slice('lease:'.length);
    const loop = await getLoopById(loopId);

    if (!loop) {
      console.warn('No Loop found for expired lease:', loopId);
      return;
    }

    if (loop.status !== 'active') {
      console.warn(
        'Ignoring lease alarm for non-active Loop:',
        loopId,
        loop.status,
      );
      return;
    }

    await updateLoopStatus(loopId, 'waiting');
    await updateWaitingBadge();
    
    const settings = await getSettings();

    if (settings.systemNotificationsEnabled) {
      await showLeaseExpiredNotification(loop);
    }

    console.log('Lease expired. Loop moved to waiting:', loopId);
  });

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await browser.tabs.get(tabId);

    await checkTabForContextReminder(tab.url);
  });

  browser.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
      return;
    }

    await checkTabForContextReminder(tab.url);
  });
});