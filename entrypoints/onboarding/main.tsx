import React from 'react';
import ReactDOM from 'react-dom/client';
import { getSettings } from '../../storage/settings';
import { applyThemePreference } from '../../utils/theme';
import Onboarding from './Onboarding';
import './style.css';

async function bootstrap() {
  const settings = await getSettings();

  applyThemePreference(settings.theme);

  ReactDOM.createRoot(
    document.getElementById('root')!,
  ).render(
    <React.StrictMode>
      <Onboarding />
    </React.StrictMode>,
  );
}

void bootstrap();