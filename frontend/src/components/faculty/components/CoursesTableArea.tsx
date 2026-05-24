import { memo, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/features/shared/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OfferingTestAverages } from "../OfferingTestAverages";
import { getFacultyOverviewColumns } from "../FacultyOverview.columns";
import { useDeferredMount } from "@/lib/useDeferredMount";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@/services/api";
import { ConcludeCourseDialog } from "./ConcludeCourseDialog";
import { useFacultyOverview } from "../hooks/useFacultyOverview";

interface CoursesTableAreaProps {
	courses: Course[];
	isLoading: boolean;
	onRefresh?: () => void;
}

export const CoursesTableArea = memo(function CoursesTableArea({
	courses,
	isLoading,
	onRefresh,
}: CoursesTableAreaProps) {
	const navigate = useNavigate();
	const isTableMounted = useDeferredMount(120);
	const hasInitialLoadedRef = useRef(false);

	if (!isLoading) {
		hasInitialLoadedRef.current = true;
	}

	const shouldShowTable = isTableMounted && hasInitialLoadedRef.current;

	const {
		activeTab,
		setActiveTab,
		concludeData,
		handleConcludeCourse,
		openConcludeDialog,
		handleOpenChange,
		activeCourses,
		pastCourses,
		tableData,
	} = useFacultyOverview({ courses, onRefresh });

	const columns = useMemo(
		() => getFacultyOverviewColumns(openConcludeDialog, navigate),
		[openConcludeDialog, navigate],
	);

	const renderSubRow = useCallback((row: any) => {
		const offeringId = row.original.offering_id;
		if (!offeringId) return null;
		return <OfferingTestAverages offeringId={offeringId} />;
	}, []);

	return (
		<div className="w-full space-y-4">
			<Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="active" className="w-full">
				<div className="flex flex-wrap gap-4 items-center justify-between mb-4 bg-card/40 border border-muted/50 rounded-xl p-2 backdrop-blur-sm w-fit">
					<TabsList className="bg-muted/50 p-1 rounded-lg">
						<TabsTrigger value="active" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
							Active Courses ({activeCourses.length})
						</TabsTrigger>
						<TabsTrigger value="past" className="px-4 py-1.5 text-xs font-semibold rounded-md data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200">
							Course History ({pastCourses.length})
						</TabsTrigger>
					</TabsList>
				</div>

				{shouldShowTable ? (
					<DataTable
						columns={columns}
						data={tableData}
						refreshing={isLoading}
						renderSubRow={renderSubRow}
					/>
				) : (
					<div className="space-y-3 pt-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="flex gap-4 items-center">
								<Skeleton className="h-9 w-20 rounded-lg shrink-0" />
								<Skeleton className="h-9 flex-1 rounded-lg" />
								<Skeleton className="h-9 w-16 rounded-lg shrink-0 hidden sm:block" />
								<Skeleton className="h-9 w-12 rounded-lg shrink-0 hidden sm:block" />
								<Skeleton className="h-9 w-20 rounded-lg shrink-0" />
							</div>
						))}
					</div>
				)}
			</Tabs>

			{concludeData.isOpen && (
				<ConcludeCourseDialog
					open={concludeData.isOpen}
					onOpenChange={handleOpenChange}
					canConclude={concludeData.canConclude}
					isConcluding={concludeData.isConcluding}
					course={concludeData.course}
					incompleteTests={concludeData.incompleteTests}
					onConclude={handleConcludeCourse}
				/>
			)}
		</div>
	);
});
