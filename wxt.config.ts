import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],

  manifest: ({ browser }) => ({
  name: 'RevisitLoop',

  icons: {
    16: 'icon/16.png',
    32: 'icon/32.png',
    48: 'icon/48.png',
    64: 'icon/64.png',
    96: 'icon/96.png',
    128: 'icon/128.png',
  },

  action: {
    default_icon: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      64: 'icon/64.png',
    },
  },

  permissions: [
    'activeTab',
    'tabs',
    'storage',
    'alarms',
    'notifications',
  ],

  ...(browser === 'firefox'
    ? {
        browser_specific_settings: {
          gecko: {
            id: 'revisitloop@Burn1ngL1ght',
            data_collection_permissions: {
              required: ['none'],
            },
          },
        },
      }
    : {}),
  }),
});