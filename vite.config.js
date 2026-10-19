import { basename, resolve } from 'node:path';
import { defineConfig } from 'vite';
import { buildBlog, CONTENT_DIR } from './scripts/blog/build.js';

// Regenerates the blog when a post changes during `npm run dev`.
function blogContent() {
  return {
    name: 'blog-content',
    configureServer(server) {
      server.watcher.add(CONTENT_DIR);
      const rebuild = async (file) => {
        if (!file.startsWith(CONTENT_DIR)) return;
        try {
          await buildBlog();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          server.config.logger.error(`blog: ${error.message}`);
        }
      };
      server.watcher.on('add', rebuild);
      server.watcher.on('change', rebuild);
      server.watcher.on('unlink', rebuild);
    },
  };
}

export default defineConfig(async () => {
  const blogPages = await buildBlog();

  return {
    base: './',
    plugins: [blogContent()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          checklist: resolve(__dirname, 'checklist.html'),
          get: resolve(__dirname, 'get.html'),
          privacy: resolve(__dirname, 'privacy.html'),
          terms: resolve(__dirname, 'terms.html'),
          support: resolve(__dirname, 'support.html'),
          accountDeletion: resolve(__dirname, 'account-deletion.html'),
          ...Object.fromEntries(
            blogPages.map((page) => [`blog-${basename(page, '.html')}`, page]),
          ),
        },
      },
    },
  };
});
