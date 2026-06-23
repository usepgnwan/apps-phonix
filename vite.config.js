import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    define: {
        global: 'globalThis',
    },
    build: {
        rollupOptions: {
            output: {
                // Pisahkan vendor besar ke chunk terpisah supaya browser bisa cache lebih efektif
                manualChunks: (id) => {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'react-vendor';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'inertia-vendor';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'icons-vendor';
                    }
                },
            },
        },
        // Peringatan saat chunk > 500KB
        chunkSizeWarningLimit: 500,
    },
});
