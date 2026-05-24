import { TestList } from "@/features/shared";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Trash2, ClipboardList } from "lucide-react";
import { ViewAssessmentDialog } from "./ViewAssessmentDialog";
import type { Course, Test } from "@/services/api";
import { useTestsList } from "./hooks/useTestsList";
import { getTestsListColumns } from "./TestsList.columns";
import { useMemo } from "react";

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
	const {
		tests,
		loading,
		hasInitialLoadedRef,
		selectedTestId,
		setSelectedTestId,
		showDetailsDialog,
		setShowDetailsDialog,
		showDeleteDialog,
		setShowDeleteDialog,
		testToDelete,
		setTestToDelete,
		deleteConfirmation,
		setDeleteConfirmation,
		isDeleting,
		handleDeleteClick,
		handleDeleteConfirm,
	} = useTestsList({ course, refreshTrigger, onCountChange });

	// Memoize columns using the hook's state callbacks
	const columns = useMemo(() => {
		return getTestsListColumns(
			(id) => {
				setSelectedTestId(id);
				setShowDetailsDialog(true);
			},
			handleDeleteClick
		);
	}, [setSelectedTestId, setShowDetailsDialog, handleDeleteClick]);

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
					{hasInitialLoadedRef.current ? (
						<TestList
							columns={columns}
							data={tests}
							searchKey="test_label"
							searchPlaceholder="Search by test name..."
							refreshing={loading}
						/>
					) : (
						<div className="space-y-3 pt-2">
							<div className="flex gap-4 items-center mb-4">
								<Skeleton className="h-9 w-40 rounded-lg shrink-0" />
								<Skeleton className="h-9 w-24 rounded-lg ml-auto shrink-0" />
							</div>
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="flex gap-4 items-center">
									<Skeleton className="h-9 w-16 rounded-lg shrink-0" />
									<Skeleton className="h-9 flex-1 rounded-lg" />
									<Skeleton className="h-9 w-20 rounded-lg shrink-0" />
									<Skeleton className="h-9 w-20 rounded-lg shrink-0" />
									<Skeleton className="h-9 w-28 rounded-lg shrink-0" />
								</div>
							))}
						</div>
					)}
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
