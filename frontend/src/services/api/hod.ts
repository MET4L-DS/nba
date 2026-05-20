import { apiGet, apiPost, apiDelete, apiPut, apiGetPaginated } from "./base";
import { debugLogger } from "@/lib/debugLogger";
import type {
	BaseCourse,
	HODStats,
	DepartmentCourse,
	DepartmentFaculty,
	TestAverage,
	CreateCourseRequest,
	UpdateCourseRequest,
	HODCreateUserRequest,
	HODUpdateUserRequest,
	PaginatedResponse,
	PaginationParams,
	Student,
	UpdateStudentRequest,
	Programme,
	ProgrammeWithBatch,
	ProgrammeBatch,
	ProgrammeCourseResponse,
	CreateProgrammeRequest,
	ProgrammeBulkEnrollRequest,
} from "./types";

export const hodApi = {
	async getDepartmentProgrammes(params?: PaginationParams): Promise<PaginatedResponse<Programme>> {
		debugLogger.info("hodApi", "getDepartmentProgrammes called", params);
		return apiGetPaginated<Programme>("/hod/programmes", params);
	},

	async getProgrammesWithBatches(): Promise<ProgrammeWithBatch[]> {
		debugLogger.info("hodApi", "getProgrammesWithBatches called");
		return apiGet<ProgrammeWithBatch[]>("/hod/programmes/with-batches");
	},

	// Batch operations
	async getBatchesByProgramme(programmeId: number): Promise<ProgrammeBatch[]> {
		debugLogger.info("hodApi", "getBatchesByProgramme called", { programmeId });
		return apiGet<ProgrammeBatch[]>(`/hod/programmes/${programmeId}/batches`);
	},

	async createBatch(programmeId: number, batchYear: number, status?: string): Promise<{ batch_id: number }> {
		debugLogger.info("hodApi", "createBatch called", { programmeId, batchYear, status });
		return apiPost<{ batch_year: number; status?: string }, { batch_id: number }>(
			`/hod/programmes/${programmeId}/batches`,
			{ batch_year: batchYear, status },
		);
	},

	async getBatch(batchId: number): Promise<ProgrammeBatch> {
		debugLogger.info("hodApi", "getBatch called", { batchId });
		return apiGet<ProgrammeBatch>(`/hod/batches/${batchId}`);
	},

	// Programme CRUD
	async createProgramme(data: CreateProgrammeRequest): Promise<Programme> {
		debugLogger.info("hodApi", "createProgramme called", data);
		return apiPost<CreateProgrammeRequest, Programme>("/hod/programmes", data);
	},

	async updateProgramme(programmeId: number, data: Partial<CreateProgrammeRequest>): Promise<Programme> {
		debugLogger.info("hodApi", "updateProgramme called", { programmeId, data });
		return apiPut<Partial<CreateProgrammeRequest>, Programme>(`/hod/programmes/${programmeId}`, data);
	},

	async updateProgrammeWeightage(programmeId: number, directWeightage: number, indirectWeightage: number): Promise<void> {
		debugLogger.info("hodApi", "updateProgrammeWeightage called", { programmeId, directWeightage, indirectWeightage });
		return apiPut<{ direct_weightage: number; indirect_weightage: number }, void>(
			`/hod/programmes/${programmeId}/weightage`,
			{ direct_weightage: directWeightage, indirect_weightage: indirectWeightage },
		);
	},

	async deleteProgramme(programmeId: number): Promise<void> {
		debugLogger.info("hodApi", "deleteProgramme called", { programmeId });
		return apiDelete(`/hod/programmes/${programmeId}`);
	},

	async getBaseCourses(params?: PaginationParams) {
		debugLogger.info("hodApi", "getBaseCourses called");
		return apiGetPaginated<BaseCourse>("/hod/base-courses", params);
	},
	async getAllBaseCourses() {
		debugLogger.info("hodApi", "getAllBaseCourses called");
		return apiGet<BaseCourse[]>("/hod/base-courses/all");
	},
	async createBaseCourse(data: any): Promise<BaseCourse> {
		debugLogger.info("hodApi", "createBaseCourse called");
		return apiPost<any, BaseCourse>("/hod/base-courses", data);
	},

	async getStats(): Promise<HODStats> {
		debugLogger.info("hodApi", "getStats called");
		return apiGet<HODStats>("/hod/stats");
	},

	async updateBaseCourse(courseId: number, data: any): Promise<void> {
		debugLogger.info("hodApi", "updateBaseCourse called");
		return apiPut(`/hod/base-courses/${courseId}`, data);
	},
	async deleteBaseCourse(courseId: number): Promise<void> {
		debugLogger.info("hodApi", "deleteBaseCourse called");
		return apiDelete(`/hod/base-courses/${courseId}`);
	},
	async getDepartmentCourses(
		params?: PaginationParams,
	): Promise<PaginatedResponse<DepartmentCourse>> {
		debugLogger.info("hodApi", "getDepartmentCourses called", params);
		return apiGetPaginated<DepartmentCourse>("/hod/courses", params);
	},

	async getDepartmentFaculty(
		params?: PaginationParams,
	): Promise<PaginatedResponse<DepartmentFaculty>> {
		debugLogger.info("hodApi", "getDepartmentFaculty called", params);
		return apiGetPaginated<DepartmentFaculty>("/hod/faculty", params);
	},

	async createCourse(
		courseData: CreateCourseRequest,
	): Promise<DepartmentCourse> {
		debugLogger.info("hodApi", "getDepartmentCourses called");
		return apiPost<CreateCourseRequest, DepartmentCourse>(
			"/hod/courses",
			courseData,
		);
	},

	async updateCourse(
		offeringId: number,
		courseData: UpdateCourseRequest,
	): Promise<DepartmentCourse> {
		debugLogger.info("hodApi", "updateCourse called");
		return apiPut<UpdateCourseRequest, DepartmentCourse>(
			`/hod/courses/${offeringId}`,
			courseData,
		);
	},

async deleteCourse(offeringId: number): Promise<void> {
		debugLogger.info("hodApi", "deleteCourse called");
		return apiDelete(`/hod/courses/${offeringId}`);
	},

	async reopenCourseOffering(offeringId: number): Promise<void> {
		debugLogger.info("hodApi", "reopenCourseOffering called", { offeringId });
		return apiPost<any, any>(`/hod/offerings/${offeringId}/reopen`, {});
	},

	// User management
	async createUser(
		userData: HODCreateUserRequest,
	): Promise<DepartmentFaculty> {
		debugLogger.info("hodApi", "createUser called");
		return apiPost<HODCreateUserRequest, DepartmentFaculty>(
			"/hod/users",
			userData,
		);
	},

	async updateUser(
		employeeId: number,
		userData: HODUpdateUserRequest,
	): Promise<DepartmentFaculty> {
		debugLogger.info("hodApi", "updateUser called");
		return apiPut<HODUpdateUserRequest, DepartmentFaculty>(
			`/hod/users/${employeeId}`,
			userData,
		);
	},

	async deleteUser(employeeId: number): Promise<void> {
		debugLogger.info("hodApi", "deleteUser called");
		return apiDelete(`/hod/users/${employeeId}`);
	},

	// Student management
	async getDepartmentStudents(
		params?: PaginationParams,
	): Promise<PaginatedResponse<Student>> {
		debugLogger.info("hodApi", "getDepartmentStudents called", params);
		return apiGetPaginated<Student>("/hod/students", params);
	},

	async updateStudent(
		rollNo: string,
		data: UpdateStudentRequest,
	): Promise<void> {
		debugLogger.info("hodApi", "getDepartmentStudents called");
		return apiPut<UpdateStudentRequest, void>(
			`/hod/students/${encodeURIComponent(rollNo)}`,
			data,
		);
	},

	async getOfferingTestAverages(offeringId: number): Promise<TestAverage[]> {
		debugLogger.info("hodApi", "getOfferingTestAverages called");
		return apiGet<TestAverage[]>(
			`/hod/offerings/${offeringId}/test-averages`,
		);
	},

	// Programme-Course Mapping
	async getProgrammeCourses(
		programmeId: number,
	): Promise<ProgrammeCourseResponse> {
		debugLogger.info("hodApi", "getProgrammeCourses called");
		return apiGet<ProgrammeCourseResponse>(
			`/hod/programmes/${programmeId}/courses`,
		);
	},

	async addProgrammeCourse(
		programmeId: number,
		courseId: number,
	): Promise<void> {
		debugLogger.info("hodApi", "addProgrammeCourse called");
		return apiPost(`/hod/programmes/${programmeId}/courses`, {
			course_id: courseId,
		});
	},

	async removeProgrammeCourse(
		programmeId: number,
		courseId: number,
	): Promise<void> {
		debugLogger.info("hodApi", "removeProgrammeCourse called");
		return apiDelete(`/hod/programmes/${programmeId}/courses/${courseId}`);
	},

	async bulkEnrollStudentsToProgramme(
		programmeId: number,
		data: ProgrammeBulkEnrollRequest,
	): Promise<any> {
		debugLogger.info("hodApi", "bulkEnrollStudentsToProgramme called");
		return apiPost<ProgrammeBulkEnrollRequest, any>(
			`/hod/programmes/${programmeId}/students/bulk`,
			data,
		);
	},
};
