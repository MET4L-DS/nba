import type { StaffStats, StaffCourse, Enrollment, Student } from "./types";
import { authApi } from "./auth";

const API_BASE = "http://localhost/nba/api";

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${authApi.getToken()}`,
});

export const staffApi = {
	/**
	 * Get staff dashboard statistics
	 */
	async getStats(): Promise<StaffStats> {
		const response = await fetch(`${API_BASE}/staff/stats`, {
			method: "GET",
			headers: getHeaders(),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to fetch staff stats");
		}
		return data.data;
	},

	/**
	 * Get all courses for the staff's department
	 */
	async getDepartmentCourses(): Promise<StaffCourse[]> {
		const response = await fetch(`${API_BASE}/staff/courses`, {
			method: "GET",
			headers: getHeaders(),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(
				data.message || "Failed to fetch department courses"
			);
		}
		return data.data;
	},

	/**
	 * Get all students in the department
	 */
	async getDepartmentStudents(): Promise<Student[]> {
		const response = await fetch(`${API_BASE}/staff/students`, {
			method: "GET",
			headers: getHeaders(),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(
				data.message || "Failed to fetch department students"
			);
		}
		return data.data;
	},

	/**
	 * Get enrollments for a specific course
	 */
	async getCourseEnrollments(courseId: number): Promise<{
		course_id: number;
		course_code: string;
		course_name: string;
		enrollment_count: number;
		enrollments: Enrollment[];
	}> {
		const response = await fetch(
			`${API_BASE}/staff/courses/${courseId}/enrollments`,
			{
				method: "GET",
				headers: getHeaders(),
			}
		);

		const data = await response.json();
		if (!response.ok) {
			throw new Error(
				data.message || "Failed to fetch course enrollments"
			);
		}
		return data.data;
	},

	/**
	 * Bulk enroll students in a course
	 */
	async bulkEnrollStudents(
		courseId: number,
		students: Array<{ rollno: string; name: string }>
	): Promise<{
		success_count: number;
		failure_count: number;
		successful: Array<{ rollno: string; name: string }>;
		failed: Array<{ rollno: string; name: string; reason: string }>;
	}> {
		const response = await fetch(
			`${API_BASE}/staff/courses/${courseId}/enroll`,
			{
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify({ students }),
			}
		);

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to enroll students");
		}
		return data.data;
	},

	/**
	 * Remove a student from a course
	 */
	async removeEnrollment(courseId: number, rollno: string): Promise<void> {
		const response = await fetch(
			`${API_BASE}/staff/courses/${courseId}/enroll/${rollno}`,
			{
				method: "DELETE",
				headers: getHeaders(),
			}
		);

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to remove enrollment");
		}
	},

	/**
	 * Get department faculty list
	 */
	async getDepartmentFaculty(): Promise<
		Array<{
			employee_id: string;
			username: string;
			email: string;
			role: string;
		}>
	> {
		const response = await fetch(`${API_BASE}/staff/faculty`, {
			method: "GET",
			headers: getHeaders(),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(
				data.message || "Failed to fetch department faculty"
			);
		}
		return data.data;
	},

	/**
	 * Create a new course
	 */
	async createCourse(courseData: {
		course_code: string;
		name: string;
		credit: number;
		faculty_id: string;
		year: number;
		semester: string;
		co_threshold?: number;
		passing_threshold?: number;
	}): Promise<StaffCourse> {
		const response = await fetch(`${API_BASE}/staff/courses`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify(courseData),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to create course");
		}
		return data.data;
	},

	/**
	 * Update an existing course
	 */
	async updateCourse(
		courseId: number,
		courseData: {
			course_code?: string;
			name?: string;
			credit?: number;
			faculty_id?: string;
			year?: number;
			semester?: string;
		}
	): Promise<StaffCourse> {
		const response = await fetch(`${API_BASE}/staff/courses/${courseId}`, {
			method: "PUT",
			headers: getHeaders(),
			body: JSON.stringify(courseData),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to update course");
		}
		return data.data;
	},

	/**
	 * Delete a course
	 */
	async deleteCourse(courseId: number): Promise<void> {
		const response = await fetch(`${API_BASE}/staff/courses/${courseId}`, {
			method: "DELETE",
			headers: getHeaders(),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to delete course");
		}
	},
};
