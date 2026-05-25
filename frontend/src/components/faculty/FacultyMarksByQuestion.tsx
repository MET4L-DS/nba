import { useRef, Fragment, memo } from "react";
import {
	Search,
	Upload,
	Save,
	BarChart2,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import type {
	Course,
	Test,
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { BulkMarksTable } from "@/features/marks/BulkMarksTable";
import { useFacultyMarksByQuestion } from "./hooks/useFacultyMarksByQuestion";
import { ITEMS_PER_PAGE } from "./constants";

export interface FacultyMarksByQuestionProps {
	selectedCourse: Course;
	selectedTest: Test;
	headerContent?: React.ReactNode;
	readOnly?: boolean;
	onStatsUpdate?: (stats: {
		entered: number;
		total: number;
		average: string;
	}) => void;
}

export const FacultyMarksByQuestion = memo(function FacultyMarksByQuestion({
	selectedCourse,
	selectedTest,
	headerContent,
	readOnly = false,
	onStatsUpdate,
}: FacultyMarksByQuestionProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (selectedTest && selectedCourse) {
			loadEnrollmentsAndQuestions();
		}
		setSearchTerm("");
		setCurrentPage(1);
	}, [selectedTest]);

	const loadEnrollmentsAndQuestions = async () => {
		if (!selectedCourse || !selectedTest) return;
		setMarksLoading(true);
		try {
			const enrollmentData = await apiService.getCourseEnrollments(
				selectedCourse.offering_id ?? selectedCourse.course_id,
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

			// Fetch all students' marks in a single bulk request
			const testMarksData = await apiService.getTestMarks(selectedTest.id, true);

			// Fill in existing marks from bulk results
			if (testMarksData?.raw_marks?.length) {
				testMarksData.raw_marks.forEach((studentData) => {
					const studentId = studentData.student_id;
					if (initialMarks[studentId]) {
						studentData.raw_marks.forEach((rawMark) => {
							const qId = rawMark.question_identifier;
							if (initialMarks[studentId][qId] !== undefined) {
								initialMarks[studentId][qId] = rawMark.marks_obtained.toString();
							}
						});
					}
				});
			}

			setMarks(initialMarks);
			setOriginalMarks(JSON.parse(JSON.stringify(initialMarks)));
			setDirtyRows(new Set());
		} catch (err) {
			console.error("Failed to load data:", err);
			toast.error("Failed to load students and questions");
		} finally {
			setMarksLoading(false);
		}
	};

	const handleMarkChange = (
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
	};

	const handleSubmit = async () => {
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
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (readOnly) return;
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => processCSV(e.target?.result as string);
		reader.readAsText(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const processCSV = (text: string) => {
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
	};

	const filteredEnrollments = enrollments.filter(
		(e) =>
			e.student_rollno.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
	);
	const totalPages = Math.ceil(filteredEnrollments.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const currentEnrollments = filteredEnrollments.slice(
		startIndex,
		currentEnrollments,
		enteredCount,
		averageTotal,
		handleMarkChange,
		handleSubmit,
		handleFileUpload,
	} = useFacultyMarksByQuestion({
		selectedCourse,
		selectedTest,
		readOnly,
		onStatsUpdate,
	});

	const containerVariants = {
		initial: {},
		animate: {
			transition: {
				staggerChildren: 0.08,
			},
		},
	};

	const itemVariants = {
		initial: { opacity: 0, y: 10 },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.4,
				ease: [0.16, 1, 0.3, 1] as const,
			},
		},
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="initial"
			animate="animate"
			className="flex-1 flex flex-col min-h-0"
		>
			{/* Toolbar */}
			<motion.div
				variants={itemVariants}
				className="px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-muted/50 bg-muted/10 shrink-0"
			>
				<div className="flex items-center gap-3.5 flex-wrap">
					{headerContent}
					{enrollments.length > 0 && (
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="gap-1.5 font-bold text-xs py-1.5 px-3 rounded-xl bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400 shadow-sm"
							>
								<BarChart2 className="w-3.5 h-3.5 text-blue-500" />
								Avg: {averageTotal}
							</Badge>
							<Badge
								variant="outline"
								className="gap-1.5 font-bold text-xs py-1.5 px-3 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 shadow-sm"
							>
								<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
								{enteredCount}/{enrollments.length} Entered
							</Badge>
						</div>
					)}
				</div>
				<div className="flex items-center gap-3 flex-wrap">
					<div className="flex items-center space-x-2 mr-1">
						<Switch
							id="validate-marks-question"
							checked={validateMarks}
							onCheckedChange={setValidateMarks}
							className="data-[state=checked]:bg-violet-600"
						/>
						<Label
							htmlFor="validate-marks-question"
							className="whitespace-nowrap flex text-xs font-semibold uppercase tracking-wider text-muted-foreground items-center h-full cursor-pointer"
						>
							Validate Marks
						</Label>
					</div>
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
						<Input
							placeholder="Search student..."
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);
								setCurrentPage(1);
							}}
							className="pl-9 h-9 text-sm w-52 rounded-xl border-muted/65 bg-background/50 focus-visible:ring-violet-500/30"
						/>
					</div>
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept=".csv"
						onChange={handleFileUpload}
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
						className="gap-1.5 text-xs h-9 rounded-xl border-muted/60 bg-background/50 hover:bg-violet-500/5 active:scale-95 duration-200 transition-all font-medium"
					>
						<Upload className="w-3.5 h-3.5 text-violet-500" />
						Import
					</Button>
					<Button
						size="sm"
						onClick={handleSubmit}
						disabled={readOnly || submitting || dirtyRows.size === 0}
						className="gap-1.5 text-xs h-9 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-md shadow-violet-600/10 active:scale-95 duration-200 transition-all"
					>
						<Save className="w-3.5 h-3.5" />
						{submitting ? "Saving…" : "Save"}
					</Button>
				</div>
			</motion.div>
			{/* Content Area */}
			{dirtyRows.size > 0 && (
				<motion.div
					variants={itemVariants}
					className="shrink-0 flex items-center gap-2.5 text-sm text-amber-700 dark:text-amber-400 bg-amber-500/5 border-b border-amber-500/20 px-6 py-2.5"
				>
					<AlertCircle className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
					<span className="font-bold">
						{dirtyRows.size} student(s) modified
					</span>
					<span className="text-xs font-medium text-amber-600/80 dark:text-amber-500/80">
						— unsaved changes highlighted in table. Remember to click Save!
					</span>
				</motion.div>
			)}
			<motion.div
				variants={itemVariants}
				className="flex-1 overflow-auto bg-background/30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full"
			>
				{marksLoading ? (
					<div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground animate-pulse">
						Loading students and questions…
					</div>
				) : enrollments.length === 0 ? (
					<div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground">
						No students enrolled in this course
					</div>
				) : questions.length === 0 ? (
					<div className="flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground text-center p-6">
						No questions found — add questions to this assessment first
					</div>
				) : (
					<BulkMarksTable
						questions={questions}
						enrollments={currentEnrollments}
						marks={marks}
						dirtyRows={dirtyRows}
						onMarkChange={handleMarkChange}
						validateMarks={validateMarks}
					/>
				)}
			</motion.div>
			{!marksLoading && filteredEnrollments.length > 0 && (
				<motion.div
					variants={itemVariants}
					className="shrink-0 bg-background/50 border-t border-muted/50 px-6 py-3.5 flex items-center justify-between gap-4"
				>
					<p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
						Showing{" "}
						{filteredEnrollments.length === 0 ? 0 : startIndex + 1}{" "}
						to{" "}
						{Math.min(
							startIndex + ITEMS_PER_PAGE,
							filteredEnrollments.length,
						)}{" "}
						of {filteredEnrollments.length} entries
					</p>
					{totalPages > 1 && (
						<Pagination className="w-auto">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={() =>
											setCurrentPage((p) =>
												Math.max(1, p - 1),
											)
										}
										className={
											currentPage === 1
												? "pointer-events-none opacity-50"
												: "cursor-pointer rounded-xl border border-muted/65 hover:bg-muted/40"
										}
									/>
								</PaginationItem>
								{Array.from(
									{
										length: totalPages,
									},
									(_, i) => i + 1,
								)
									.filter(
										(p) =>
											p === 1 ||
											p === totalPages ||
											Math.abs(p - currentPage) <= 1,
									)
									.map((page, index, array) => {
										const prevPage = array[index - 1];
										const showEllipsis =
											prevPage && page - prevPage > 1;
										return (
											<Fragment key={`pg-${page}`}>
												{showEllipsis && (
													<PaginationItem>
														<span className="px-2 text-muted-foreground text-sm">
															…
														</span>
													</PaginationItem>
												)}
												<PaginationItem>
													<PaginationLink
														onClick={() =>
															setCurrentPage(page)
														}
														isActive={
															currentPage === page
														}
														className="cursor-pointer rounded-xl border border-muted/65 hover:bg-muted/40 data-[active=true]:bg-violet-600 data-[active=true]:text-white"
													>
														{page}
													</PaginationLink>
												</PaginationItem>
											</Fragment>
										);
									})}
								<PaginationItem>
									<PaginationNext
										onClick={() =>
											setCurrentPage((p) =>
												Math.min(totalPages, p + 1),
											)
										}
										className={
											currentPage === totalPages
												? "pointer-events-none opacity-50"
												: "cursor-pointer rounded-xl border border-muted/65 hover:bg-muted/40"
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</motion.div>
			)}
		</motion.div>
	);
});
