import { debugLogger } from "@/lib/debugLogger";

export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost/nba/api";

class TokenManager {
	private token: string | null = null;

	constructor() {
		this.token = localStorage.getItem("auth_token");
	}

	setToken(token: string) {
		this.token = token;
		localStorage.setItem("auth_token", token);
	}

	clearToken() {
		this.token = null;
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user");
	}

	getToken(): string | null {
		return this.token;
	}

	getAuthHeaders(): HeadersInit {
		return {
			Authorization: `Bearer ${this.token}`,
		};
	}

	getJsonHeaders(): HeadersInit {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.token}`,
		};
	}
}

export const tokenManager = new TokenManager();

/** Called on any 401 response — clears stale token and sends user to login. */
function handleUnauthorized(): void {
	tokenManager.clearToken();
	window.location.href = "/login";
}

/**
 * Wraps global fetch with automatic retry logic for transient network/proxy errors.
 */
async function fetchWithRetry(
	input: RequestInfo | URL,
	init?: RequestInit,
	retries = 3,
	delay = 300,
): Promise<Response> {
	let lastError: any;
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const response = await fetch(input, init);
			
			// Retry only on transient gateway/proxy errors (502, 503, 504)
			if (
				response.status === 502 ||
				response.status === 503 ||
				response.status === 504
			) {
				debugLogger.warn(
					"API",
					`Temporary server error ${response.status} on attempt ${attempt} for ${input}. Retrying in ${delay}ms...`,
				);
				lastError = new Error(`HTTP error ${response.status}`);
				if (attempt < retries) {
					await new Promise((resolve) => setTimeout(resolve, delay));
					delay *= 2; // exponential backoff
					continue;
				}
			}
			return response;
		} catch (error) {
			debugLogger.warn(
				"API",
				`Network error on attempt ${attempt} for ${input}. Retrying in ${delay}ms...`,
				error,
			);
			lastError = error;
			if (attempt < retries) {
				await new Promise((resolve) => setTimeout(resolve, delay));
				delay *= 2; // exponential backoff
				continue;
			}
		}
	}
	throw lastError;
}

// Caching and Request Deduplication structures
const apiCache = new Map<string, { data: any; timestamp: number }>();
const activeGetRequests = new Map<string, Promise<any>>();

export function clearApiCache(): void {
	debugLogger.info("API", "Clearing API response cache due to mutation request.");
	apiCache.clear();
}

function getCacheKey(endpoint: string, params?: Record<string, any>): string {
	if (!params) return endpoint;
	const filtered = Object.fromEntries(
		Object.entries(params).filter(
			([, v]) => v !== undefined && v !== null && v !== "",
		),
	);
	const qs = new URLSearchParams(
		Object.fromEntries(
			Object.entries(filtered).map(([k, v]) => [k, String(v)]),
		),
	).toString();
	return qs ? `${endpoint}?${qs}` : endpoint;
}

// Helper function for making GET requests
export async function apiGet<T>(endpoint: string, options?: { bypassCache?: boolean }): Promise<T> {
	const cacheKey = endpoint;
	const bypassCache = options?.bypassCache;

	if (!bypassCache) {
		const cached = apiCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < 5000) {
			debugLogger.debug("API", `GET ${endpoint} - Cache Hit`);
			return cached.data;
		}

		const active = activeGetRequests.get(cacheKey);
		if (active) {
			debugLogger.debug("API", `GET ${endpoint} - Request Deduplicated`);
			return active;
		}
	}

	const requestPromise = (async () => {
		debugLogger.debug("API", `GET request: ${endpoint}`);
		const startTime = performance.now();

		try {
			const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
				headers: tokenManager.getAuthHeaders(),
			});

			const duration = performance.now() - startTime;
			debugLogger.debug(
				"API",
				`GET ${endpoint} - Status: ${response.status} (${duration.toFixed(2)}ms)`,
			);

			if (response.status === 401) handleUnauthorized();

			const data = await response.json();

			if (!response.ok) {
				debugLogger.error("API", `GET ${endpoint} failed`, {
					status: response.status,
					message: data.message,
				});
				throw new Error(data.message || "Request failed");
			}

			debugLogger.debug("API", `GET ${endpoint} - Success`);
			apiCache.set(cacheKey, { data: data.data, timestamp: Date.now() });
			return data.data;
		} catch (error) {
			debugLogger.error("API", `GET ${endpoint} - Error`, error);
			throw error;
		}
	})();

	activeGetRequests.set(cacheKey, requestPromise);

	try {
		return await requestPromise;
	} finally {
		activeGetRequests.delete(cacheKey);
	}
}

// Helper function for making POST requests
export async function apiPost<T, R>(endpoint: string, body: T): Promise<R> {
	debugLogger.info("API", `POST request: ${endpoint}`, { body });
	const startTime = performance.now();

	try {
		const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
			method: "POST",
			headers: tokenManager.getJsonHeaders(),
			body: JSON.stringify(body),
		});

		const duration = performance.now() - startTime;
		debugLogger.debug(
			"API",
			`POST ${endpoint} - Status: ${response.status} (${duration.toFixed(2)}ms)`,
		);

		if (response.status === 401) handleUnauthorized();

		const data = await response.json();

		if (!response.ok) {
			debugLogger.error("API", `POST ${endpoint} failed`, {
				status: response.status,
				errors: data.errors,
				message: data.message,
			});
			throw new Error(
				data.errors
					? data.errors.join(", ")
					: data.message || "Request failed",
			);
		}

		debugLogger.info("API", `POST ${endpoint} - Success`, {
			data: data.data,
		});
		clearApiCache();
		return data.data;
	} catch (error) {
		debugLogger.error("API", `POST ${endpoint} - Error`, error);
		throw error;
	}
}

// Helper function for making DELETE requests
export async function apiDelete<T = void>(endpoint: string): Promise<T> {
	debugLogger.warn("API", `DELETE request: ${endpoint}`);
	const startTime = performance.now();

	try {
		const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
			method: "DELETE",
			headers: tokenManager.getAuthHeaders(),
		});

		const duration = performance.now() - startTime;
		debugLogger.debug(
			"API",
			`DELETE ${endpoint} - Status: ${response.status} (${duration.toFixed(2)}ms)`,
		);

		if (response.status === 401) handleUnauthorized();

		const data = await response.json();

		if (!response.ok) {
			debugLogger.error("API", `DELETE ${endpoint} failed`, {
				status: response.status,
				message: data.message,
			});
			throw new Error(data.message || "Request failed");
		}

		debugLogger.warn("API", `DELETE ${endpoint} - Success`);
		clearApiCache();
		return data.data as T;
	} catch (error) {
		debugLogger.error("API", `DELETE ${endpoint} - Error`, error);
		throw error;
	}
}

// Helper function for making PUT requests
export async function apiPut<T, R>(endpoint: string, body: T): Promise<R> {
	debugLogger.info("API", `PUT request: ${endpoint}`, { body });
	const startTime = performance.now();

	try {
		const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
			method: "PUT",
			headers: tokenManager.getJsonHeaders(),
			body: JSON.stringify(body),
		});

		const duration = performance.now() - startTime;
		debugLogger.debug(
			"API",
			`PUT ${endpoint} - Status: ${response.status} (${duration.toFixed(2)}ms)`,
		);

		if (response.status === 401) handleUnauthorized();

		const data = await response.json();

		if (!response.ok) {
			debugLogger.error("API", `PUT ${endpoint} failed`, {
				status: response.status,
				errors: data.errors,
				message: data.message,
				error: data.error,
			});
			throw new Error(
				data.errors
					? data.errors.join(", ")
					: data.message || data.error || "Request failed",
			);
		}

		debugLogger.info("API", `PUT ${endpoint} - Success`, {
			data: data.data,
		});
		clearApiCache();
		return data.data;
	} catch (error) {
		debugLogger.error("API", `PUT ${endpoint} - Error`, error);
		throw error;
	}
}

// Helper for full response (when we need success, message, data)
export async function apiGetFull<T>(
	endpoint: string,
	options?: { bypassCache?: boolean }
): Promise<{ success: boolean; message: string; data: T }> {
	const cacheKey = `full:${endpoint}`;
	const bypassCache = options?.bypassCache;

	if (!bypassCache) {
		const cached = apiCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < 5000) {
			debugLogger.debug("API", `GET full ${endpoint} - Cache Hit`);
			return cached.data;
		}

		const active = activeGetRequests.get(cacheKey);
		if (active) {
			debugLogger.debug("API", `GET full ${endpoint} - Request Deduplicated`);
			return active;
		}
	}

	const requestPromise = (async () => {
		const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
			headers: tokenManager.getAuthHeaders(),
		});

		if (response.status === 401) handleUnauthorized();

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Request failed");
		}

		apiCache.set(cacheKey, { data, timestamp: Date.now() });
		return data;
	})();

	activeGetRequests.set(cacheKey, requestPromise);

	try {
		return await requestPromise;
	} finally {
		activeGetRequests.delete(cacheKey);
	}
}

export async function apiPostFull<T, R>(
	endpoint: string,
	body: T,
): Promise<{ success: boolean; message: string; data: R }> {
	const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
		method: "POST",
		headers: tokenManager.getJsonHeaders(),
		body: JSON.stringify(body),
	});

	if (response.status === 401) handleUnauthorized();

	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.errors
				? data.errors.join(", ")
				: data.message || "Request failed",
		);
	}

	clearApiCache();
	return data;
}

// Helper for paginated GET requests — returns full {data, pagination} envelope
export async function apiGetPaginated<T>(
	endpoint: string,
	params?: Record<string, string | number | undefined>,
	options?: { bypassCache?: boolean }
): Promise<import("./types").PaginatedResponse<T>> {
	const cacheKey = getCacheKey(endpoint, params);
	const bypassCache = options?.bypassCache;

	if (!bypassCache) {
		const cached = apiCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < 5000) {
			debugLogger.debug("API", `GET paginated ${endpoint} - Cache Hit`);
			return cached.data;
		}

		const active = activeGetRequests.get(cacheKey);
		if (active) {
			debugLogger.debug("API", `GET paginated ${endpoint} - Request Deduplicated`);
			return active;
		}
	}

	const requestPromise = (async () => {
		let url = `${API_BASE_URL}${endpoint}`;
		if (params) {
			const filtered = Object.fromEntries(
				Object.entries(params).filter(
					([, v]) => v !== undefined && v !== null && v !== "",
				),
			) as Record<string, string>;
			const qs = new URLSearchParams(
				Object.fromEntries(
					Object.entries(filtered).map(([k, v]) => [k, String(v)]),
				),
			).toString();
			if (qs) url += "?" + qs;
		}

		debugLogger.debug("API", `GET paginated request: ${url}`);
		const response = await fetchWithRetry(url, {
			headers: tokenManager.getAuthHeaders(),
		});

		if (response.status === 401) handleUnauthorized();

		const data = await response.json();

		if (!response.ok) {
			debugLogger.error("API", `GET paginated ${endpoint} failed`, {
				status: response.status,
				message: data.message,
			});
			throw new Error(data.message || "Request failed");
		}

		debugLogger.debug("API", `GET paginated ${endpoint} - Success`);
		apiCache.set(cacheKey, { data, timestamp: Date.now() });
		return data;
	})();

	activeGetRequests.set(cacheKey, requestPromise);

	try {
		return await requestPromise;
	} finally {
		activeGetRequests.delete(cacheKey);
	}
}
