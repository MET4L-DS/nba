import { apiGet, apiPostFull, apiDelete, apiPut } from "./base";
import { debugLogger } from "@/lib/debugLogger";
import type {
	Course,
	Test,
	QuestionResponse,
	CreateAssessmentRequest,
	CreateAssessmentResponse,
} from "./types";

export const assessmentsApi = {
	async createAssessment(
		assessment: CreateAssessmentRequest
	): Promise<CreateAssessmentResponse> {
		debugLogger.info("assessmentsApi", "createAssessment called");
		const result = await apiPostFull<
			CreateAssessmentRequest,
			{ test: Test; questions: QuestionResponse[] }
		>("/assessment", assessment);

		return {
			success: result.success,
			message: result.message,
			data: result.data,
		};
	},

	async getAssessment(testId: number): Promise<{
		test: Test;
		course: Course;
		questions: QuestionResponse[];
	}> {
		debugLogger.info("assessmentsApi", "getAssessment called");
		return apiGet<{
			test: Test;
			course: Course;
			questions: QuestionResponse[];
		}>(`/assessment?test_id=${testId}`);
	},

	async deleteTest(testId: number): Promise<{
		test_name: string;
		course_code: string;
		questions_deleted: number;
		students_affected: number;
		raw_marks_deleted: number;
	}> {
		debugLogger.info("assessmentsApi", "deleteTest called");
		return apiDelete<{
			test_name: string;
			course_code: string;
			questions_deleted: number;
			students_affected: number;
			raw_marks_deleted: number;
		}>(`/tests/${testId}`);
	},

	async updateQuestion(
		questionId: number,
		data: Partial<QuestionResponse>
	): Promise<QuestionResponse> {
		debugLogger.info("assessmentsApi", "updateQuestion called");
		return apiPut<Partial<QuestionResponse>, QuestionResponse>(
			`/questions/${questionId}`,
			data
		);
	},
};
