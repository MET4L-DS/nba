import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
import type { Course, CourseStats } from "@/services/api";

interface UseFacultyAssessmentsProps {
	selectedCourse: Course | null;
}

export function useFacultyAssessments({ selectedCourse }: UseFacultyAssessmentsProps) {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEnrollDialog, setShowEnrollDialog] = useState(false);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [testsCount, setTestsCount] = useState(0);
	const [courseStats, setCourseStats] = useState<CourseStats | null>(null);
	const [statsLoading, setStatsLoading] = useState(false);

	const triggerRefresh = useCallback(() => {
		setRefreshTrigger((prev) => prev + 1);
	}, []);

	useEffect(() => {
		if (!selectedCourse?.offering_id) {
			setCourseStats(null);
			return;
		}
		let cancelled = false;
		setStatsLoading(true);
		apiService
			.getFacultyCourseStats(selectedCourse.offering_id)
			.then((data) => {
				if (!cancelled) setCourseStats(data);
			})
			.catch((err) => {
				console.error("[FacultyAssessments] Stats fetch failed:", err);
				if (!cancelled) setCourseStats(null);
			})
			.finally(() => {
				if (!cancelled) setStatsLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [selectedCourse?.offering_id]);

	useEffect(() => {
		if (!selectedCourse?.offering_id || refreshTrigger === 0) return;
		apiService
			.getFacultyCourseStats(selectedCourse.offering_id)
			.then((data) => {
				setCourseStats(data);
			})
			.catch((err) =>
				console.error(
					"[FacultyAssessments] Stats refresh failed:",
					err,
				),
			);
	}, [refreshTrigger, selectedCourse?.offering_id]);

	return {
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
	};
}
