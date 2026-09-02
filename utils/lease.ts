import type { LeaseOption } from '@/types/loop';

export function calculateLeaseExpiration(
  lease: LeaseOption,
  now = new Date(),
  customExpiration: number | null = null,
): number | null {
  switch (lease) {
    case 'none':
      return null;

    case '1-hour':
      return now.getTime() + 60 * 60 * 1000;

    case 'tonight': {
      const expiration = new Date(now);
      expiration.setHours(23, 59, 59, 999);

      return expiration.getTime();
    }

    case 'tomorrow': {
      const expiration = new Date(now);
      expiration.setDate(expiration.getDate() + 1);
      expiration.setHours(23, 59, 59, 999);

      return expiration.getTime();
    }

    case 'custom':
      return customExpiration;
  }
}