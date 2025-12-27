import { apiGet } from "./base";
import type { FacultyStats } from "./types";

async function getStats(): Promise<FacultyStats> {
	return apiGet<FacultyStats>("/faculty/stats");
}

export const facultyApi = {
	getStats,
};
