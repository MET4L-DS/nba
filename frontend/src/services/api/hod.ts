import { apiGet, apiPost, apiDelete, apiPut } from "./base";
import type {
	HODStats,
	DepartmentCourse,
	DepartmentFaculty,
	CreateCourseRequest,
	UpdateCourseRequest,
	HODCreateUserRequest,
	HODUpdateUserRequest,
} from "./types";

export const hodApi = {
	async getStats(): Promise<HODStats> {
		return apiGet<HODStats>("/hod/stats");
	},

	async getDepartmentCourses(): Promise<DepartmentCourse[]> {
		return apiGet<DepartmentCourse[]>("/hod/courses");
	},

	async getDepartmentFaculty(): Promise<DepartmentFaculty[]> {
		return apiGet<DepartmentFaculty[]>("/hod/faculty");
	},

	async createCourse(
		courseData: CreateCourseRequest
	): Promise<DepartmentCourse> {
		return apiPost<CreateCourseRequest, DepartmentCourse>(
			"/hod/courses",
			courseData
		);
	},

	async updateCourse(
		courseId: number,
		courseData: UpdateCourseRequest
	): Promise<DepartmentCourse> {
		return apiPut<UpdateCourseRequest, DepartmentCourse>(
			`/hod/courses/${courseId}`,
			courseData
		);
	},

	async deleteCourse(courseId: number): Promise<void> {
		return apiDelete(`/hod/courses/${courseId}`);
	},

	// User management
	async createUser(
		userData: HODCreateUserRequest
	): Promise<DepartmentFaculty> {
		return apiPost<HODCreateUserRequest, DepartmentFaculty>(
			"/hod/users",
			userData
		);
	},

	async updateUser(
		employeeId: number,
		userData: HODUpdateUserRequest
	): Promise<DepartmentFaculty> {
		return apiPut<HODUpdateUserRequest, DepartmentFaculty>(
			`/hod/users/${employeeId}`,
			userData
		);
	},

	async deleteUser(employeeId: number): Promise<void> {
		return apiDelete(`/hod/users/${employeeId}`);
	},
};
