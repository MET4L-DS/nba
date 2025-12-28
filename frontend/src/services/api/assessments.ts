import { apiGet, apiPostFull, apiDelete } from "./base";
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
		return apiGet<{
			test: Test;
			course: Course;
			questions: QuestionResponse[];
		}>(`/assessment?test_id=${testId}`);
	},

	async deleteTest(testId: number): Promise<{
		success: boolean;
		message: string;
		data: {
			test_name: string;
			course_code: string;
			questions_deleted: number;
			students_affected: number;
			raw_marks_deleted: number;
		};
	}> {
		return apiDelete<{
			success: boolean;
			message: string;
			data: {
				test_name: string;
				course_code: string;
				questions_deleted: number;
				students_affected: number;
				raw_marks_deleted: number;
			};
		}>(`/tests/${testId}`);
	},
};
