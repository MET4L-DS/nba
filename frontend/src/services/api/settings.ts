import { apiGet, apiPost, API_BASE_URL, tokenManager, fetchWithRetry } from "./base";
import { debugLogger } from "@/lib/debugLogger";

export interface SystemSettings {
	university_name: string;
	university_subtitle: string;
	system_name: string;
	system_short_name: string;
	logo_url: string;
	motto_text: string;
	motto_subtext: string;
}

export const settingsApi = {
	async getPublicSettings(options?: { bypassCache?: boolean }): Promise<SystemSettings> {
		debugLogger.info("settingsApi", "getPublicSettings called");
		return apiGet<SystemSettings>("/settings/public", options);
	},

	async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
		debugLogger.info("settingsApi", "updateSettings called");
		return apiPost<Partial<SystemSettings>, SystemSettings>("/admin/settings", settings);
	},

	async uploadLogo(file: File): Promise<{ logo_url: string }> {
		debugLogger.info("settingsApi", "uploadLogo called");
		const formData = new FormData();
		formData.append("logo", file);

		const response = await fetchWithRetry(`${API_BASE_URL}/admin/settings/logo`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${tokenManager.getToken()}`,
				"bypass-tunnel-reminder": "true",
				"ngrok-skip-browser-warning": "true",
			},
			body: formData,
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to upload logo");
		}
		return data.data;
	},
};
