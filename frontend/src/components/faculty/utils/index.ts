import type { QuestionResponse } from "@/services/api";

/** Maps enrolled student status to badge style variants */
export const statusVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case "active":
			return "default";
		case "graduated":
			return "secondary";
		case "inactive":
		case "dropped":
			return "destructive";
		default:
			return "outline";
	}
};

/** Calculates the total marks obtained by a student for specific assessment questions */
export const calculateRowTotal = (
	rollno: string,
	questions: QuestionResponse[],
	marks: Record<string, Record<string, string>>,
): number => {
	return questions.reduce((sum, q) => {
		const v = parseFloat(marks[rollno]?.[q.question_identifier] || "");
		return isNaN(v) ? sum : sum + v;
	}, 0);
};

/** Validates if a student's mark for a specific question exceeds the maximum allowable marks */
export const isCellMarkInvalid = (
	rollno: string,
	q: QuestionResponse,
	marks: Record<string, Record<string, string>>,
	validateMarks: boolean = true,
): boolean => {
	if (!validateMarks) return false;
	const v = parseFloat(marks[rollno]?.[q.question_identifier] || "");
	return !isNaN(v) && v > q.max_marks;
};
