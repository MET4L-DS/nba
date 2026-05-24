import { memo } from "react";
import type { Course } from "@/services/api";
import { AssignedCoursesCard } from "./components/AssignedCoursesCard";
import { PerformanceInsightsCard } from "./components/PerformanceInsightsCard";

interface FacultyOverviewProps {
	courses: Course[];
	isLoading: boolean;
	onRefresh?: () => void;
}

export const FacultyOverview = memo(function FacultyOverview({
	courses,
	isLoading,
	onRefresh,
}: FacultyOverviewProps) {
	return (
		<div className="space-y-6">
			<AssignedCoursesCard
				courses={courses}
				isLoading={isLoading}
				onRefresh={onRefresh}
			/>
			<PerformanceInsightsCard courses={courses} />
		</div>
	);
}, (prevProps, nextProps) => {
	// Deep equality comparison to prevent unneeded heavy reconciliations
	if (prevProps.isLoading !== nextProps.isLoading) return false;
	if (prevProps.onRefresh !== nextProps.onRefresh) return false;

	if (prevProps.courses.length !== nextProps.courses.length) return false;
	for (let i = 0; i < prevProps.courses.length; i++) {
		if (prevProps.courses[i] !== nextProps.courses[i]) return false;
	}

	return true;
});
