import type {
	StaffStats,
	StaffCourse,
	Enrollment,
	Student,
	PaginatedResponse,
	PaginationParams,
	BaseCourse,
	Programme,
	ProgrammeWithBatch,
	ProgrammeBatch,
	ProgrammeCourseResponse,
	CreateProgrammeRequest,
	ProgrammeBulkEnrollRequest,
} from "./types";
import { apiGet, apiPost, apiPut, apiDelete, apiGetPaginated } from "./base";
import { debugLogger } from "@/lib/debugLogger";

export const staffApi = {
	/**
	 * Get staff dashboard statistics
	 */
	async getStats(options?: { bypassCache?: boolean }): Promise<StaffStats> {
		debugLogger.info("staffApi", "getStats called");
		return apiGet<StaffStats>("/staff/stats", options);
	},

	/**
	 * Get all courses for the staff's department — paginated
	 */
	async getDepartmentCourses(
		params?: PaginationParams,
	): Promise<PaginatedResponse<StaffCourse>> {
		return apiGetPaginated<StaffCourse>("/staff/courses", params);
	},

	/**
	 * Get all students in the department — paginated
	 */
	async getDepartmentStudents(
		params?: PaginationParams,
	): Promise<PaginatedResponse<Student>> {
		return apiGetPaginated<Student>("/staff/students", params);
	},

	/**
	 * Get enrollments for a specific course offering
	 */
	async getCourseEnrollments(offeringId: number): Promise<{
		offering_id: number;
		course_id: number;
		course_code: string;
		course_name: string;
		enrollment_count: number;
		enrollments: Enrollment[];
	}> {
		debugLogger.info("staffApi", "getDepartmentCourses called");
		return apiGet<{
			offering_id: number;
			course_id: number;
			course_code: string;
			course_name: string;
			enrollment_count: number;
			enrollments: Enrollment[];
		}>(`/staff/courses/${offeringId}/enrollments`);
	},

	/**
	 * Bulk enroll students in a course offering
	 */
	async bulkEnrollStudents(
		offeringId: number,
		students: Array<{ rollno: string; name: string }>,
	): Promise<{
		success_count: number;
		failure_count: number;
		successful: Array<{ rollno: string; name: string }>;
		failed: Array<{ rollno: string; name: string; reason: string }>;
	}> {
		return apiPost<
			{ students: Array<{ rollno: string; name: string }> },
			{
				success_count: number;
				failure_count: number;
				successful: Array<{ rollno: string; name: string }>;
				failed: Array<{ rollno: string; name: string; reason: string }>;
			}
		>(`/staff/courses/${offeringId}/enrollments`, { students });
	},

	/**
	 * Remove a student from a course offering
	 */
	async removeEnrollment(offeringId: number, rollno: string): Promise<void> {
		debugLogger.info("staffApi", "bulkEnrollStudents called");
		return apiDelete(`/staff/courses/${offeringId}/enrollments/${rollno}`);
	},

	/**
	 * Get department faculty list — paginated
	 */
	async getDepartmentFaculty(params?: PaginationParams): Promise<
		PaginatedResponse<{
			employee_id: string;
			username: string;
			email: string;
			role: string;
		}>
	> {
		return apiGetPaginated<{
			employee_id: string;
			username: string;
			email: string;
			role: string;
		}>("/staff/faculty", params);
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
		debugLogger.info("staffApi", "getDepartmentFaculty called");
		return apiPost<
			{
				course_code: string;
				name: string;
				credit: number;
				faculty_id: string;
				year: number;
				semester: string;
				co_threshold?: number;
				passing_threshold?: number;
			},
			StaffCourse
		>("/staff/courses", courseData);
	},

	/**
	 * Update an existing course
	 */
	async updateCourse(
		offeringId: number,
		courseData: {
			course_code?: string;
			name?: string;
			credit?: number;
			faculty_id?: string;
			year?: number;
			semester?: string;
		},
	): Promise<StaffCourse> {
		debugLogger.info("staffApi", "updateCourse called");
		return apiPut<
			{
				course_code?: string;
				name?: string;
				credit?: number;
				faculty_id?: string;
				year?: number;
				semester?: string;
			},
			StaffCourse
		>(`/staff/courses/${offeringId}`, courseData);
	},

	/**
	 * Delete a course
	 */
	async deleteCourse(offeringId: number): Promise<void> {
		debugLogger.info("staffApi", "deleteCourse called");
		return apiDelete(`/staff/courses/${offeringId}`);
	},

	/**
	 * Get base courses for the department
	 */
	async getBaseCourses(params?: PaginationParams): Promise<PaginatedResponse<BaseCourse>> {
		return apiGetPaginated<BaseCourse>("/staff/base-courses", params);
	},

	/**
	 * Get programmes associated with the staff's department
	 */
	async getDepartmentProgrammes(params?: PaginationParams): Promise<PaginatedResponse<Programme>> {
		return apiGetPaginated<Programme>("/staff/programmes", params);
	},

	async getProgrammesWithBatches(): Promise<ProgrammeWithBatch[]> {
		debugLogger.info("staffApi", "getProgrammesWithBatches called");
		return apiGet<ProgrammeWithBatch[]>("/staff/programmes/with-batches");
	},

	// Batch operations
	async getBatchesByProgramme(programmeId: number): Promise<ProgrammeBatch[]> {
		debugLogger.info("staffApi", "getBatchesByProgramme called", { programmeId });
		return apiGet<ProgrammeBatch[]>(`/staff/programmes/${programmeId}/batches`);
	},

	async createBatch(programmeId: number, batchYear: number, status?: string): Promise<{ batch_id: number }> {
		debugLogger.info("staffApi", "createBatch called", { programmeId, batchYear, status });
		return apiPost<{ batch_year: number; status?: string }, { batch_id: number }>(
			`/staff/programmes/${programmeId}/batches`,
			{ batch_year: batchYear, status },
		);
	},

	async getBatch(batchId: number): Promise<ProgrammeBatch> {
		debugLogger.info("staffApi", "getBatch called", { batchId });
		return apiGet<ProgrammeBatch>(`/staff/batches/${batchId}`);
	},

	// Programme CRUD
	async createProgramme(data: CreateProgrammeRequest): Promise<Programme> {
		debugLogger.info("staffApi", "createProgramme called", data);
		return apiPost<CreateProgrammeRequest, Programme>("/staff/programmes", data);
	},

	async updateProgramme(programmeId: number, data: Partial<CreateProgrammeRequest>): Promise<Programme> {
		debugLogger.info("staffApi", "updateProgramme called", { programmeId, data });
		return apiPut<Partial<CreateProgrammeRequest>, Programme>(`/staff/programmes/${programmeId}`, data);
	},

	async deleteProgramme(programmeId: number): Promise<void> {
		debugLogger.info("staffApi", "deleteProgramme called", { programmeId });
		return apiDelete(`/staff/programmes/${programmeId}`);
	},

	// Programme-Course Mapping
	async getProgrammeCourses(
		programmeId: number,
	): Promise<ProgrammeCourseResponse> {
		debugLogger.info("staffApi", "getProgrammeCourses called");
		return apiGet<ProgrammeCourseResponse>(
			`/staff/programmes/${programmeId}/courses`,
		);
	},

	async addProgrammeCourse(
		programmeId: number,
		courseId: number,
	): Promise<void> {
		debugLogger.info("staffApi", "addProgrammeCourse called");
		return apiPost(`/staff/programmes/${programmeId}/courses`, {
			course_id: courseId,
		});
	},

	async removeProgrammeCourse(
		programmeId: number,
		courseId: number,
	): Promise<void> {
		debugLogger.info("staffApi", "removeProgrammeCourse called");
		return apiDelete(`/staff/programmes/${programmeId}/courses/${courseId}`);
	},

	async bulkEnrollStudentsToProgramme(
		programmeId: number,
		data: ProgrammeBulkEnrollRequest,
	): Promise<any> {
		debugLogger.info("staffApi", "bulkEnrollStudentsToProgramme called");
		return apiPost<ProgrammeBulkEnrollRequest, any>(
			`/staff/programmes/${programmeId}/students/bulk`,
			data,
		);
	},
};
