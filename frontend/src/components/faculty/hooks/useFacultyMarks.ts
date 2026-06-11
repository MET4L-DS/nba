import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { apiService } from "@/services/api";
import type { Course, Test } from "@/services/api";

type ViewMode = "by-question" | "by-co" | "bulk";

interface UseFacultyMarksProps {
	selectedCourse: Course | null;
}

export function useFacultyMarks({ selectedCourse }: UseFacultyMarksProps) {
	const courseId = selectedCourse?.offering_id ?? selectedCourse?.course_id;
	const location = useLocation();
	const stateTestId = location.state?.testId;

	const [tests, setTests] = useState<Test[]>([]);
	const [testsLoading, setTestsLoading] = useState(false);
	const [selectedTest, setSelectedTest] = useState<Test | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("by-question");
	const [stats, setStats] = useState<{
		entered: number;
		total: number;
		average: string;
	} | null>(null);

	const loadTests = useCallback(async () => {
		if (!courseId) return;
		setTestsLoading(true);
		try {
			const testsData = await apiService.getCourseTests(courseId);
			const list: Test[] = Array.isArray(testsData) ? testsData : [];
			setTests(list);
			if (list.length > 0) {
				const matchingTest = stateTestId ? list.find(t => t.id === stateTestId) : null;
				setSelectedTest(matchingTest || list[0]);
			} else {
				setSelectedTest(null);
			}
		} catch (err) {
			console.error("Failed to load tests:", err);
			setTests([]);
			setSelectedTest(null);
		} finally {
			setTestsLoading(false);
		}
	}, [courseId, stateTestId]);

	useEffect(() => {
		if (courseId) {
			loadTests();
		} else {
			setTests([]);
			setSelectedTest(null);
		}
	}, [courseId, loadTests]);

	const handleTabSelect = useCallback((test: Test) => {
		setSelectedTest((current) => {
			if (current?.id === test.id) return current;
			setStats(null);
			return test;
		});
	}, []);

	const getTabStatus = useCallback((test: Test) => {
		if (
			test.id !== selectedTest?.id ||
			viewMode !== "by-question" ||
			!stats ||
			stats.total === 0
		) {
			return {
				dot: "bg-muted-foreground/30",
				subtitle: `Full Marks: ${test.full_marks || "?"}`,
			};
		}
		const pct = Math.round((stats.entered / stats.total) * 100);
		const dot =
			stats.entered === 0
				? "bg-muted-foreground/30"
				: stats.entered === stats.total
					? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
					: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
		const label =
			stats.entered === 0
				? "Pending"
				: stats.entered === stats.total
					? "Completed"
					: `${pct}% Entered`;
		return {
			dot,
			subtitle: `${label} | Full: ${test.full_marks || "?"}`,
		};
	}, [selectedTest?.id, viewMode, stats]);

	return {
		tests,
		testsLoading,
		selectedTest,
		setSelectedTest,
		viewMode,
		setViewMode,
		stats,
		setStats,
		handleTabSelect,
		getTabStatus,
	};
}
