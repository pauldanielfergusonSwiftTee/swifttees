import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.co.swifttees.app',
  appName: 'Swift Tees',
  webDir: 'public',

  server: {
    url: 'https://swifttees.co.uk',
    cleartext: false,
    allowNavigation: [
      'swifttees.co.uk',
      '*.swifttees.co.uk',
    ],
  },
};

export default config;