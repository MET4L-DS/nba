import { apiGet, apiPost, apiPostFull } from "./base";
import { debugLogger } from "@/lib/debugLogger";
import type {
  Course,
  Test,
  SaveMarksByQuestionRequest,
  SaveMarksByCORequest,
  COTotals,
  MarksRecord,
  StudentMarks,
  BulkMarksSaveRequest,
  BulkMarksSaveResponse,
} from "./types";

export const marksApi = {
  async saveMarksByQuestion(
    marksData: SaveMarksByQuestionRequest,
  ): Promise<{ student_id: string; test_id: number; co_totals: COTotals }> {
		debugLogger.info("marksApi", "saveMarksByQuestion called");
    return apiPost<
      SaveMarksByQuestionRequest,
      { student_id: string; test_id: number; co_totals: COTotals }
    >("/marks/by-question", marksData);
  },

  async saveMarksByCO(marksData: SaveMarksByCORequest): Promise<MarksRecord> {
		debugLogger.info("marksApi", "saveMarksByCO called");
    return apiPost<SaveMarksByCORequest, MarksRecord>(
      "/marks/by-co",
      marksData,
    );
  },

  async saveBulkMarks(
    bulkMarksData: BulkMarksSaveRequest,
  ): Promise<BulkMarksSaveResponse> {
		debugLogger.info("marksApi", "saveBulkMarks called");
    return apiPostFull<BulkMarksSaveRequest, BulkMarksSaveResponse["data"]>(
      "/marks/bulk",
      bulkMarksData,
    );
  },

  async getStudentMarks(
    testId: number,
    studentId: string,
  ): Promise<StudentMarks> {
		debugLogger.info("marksApi", "getStudentMarks called");
    return apiGet<StudentMarks>(
      `/marks?test_id=${testId}&student_id=${studentId}`,
    );
  },

  async getTestMarks(
    testId: number,
    includeRaw?: boolean,
  ): Promise<{
    test: Test;
    course: Course;
    marks: Array<{
      student_id: string;
      student_name: string;
      programme_id?: number;
      programme_name?: string;
      is_repeater?: boolean;
      CO1: string | number;
      CO2: string | number;
      CO3: string | number;
      CO4: string | number;
      CO5: string | number;
      CO6: string | number;
    }>;
    raw_marks?: Array<{
      student_id: string;
      student_name: string;
      raw_marks: Array<{
        question_id: number;
        question_number: number;
        sub_question: string | null;
        question_identifier: string;
        marks_obtained: number;
        max_marks: number;
        co: string;
      }>;
    }>;
    questions?: Array<{
      id: number;
      question_number: number;
      sub_question: string | null;
      question_identifier: string;
      max_marks: number;
      co: string;
      is_optional: number;
    }>;
  }> {
    return apiGet<any>(
      `/marks/test?test_id=${testId}${includeRaw ? "&include_raw=true" : ""}`
    );
  },
};
