import { browser } from 'wxt/browser';
import { getLoops } from '../storage/loops';

export async function updateWaitingBadge() {
  const loops = await getLoops();

  const waitingCount = loops.filter(
    (loop) => loop.status === 'waiting',
  ).length;

  const badgeText =
    waitingCount > 99
      ? '99+'
      : waitingCount > 0
        ? String(waitingCount)
        : '';

  await browser.action.setBadgeText({
    text: badgeText,
  });

  await browser.action.setBadgeBackgroundColor({
    color: '#6675e8',
  });
}