import React, { createContext, useContext, useState, useEffect } from "react";
import { settingsApi } from "@/services/api/settings";
import type { SystemSettings } from "@/services/api/settings";
import { API_BASE_URL } from "@/services/api/base";

interface SettingsContextType {
	settings: SystemSettings | null;
	loading: boolean;
	error: string | null;
	refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (!context) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};

// Default settings if API fails or prior to loading
export const DEFAULT_SETTINGS: SystemSettings = {
	university_name: "Tezpur University",
	university_subtitle: "A Central University • Est. 1994",
	system_name: "Outcome Based Education System",
	system_short_name: "OBEMS",
	logo_url: "/tulogo.png",
	motto_text: "विज्ञानं यज्ञं तनुते",
	motto_subtext: "Specialized knowledge promotes creativity",
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [settings, setSettings] = useState<SystemSettings | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSettings = async () => {
		try {
			const data = await settingsApi.getPublicSettings({ bypassCache: true });
			setSettings(data);
			setError(null);
		} catch (err: any) {
			console.error("Failed to load branding settings, using defaults.", err);
			setError(err.message || "Failed to load settings");
			// Fallback to defaults to prevent app crash
			setSettings(DEFAULT_SETTINGS);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSettings();
	}, []);

	useEffect(() => {
		if (settings) {
			// Update Document Title
			document.title = `${settings.system_short_name} | ${settings.university_name}`;

			// Update Favicon dynamically
			let faviconUrl = settings.logo_url;
			// If logo_url is relative to the API, resolve it with domain/base URL if it is not a full URL or absolute path
			if (faviconUrl && !faviconUrl.startsWith("http") && !faviconUrl.startsWith("/")) {
				faviconUrl = `${API_BASE_URL}/${faviconUrl}`;
			}

			let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
			if (!link) {
				link = document.createElement("link");
				link.rel = "icon";
				link.type = "image/png";
				document.head.appendChild(link);
			}
			link.href = faviconUrl;
		}
	}, [settings]);

	const refreshSettings = async () => {
		setLoading(true);
		await fetchSettings();
	};

	return (
		<SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};
