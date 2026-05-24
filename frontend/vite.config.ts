import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		// Target modern browsers for smaller bundles
		target: "esnext",
		// Enable minification
		minify: "esbuild",
		// Raise warning threshold (we know about large async chunks like attainmentExcel)
		chunkSizeWarningLimit: 1000,
	},
});
