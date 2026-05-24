import { useState, useCallback, useMemo } from "react";
import { facultyApi } from "@/services/api/faculty";
import type { Course } from "@/services/api";
import { toast } from "sonner";

interface UseFacultyOverviewProps {
	courses: Course[];
	onRefresh?: () => void;
}

export function useFacultyOverview({ courses, onRefresh }: UseFacultyOverviewProps) {
	const [activeTab, setActiveTab] = useState("active");
	const [concludeData, setConcludeData] = useState<{
		isOpen: boolean;
		course: Course | null;
		isConcluding: boolean;
		canConclude: boolean;
		incompleteTests: string[];
	}>({
		isOpen: false,
		course: null,
		isConcluding: false,
		canConclude: true,
		incompleteTests: [],
	});

	const handleConcludeCourse = useCallback(async () => {
		if (!concludeData.course || !concludeData.canConclude) return;
		const offeringId =
			concludeData.course.offering_id || concludeData.course.course_id;

		setConcludeData((prev) => ({ ...prev, isConcluding: true }));

		try {
			await facultyApi.concludeCourse(offeringId);
			toast.success("Course session concluded successfully", {
				description: "Rollbacks are not possible. Session deactivated.",
			});
			setConcludeData({
				isOpen: false,
				course: null,
				isConcluding: false,
				canConclude: true,
				incompleteTests: [],
			});
			if (onRefresh) onRefresh();
		} catch (error) {
			console.error("Failed to conclude course", error);
			toast.error("Failed to conclude course", {
				description:
					"You might not be authorized or the server encountered an error.",
			});
			setConcludeData((prev) => ({ ...prev, isConcluding: false }));
		}
	}, [concludeData.course, concludeData.canConclude, onRefresh]);

	const openConcludeDialog = useCallback(async (course: Course) => {
		const offeringId = course.offering_id || course.course_id;
		try {
			const status =
				await facultyApi.checkCourseCompletionStatus(offeringId);
			setConcludeData({
				isOpen: true,
				course,
				isConcluding: false,
				canConclude: status.can_conclude,
				incompleteTests: status.incomplete_tests,
			});
		} catch (error) {
			console.error("Failed to check course status", error);
			toast.error("Failed to check course status");
		}
	}, []);

	const handleOpenChange = useCallback((open: boolean) => {
		setConcludeData((prev) => {
			if (prev.isConcluding) return prev;
			return { ...prev, isOpen: open };
		});
	}, []);

	const activeCourses = useMemo(
		() => courses.filter((c) => c.is_active !== 0),
		[courses],
	);
	
	const pastCourses = useMemo(
		() => courses.filter((c) => c.is_active === 0),
		[courses],
	);

	const tableData = useMemo(() => {
		return activeTab === "active" ? activeCourses : pastCourses;
	}, [activeTab, activeCourses, pastCourses]);

	return {
		activeTab,
		setActiveTab,
		concludeData,
		handleConcludeCourse,
		openConcludeDialog,
		handleOpenChange,
		activeCourses,
		pastCourses,
		tableData,
	};
}
