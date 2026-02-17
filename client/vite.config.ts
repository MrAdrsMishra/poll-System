import { defineConfig } from 'vite';
// Import your framework's plugin (e.g., React)
import tailwindcss from '@tailwindcss/vite'; // Import the Tailwind CSS plugin

export default defineConfig({
  plugins: [tailwindcss(), // Add the Tailwind CSS plugin
  ],
});
