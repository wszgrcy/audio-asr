import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'local.audio.asr',
  appName: 'audio-asr',
  webDir: 'www',
  android: { allowMixedContent: true },
  server: { cleartext: true },
  plugins: {
    SystemBars: {
      insetsHandling: 'disable',
    },
    EdgeToEdge: {
      // backgroundColor: '#ffffff',
      // navigationBarColor: '#0000',
      statusBarColor: '#ffffff',
    },
  },
};

export default config;
