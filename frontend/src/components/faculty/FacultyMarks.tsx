import { lazy, Suspense, memo } from "react";
import type { Course } from "@/services/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FacultyMarksByQuestion } from "./FacultyMarksByQuestion";
import { useFacultyMarks } from "./hooks/useFacultyMarks";

const MarksEntryByCO = lazy(() =>
	import("@/features/marks/MarksEntryByCO").then((m) => ({
		default: m.MarksEntryByCO,
	}))
);

const ViewTestMarks = lazy(() =>
	import("@/features/marks/ViewTestMarks").then((m) => ({
		default: m.ViewTestMarks,
	}))
);

interface FacultyMarksProps {
	selectedCourse: Course | null;
	readOnly?: boolean;
}

export const FacultyMarks = memo(function FacultyMarks({
	selectedCourse,
	readOnly = false,
}: FacultyMarksProps) {
	const {
		tests,
		testsLoading,
		selectedTest,
		viewMode,
		setViewMode,
		setStats,
		handleTabSelect,
		getTabStatus,
	} = useFacultyMarks({ selectedCourse });

	if (!selectedCourse) {
		return (
			<div className="flex flex-col items-center justify-center h-[400px] text-center p-6 bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg relative overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 to-indigo-50" />
				<div className="p-4 rounded-full bg-muted/40 mb-4 border border-muted/60">
					<FileText className="w-8 h-8 text-muted-foreground/40" />
				</div>
				<h4 className="text-base font-semibold text-foreground">No Course Selected</h4>
				<p className="text-sm text-muted-foreground mt-1 max-w-xs">
					Select a course from the main dashboard sidebar to begin marks entry.
				</p>
			</div>
		);
	}

	const renderTabs = () => (
		<Tabs
			value={viewMode}
			onValueChange={(v) => setViewMode(v as any)}
		>
			<TabsList className="bg-muted/50 border border-muted/80 backdrop-blur-sm rounded-xl p-1 h-auto gap-0.5">
				<TabsTrigger
					value="by-question"
					className="text-xs px-4 py-1.5 font-semibold rounded-lg data-[state=active]:bg-background/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-95 duration-200 transition-all"
					disabled={readOnly}
				>
					By Question
				</TabsTrigger>
				<TabsTrigger
					value="by-co"
					className="text-xs px-4 py-1.5 font-semibold rounded-lg data-[state=active]:bg-background/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-95 duration-200 transition-all"
					disabled={readOnly}
				>
					By CO
				</TabsTrigger>
				<TabsTrigger
					value="bulk"
					className="text-xs px-4 py-1.5 font-semibold rounded-lg data-[state=active]:bg-background/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm active:scale-95 duration-200 transition-all"
				>
					Bulk View
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);

	return (
		<div className="flex flex-col h-full bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg overflow-hidden relative">
			<div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent" />
			
			{readOnly && (
				<div className="mx-6 mt-5 p-3.5 rounded-xl border bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center gap-2">
					<AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 animate-bounce" />
					<span>This course has been concluded and is locked. Marks entry is read-only.</span>
				</div>
			)}
			
			{/* Tests Header */}
			<div className="shrink-0 bg-muted/20 border-b border-muted/50 p-4">
				{testsLoading ? (
					<div className="p-4 text-sm text-muted-foreground text-center animate-pulse">
						Loading assessments...
					</div>
				) : tests.length === 0 ? (
					<div className="p-4 text-sm text-muted-foreground text-center">
						No assessments found for this course.
					</div>
				) : (
					<ScrollArea className="w-full whitespace-nowrap">
						<div className="flex w-full p-1 gap-3">
							{tests.map((test) => {
								const { dot, subtitle } = getTabStatus(test);
								const isSelected = selectedTest?.id === test.id;
								return (
									<button
										key={test.id}
										onClick={() => handleTabSelect(test)}
										className={`flex flex-col items-start min-w-[210px] rounded-xl px-4 py-3.5 text-left border transition-all duration-300 active:scale-95 ${
											isSelected
												? "border-violet-500/50 bg-violet-500/10 text-foreground shadow-lg shadow-violet-500/5"
												: "border-muted/60 bg-background/50 backdrop-blur-sm hover:bg-muted/40 hover:border-muted-foreground/20 text-muted-foreground"
										}`}
									>
										<div className="flex items-center gap-2 mb-1.5 font-bold text-sm w-full">
											<span
												className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`}
											/>
											<span className={`truncate ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-foreground/90"}`}>
												{test.name}
											</span>
										</div>
										<div className="text-xs font-medium opacity-90">
											{subtitle}
										</div>
									</button>
								);
							})}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				)}
			</div>

			{/* Main Content Area */}
			<div className="flex-1 overflow-hidden flex flex-col min-h-0">
				{!selectedTest ? (
					<div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
						<FileText className="w-10 h-10 text-muted-foreground/45 mb-3" />
						<p className="text-sm text-muted-foreground font-medium">
							Select an assessment tab above to manage marks
						</p>
					</div>
				) : viewMode === "by-question" ? (
					<FacultyMarksByQuestion
						selectedCourse={selectedCourse}
						selectedTest={selectedTest}
						headerContent={renderTabs()}
						onStatsUpdate={setStats}
						readOnly={readOnly}
					/>
				) : viewMode === "by-co" ? (
					<div className="flex-1 overflow-auto flex flex-col min-h-0">
						<Suspense
							fallback={
								<div className="p-6 space-y-4 flex-1">
									<Skeleton className="h-10 w-full rounded-lg animate-pulse" />
									<Skeleton className="h-[300px] w-full rounded-xl animate-pulse" />
								</div>
							}
						>
							<MarksEntryByCO
								test={selectedTest}
								course={selectedCourse}
								onBack={() => setViewMode("by-question")}
								embedded
								headerContent={renderTabs()}
								readOnly={readOnly}
							/>
						</Suspense>
					</div>
				) : (
					<div className="flex-1 overflow-auto flex flex-col min-h-0">
						<div className="px-6 py-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-muted/50 bg-background/40 backdrop-blur-md">
							<div className="flex items-center gap-3 flex-wrap">
								{renderTabs()}
							</div>
						</div>
						<div className="flex-1 overflow-auto">
							<Suspense
								fallback={
									<div className="p-6 space-y-4 flex-1">
										<Skeleton className="h-10 w-full rounded-lg animate-pulse" />
										<Skeleton className="h-[300px] w-full rounded-xl animate-pulse" />
									</div>
								}
							>
								<ViewTestMarks
									test={selectedTest}
									course={selectedCourse}
									onBack={() => setViewMode("by-question")}
									embedded
								/>
							</Suspense>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});
