import { browser } from 'wxt/browser';
import type { Loop } from '@/types/loop';
import { getLoops, updateLoopStatus } from '@/storage/loops';

export async function scheduleLeaseAlarm(loop: Loop) {
  if (loop.leaseExpiresAt === null) {
    return;
  }

  await browser.alarms.create(`lease:${loop.id}`, {
    when: loop.leaseExpiresAt,
  });
}

export async function clearLeaseAlarm(loopId: string) {
  await browser.alarms.clear(`lease:${loopId}`);
}

export async function restoreLeaseAlarms() {
  const loops = await getLoops();
  const now = Date.now();

  for (const loop of loops) {
    if (loop.status !== 'active') {
      continue;
    }

    if (loop.leaseExpiresAt === null) {
      continue;
    }

    if (loop.leaseExpiresAt <= now) {
      await updateLoopStatus(loop.id, 'waiting');
      continue;
    }

    await scheduleLeaseAlarm(loop);
  }
}