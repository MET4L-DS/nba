import { lazy, Suspense, useCallback, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeferredMount } from "@/lib/useDeferredMount";
import {
	Plus,
	Users,
	ClipboardList,
	TrendingUp,
	GraduationCap,
} from "lucide-react";

import { TestsList } from "@/features/assessments/TestsList";
import type { Course, Test } from "@/services/api";
import { useFacultyAssessments } from "./hooks/useFacultyAssessments";

const CreateAssessmentForm = lazy(() =>
	import("@/features/assessments/CreateAssessmentForm").then((m) => ({
		default: m.CreateAssessmentForm,
	}))
);

const EnrollStudentsDialog = lazy(() =>
	import("@/features/assessments/EnrollStudentsDialog").then((m) => ({
		default: m.EnrollStudentsDialog,
	}))
);

interface FacultyAssessmentsProps {
	selectedCourse: Course | null;
}

export const FacultyAssessments = memo(function FacultyAssessments({
	selectedCourse,
}: FacultyAssessmentsProps) {
	const isListMounted = useDeferredMount(120);

	const {
		showCreateForm,
		setShowCreateForm,
		showEnrollDialog,
		setShowEnrollDialog,
		refreshTrigger,
		testsCount,
		setTestsCount,
		courseStats,
		statsLoading,
		triggerRefresh,
	} = useFacultyAssessments({ selectedCourse });

	const handleAssessmentCreated = useCallback(() => {
		console.log(
			"[FacultyAssessments] Assessment created — triggering refresh",
		);
		setShowCreateForm(false);
		triggerRefresh();
	}, [setShowCreateForm, triggerRefresh]);

	const handleGoToMarks = useCallback((_test: Test) => {
		// Navigate to marks entry — parent handles this via nav
	}, []);

	return (
		<div className="h-full flex flex-col">
			{/* ── Page header + toolbar ─────────────────────────────────── */}
			{!showCreateForm && (
				<div className="p-6 shrink-0 space-y-5 bg-card/45 backdrop-blur-md border-b border-muted/50 relative overflow-hidden">
					{/* Ambient Top gradient glow */}
					<div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent" />
					
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-bold tracking-tight text-foreground">
								Assessments Dashboard
							</h3>
							{selectedCourse ? (
								<p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
									<span className="text-indigo-500 font-semibold">{selectedCourse.course_code}</span>
									<span>&bull;</span>
									<span className="text-foreground">{selectedCourse.course_name}</span>
									<span>&bull;</span>
									<span className="text-muted-foreground">{selectedCourse.semester} Sem ({selectedCourse.year})</span>
								</p>
							) : (
								<p className="text-sm text-muted-foreground mt-0.5">
									Select a course to manage its assessments
								</p>
							)}
						</div>
						<div className="flex gap-2.5 shrink-0">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowEnrollDialog(true)}
								disabled={!selectedCourse}
								className="rounded-xl border-muted/60 bg-background/50 hover:bg-violet-500/5 active:scale-95 duration-200 transition-all text-sm font-medium h-9"
							>
								<Users className="w-4 h-4 mr-2 text-violet-500" />
								Enroll Students
							</Button>
							<Button
								size="sm"
								onClick={() => setShowCreateForm(true)}
								disabled={!selectedCourse}
								className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/15 active:scale-95 duration-200 transition-all text-sm font-medium h-9"
							>
								<Plus className="w-4 h-4 mr-2" />
								Create Assessment
							</Button>
						</div>
					</div>

					{/* Stat cards */}
					{selectedCourse && (
						<div className="grid grid-cols-3 gap-4">
							{/* Total Assessments */}
							<div className="rounded-xl border bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20 p-3 flex items-center gap-3.5 hover:bg-blue-500/10 transition-all duration-300">
								<div className="h-9 w-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-sm">
									<ClipboardList className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="min-w-0">
									<p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-semibold truncate uppercase tracking-wider">
										Total Assessments
									</p>
									{statsLoading ? (
										<Skeleton className="h-5 w-8 mt-0.5" />
									) : (
										<p className="text-xl font-bold text-blue-700 dark:text-blue-300 leading-tight mt-0.5">
											{courseStats?.totalAssessments ??
												testsCount}
										</p>
									)}
								</div>
							</div>
							{/* Avg. Performance */}
							<div className="rounded-xl border bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-3 flex items-center gap-3.5 hover:bg-emerald-500/10 transition-all duration-300">
								<div className="h-9 w-9 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm">
									<TrendingUp className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div className="min-w-0">
									<p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold truncate uppercase tracking-wider">
										Avg. Performance
									</p>
									{statsLoading ? (
										<Skeleton className="h-5 w-12 mt-0.5" />
									) : courseStats?.avgPerformance != null ? (
										<p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 leading-tight mt-0.5">
											{courseStats.avgPerformance}%
										</p>
									) : (
										<div className="mt-0.5">
											<p className="text-sm font-bold text-emerald-700/60 dark:text-emerald-300/60 leading-tight">
												No marks yet
											</p>
											{courseStats &&
												courseStats.marksCount === 0 &&
												courseStats.totalAssessments >
													0 && (
													<p className="text-[10px] text-emerald-600/50 dark:text-emerald-400/50 leading-tight mt-0.5">
														Enter marks to track
													</p>
												)}
										</div>
									)}
								</div>
							</div>
							{/* Active Students */}
							<div className="rounded-xl border bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/20 p-3 flex items-center gap-3.5 hover:bg-violet-500/10 transition-all duration-300">
								<div className="h-9 w-9 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-sm">
									<GraduationCap className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
								</div>
								<div className="min-w-0">
									<p className="text-xs text-violet-600/80 dark:text-violet-400/80 font-semibold truncate uppercase tracking-wider">
										Active Students
									</p>
									{statsLoading ? (
										<Skeleton className="h-5 w-8 mt-0.5" />
									) : (
										<p className="text-xl font-bold text-violet-700 dark:text-violet-300 leading-tight mt-0.5">
											{courseStats?.activeStudents ?? "—"}
										</p>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* ── Main content ─────────────────────────────────────────── */}
			<div className="flex-1 overflow-hidden">
				{showCreateForm ? (
					<Suspense
						fallback={
							<div className="p-6">
								<Skeleton className="h-[400px] w-full rounded-2xl" />
							</div>
						}
					>
						<CreateAssessmentForm
							selectedCourse={selectedCourse}
							onSuccess={handleAssessmentCreated}
							onCancel={() => setShowCreateForm(false)}
							contextStats={
								courseStats
									? {
											assessments:
												courseStats.totalAssessments,
											students: courseStats.activeStudents,
										}
									: null
							}
						/>
					</Suspense>
				) : (
					<ScrollArea className="h-full">
						<div className="p-6">
							<div className="bg-card/70 backdrop-blur-sm border border-muted/50 rounded-2xl overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
								<div className="h-[2px] bg-gradient-to-r from-violet-500/60 to-indigo-500/60" />
								<div className="p-6">
									{isListMounted ? (
										<TestsList
											course={selectedCourse}
											refreshTrigger={refreshTrigger}
											onGoToMarks={handleGoToMarks}
											onCountChange={setTestsCount}
										/>
									) : (
										<div className="space-y-4">
											<Skeleton className="h-8 w-1/3 rounded-lg" />
											<div className="space-y-3">
												{Array.from({ length: 4 }).map((_, i) => (
													<div key={i} className="flex gap-4 items-center">
														<Skeleton className="h-9 w-24 rounded-lg shrink-0" />
														<Skeleton className="h-9 flex-1 rounded-lg" />
														<Skeleton className="h-9 w-16 rounded-lg shrink-0" />
														<Skeleton className="h-9 w-16 rounded-lg shrink-0" />
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					</ScrollArea>
				)}
			</div>

			{/* ── Enroll Students Dialog ────────────────────────────────── */}
			{showEnrollDialog && (
				<Suspense fallback={null}>
					<EnrollStudentsDialog
						open={showEnrollDialog}
						onOpenChange={setShowEnrollDialog}
						course={selectedCourse}
					/>
				</Suspense>
			)}
		</div>
	);
});
