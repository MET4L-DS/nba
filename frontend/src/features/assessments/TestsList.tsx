import { TestList, getBaseTestColumns } from "@/features/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Trash2, ClipboardList } from "lucide-react";
import { ViewAssessmentDialog } from "./ViewAssessmentDialog";
import { apiService } from "@/services/api";
import { assessmentsApi } from "@/services/api/assessments";
import { toast } from "sonner";
import type { Course, Test } from "@/services/api";

interface TestsListProps {
	course: Course | null;
	refreshTrigger: number;
	onGoToMarks?: (test: Test) => void;
	onCountChange?: (count: number) => void;
}

export function TestsList({
	course,
	refreshTrigger,
	onGoToMarks,
	onCountChange,
}: TestsListProps) {
	const [tests, setTests] = useState<Test[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
	const [showDetailsDialog, setShowDetailsDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [testToDelete, setTestToDelete] = useState<Test | null>(null);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const columns: ColumnDef<Test>[] = [
		...getBaseTestColumns<Test>(),
		{
			id: "actions",
			header: () => <div className="text-right">Actions</div>,
			cell: ({ row }) => {
				const test = row.original;
				return (
					<div className="flex justify-end gap-1">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setSelectedTestId(test.id);
								setShowDetailsDialog(true);
							}}
							className="gap-1.5 h-8"
						>
							<Eye className="w-3.5 h-3.5" />
							View
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => handleDeleteClick(test)}
							className="gap-1.5 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="w-3.5 h-3.5" />
							Delete
						</Button>
					</div>
				);
			},
		},
	];

	useEffect(() => {
		if (course) {
			loadTests();
		} else {
			setTests([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [course, refreshTrigger]);

	const loadTests = async () => {
		if (!course) return;

		setLoading(true);
		try {
			const testsData = await apiService.getCourseTests(
				course.offering_id ?? course.course_id,
			);
			console.log("Tests received in component:", testsData);

			// Ensure testsData is an array
			const arr = Array.isArray(testsData) ? testsData : [];
			setTests(arr);
			onCountChange?.(arr.length);
		} catch (error) {
			console.error("Failed to load tests:", error);
			// Reset to empty array on error
			setTests([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (test: Test) => {
		setTestToDelete(test);
		setDeleteConfirmation("");
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (!testToDelete || deleteConfirmation !== "Yes") {
			return;
		}

		setIsDeleting(true);
		try {
			const result = await assessmentsApi.deleteTest(testToDelete.id);

			toast.success(result.message || "Test deleted successfully", {
				description: `${result.data.questions_deleted} questions and marks for ${result.data.students_affected} students were removed.`,
			});

			// Refresh the tests list
			loadTests();

			// Close dialog
			setShowDeleteDialog(false);
			setTestToDelete(null);
			setDeleteConfirmation("");
		} catch (error) {
			console.error("Failed to delete test:", error);
			toast.error("Failed to delete test", {
				description:
					error instanceof Error
						? error.message
						: "An error occurred",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	if (!course) {
		return (
			<motion.div 
				initial={{ opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
				className="flex flex-col items-center justify-center py-24 gap-4 text-center"
			>
				<motion.div
					animate={{ y: [0, -8, 0] }}
					transition={{
						repeat: Infinity,
						duration: 3.5,
						ease: "easeInOut",
					}}
					className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/50 backdrop-blur border border-white/20 dark:border-zinc-800/40 shadow-md"
				>
					<ClipboardList className="w-10 h-10 text-primary/80" />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
				>
					<h3 className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						No Course Selected
					</h3>
					<p className="text-sm text-muted-foreground mt-1 max-w-sm">
						Select a course from the dropdown above to view its assessments
					</p>
				</motion.div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
			className="w-full"
		>
			{/* Course header */}
			<motion.div 
				initial={{ opacity: 0, x: -10 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.1, duration: 0.3 }}
				className="mb-6"
			>
				<h3 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					{course.course_code} — {course.course_name}
				</h3>
				<p className="text-sm text-muted-foreground mt-0.5 font-medium">
					{course.semester} Semester • Year {course.year}
				</p>
			</motion.div>

			<Card className="bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-xl rounded-xl overflow-hidden">
				<CardContent className="px-5 pt-6">
					<TestList
						columns={columns}
						data={tests}
						searchKey="test_label"
						searchPlaceholder="Search by test name..."
						refreshing={loading}
					/>
				</CardContent>
			</Card>

			{/* View Assessment Details Panel */}
			<ViewAssessmentDialog
				open={showDetailsDialog}
				onOpenChange={setShowDetailsDialog}
				testId={selectedTestId}
				onGoToMarks={onGoToMarks}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="sm:max-w-[500px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border border-red-200 dark:border-red-950 shadow-2xl rounded-xl p-6">
					<AnimatePresence mode="wait">
						{showDeleteDialog && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 10 }}
								transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
								className="space-y-4"
							>
								<DialogHeader>
									<DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-lg">
										<Trash2 className="w-5 h-5 animate-pulse" />
										Delete Assessment
									</DialogTitle>
									<DialogDescription asChild>
										<div className="space-y-3 pt-2">
											<p className="font-semibold text-gray-900 dark:text-white">
												Are you sure you want to delete "{testToDelete?.name}"?
											</p>
											<div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 shadow-inner">
												<p className="text-sm text-red-800 dark:text-red-200 font-bold mb-2 flex items-center gap-1.5">
													<span>⚠️</span> Warning: This action cannot be undone!
												</p>
												<p className="text-xs text-red-700 dark:text-red-300 font-medium">
													Deleting this test will permanently remove:
												</p>
												<ul className="list-disc list-inside text-xs text-red-700 dark:text-red-300 mt-2 space-y-1 pl-1">
													<li>All questions in this assessment</li>
													<li>All student marks (raw and CO-aggregated)</li>
													<li>All related test records</li>
												</ul>
											</div>
										</div>
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-2 py-2">
									<Label htmlFor="confirm-delete" className="text-sm font-semibold">
										Type <span className="font-mono font-bold text-red-600 bg-red-100 dark:bg-red-950/40 px-1.5 py-0.5 rounded">Yes</span> to confirm deletion
									</Label>
									<Input
										id="confirm-delete"
										value={deleteConfirmation}
										onChange={(e) => setDeleteConfirmation(e.target.value)}
										placeholder="Type Yes to confirm"
										className="font-mono bg-white/50 dark:bg-zinc-900/50 focus:scale-[1.01] transition-transform duration-100"
										autoComplete="off"
									/>
								</div>
								<DialogFooter className="pt-2 border-t border-muted/20">
									<Button
										variant="outline"
										onClick={() => {
											setShowDeleteDialog(false);
											setTestToDelete(null);
											setDeleteConfirmation("");
										}}
										disabled={isDeleting}
										className="active:scale-95 transition-transform duration-100 cursor-pointer"
									>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={handleDeleteConfirm}
										disabled={deleteConfirmation !== "Yes" || isDeleting}
										className="active:scale-95 transition-transform duration-100 cursor-pointer shadow-sm shadow-red-500/20"
									>
										{isDeleting ? "Deleting..." : "Delete Test"}
									</Button>
								</DialogFooter>
							</motion.div>
						)}
					</AnimatePresence>
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
