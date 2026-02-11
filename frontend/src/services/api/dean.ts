import { apiGet, apiPost, apiDelete } from "./base";
import type {
	DeanStats,
	DeanDepartment,
	DeanUser,
	DeanCourse,
	DeanStudent,
	DeanTest,
	DepartmentAnalytics,
} from "./types";

export const deanApi = {
	async getStats(): Promise<DeanStats> {
		return apiGet<DeanStats>("/dean/stats");
	},

	async getAllDepartments(): Promise<DeanDepartment[]> {
		return apiGet<DeanDepartment[]>("/dean/departments");
	},

	async getAllUsers(): Promise<DeanUser[]> {
		return apiGet<DeanUser[]>("/dean/users");
	},

	async getAllCourses(): Promise<DeanCourse[]> {
		return apiGet<DeanCourse[]>("/dean/courses");
	},

	async getAllStudents(): Promise<DeanStudent[]> {
		return apiGet<DeanStudent[]>("/dean/students");
	},

	async getAllTests(): Promise<DeanTest[]> {
		return apiGet<DeanTest[]>("/dean/tests");
	},

	async getDepartmentAnalytics(): Promise<DepartmentAnalytics[]> {
		return apiGet<DepartmentAnalytics[]>("/dean/analytics");
	},

	// HOD Management
	async getDepartmentFaculty(departmentId: number): Promise<DeanUser[]> {
		return apiGet<DeanUser[]>(`/dean/departments/${departmentId}/faculty`);
	},

	async appointHOD(
		departmentId: number,
		data:
			| { employee_id: number }
			| {
					employee_id: number;
					username: string;
					email: string;
					password: string;
			  },
	): Promise<DeanUser> {
		return apiPost<typeof data, DeanUser>(
			`/dean/departments/${departmentId}/hod`,
			data,
		);
	},

	async demoteHOD(employeeId: number): Promise<DeanUser> {
		return apiDelete<DeanUser>(`/dean/hod/${employeeId}`);
	},
};
