import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: true,
                    exportType: 'named',
                    namedExport: 'ReactComponent',
                },
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: Number(env.VITE_PORT) || 4000,
            open: env.VITE_OPEN === 'true',
            hmr: env.VITE_HMR === 'true',
            host: env.VITE_HOST === 'true',
            allowedHosts: env.VITE_ALLOWED_HOSTS?.split(',') ?? [],
        },
    };
});
