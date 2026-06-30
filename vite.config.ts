import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';

function copyTinymce() {
    const src = path.resolve(__dirname, 'node_modules/tinymce');
    const dest = path.resolve(__dirname, 'public/tinymce');
    if (!existsSync(src)) return;
    function copyRecursive(srcDir: string, destDir: string) {
        if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
        const entries = readdirSync(srcDir, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(srcDir, entry.name);
            const destPath = path.join(destDir, entry.name);
            if (entry.isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                copyFileSync(srcPath, destPath);
            }
        }
    }
    copyRecursive(src, dest);
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    // Copy TinyMCE to public folder before Vite starts serving
    copyTinymce();

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
        build: {
            rollupOptions: {
                external: [
                ]
            }
        },
    };
});
