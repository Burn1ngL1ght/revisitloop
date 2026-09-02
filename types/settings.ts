export type ThemePreference =
  | 'system'
  | 'light'
  | 'dark';

export type RevisitLoopSettings = {
  systemNotificationsEnabled: boolean;
  use24HourTime: boolean;
  theme: ThemePreference;
  onboardingCompleted: boolean;
};