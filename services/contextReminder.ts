import { updateWaitingBadge } from './badge';
import { clearLeaseAlarm } from './leaseScheduler';
import { showContextReminderNotification } from './notifications';
import { getLoops, updateLoopStatus } from '@/storage/loops';
import { getSettings } from '@/storage/settings';
import type { Loop } from '@/types/loop';
import { getHostname } from '@/utils/url';

export async function getLoopsForSite(url: string): Promise<Loop[]> {
  const currentHostname = getHostname(url);

  if (!currentHostname) {
    return [];
  }

  const loops = await getLoops();

  return loops.filter((loop) => {
    if (loop.status !== 'active') {
      return false;
    }

    if (!loop.remindOnReturn) {
      return false;
    }

    const loopHostname = getHostname(loop.url);

    return loopHostname === currentHostname;
  });
}

export async function triggerContextReminders(
  url: string,
): Promise<Loop[]> {
  const matchingLoops = await getLoopsForSite(url);

  if (matchingLoops.length === 0) {
    return [];
  }

  for (const loop of matchingLoops) {
    await updateLoopStatus(loop.id, 'waiting');
    await clearLeaseAlarm(loop.id);
  }

  await updateWaitingBadge();

  const settings = await getSettings();

  if (settings.systemNotificationsEnabled) {
    for (const loop of matchingLoops) {
      await showContextReminderNotification(loop);
    }
  }

  return matchingLoops;
}