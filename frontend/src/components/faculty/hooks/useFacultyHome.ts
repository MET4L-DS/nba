import { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import type { User, FacultyStats, Course } from "@/services/api";
import { createFacultyStats } from "@/features/shared/statsFactory";
import { createFacultyQuickAccess } from "@/features/shared/quickAccessFactory";
import { debugLogger } from "@/lib/debugLogger";

export function useFacultyHome() {
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

	debugLogger.info("FacultyHome", "useFacultyHome hook initialized", { user: user?.username });

	const [stats, setStats] = useState<FacultyStats>({
		totalCourses: 0,
		totalAssessments: 0,
		totalStudents: 0,
		averageAttainment: 0,
	});
	const [statsLoading, setStatsLoading] = useState(true);

	const facultyStats = useMemo(() => createFacultyStats(stats), [stats]);
	const quickAccessItems = useMemo(() => createFacultyQuickAccess(), []);

	const handleQuickAccessClick = useCallback((nav: string) => {
		navigate(`/faculty/${nav}`);
	}, [navigate]);

	const loadStats = useCallback(async (options?: { bypassCache?: boolean }) => {
		debugLogger.debug("FacultyHome", "Loading faculty stats in hook...");
		setStatsLoading(true);
		try {
			const statsData = await apiService.getFacultyStats(options);
			debugLogger.info("FacultyHome", "Faculty stats loaded in hook", {
				stats: statsData,
				totalCourses: statsData.totalCourses,
				totalAssessments: statsData.totalAssessments,
				totalStudents: statsData.totalStudents
			});
			setStats(statsData);
		} catch (error) {
			debugLogger.error("FacultyHome", "Failed to load faculty stats in hook", error);
			console.error("Failed to load faculty stats:", error);
			setStats({
				totalCourses: courses ? courses.length : 0,
				totalAssessments: 0,
				totalStudents: 0,
				averageAttainment: 0,
			});
		} finally {
			setStatsLoading(false);
			debugLogger.debug("FacultyHome", "Stats loading completed in hook");
		}
	}, [courses]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	return {
		user,
		courses,
		selectedCourse,
		isLoadingCourses,
		statsLoading,
		facultyStats,
		quickAccessItems,
		handleQuickAccessClick,
		loadStats
	};
}
