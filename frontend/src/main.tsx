import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider";
import { SettingsProvider } from "./context/SettingsContext.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60_000,      // 1 minute - data stays fresh
			gcTime: 5 * 60_000,    // 5 minutes cache garbage collection
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="dark" storageKey="nba-ui-theme">
				<SettingsProvider>
					<TooltipProvider>
						<App />
						<Toaster />
					</TooltipProvider>
				</SettingsProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
);
