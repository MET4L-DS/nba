import { lazy, Suspense } from "react";
import { useFacultyHome } from "./hooks/useFacultyHome";
import { FacultyWelcomeCard } from "./components/FacultyWelcomeCard";
import { StatsGrid, QuickAccessGrid } from "@/features/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const pageVariants = {
	initial: { opacity: 0, y: 15 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -15 },
};

const pageTransition = {
	duration: 0.45,
	ease: [0.16, 1, 0.3, 1] as const,
};

// Lazy load heavy FacultyOverview component for improved code-splitting and faster initial page hydration
const FacultyOverview = lazy(() =>
	import("@/components/faculty").then((module) => ({
		default: module.FacultyOverview,
	})),
);

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
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={pageVariants}
			transition={pageTransition}
			className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
		>
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

			{/* Heavy table/analytics section loaded asynchronously */}
			<Suspense
				fallback={
					<div className="space-y-4">
						<Skeleton className="h-10 w-48 rounded-lg" />
						<Skeleton className="h-64 w-full rounded-xl" />
					</div>
				}
			>
				<FacultyOverview
					courses={courses}
					isLoading={isLoadingCourses}
				/>
			</Suspense>
		</motion.div>
	);
}
