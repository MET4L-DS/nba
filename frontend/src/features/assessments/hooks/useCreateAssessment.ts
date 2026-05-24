import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { Course, Question } from "@/services/api";
import { TEST_MARKS } from "../constants";

interface UseCreateAssessmentProps {
	selectedCourse: Course | null;
	onSuccess: (courseId?: number) => void;
}

export function useCreateAssessment({
	selectedCourse,
	onSuccess,
}: UseCreateAssessmentProps) {
	const [name, setName] = useState("");
	const [fullMarks, setFullMarks] = useState("");
	const [passMarks, setPassMarks] = useState("");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalMarks = useMemo(() => {
		return questions.reduce((sum, q) => sum + q.max_marks, 0);
	}, [questions]);

	const fullMarksNum = useMemo(() => {
		return parseFloat(fullMarks) || 0;
	}, [fullMarks]);

	const marksMatch = useMemo(() => {
		return fullMarksNum > 0 && totalMarks === fullMarksNum;
	}, [fullMarksNum, totalMarks]);

	const handleTestTypeChange = useCallback((testType: string) => {
		setName(testType === "Other" ? "" : testType);
		const fm = TEST_MARKS[testType] || 0;
		if (testType !== "Other") {
			setFullMarks(fm.toString());
			setPassMarks((Math.round(fm * 0.34 * 2) / 2).toString());
		} else {
			setFullMarks("");
			setPassMarks("");
		}
	}, []);

	const handleFullMarksChange = useCallback((val: string) => {
		setFullMarks(val);
		const fm = parseFloat(val);
		if (!isNaN(fm)) {
			setPassMarks((Math.round(fm * 0.34 * 2) / 2).toString());
		}
	}, []);

	const addQuestion = useCallback(() => {
		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`
			);
			return;
		}
		setQuestions((prev) => {
			const maxNum =
				prev.length > 0
					? Math.max(...prev.map((q) => q.question_number))
					: 0;
			return [
				...prev,
				{
					question_number: maxNum + 1,
					sub_question: "",
					is_optional: false,
					co: 1,
					max_marks: 1,
				},
			];
		});
	}, [fullMarksNum, totalMarks]);

	const addSubQuestion = useCallback((questionNumber: number) => {
		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`
			);
			return;
		}
		setQuestions((prev) => {
			const sameNum = prev.filter(
				(q) => q.question_number === questionNumber
			);
			if (sameNum.length === 0) return prev;

			const existingSubs = sameNum
				.map((q) => q.sub_question)
				.filter((s) => s !== "");
			const updated = [...prev];

			if (existingSubs.length === 0) {
				const idx = updated.findIndex(
					(q) => q.question_number === questionNumber
				);
				updated[idx] = { ...updated[idx], sub_question: "a" };
				updated.splice(idx + 1, 0, {
					question_number: questionNumber,
					sub_question: "b",
					is_optional: false,
					co: updated[idx].co,
					max_marks: 1,
				});
			} else {
				const highest = [...existingSubs].sort().pop() || "a";
				const nextCode = highest.charCodeAt(0) + 1;
				if (nextCode > "h".charCodeAt(0)) {
					toast.error("Maximum 8 sub-questions (a-h) allowed");
					return prev;
				}
				const next = String.fromCharCode(nextCode);
				const lastIdx = updated
					.map((q, i) => ({ q, i }))
					.filter((x) => x.q.question_number === questionNumber)
					.pop()?.i;
				if (lastIdx !== undefined) {
					updated.splice(lastIdx + 1, 0, {
						question_number: questionNumber,
						sub_question: next,
						is_optional: false,
						co: updated[lastIdx].co,
						max_marks: 1,
					});
				}
			}
			return updated;
		});
	}, [fullMarksNum, totalMarks]);

	const removeQuestion = useCallback((index: number) => {
		setQuestions((prev) => {
			const removed = prev[index];
			if (!removed) return prev;
			let remaining = prev.filter((_, i) => i !== index);
			const sameNum = remaining.filter(
				(q) => q.question_number === removed.question_number
			);
			if (sameNum.length === 1 && sameNum[0].sub_question !== "") {
				const idx = remaining.findIndex(
					(q) => q.question_number === removed.question_number
				);
				remaining[idx] = { ...remaining[idx], sub_question: "" };
			}

			// Renumber main questions sequentially (1, 2, 3...)
			const uniqueNums = Array.from(
				new Set(remaining.map((q) => q.question_number))
			).sort((a, b) => a - b);
			const numMap = new Map(uniqueNums.map((num, i) => [num, i + 1]));

			// Renumber sub-questions sequentially (a, b, c...)
			const subQMap = new Map<number, number>();

			return remaining.map((q) => {
				const newNum =
					numMap.get(q.question_number) || q.question_number;
				let newSub = q.sub_question;

				if (newSub !== "") {
					const offset = subQMap.get(newNum) || 0;
					newSub = String.fromCharCode("a".charCodeAt(0) + offset);
					subQMap.set(newNum, offset + 1);
				}

				return { ...q, question_number: newNum, sub_question: newSub };
			});
		});
	}, []);

	const updateQuestion = useCallback((index: number, updates: Partial<Question>) => {
		setQuestions((prev) => {
			const updated = [...prev];
			updated[index] = { ...updated[index], ...updates };
			return updated;
		});
	}, []);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedCourse) {
			toast.error("Please select a course");
			return;
		}
		if (!name || !fullMarks || !passMarks) {
			toast.error("Please fill in all required fields");
			return;
		}
		if (questions.length === 0) {
			toast.error("Please add at least one question");
			return;
		}
		if (totalMarks !== fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) must equal full marks (${fullMarksNum})`
			);
			return;
		}
		for (const q of questions) {
			if (q.max_marks < 0.5) {
				toast.error(
					`Q${q.question_number}${q.sub_question || ""}: marks must be >=0.5`
				);
				return;
			}
			if (q.co < 1 || q.co > 6) {
				toast.error(
					`Q${q.question_number}${q.sub_question || ""}: CO must be 1-6`
				);
				return;
			}
		}
		setIsSubmitting(true);
		try {
			const result = await apiService.createAssessment({
				offering_id:
					selectedCourse.offering_id ?? selectedCourse.course_id,
				name,
				full_marks: parseFloat(fullMarks),
				pass_marks: parseFloat(passMarks),
				questions,
			});
			toast.success(
				`Assessment created! Test ID: ${result.data.test.id}`
			);
			onSuccess(selectedCourse.offering_id ?? selectedCourse.course_id);
		} catch (err) {
			console.error("Failed to create assessment:", err);
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to create assessment"
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [selectedCourse, name, fullMarks, passMarks, questions, totalMarks, fullMarksNum, onSuccess]);

	return {
		name,
		setName,
		fullMarks,
		passMarks,
		setPassMarks,
		questions,
		isSubmitting,
		totalMarks,
		fullMarksNum,
		marksMatch,
		handleTestTypeChange,
		handleFullMarksChange,
		addQuestion,
		addSubQuestion,
		removeQuestion,
		updateQuestion,
		handleSubmit,
	};
}
