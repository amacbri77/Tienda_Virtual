import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env["BASE_PATH"] || "/";

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: Number(process.env["WEB_PORT"] ?? 5173),
    host: true
  }
});
