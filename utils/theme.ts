import type { ThemePreference } from '../types/settings';

type ResolvedTheme = 'light' | 'dark';

let removeSystemThemeListener: (() => void) | null = null;

function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return preference;
}

export function applyThemePreference(
  preference: ThemePreference,
) {
  if (removeSystemThemeListener) {
    removeSystemThemeListener();
    removeSystemThemeListener = null;
  }

  const mediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)',
  );

  function applyTheme() {
    const theme = resolveTheme(
      preference,
      mediaQuery.matches,
    );

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }

  applyTheme();

  if (preference === 'system') {
    mediaQuery.addEventListener('change', applyTheme);

    removeSystemThemeListener = () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }
}