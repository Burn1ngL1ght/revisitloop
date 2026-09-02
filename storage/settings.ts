import { storage } from '#imports';
import type { RevisitLoopSettings } from '../types/settings';

const defaultSettings: RevisitLoopSettings = {
  systemNotificationsEnabled: false,
  use24HourTime: false,
  theme: 'system',
  onboardingCompleted: false,
};

export const settingsStorage = storage.defineItem<RevisitLoopSettings>(
  'local:settings',
  {
    fallback: defaultSettings,
    version: 1,
  },
);

export async function getSettings(): Promise<RevisitLoopSettings> {
  const storedSettings = await settingsStorage.getValue();

  return {
    ...defaultSettings,
    ...storedSettings,
  };
}

export async function updateSettings(
  updates: Partial<RevisitLoopSettings>,
): Promise<RevisitLoopSettings> {
  const currentSettings = await getSettings();

  const updatedSettings = {
    ...currentSettings,
    ...updates,
  };

  await settingsStorage.setValue(updatedSettings);

  return updatedSettings;
}