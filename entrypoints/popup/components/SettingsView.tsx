import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '@/storage/settings';
import type { ThemePreference } from '@/types/settings';
import { applyThemePreference } from '@/utils/theme';
import { ArrowLeftIcon } from './Icons';

type SettingsViewProps = {
  onBack: () => void;
};

export function SettingsView({ onBack }: SettingsViewProps) {
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] =
    useState(false);
  const [use24HourTime, setUse24HourTime] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>('system');

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSettings();

      setSystemNotificationsEnabled(settings.systemNotificationsEnabled);
      setUse24HourTime(settings.use24HourTime);
      setTheme(settings.theme);
    }

    void loadSettings();
  }, []);

  async function handleSystemNotificationsChange(enabled: boolean) {
    setSystemNotificationsEnabled(enabled);

    await updateSettings({
      systemNotificationsEnabled: enabled,
    });
  }

  async function handle24HourTimeChange(enabled: boolean) {
    setUse24HourTime(enabled);

    await updateSettings({
      use24HourTime: enabled,
    });
  }

  async function handleThemeChange(
    newTheme: ThemePreference,
  ) {
    setTheme(newTheme);
    applyThemePreference(newTheme);

    await updateSettings({
      theme: newTheme,
    });
  }

  return (
    <main className="app">
      <header className="settingsHeader">
        <button
          type="button"
          className="iconButton"
          onClick={onBack}
          aria-label="Back to RevisitLoop"
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Settings</h1>
          <p>Customize how RevisitLoop behaves.</p>
        </div>
      </header>

      <section className="settingsSection">
        <h2>Appearance</h2>

        <div className="settingBlock">
          <div>
            <strong>Theme</strong>
            <p>
              Choose how RevisitLoop should look.
            </p>
          </div>

          <div
            className="themeOptions"
            role="group"
            aria-label="Theme"
          >
            <button
              type="button"
              className={theme === 'system' ? 'selected' : ''}
              onClick={() => 
                void handleThemeChange('system')
              }
            >
              System
            </button>

            <button
              type="button"
              className={theme === 'light' ? 'selected' : ''}
              onClick={() => 
                void handleThemeChange('light')
              }
            >
              Light
            </button>

            <button
              type="button"
              className={theme === 'dark' ? 'selected' : ''}
              onClick={() => 
                void handleThemeChange('dark')
              }
            >
              Dark
            </button>
          </div>
        </div>
      </section>

      <section className="settingsSection">
        <h2>Notifications</h2>

        <div className="settingRow">
          <div>
            <strong>System notifications</strong>
            <p>
              Show operating system notifications when a Loop needs attention.
            </p>
          </div>

          <input
            type="checkbox"
            checked={systemNotificationsEnabled}
            onChange={(event) =>
              void handleSystemNotificationsChange(event.target.checked)
            }
          />
        </div>
      </section>

      <section className="settingsSection">
        <h2>Date & time</h2>

        <div className="settingRow">
          <div>
            <strong>Use 24-hour time</strong>
            <p>
              Enter custom expiration times using 24-hour format, such as 15:30.
            </p>
          </div>

          <input
            type="checkbox"
            checked={use24HourTime}
            onChange={(event) => 
              void handle24HourTimeChange(event.target.checked)
            }
          />
        </div>
      </section>
    </main>
  );
}