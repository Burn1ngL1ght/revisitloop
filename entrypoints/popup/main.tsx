import React from 'react';
import ReactDOM from 'react-dom/client';
import { getSettings } from '@/storage/settings.ts';
import { applyThemePreference } from '@/utils/theme.ts';
import App from './App.tsx';
import './style.css';

async function bootstrap() {
  const settings = await getSettings();

  applyThemePreference(settings.theme);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

}

void bootstrap();
