import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { assessmentsApi } from "@/services/api/assessments";
import type { Course, Test } from "@/services/api";
import { debugLogger } from "@/lib/debugLogger";

interface UseTestsListProps {
	course: Course | null;
	refreshTrigger: number;
	onCountChange?: (count: number) => void;
}

export function useTestsList({
	course,
	refreshTrigger,
	onCountChange,
}: UseTestsListProps) {
	const courseId = course?.offering_id ?? course?.course_id;
	const onCountChangeRef = useRef(onCountChange);
	onCountChangeRef.current = onCountChange;

	const [tests, setTests] = useState<Test[]>([]);
	const [loading, setLoading] = useState(!!courseId);
	const hasInitialLoadedRef = useRef(false);

	if (!loading && courseId) {
		hasInitialLoadedRef.current = true;
	}

	const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
	const [showDetailsDialog, setShowDetailsDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [testToDelete, setTestToDelete] = useState<Test | null>(null);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const loadTests = useCallback(async () => {
		if (!courseId) return;

		setLoading(true);
		try {
			const testsData = await apiService.getCourseTests(courseId);
			console.log("Tests received in component:", testsData);

			const arr = Array.isArray(testsData) ? testsData : [];
			setTests(arr);
			onCountChangeRef.current?.(arr.length);
		} catch (error) {
			console.error("Failed to load tests:", error);
			setTests([]);
		} finally {
			setLoading(false);
		}
	}, [courseId]);

	useEffect(() => {
		if (courseId) {
			hasInitialLoadedRef.current = false;
			loadTests();
		} else {
			setTests([]);
			hasInitialLoadedRef.current = false;
		}
	}, [courseId, refreshTrigger, loadTests]);

	const handleDeleteClick = useCallback((test: Test) => {
		setTestToDelete(test);
		setDeleteConfirmation("");
		setShowDeleteDialog(true);
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!testToDelete || deleteConfirmation !== "Yes") {
			return;
		}

		debugLogger.info("useTestsList", "Submitting delete assessment request", {
			testId: testToDelete.id,
			testName: testToDelete.name,
			courseId,
		});

		setIsDeleting(true);
		try {
			const result = await assessmentsApi.deleteTest(testToDelete.id);

			debugLogger.info("useTestsList", "Assessment deleted successfully", {
				testId: testToDelete.id,
				result,
			});

			toast.success("Test deleted successfully", {
				description: `${result.questions_deleted} questions and marks for ${result.students_affected} students were removed.`,
			});

			await loadTests();

			setShowDeleteDialog(false);
			setTestToDelete(null);
			setDeleteConfirmation("");
		} catch (error) {
			debugLogger.error("useTestsList", "Failed to delete test", error);
			console.error("Failed to delete test:", error);
			toast.error("Failed to delete test", {
				description:
					error instanceof Error ? error.message : "An error occurred",
			});
		} finally {
			setIsDeleting(false);
		}
	}, [testToDelete, deleteConfirmation, loadTests, courseId]);

	return {
		tests,
		loading,
		hasInitialLoadedRef,
		selectedTestId,
		setSelectedTestId,
		showDetailsDialog,
		setShowDetailsDialog,
		showDeleteDialog,
		setShowDeleteDialog,
		testToDelete,
		setTestToDelete,
		deleteConfirmation,
		setDeleteConfirmation,
		isDeleting,
		handleDeleteClick,
		handleDeleteConfirm,
		loadTests,
	};
}
