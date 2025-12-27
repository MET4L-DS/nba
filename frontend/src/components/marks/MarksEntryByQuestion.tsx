import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type {
	Course,
	Test,
	QuestionResponse,
	Enrollment,
	BulkMarksEntry,
} from "@/services/api";
import { MarksEntryHeader } from "./MarksEntryHeader";
import { TestInfoCard } from "./TestInfoCard";
import { BulkMarksTable } from "./BulkMarksTable";

interface MarksEntryByQuestionProps {
	test: Test;
	course: Course | null;
	onBack: () => void;
}

export function MarksEntryByQuestion({
	test,
	course,
	onBack,
}: MarksEntryByQuestionProps) {
	const [questions, setQuestions] = useState<QuestionResponse[]>([]);
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
	const [marks, setMarks] = useState<Record<string, Record<string, string>>>(
		{}
	);
	const [originalMarks, setOriginalMarks] = useState<
		Record<string, Record<string, string>>
	>({});
	const [dirtyRows, setDirtyRows] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (test && course) {
			loadEnrollmentsAndQuestions();
		}
	}, [test, course]);

	const loadEnrollmentsAndQuestions = async () => {
		if (!course || !test) return;

		setLoading(true);
		try {
			const enrollmentData = await apiService.getCourseEnrollments(
				course.id,
				test.id
			);

			setEnrollments(enrollmentData.enrollments || []);
			setQuestions(enrollmentData.test_info?.questions || []);

			// Initialize marks structure
			const initialMarks: Record<string, Record<string, string>> = {};

			// Load existing marks for each student
			const enrollments = enrollmentData.enrollments || [];
			const questions = enrollmentData.test_info?.questions || [];

			for (const enrollment of enrollments) {
				initialMarks[enrollment.student_rollno] = {};

				// Initialize all questions with empty string
				questions.forEach((q) => {
					initialMarks[enrollment.student_rollno][
						q.question_identifier
					] = "";
				});

				// Try to load existing marks for this student
				try {
					const studentMarks = await apiService.getStudentMarks(
						test.id,
						enrollment.student_rollno
					);

					// Fill in existing marks
					if (
						studentMarks.raw_marks &&
						studentMarks.raw_marks.length > 0
					) {
						studentMarks.raw_marks.forEach((rawMark) => {
							const questionIdentifier =
								rawMark.question_identifier;
							if (
								initialMarks[enrollment.student_rollno][
									questionIdentifier
								] !== undefined
							) {
								initialMarks[enrollment.student_rollno][
									questionIdentifier
								] = rawMark.marks.toString();
							}
						});
					}
				} catch (error) {
					// If student has no marks yet, continue with empty values
					console.log(
						`No existing marks for student ${enrollment.student_rollno}`
					);
				}
			}

			setMarks(initialMarks);
			setOriginalMarks(JSON.parse(JSON.stringify(initialMarks))); // Deep copy
			setDirtyRows(new Set()); // Reset dirty rows on reload
		} catch (error) {
			console.error("Failed to load data:", error);
			toast.error("Failed to load students and questions");
		} finally {
			setLoading(false);
		}
	};

	const handleMarkChange = (
		studentRollno: string,
		questionId: string,
		value: string
	) => {
		setMarks((prev) => ({
			...prev,
			[studentRollno]: {
				...prev[studentRollno],
				[questionId]: value,
			},
		}));

		// Mark row as dirty if value differs from original
		setDirtyRows((prev) => {
			const newDirtyRows = new Set(prev);
			const originalValue =
				originalMarks[studentRollno]?.[questionId] || "";

			// Check if this student has any changes
			const hasChanges = value !== originalValue;

			if (hasChanges) {
				newDirtyRows.add(studentRollno);
			} else {
				// Check if all other questions for this student are unchanged
				const allQuestionsUnchanged = Object.keys(
					marks[studentRollno] || {}
				).every((qId) => {
					if (qId === questionId) return value === originalValue;
					return (
						(marks[studentRollno]?.[qId] || "") ===
						(originalMarks[studentRollno]?.[qId] || "")
					);
				});
				if (allQuestionsUnchanged) {
					newDirtyRows.delete(studentRollno);
				}
			}

			return newDirtyRows;
		});
	};

	const handleSubmit = async () => {
		if (!test) {
			toast.error("Test not found");
			return;
		}

		if (!test.id) {
			toast.error("Test ID is missing. Please select a valid test.");
			return;
		}

		if (dirtyRows.size === 0) {
			toast.error("No changes to save");
			return;
		}

		const bulkEntries: BulkMarksEntry[] = [];

		// Only process dirty (modified) rows
		for (const studentRollno of dirtyRows) {
			const studentMarks = marks[studentRollno];
			if (!studentMarks) continue;
			for (const [questionIdentifier, markValue] of Object.entries(
				studentMarks
			)) {
				if (markValue.trim() !== "") {
					const mark = parseFloat(markValue);
					if (isNaN(mark) || mark < 0) {
						toast.error(
							`Invalid mark for ${studentRollno} - Question ${questionIdentifier}`
						);
						return;
					}

					const match = questionIdentifier.match(/^(\d+)([a-h]?)$/);
					if (!match) {
						toast.error(
							`Invalid question identifier: ${questionIdentifier}`
						);
						return;
					}

					const questionNumber = parseInt(match[1]);
					const subQuestion = match[2] || null;

					bulkEntries.push({
						student_rollno: studentRollno,
						question_number: questionNumber,
						sub_question: subQuestion,
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
				test_id: test.id,
				marks_entries: bulkEntries,
			});

			if (result.data.failure_count > 0) {
				toast.warning(
					`Marks saved with ${result.data.failure_count} failures. ${result.data.success_count} successful.`
				);
				console.error("Failed entries:", result.data.failed);
			} else {
				toast.success(
					`All marks saved successfully! (${result.data.success_count} entries)`
				);
			}

			// Reload the data to show updated marks
			await loadEnrollmentsAndQuestions();
		} catch (error) {
			console.error("Failed to save marks:", error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to save marks");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-2 w-full min-w-0">
			<MarksEntryHeader
				title="Bulk Marks Entry (By Question)"
				course={course}
				onBack={onBack}
			/>

			<TestInfoCard
				test={test}
				onSave={handleSubmit}
				isSaving={submitting}
				isDisabled={enrollments.length === 0}
			>
				{loading ? (
					<div className="text-center py-8 text-gray-500">
						Loading students and questions...
					</div>
				) : (
					<BulkMarksTable
						questions={questions}
						enrollments={enrollments}
						marks={marks}
						dirtyRows={dirtyRows}
						onMarkChange={handleMarkChange}
					/>
				)}
			</TestInfoCard>
		</div>
	);
}
