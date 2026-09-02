import { 
  deleteLoop,
  getLoopById,
  saveLoop,
  updateLoop,
} from '@/storage/loops';
import type { LeaseOption, Loop } from '@/types/loop';
import { updateWaitingBadge } from './badge';
import { calculateLeaseExpiration } from '@/utils/lease';
import { 
  clearLeaseAlarm,
  scheduleLeaseAlarm,
} from './leaseScheduler';

type ActiveLoopUpdates = {
  purpose: string;
  lease: LeaseOption;
  remindOnReturn: boolean;
  customLeaseExpiresAt?: number | null;
};

export async function startLoop(loop: Loop) {
  await saveLoop(loop);
  await scheduleLeaseAlarm(loop);
}

export async function archiveLoop(loopId: string) {
  await clearLeaseAlarm(loopId);

  const archivedLoop = await updateLoop(loopId, {
    status: 'archived',
    lease: 'none',
    leaseExpiresAt: null,
  });

  await updateWaitingBadge();

  return archivedLoop;
}

export async function restoreLoop(loopId: string) {
  const restoredLoop = await updateLoop(loopId, {
    status: 'active',
    lease: 'none',
    leaseExpiresAt: null,
  });

  return restoredLoop;
}

export async function removeLoop(loopId: string): Promise<boolean> {
  await clearLeaseAlarm(loopId);

  const deleted = await deleteLoop(loopId);

  if (deleted) {
    await updateWaitingBadge();
  }

  return deleted;
}

export async function updateActiveLoop(
  loopId: string,
  updates: ActiveLoopUpdates,
): Promise<Loop | undefined> {
  const currentLoop = await getLoopById(loopId);

  if (!currentLoop || currentLoop.status !== 'active') {
    return undefined;
  }

  const leaseChanged = updates.lease !== currentLoop.lease;

  let leaseExpiresAt = currentLoop.leaseExpiresAt;

  if (updates.lease === 'custom') {
    if (updates.customLeaseExpiresAt === undefined) {
      return undefined;
    }

    leaseExpiresAt = updates.customLeaseExpiresAt;
  } else if (leaseChanged) {
    leaseExpiresAt = calculateLeaseExpiration(updates.lease);
  }

  const expirationChanged =
    leaseExpiresAt !== currentLoop.leaseExpiresAt;
  
  const updatedLoop = await updateLoop(loopId, {
    purpose: updates.purpose.trim(),
    lease: updates.lease,
    leaseExpiresAt,
    remindOnReturn: updates.remindOnReturn,
  });

  if (!updatedLoop) {
    return undefined;
  }

  if (leaseChanged || expirationChanged) {
    await clearLeaseAlarm(loopId);
    await scheduleLeaseAlarm(updatedLoop);
  }

  return updatedLoop;
}

export async function resumeLoop(
  loopId: string,
): Promise<Loop | undefined> {
  await clearLeaseAlarm(loopId);

  const resumedLoop = await updateLoop(loopId, {
    status: 'active',
    lease: 'none',
    leaseExpiresAt: null,
  });

  if (!resumedLoop) {
    return undefined;
  }

  await updateWaitingBadge();

  return resumedLoop;
}

export async function snoozeLoop(
  loopId: string,
): Promise<Loop | undefined> {
  const leaseExpiresAt = calculateLeaseExpiration('1-hour');

  const snoozedLoop = await updateLoop(loopId, {
    status: 'active',
    lease: '1-hour',
    leaseExpiresAt,
  });

  if (!snoozedLoop) {
    return undefined;
  }

  await clearLeaseAlarm(loopId);
  await scheduleLeaseAlarm(snoozedLoop);
  await updateWaitingBadge();

  return snoozedLoop;
}