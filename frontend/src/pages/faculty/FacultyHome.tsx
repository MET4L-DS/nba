import { useFacultyHome } from "@/components/faculty/hooks/useFacultyHome";
import { FacultyWelcomeCard } from "@/components/faculty/components/FacultyWelcomeCard";
import { StatsGrid } from "@/features/shared/StatsCard";
import { QuickAccessGrid } from "@/features/shared/QuickAccessCard";
import { FacultyOverview } from "@/components/faculty/FacultyOverview";

export function FacultyHome() {
	const {
		user,
		courses,
		selectedCourse,
		isLoadingCourses,
		statsLoading,
		facultyStats,
		quickAccessItems,
		handleQuickAccessClick,
	} = useFacultyHome();

	return (
		<div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
			{/* Extracted static UI header: prevents unnecessary rerenders when stats load */}
			<FacultyWelcomeCard
				user={user}
				selectedCourse={selectedCourse}
			/>

			{/* Core Dashboard KPI Metrics */}
			<StatsGrid
				stats={facultyStats}
				isLoading={statsLoading}
				variant="solid"
				columns={4}
			/>

			{/* Feature Portal Navigation */}
			<QuickAccessGrid
				items={quickAccessItems}
				onItemClick={handleQuickAccessClick}
				variant="elevated"
				columns={4}
			/>

			{/* Heavy table/analytics section */}
			<FacultyOverview
				courses={courses}
				isLoading={isLoadingCourses}
			/>
		</div>
	);
}
