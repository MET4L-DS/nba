import { apiGet, apiPost, apiPut, apiDelete } from "./base";
import type {
	User,
	Student,
	Department,
	AdminStats,
	AdminCourse,
	AdminTest,
	CreateUserRequest,
	CreateDepartmentRequest,
	UpdateDepartmentRequest,
} from "./types";

export const adminApi = {
	async getStats(): Promise<AdminStats> {
		return apiGet<AdminStats>("/admin/stats");
	},

	async getAllUsers(): Promise<User[]> {
		return apiGet<User[]>("/admin/users");
	},

	async createUser(userData: CreateUserRequest): Promise<User> {
		return apiPost<CreateUserRequest, User>("/admin/users", userData);
	},

	async deleteUser(employeeId: number): Promise<void> {
		return apiDelete(`/admin/users/${employeeId}`);
	},

	async getAllDepartments(): Promise<Department[]> {
		return apiGet<Department[]>("/departments");
	},

	async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
		return apiPost<CreateDepartmentRequest, Department>(
			"/admin/departments",
			data
		);
	},

	async updateDepartment(
		departmentId: number,
		data: UpdateDepartmentRequest
	): Promise<Department> {
		return apiPut<UpdateDepartmentRequest, Department>(
			`/admin/departments/${departmentId}`,
			data
		);
	},

	async deleteDepartment(departmentId: number): Promise<void> {
		return apiDelete(`/admin/departments/${departmentId}`);
	},

	async getAllCourses(): Promise<AdminCourse[]> {
		return apiGet<AdminCourse[]>("/admin/courses");
	},

	async getAllStudents(): Promise<Student[]> {
		return apiGet<Student[]>("/admin/students");
	},

	async getAllTests(): Promise<AdminTest[]> {
		return apiGet<AdminTest[]>("/admin/tests");
	},
};
