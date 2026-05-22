import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import type { User, FacultyStats, Course } from "@/services/api";
import { StatsGrid, QuickAccessGrid } from "@/features/shared";
import { createFacultyStats } from "@/features/shared/statsFactory";
import { createFacultyQuickAccess } from "@/features/shared/quickAccessFactory";
import { FacultyOverview } from "@/components/faculty";
import { debugLogger } from "@/lib/debugLogger";
import { motion } from "framer-motion";

export function FacultyHome() {
	const navigate = useNavigate();
	const {
		user,
		courses,
		selectedCourse,
		isLoadingCourses,
	} = useOutletContext<{
		user: User;
		courses: Course[];
		selectedCourse: Course | null;
		isLoadingCourses: boolean;
	}>();

	debugLogger.info("FacultyHome", "Component mounted", { user: user?.username });

	const [stats, setStats] = useState<FacultyStats>({
		totalCourses: 0,
		totalAssessments: 0,
		totalStudents: 0,
		averageAttainment: 0,
	});
	const [statsLoading, setStatsLoading] = useState(true);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async (options?: { bypassCache?: boolean }) => {
		debugLogger.debug("FacultyHome", "Loading faculty stats...");
		setStatsLoading(true);
		try {
			const statsData = await apiService.getFacultyStats(options);
			debugLogger.info("FacultyHome", "Faculty stats loaded", {
				stats: statsData,
				totalCourses: statsData.totalCourses,
				totalAssessments: statsData.totalAssessments,
				totalStudents: statsData.totalStudents
			});
			setStats(statsData);
		} catch (error) {
			debugLogger.error("FacultyHome", "Failed to load faculty stats", error);
			console.error("Failed to load faculty stats:", error);
			setStats({
				totalCourses: courses.length,
				totalAssessments: 0,
				totalStudents: 0,
				averageAttainment: 0,
			});
		} finally {
			setStatsLoading(false);
			debugLogger.debug("FacultyHome", "Stats loading completed");
		}
	};

	const pageVariants = {
		initial: { opacity: 0, y: 15 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -15 },
	};

	const pageTransition = {
		duration: 0.45,
		ease: [0.16, 1, 0.3, 1] as const,
	};

	return (
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={pageVariants}
			transition={pageTransition}
			className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
		>
			<div className="flex flex-wrap gap-4 items-center justify-between bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative overflow-hidden mb-2">
				<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-primary/20 pointer-events-none"></div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						Welcome, {user.username}
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{selectedCourse
							? `Currently managing ${selectedCourse.course_code} — ${selectedCourse.course_name}`
							: "Overview of your assigned courses and student performance."}
					</p>
				</div>
			</div>

			<StatsGrid
				stats={createFacultyStats(stats)}
				isLoading={statsLoading}
				variant="solid"
				columns={4}
			/>
			<QuickAccessGrid
				items={createFacultyQuickAccess()}
				onItemClick={(nav) => navigate(`/faculty/${nav}`)}
				variant="elevated"
				columns={4}
			/>
			<FacultyOverview
				courses={courses}
				isLoading={isLoadingCourses}
			/>
		</motion.div>
	);
}

