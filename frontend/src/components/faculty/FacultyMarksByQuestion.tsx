import { useRef, Fragment, memo } from "react";
import {
	Search,
	Download,
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

	const {
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
						<Download className="w-3.5 h-3.5 text-violet-500" />
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
