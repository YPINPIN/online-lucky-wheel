import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// prerender
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/online-lucky-wheel/" : "/",
  plugins: [
    vue(),
    vitePrerenderPlugin({
      renderTarget: "#app",
      prerenderScript: path.resolve(fileURLToPath(new URL("./src/prerender.js", import.meta.url))),
    }),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
