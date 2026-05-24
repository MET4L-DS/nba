import { useState, useEffect, useMemo, useCallback } from "react";
import { facultyApi } from "@/services/api/faculty";
import type { EnrolledStudent } from "@/services/api";
import { toast } from "sonner";

export function useFacultyStudents() {
	const [allStudents, setAllStudents] = useState<EnrolledStudent[]>([]);
	const [loading, setLoading] = useState(true);

	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [batchInput, setBatchInput] = useState("");
	const [batchFilter, setBatchFilter] = useState("");

	const [editTarget, setEditTarget] = useState<EnrolledStudent | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<EnrolledStudent | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// Debounce batch year
	useEffect(() => {
		const t = setTimeout(() => setBatchFilter(batchInput), 500);
		return () => clearTimeout(t);
	}, [batchInput]);

	const hasFilters = useMemo(() => {
		return statusFilter !== "all" || batchFilter !== "";
	}, [statusFilter, batchFilter]);

	const loadStudents = useCallback(async () => {
		setLoading(true);
		try {
			const response = await facultyApi.getEnrolledStudents({
				limit: 1000,
			});
			setAllStudents(response.data);
		} catch {
			toast.error("Failed to load students");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadStudents();
	}, [loadStudents]);

	const filtered = useMemo(() => {
		let result = allStudents;
		if (statusFilter !== "all") {
			result = result.filter(
				(s) =>
					s.student_status?.toLowerCase() ===
					statusFilter.toLowerCase(),
			);
		}
		if (batchFilter) {
			result = result.filter((s) => String(s.batch_year) === batchFilter);
		}
		return result;
	}, [allStudents, statusFilter, batchFilter]);

	const resetFilters = useCallback(() => {
		setStatusFilter("all");
		setBatchInput("");
		setBatchFilter("");
	}, []);

	const handleDelete = useCallback(async () => {
		if (!deleteTarget) return;
		setDeleteLoading(true);
		try {
			await facultyApi.removeStudentEnrollment(deleteTarget.roll_no);
			toast.success(
				`${deleteTarget.student_name} removed from your course enrollments`,
			);
			setAllStudents((prev) =>
				prev.filter((s) => s.roll_no !== deleteTarget.roll_no),
			);
			setDeleteTarget(null);
		} catch {
			toast.error("Failed to remove student");
		} finally {
			setDeleteLoading(false);
		}
	}, [deleteTarget]);

	const handleEditSuccess = useCallback((updatedStudent: Partial<EnrolledStudent>) => {
		setAllStudents((prev) =>
			prev.map((s) =>
				s.roll_no === updatedStudent.roll_no
					? ({ ...s, ...updatedStudent } as any)
					: s,
			),
		);
	}, []);

	return {
		allStudents,
		loading,
		statusFilter,
		setStatusFilter,
		batchInput,
		setBatchInput,
		batchFilter,
		hasFilters,
		editTarget,
		setEditTarget,
		deleteTarget,
		setDeleteTarget,
		deleteLoading,
		filtered,
		loadStudents,
		resetFilters,
		handleDelete,
		handleEditSuccess,
	};
}
export type UseFacultyStudentsReturn = ReturnType<typeof useFacultyStudents>;
