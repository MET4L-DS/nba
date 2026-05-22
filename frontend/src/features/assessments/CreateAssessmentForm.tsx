import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ArrowLeft,
	ChevronDown,
	Plus,
	X,
	Check,
	AlertCircle,
	Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { QuestionsTable } from "./QuestionsTable";
import { apiService } from "@/services/api";
import type { Course, Question } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface ContextStats {
	assessments: number;
	students: number;
}

interface CreateAssessmentFormProps {
	selectedCourse: Course | null;
	onSuccess: (courseId?: number) => void;
	onCancel: () => void;
	contextStats?: ContextStats | null;
}

const TEST_TYPES = ["Test-1", "Mid-Term", "Test-2", "End-Term", "Other"];

const TEST_MARKS: Record<string, number> = {
	"Test-1": 10,
	"Mid-Term": 30,
	"Test-2": 10,
	"End-Term": 50,
	Other: 0,
};

const MotionButton = motion(Button);

export function CreateAssessmentForm({
	selectedCourse,
	onSuccess,
	onCancel,
	contextStats,
}: CreateAssessmentFormProps) {
	const [name, setName] = useState("");
	const [fullMarks, setFullMarks] = useState("");
	const [passMarks, setPassMarks] = useState("");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const totalMarks = questions.reduce((sum, q) => sum + q.max_marks, 0);
	const fullMarksNum = parseFloat(fullMarks) || 0;
	const marksMatch = fullMarksNum > 0 && totalMarks === fullMarksNum;

	const handleTestTypeChange = (testType: string) => {
		setName(testType === "Other" ? "" : testType);
		const fm = TEST_MARKS[testType] || 0;
		if (testType !== "Other") {
			setFullMarks(fm.toString());
			setPassMarks((Math.round(fm * 0.34 * 2) / 2).toString());
		} else {
			setFullMarks("");
			setPassMarks("");
		}
	};

	const handleFullMarksChange = (val: string) => {
		setFullMarks(val);
		const fm = parseFloat(val);
		if (!isNaN(fm))
			setPassMarks((Math.round(fm * 0.34 * 2) / 2).toString());
	};

	const addQuestion = () => {
		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`,
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
	};

	const addSubQuestion = (questionNumber: number) => {
		if (fullMarksNum && totalMarks + 1 > fullMarksNum) {
			toast.error(
				`Total marks (${totalMarks}) would exceed full marks (${fullMarksNum})`,
			);
			return;
		}
		setQuestions((prev) => {
			const sameNum = prev.filter(
				(q) => q.question_number === questionNumber,
			);
			if (sameNum.length === 0) return prev;

			const existingSubs = sameNum
				.map((q) => q.sub_question)
				.filter((s) => s !== "");
			const updated = [...prev];

			if (existingSubs.length === 0) {
				const idx = updated.findIndex(
					(q) => q.question_number === questionNumber,
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
	};

	const removeQuestion = (index: number) => {
		setQuestions((prev) => {
			const removed = prev[index];
			if (!removed) return prev;
			let remaining = prev.filter((_, i) => i !== index);
			const sameNum = remaining.filter(
				(q) => q.question_number === removed.question_number,
			);
			if (sameNum.length === 1 && sameNum[0].sub_question !== "") {
				const idx = remaining.findIndex(
					(q) => q.question_number === removed.question_number,
				);
				remaining[idx] = { ...remaining[idx], sub_question: "" };
			}

			// Renumber main questions sequentially (1, 2, 3...)
			const uniqueNums = Array.from(
				new Set(remaining.map((q) => q.question_number)),
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
	};

	const updateQuestion = (index: number, updates: Partial<Question>) => {
		setQuestions((prev) => {
			const updated = [...prev];
			updated[index] = { ...updated[index], ...updates };
			return updated;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
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
				`Total marks (${totalMarks}) must equal full marks (${fullMarksNum})`,
			);
			return;
		}
		for (const q of questions) {
			if (q.max_marks < 0.5) {
				toast.error(
					`Q${q.question_number}${q.sub_question || ""}: marks must be >=0.5`,
				);
				return;
			}
			if (q.co < 1 || q.co > 6) {
				toast.error(
					`Q${q.question_number}${q.sub_question || ""}: CO must be 1-6`,
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
				`Assessment created! Test ID: ${result.data.test.id}`,
			);
			onSuccess(selectedCourse.offering_id ?? selectedCourse.course_id);
		} catch (err) {
			console.error("Failed to create assessment:", err);
			toast.error(
				err instanceof Error
					? err.message
					: "Failed to create assessment",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="h-full flex flex-col relative overflow-hidden bg-slate-50/30 dark:bg-slate-950/20">
			{/* Top header bar */}
			<header className="h-16 shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b flex items-center justify-between px-6 gap-4 relative z-20">
				<div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
				<div className="flex items-center gap-3 min-w-0">
					<MotionButton
						type="button"
						variant="ghost"
						size="icon"
						onClick={onCancel}
						whileHover={{ scale: 1.08, backgroundColor: "rgba(0,0,0,0.03)" }}
						whileTap={{ scale: 0.92 }}
						className="rounded-full shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="w-5 h-5" />
					</MotionButton>
					<div>
						<h1 className="text-base font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Create New Assessment
						</h1>
						{selectedCourse && (
							<p className="text-[11px] text-muted-foreground truncate sm:hidden">
								{selectedCourse.course_code}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-3 shrink-0">
					{selectedCourse && (
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							className="hidden sm:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60"
						>
							<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
								Course:
							</span>
							<span className="text-[11px] font-bold text-primary truncate max-w-[240px]">
								{selectedCourse.course_code} — {selectedCourse.course_name}
							</span>
						</motion.div>
					)}
					<MotionButton
						type="submit"
						size="sm"
						disabled={isSubmitting || !selectedCourse}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						transition={{ type: "spring" as const, stiffness: 450, damping: 14 }}
						className="gap-2 font-bold shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border-none px-4 h-9.5"
					>
						<Rocket className="w-4 h-4" />
						{isSubmitting ? "Creating..." : "Create Assessment"}
					</MotionButton>
				</div>
			</header>

			{/* Two-column body */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left panel */}
				<motion.aside
					initial={{ opacity: 0, x: -30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ type: "spring" as const, stiffness: 280, damping: 24 }}
					className="w-80 lg:w-96 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col shrink-0 overflow-y-auto relative z-10"
				>
					<div className="p-6 space-y-8">
						{/* Context */}
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.05, type: "spring" as const }}
						>
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3.5 ml-0.5">
								Context
							</p>
							{selectedCourse ? (
								<div className="relative group overflow-hidden bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10 rounded-2xl p-4.5 border border-blue-100/70 dark:border-blue-900/30 shadow-xs transition-all hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-800/30">
									<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
									<p className="text-sm font-bold text-indigo-900 dark:text-blue-300 leading-snug">
										{selectedCourse.course_code} - {selectedCourse.course_name}
									</p>
									<p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-1">
										Semester {selectedCourse.semester}, Year {selectedCourse.year}
									</p>
									{contextStats != null && (
										<div className="mt-4 pt-3.5 border-t border-blue-100/80 dark:border-blue-900/40 flex gap-4">
											<div className="flex-1">
												<p className="text-[10px] font-bold text-blue-500/80 dark:text-blue-400/80 uppercase tracking-wider">
													Assessments
												</p>
												<p className="text-xl font-bold text-indigo-950 dark:text-white mt-0.5">
													{contextStats.assessments}
												</p>
											</div>
											<div className="flex-1">
												<p className="text-[10px] font-bold text-blue-500/80 dark:text-blue-400/80 uppercase tracking-wider">
													Students
												</p>
												<p className="text-xl font-bold text-indigo-950 dark:text-white mt-0.5">
													{contextStats.students}
												</p>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-muted/30 text-xs text-muted-foreground text-center">
									Select a course from the dropdown above.
								</div>
							)}
						</motion.div>

						{/* Configuration */}
						<motion.div
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1, type: "spring" as const }}
							className="space-y-6"
						>
							<div>
								<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-0.5">
									Configuration
								</p>
								<div className="space-y-5">
									<div className="space-y-2">
										<Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
											Assessment Type
										</Label>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<MotionButton
													type="button"
													variant="outline"
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
													className="w-full justify-between bg-background/50 border-slate-200 dark:border-slate-800 h-10 px-3.5 hover:bg-background shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
												>
													<span className="text-sm font-semibold">
														{TEST_TYPES.includes(name)
															? name
															: name
																? "Other"
																: "Select type..."}
													</span>
													<ChevronDown className="w-4 h-4 ml-2 text-muted-foreground/75" />
												</MotionButton>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) rounded-2xl shadow-xl border border-muted/80 backdrop-blur-md p-1">
												{TEST_TYPES.map((t) => (
													<DropdownMenuItem
														key={t}
														onSelect={() =>
															handleTestTypeChange(t)
														}
														className="rounded-xl py-2 px-3 font-semibold text-xs transition-colors hover:bg-accent"
													>
														{t}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									{(!TEST_TYPES.includes(name) ||
										name === "Other") && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											className="space-y-2 overflow-hidden"
										>
											<Label
												htmlFor="customName"
												className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5"
											>
												Custom Assessment Name
											</Label>
											<Input
												id="customName"
												type="text"
												value={name === "Other" ? "" : name}
												onChange={(e) =>
													setName(e.target.value)
												}
												placeholder="e.g. Quiz 1"
												className="bg-background/50 h-10 px-3.5 focus-visible:ring-indigo-500/30 transition-all font-semibold"
												required
											/>
										</motion.div>
									)}

									<div className="space-y-2">
										<Label
											htmlFor="fullMarks"
											className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5"
										>
											Full Marks
										</Label>
										<Input
											id="fullMarks"
											type="number"
											step="0.5"
											min="0"
											value={fullMarks}
											onChange={(e) =>
												handleFullMarksChange(
													e.target.value,
												)
											}
											placeholder="e.g. 10"
											className="bg-background/50 h-10 px-3.5 focus-visible:ring-indigo-500/30 transition-all font-mono font-bold"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="passMarks"
											className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5"
										>
											Pass Marks
										</Label>
										<Input
											id="passMarks"
											type="number"
											step="0.5"
											min="0"
											value={passMarks}
											onChange={(e) =>
												setPassMarks(e.target.value)
											}
											placeholder="e.g. 4"
											className="bg-background/50 h-10 px-3.5 focus-visible:ring-indigo-500/30 transition-all font-mono font-bold"
											required
										/>
										<p className="text-[10px] text-muted-foreground ml-0.5">
											Auto-calculated at 34% of full marks
										</p>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Cancel */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.15 }}
							className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60"
						>
							<MotionButton
								type="button"
								variant="ghost"
								onClick={onCancel}
								whileHover={{ scale: 1.01, backgroundColor: "rgba(239,68,68,0.06)" }}
								whileTap={{ scale: 0.99 }}
								className="w-full text-muted-foreground hover:text-destructive gap-2 h-10 font-bold rounded-xl transition-all"
							>
								<X className="w-4 h-4" />
								Cancel Creation
							</MotionButton>
						</motion.div>
					</div>
				</motion.aside>

				{/* Right panel */}
				<motion.section
					initial={{ opacity: 0, x: 30 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ type: "spring" as const, stiffness: 280, damping: 24 }}
					className="flex-1 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col overflow-hidden relative"
				>
					{/* Sticky sub-header */}
					<div className="px-8 py-4.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between sticky top-0 z-10 shadow-xs">
						<div className="flex items-center gap-5">
							<h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
								<span className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" />
								Questions Configuration
							</h3>
							<div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
							<span className="text-xs text-muted-foreground hidden sm:block font-medium">
								Define structure and CO mapping
							</span>
						</div>

						{/* Dynamic Matching Badge */}
						<motion.div
							animate={marksMatch ? { scale: [1, 1.02, 1] } : {}}
							transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
							className={`flex items-center bg-white dark:bg-slate-900 border rounded-full pl-2 pr-4.5 py-1.5 shadow-xs gap-3 transition-all ${
								marksMatch
									? "border-green-500/40 bg-green-500/[0.04] dark:bg-green-950/20 shadow-green-500/5"
									: fullMarksNum > 0
										? "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-950/20 shadow-amber-500/5"
										: "border-slate-200 dark:border-slate-800"
							}`}
						>
							<div
								className={`flex items-center justify-center w-7 h-7 rounded-full text-white shadow-xs ${
									marksMatch
										? "bg-green-500 dark:bg-green-600"
										: fullMarksNum > 0
											? "bg-amber-500 dark:bg-amber-600"
											: "bg-slate-300 dark:bg-slate-700"
								}`}
							>
								{marksMatch ? (
									<Check className="w-4 h-4" />
								) : (
									<AlertCircle className="w-4 h-4" />
								)}
							</div>
							<div className="flex flex-col leading-none">
								<span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
									Total Marks
								</span>
								<div className="flex items-baseline gap-1 mt-1">
									<AnimatePresence mode="popLayout">
										<motion.span
											key={totalMarks}
											initial={{ scale: 1.3, y: -4, opacity: 0 }}
											animate={{ scale: 1, y: 0, opacity: 1 }}
											exit={{ scale: 0.8, y: 4, opacity: 0 }}
											transition={{ type: "spring", stiffness: 350, damping: 15 }}
											className={`text-sm font-bold font-mono ${
												marksMatch
													? "text-green-600 dark:text-green-400"
													: fullMarksNum > 0
														? "text-amber-600 dark:text-amber-400"
														: "text-muted-foreground"
											}`}
										>
											{totalMarks}
										</motion.span>
									</AnimatePresence>
									<span className="text-xs text-muted-foreground font-bold font-mono">
										/ {fullMarks || "—"}
									</span>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Scrollable questions area */}
					<div className="flex-1 overflow-y-auto p-6 lg:p-8">
						<div className="max-w-7xl mx-auto w-full pb-4">
							<div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
								<QuestionsTable
									questions={questions}
									onUpdateQuestion={updateQuestion}
									onRemoveQuestion={removeQuestion}
									onAddSubQuestion={addSubQuestion}
								/>
							</div>
						</div>
					</div>

					{/* True Sticky Add Button Footer */}
					<div className="shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 p-4.5 flex justify-center relative z-10 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)]">
						<MotionButton
							type="button"
							variant="outline"
							size="sm"
							onClick={addQuestion}
							disabled={
								fullMarksNum > 0 && totalMarks >= fullMarksNum
							}
							whileHover={{ scale: 1.03, y: -1 }}
							whileTap={{ scale: 0.97 }}
							transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
							className="gap-2 rounded-full h-11 px-8 shadow-xs hover:shadow-md bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
						>
							<Plus className="w-5 h-5 text-indigo-500" />
							Add Main Question
						</MotionButton>
					</div>
				</motion.section>
			</div>
		</form>
	);
}
