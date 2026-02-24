import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { AssessmentsHeader as CreateHeader } from "./CreateAssessmentHeader";
import { CourseInfoDisplay } from "./CourseInfoDisplay";
import { AssessmentDetailsForm } from "./AssessmentDetailsForm";
import { QuestionsTable } from "./QuestionsTable";
import { apiService } from "@/services/api";
import type { Course, Question } from "@/services/api";

interface CreateAssessmentFormProps {
	selectedCourse: Course | null;
	onSuccess: (courseId?: number) => void;
	onCancel: () => void;
}

export function CreateAssessmentForm({
	selectedCourse,
	onSuccess,
	onCancel,
}: CreateAssessmentFormProps) {
	const [name, setName] = useState("");
	const [fullMarks, setFullMarks] = useState("");
	const [passMarks, setPassMarks] = useState("");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const testMarksDefaults: Record<string, number> = {
		"Test-1": 10,
		"Mid-Term": 30,
		"Test-2": 10,
		"End-Term": 50,
	};

	const handleTestTypeChange = (testType: string) => {
		setName(testType);
		const defaultFullMarks = testMarksDefaults[testType];
		setFullMarks(defaultFullMarks.toString());
		// Calculate 34% of full marks for pass marks
		const defaultPassMarks = Math.round(defaultFullMarks * 0.34 * 2) / 2; // Round to nearest 0.5
		setPassMarks(defaultPassMarks.toString());
	};

	const handleFullMarksChange = (marks: string) => {
		setFullMarks(marks);
		// Auto-calculate pass marks as 34%
		const fullMarksNum = parseFloat(marks);
		if (!isNaN(fullMarksNum)) {
			const calculatedPassMarks = Math.round(fullMarksNum * 0.34 * 2) / 2;
			setPassMarks(calculatedPassMarks.toString());
		}
	};

	const addQuestion = () => {
		const totalMarks = questions.reduce((sum, q) => sum + q.max_marks, 0);
		const fullMarksNum = parseFloat(fullMarks);

		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Cannot add question. Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`,
			);
			return;
		}

		// Find the next available question number
		const existingNumbers = questions.map((q) => q.question_number);
		const maxNumber =
			existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

		const newQuestion: Question = {
			question_number: maxNumber + 1,
			sub_question: "",
			is_optional: false,
			co: 1,
			max_marks: 1,
		};
		setQuestions([...questions, newQuestion]);
	};

	const addSubQuestion = (questionNumber: number) => {
		const totalMarks = questions.reduce((sum, q) => sum + q.max_marks, 0);
		const fullMarksNum = parseFloat(fullMarks);

		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Cannot add sub-question. Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`,
			);
			return;
		}

		// Find all questions with the same question number
		const sameNumberQuestions = questions.filter(
			(q) => q.question_number === questionNumber,
		);

		// Find the next available sub-question letter
		let nextSubQuestion = "a";
		if (sameNumberQuestions.length > 0) {
			const existingSubQuestions = sameNumberQuestions
				.map((q) => q.sub_question)
				.filter((sq) => sq !== "");

			if (existingSubQuestions.length === 0) {
				// Convert the first question to sub-question 'a'
				const questionIndex = questions.findIndex(
					(q) => q.question_number === questionNumber,
				);
				const updatedQuestions = [...questions];
				updatedQuestions[questionIndex] = {
					...updatedQuestions[questionIndex],
					sub_question: "a",
				};

				// Add new sub-question 'b'
				const newSubQuestion: Question = {
					question_number: questionNumber,
					sub_question: "b",
					is_optional: false,
					co: updatedQuestions[questionIndex].co,
					max_marks: 1,
				};

				// Insert after the current question
				updatedQuestions.splice(questionIndex + 1, 0, newSubQuestion);
				setQuestions(updatedQuestions);
			} else {
				// Find the highest sub-question letter
				const highestLetter = existingSubQuestions.sort().pop() || "a";
				const nextCharCode = highestLetter.charCodeAt(0) + 1;

				if (nextCharCode > "h".charCodeAt(0)) {
					toast.error("Maximum 8 sub-questions (a-h) allowed");
					return;
				}

				nextSubQuestion = String.fromCharCode(nextCharCode);

				// Find the last occurrence of this question number
				const lastIndex = questions
					.map((q, i) => ({
						q,
						i,
					}))
					.filter((item) => item.q.question_number === questionNumber)
					.pop()?.i;

				if (lastIndex !== undefined) {
					const newSubQuestion: Question = {
						question_number: questionNumber,
						sub_question: nextSubQuestion,
						is_optional: false,
						co: questions[lastIndex].co,
						max_marks: 1,
					};

					const updatedQuestions = [...questions];
					updatedQuestions.splice(lastIndex + 1, 0, newSubQuestion);
					setQuestions(updatedQuestions);
				}
			}
		}
	};

	const removeQuestion = (index: number) => {
		const questionToRemove = questions[index];
		const newQuestions = questions.filter((_, i) => i !== index);

		// Check if this was the only question with this number and had a sub-question
		const sameNumberQuestions = newQuestions.filter(
			(q) => q.question_number === questionToRemove.question_number,
		);

		// If only one question remains with this number and it has a sub-question, clear the sub-question
		if (
			sameNumberQuestions.length === 1 &&
			sameNumberQuestions[0].sub_question !== ""
		) {
			const questionIndex = newQuestions.findIndex(
				(q) =>
					q.question_number === questionToRemove.question_number &&
					q.sub_question !== "",
			);
			if (questionIndex !== -1) {
				newQuestions[questionIndex] = {
					...newQuestions[questionIndex],
					sub_question: "",
				};
			}
		}

		setQuestions(newQuestions);
	};

	const updateQuestion = (index: number, updates: Partial<Question>) => {
		const newQuestions = [...questions];
		newQuestions[index] = { ...newQuestions[index], ...updates };
		setQuestions(newQuestions);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!selectedCourse) {
			toast.error("Please select a course from the header");
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

		// Calculate total marks
		const totalMarks = questions.reduce((sum, q) => sum + q.max_marks, 0);
		const fullMarksNum = parseFloat(fullMarks);

		if (totalMarks !== fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) must equal full marks (${fullMarksNum})`,
			);
			return;
		}

		// Validate each question
		for (const q of questions) {
			if (q.max_marks < 0.5) {
				toast.error(
					`Question ${q.question_number}${
						q.sub_question || ""
					}: Maximum marks must be at least 0.5`,
				);
				return;
			}
			if (q.co < 1 || q.co > 6) {
				toast.error(
					`Question ${q.question_number}${
						q.sub_question || ""
					}: CO must be between 1 and 6`,
				);
				return;
			}
		}

		setIsSubmitting(true);

		try {
			const result = await apiService.createAssessment({
				course_id:
					selectedCourse.offering_id ?? selectedCourse.course_id,
				name,
				full_marks: parseFloat(fullMarks),
				pass_marks: parseFloat(passMarks),
				questions,
			});

			toast.success(
				`Assessment created successfully! Test ID: ${result.data.test.id}`,
			);
			onSuccess(selectedCourse.offering_id ?? selectedCourse.course_id);
		} catch (error) {
			console.error("Failed to create assessment:", error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to create assessment");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			{/* Header with Back Button */}
			<CreateHeader onBack={onCancel} />

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Assessment Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Course Info Display */}
						{selectedCourse && (
							<CourseInfoDisplay course={selectedCourse} />
						)}

						<AssessmentDetailsForm
							name={name}
							fullMarks={fullMarks}
							passMarks={passMarks}
							onNameChange={handleTestTypeChange}
							onFullMarksChange={handleFullMarksChange}
							onPassMarksChange={setPassMarks}
						/>
					</CardContent>
				</Card>

				{/* Questions Section */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center gap-4">
							<CardTitle>Questions</CardTitle>
							{fullMarks && (
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Total Marks:{" "}
									<span
										className={
											questions.reduce(
												(sum, q) => sum + q.max_marks,
												0,
											) > parseFloat(fullMarks)
												? "text-red-600 font-semibold"
												: "text-green-600 font-semibold"
										}
									>
										{questions.reduce(
											(sum, q) => sum + q.max_marks,
											0,
										)}
									</span>{" "}
									/ {fullMarks}
								</div>
							)}
						</div>
						<Button
							type="button"
							onClick={addQuestion}
							size="sm"
							className="gap-2"
							disabled={
								fullMarks
									? questions.reduce(
											(sum, q) => sum + q.max_marks,
											0,
										) >= parseFloat(fullMarks)
									: false
							}
						>
							<Plus className="w-4 h-4" />
							Add Question
						</Button>
					</CardHeader>
					<CardContent>
						<QuestionsTable
							questions={questions}
							onUpdateQuestion={updateQuestion}
							onRemoveQuestion={removeQuestion}
							onAddSubQuestion={addSubQuestion}
						/>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex justify-end gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						<X className="w-4 h-4 mr-2" />
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						<Save className="w-4 h-4 mr-2" />
						{isSubmitting ? "Creating..." : "Create Assessment"}
					</Button>
				</div>
			</form>
		</div>
	);
}
