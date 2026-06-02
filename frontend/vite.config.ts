import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	plugins: [react(), tailwindcss()],
	base: command === "build" ? "/nba-frontend/" : "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
