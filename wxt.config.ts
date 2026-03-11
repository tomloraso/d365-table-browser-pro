import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'D365 F&O Table & OData Browser Pro',
    description:
      'Browse tables, query OData entities, and export data from Dynamics 365 Finance & Operations with multi-environment support',
    version: '1.0.0',
    permissions: ['storage', 'unlimitedStorage', 'activeTab', 'sidePanel'],
    host_permissions: [
      'https://*.dynamics.com/*',
      'https://*.operations.dynamics.com/*',
      'https://*.cloudax.dynamics.com/*',
      'https://*.sandbox.operations.dynamics.com/*',
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
