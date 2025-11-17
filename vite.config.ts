import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const openAiApiKey = env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || '';

  return {
    envDir: process.cwd(),
    envPrefix: ['VITE_', 'OPENAI_'],
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.OPENAI_API_KEY': JSON.stringify(openAiApiKey),
      'process.env.VITE_OPENAI_API_KEY': JSON.stringify(openAiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
