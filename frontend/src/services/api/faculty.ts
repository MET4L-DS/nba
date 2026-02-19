import { apiGet } from "./base";
import type {
	FacultyStats,
	Course,
	PaginatedResponse,
	PaginationParams,
} from "./types";

async function getStats(): Promise<FacultyStats> {
	return apiGet<FacultyStats>("/faculty/stats");
}

async function getCourses(
	_params?: PaginationParams,
): Promise<PaginatedResponse<Course>> {
	const courses = await apiGet<Course[]>("/courses");
	return {
		success: true,
		message: "ok",
		data: courses,
		pagination: {
			next_cursor: null,
			prev_cursor: null,
			has_more: false,
			total: courses.length,
			limit: courses.length,
		},
	};
}

export const facultyApi = {
	getStats,
	getCourses,
};
