import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type {
	Course,
	Test,
	QuestionResponse,
	Enrollment,
	BulkMarksEntry,
} from "@/services/api";
import { ITEMS_PER_PAGE } from "../constants";
import { calculateRowTotal } from "../utils";

interface UseFacultyMarksByQuestionProps {
	selectedCourse: Course;
	selectedTest: Test;
	readOnly?: boolean;
	onStatsUpdate?: (stats: {
		entered: number;
		total: number;
		average: string;
	}) => void;
}

export function useFacultyMarksByQuestion({
	selectedCourse,
	selectedTest,
	readOnly = false,
	onStatsUpdate,
}: UseFacultyMarksByQuestionProps) {
	const [questions, setQuestions] = useState<QuestionResponse[]>([]);
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
	const [marks, setMarks] = useState<Record<string, Record<string, string>>>({});
	const [originalMarks, setOriginalMarks] = useState<Record<string, Record<string, string>>>({});
	const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
	const [marksLoading, setMarksLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [validateMarks, setValidateMarks] = useState(true);

	const loadEnrollmentsAndQuestions = useCallback(async () => {
		if (!selectedCourse || !selectedTest) return;
		setMarksLoading(true);
		try {
			const offeringId = selectedCourse.offering_id ?? selectedCourse.course_id;
			const enrollmentData = await apiService.getCourseEnrollments(
				offeringId,
				selectedTest.id,
			);
			const enrolledList: Enrollment[] = enrollmentData.enrollments || [];
			const questionsList: QuestionResponse[] =
				enrollmentData.test_info?.questions || [];

			setEnrollments(enrolledList);
			setQuestions(questionsList);

			const initialMarks: Record<string, Record<string, string>> = {};
			enrolledList.forEach((e) => {
				initialMarks[e.student_rollno] = {};
				questionsList.forEach((q) => {
					initialMarks[e.student_rollno][q.question_identifier] = "";
				});
			});

			const marksResults = await Promise.all(
				enrolledList.map(async (e) => {
					try {
						return await apiService.getStudentMarks(
							selectedTest.id,
							e.student_rollno,
						);
					} catch {
						return null;
					}
				}),
			);

			enrolledList.forEach((e, idx) => {
				const sm = marksResults[idx];
				if (sm?.raw_marks?.length) {
					sm.raw_marks.forEach(
						(rawMark: {
							question_identifier: string;
							marks: number;
						}) => {
							const qId = rawMark.question_identifier;
							if (
								initialMarks[e.student_rollno][qId] !==
								undefined
							) {
								initialMarks[e.student_rollno][qId] =
									rawMark.marks.toString();
							}
						},
					);
				}
			});

			setMarks(initialMarks);
			setOriginalMarks(JSON.parse(JSON.stringify(initialMarks)));
			setDirtyRows(new Set());
		} catch (err) {
			console.error("Failed to load data:", err);
			toast.error("Failed to load students and questions");
		} finally {
			setMarksLoading(false);
		}
	}, [selectedCourse, selectedTest]);

	useEffect(() => {
		if (selectedTest && selectedCourse) {
			loadEnrollmentsAndQuestions();
		}
		setSearchTerm("");
		setCurrentPage(1);
	}, [selectedTest, selectedCourse, loadEnrollmentsAndQuestions]);

	const handleMarkChange = useCallback((
		studentRollno: string,
		questionId: string,
		value: string,
	) => {
		if (readOnly) return;
		setMarks((prev) => ({
			...prev,
			[studentRollno]: { ...prev[studentRollno], [questionId]: value },
		}));
		setDirtyRows((prev) => {
			const next = new Set(prev);
			const originalValue =
				originalMarks[studentRollno]?.[questionId] || "";
			if (value !== originalValue) {
				next.add(studentRollno);
			} else {
				const allUnchanged = Object.keys(
					marks[studentRollno] || {},
				).every((qId) => {
					if (qId === questionId) return value === originalValue;
					return (
						(marks[studentRollno]?.[qId] || "") ===
						(originalMarks[studentRollno]?.[qId] || "")
					);
				});
				if (allUnchanged) next.delete(studentRollno);
			}
			return next;
		});
	}, [readOnly, originalMarks, marks]);

	const handleSubmit = useCallback(async () => {
		if (readOnly) return;
		if (!selectedTest) {
			toast.error("No test selected");
			return;
		}
		if (dirtyRows.size === 0) {
			toast.error("No changes to save");
			return;
		}

		const bulkEntries: BulkMarksEntry[] = [];
		for (const rollno of dirtyRows) {
			const studentMarks = marks[rollno];
			if (!studentMarks) continue;
			for (const [questionIdentifier, markValue] of Object.entries(
				studentMarks,
			)) {
				if (markValue.trim() !== "") {
					const mark = parseFloat(markValue);
					if (isNaN(mark) || mark < 0) {
						toast.error(
							`Invalid mark for ${rollno} – Q${questionIdentifier}`,
						);
						return;
					}
					const match = questionIdentifier.match(/^(\d+)([a-h]?)$/);
					if (!match) {
						toast.error(
							`Invalid question identifier: ${questionIdentifier}`,
						);
						return;
					}
					bulkEntries.push({
						student_rollno: rollno,
						question_number: parseInt(match[1]),
						sub_question: match[2] || null,
						marks_obtained: mark,
					});
				}
			}
		}

		if (bulkEntries.length === 0) {
			toast.error("Please enter at least one mark");
			return;
		}

		setSubmitting(true);
		try {
			const result = await apiService.saveBulkMarks({
				test_id: selectedTest.id,
				marks_entries: bulkEntries,
				validate_marks: validateMarks,
			});
			if (result.data.failure_count > 0) {
				toast.warning(
					`Saved with ${result.data.failure_count} failure(s). ${result.data.success_count} successful.`,
				);
			} else {
				toast.success(
					`All marks saved! (${result.data.success_count} entries)`,
				);
			}
			await loadEnrollmentsAndQuestions();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to save marks",
			);
		} finally {
			setSubmitting(false);
		}
	}, [readOnly, selectedTest, dirtyRows, marks, validateMarks, loadEnrollmentsAndQuestions]);

	const processCSV = useCallback((text: string) => {
		const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
		if (lines.length < 2) {
			toast.error("CSV file is empty or missing header");
			return;
		}
		const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
		let marksStartIndex = 1;
		if (
			headers.length > 1 &&
			(headers[1].includes("name") || headers[1] === "student name")
		) {
			marksStartIndex = 2;
		} else {
			const firstData = lines[1].split(",");
			if (firstData.length > 1 && isNaN(parseFloat(firstData[1]))) {
				marksStartIndex = 2;
			}
		}

		setMarks((prevMarks) => {
			const newMarks = { ...prevMarks };
			const newDirtyRows = new Set(dirtyRows);
			let updatedCount = 0;
			const questionIds = questions.map((q) => q.question_identifier);

			lines.slice(1).forEach((line) => {
				const values = line.split(",").map((v) => v.trim());
				if (values.length < 2) return;
				const rollNo = values[0];
				if (!enrollments.some((e) => e.student_rollno === rollNo))
					return;
				if (!newMarks[rollNo]) newMarks[rollNo] = {};
				values.slice(marksStartIndex).forEach((val, index) => {
					if (
						index < questionIds.length &&
						val !== "" &&
						!isNaN(parseFloat(val))
					) {
						newMarks[rollNo][questionIds[index]] = val;
					}
				});
				newDirtyRows.add(rollNo);
				updatedCount++;
			});

			setDirtyRows(newDirtyRows);
			if (updatedCount > 0) {
				toast.success(
					`Imported marks for ${updatedCount} students. Review and click Save.`,
				);
			} else {
				toast.warning("No matching students found in CSV.");
			}
			return newMarks;
		});
	}, [questions, enrollments, dirtyRows]);

	const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		if (readOnly) return;
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => processCSV(e.target?.result as string);
		reader.readAsText(file);
		if (event.target) event.target.value = "";
	}, [readOnly, processCSV]);

	// Memoized stats & searching
	const filteredEnrollments = useMemo(() => {
		return enrollments.filter(
			(e) =>
				e.student_rollno.toLowerCase().includes(searchTerm.toLowerCase()) ||
				e.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [enrollments, searchTerm]);

	const totalPages = useMemo(() => {
		return Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE);
	}, [filteredEnrollments]);

	const startIndex = useMemo(() => {
		return (currentPage - 1) * ITEMS_PER_PAGE;
	}, [currentPage]);

	const currentEnrollments = useMemo(() => {
		return filteredEnrollments.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE,
		);
	}, [filteredEnrollments, startIndex]);

	const enteredCount = useMemo(() => {
		return enrollments.filter((e) =>
			questions.some(
				(q) =>
					(marks[e.student_rollno]?.[q.question_identifier] || "") !== "",
			),
		).length;
	}, [enrollments, questions, marks]);

	const rowTotal = useCallback((rollno: string) => {
		return calculateRowTotal(rollno, questions, marks);
	}, [questions, marks]);

	const averageTotal = useMemo(() => {
		const rowsWithAnyMark = enrollments.filter((e) =>
			questions.some(
				(q) =>
					(marks[e.student_rollno]?.[q.question_identifier] || "") !== "",
			),
		);
		if (rowsWithAnyMark.length === 0) return "–";
		const sumTotal = rowsWithAnyMark.reduce(
			(sum, e) => sum + rowTotal(e.student_rollno),
			0,
		);
		return (sumTotal / rowsWithAnyMark.length).toFixed(1);
	}, [enrollments, questions, marks, rowTotal]);

	useEffect(() => {
		if (onStatsUpdate) {
			onStatsUpdate({
				entered: enteredCount,
				total: enrollments.length,
				average: averageTotal,
			});
		}
	}, [enteredCount, enrollments.length, averageTotal, onStatsUpdate]);

	return {
		questions,
		enrollments,
		marks,
		dirtyRows,
		marksLoading,
		submitting,
		searchTerm,
		setSearchTerm,
		currentPage,
		setCurrentPage,
		validateMarks,
		setValidateMarks,
		filteredEnrollments,
		totalPages,
		startIndex,
		currentEnrollments,
		enteredCount,
		averageTotal,
		handleMarkChange,
		handleSubmit,
		handleFileUpload,
		loadEnrollmentsAndQuestions,
	};
}
