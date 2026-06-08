import { useState, useMemo } from "react";
import { toast } from "sonner";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type {
	AdminCourse,
	PaginationParams,
	PaginatedResponse,
	Department,
} from "@/services/api";
import { DataTable } from "@/features/shared/DataTable";
import type { Row } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CourseFormDialog } from "./CourseFormDialog";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { ReopenCourseDialog } from "./ReopenCourseDialog";
import { createCourseColumns, type CourseListColumnConfig } from "./utils";
import { motion } from "framer-motion";

export interface CourseListProps {
	// Data source
	fetchFn?: (
		params: PaginationParams,
	) => Promise<PaginatedResponse<AdminCourse>>;
	initialFilters?: Record<string, string | number | undefined>;
	clientData?: AdminCourse[];

	permissions?: {
		canEdit?: boolean;
		canDelete?: boolean;
		canCreate?: boolean;
		canViewDepartment?: boolean;
		allowDepartmentFilter?: boolean;
		canViewCOPO?: boolean;
		canManageEnrollment?: boolean;
	};

	// UI customization
	title?: string;
	hideHeader?: boolean;
	showFaculty?: boolean;
	showDepartment?: boolean;
	showYear?: boolean;
	showSemester?: boolean;
	showCredits?: boolean;
	showType?: boolean;
	showLevel?: boolean;
	showStatus?: boolean;
	showEnrollment?: boolean;
	showTests?: boolean;
	showAverageScore?: boolean;

	// Expandable rows
	expandable?: boolean;
	renderSubRow?: (row: Row<AdminCourse>) => React.ReactNode;

	// Pagination
	paginationMode?: "server" | "client";
	pageSize?: number;

	// Filters
	availableFilters?: (
		| "department"
		| "year"
		| "semester"
		| "status"
		| "type"
	)[];
	departments?: Department[];

	// Events
	onCourseUpdate?: (courseId: number, data: any) => Promise<void>;
	onCourseDelete?: (courseId: number) => Promise<void>;
	onCourseCreate?: (data: any) => Promise<void>;
	onCourseReopen?: (courseId: number) => Promise<void>;
	onRefresh?: () => void;
	onViewCOPO?: (course: AdminCourse) => void;
	onManageEnrollment?: (course: AdminCourse) => void;

	mode?: "base" | "offering";

	department_id?: number | null;
}

export function CourseList({
	fetchFn,
	initialFilters,
	clientData,
	permissions = {},
	title = "Courses",
	mode = "offering",
	hideHeader = false,
	showFaculty = true,
	showDepartment = permissions.canViewDepartment,
	showYear = true,
	showSemester = true,
	showCredits = true,
	showType = false,
	showLevel = false,
	showStatus = false,
	showEnrollment = true,
	showTests = false,
	showAverageScore = false,
	expandable = false,
	renderSubRow,
	paginationMode = fetchFn ? "server" : "client",
	pageSize = 20,
	availableFilters = ["year", "semester"],
	departments = [],
	onCourseUpdate,
	onCourseDelete,
	onCourseCreate,
	onCourseReopen,
	onRefresh,
	onViewCOPO,
	onManageEnrollment,
	department_id,
}: CourseListProps) {
	// Dialog state
	const [editTarget, setEditTarget] = useState<AdminCourse | null>(null);
	const [editSaving, setEditSaving] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [createSaving, setCreateSaving] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);
	const [deleteSaving, setDeleteSaving] = useState(false);
	const [reopenTarget, setReopenTarget] = useState<AdminCourse | null>(null);
	const [reopenSaving, setReopenSaving] = useState(false);

	// Data fetching
	const {
		data: serverCourses,
		loading: serverLoading,
		error,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		setFilter,
		filters,
		sort,
		sortDir,
		setSort,
		refresh,
		setLimit,
	} = usePaginatedData<
		AdminCourse,
		Record<string, string | number | undefined>
	>({
		fetchFn:
			fetchFn ||
			(() =>
				Promise.resolve({
					data: [],
					pagination: {} as any,
					success: true,
					message: "",
				})),
		limit: pageSize,
		initialFilters: {
			department_id: department_id || undefined,
			...initialFilters,
		},
		defaultSort: "-course_code",
	});

	// Client-side filtering
	const filteredClientData = useMemo(() => {
		if (!clientData) return [];

		return clientData.filter((course) => {
			const matchesYear =
				!filters.year ||
				course.year?.toString() === filters.year?.toString();
			const semesterFilter = filters.semester as string | undefined;
			const matchesSemester =
				!semesterFilter ||
				(semesterFilter === "Autumn" &&
					(String(course.semester).toLowerCase() === "autumn" ||
						Number(course.semester) % 2 === 1)) ||
				(semesterFilter === "Spring" &&
					(String(course.semester).toLowerCase() === "spring" ||
						Number(course.semester) % 2 === 0));
			const matchesSearch =
				!search ||
				course.course_code
					.toLowerCase()
					.includes(search.toLowerCase()) ||
				course.course_name.toLowerCase().includes(search.toLowerCase());
			return matchesYear && matchesSemester && matchesSearch;
		});
	}, [clientData, filters, search]);

	// Determine which data to display
	const courses =
		paginationMode === "client" ? filteredClientData : serverCourses;
	const isLoading = paginationMode === "client" ? false : serverLoading;

	// Column configuration
	const columnConfig: CourseListColumnConfig = {
		showFaculty,
		showDepartment,
		showYear,
		showSemester,
		showCredits,
		showType,
		showLevel,
		showStatus,
		showEnrollment,
		showTests,
		showAverageScore,
		canEdit: permissions.canEdit,
		canDelete: permissions.canDelete,
		canReopen: !!onCourseReopen,
		canViewCOPO: permissions.canViewCOPO || !!onViewCOPO,
		canManageEnrollment: permissions.canManageEnrollment,
		expandable,
	};

	// Handle edit
	const handleEditSave = async (courseId: number | undefined, data: any) => {
		if (!onCourseUpdate || !courseId) return;

		setEditSaving(true);
		try {
			await onCourseUpdate(courseId, data);
			toast.success("Course updated successfully");
			setEditTarget(null);
			onRefresh?.();
			refresh();
		} catch (err) {
			toast.error("Failed to update course");
			console.error(err);
		} finally {
			setEditSaving(false);
		}
	};

	// Handle create
	const handleCreate = async (data: any) => {
		if (!onCourseCreate) return;

		setCreateSaving(true);
		try {
			await onCourseCreate(data);
			toast.success("Course created successfully");
			setCreateOpen(false);
			onRefresh?.();
			refresh();
		} catch (err) {
			toast.error("Failed to create course");
			console.error(err);
		} finally {
			setCreateSaving(false);
		}
	};

	// Handle delete
	const handleDelete = async (courseId: number | undefined) => {
		if (!onCourseDelete || !courseId) return;

		setDeleteSaving(true);
		try {
			await onCourseDelete(courseId);
			toast.success("Course deleted successfully");
			setDeleteTarget(null);
			onRefresh?.();
			refresh();
		} catch (err) {
			toast.error("Failed to delete course");
			console.error(err);
		} finally {
			setDeleteSaving(false);
		}
	};

// Handle reopen - just set the target, dialog will handle confirmation
	const handleReopenClick = (course: AdminCourse) => {
		setReopenTarget(course);
	};

	const handleReopenConfirm = async () => {
		if (!onCourseReopen || !reopenTarget) return;
		const courseId = reopenTarget.offering_id || reopenTarget.course_id;
		if (!courseId) return;

		setReopenSaving(true);
		try {
			await onCourseReopen(courseId);
			toast.success("Course reopened successfully");
			refresh();
		} catch (err) {
			toast.error("Failed to reopen course");
			console.error(err);
		} finally {
			setReopenSaving(false);
		}
	};

	// Create columns
	const columns = useMemo(
		() =>
			createCourseColumns(
				columnConfig,
				setEditTarget,
				(course: AdminCourse) => {
					setDeleteTarget(course);
				},
				onViewCOPO,
				handleReopenClick,
				onManageEnrollment,
			),
		[courses, columnConfig, onViewCOPO, onCourseReopen, handleReopenClick, onManageEnrollment],
	);

	if (error) {
		return (
			<div className="text-red-500 p-4">
				Failed to load courses: {error}
			</div>
		);
	}

	const hasActiveFilters =
		!!filters.year ||
		!!filters.semester ||
		filters.is_active !== undefined ||
		filters.department_id !== undefined ||
		!!search;

	return (
		<motion.div
			initial={{ opacity: 0, y: 15 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
			className="space-y-4 w-full"
		>
			{!hideHeader && (
				<div className="flex items-center justify-between">
					<motion.div
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1, duration: 0.3 }}
					>
						<h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							{title}
						</h2>
						<p className="text-sm text-muted-foreground">
							Total: <span className="font-semibold text-foreground/90">{courses.length}</span> course
							{courses.length !== 1 ? "s" : ""}
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.15, duration: 0.3 }}
						className="flex gap-2"
					>
						{permissions.canCreate && (
							<Button
								onClick={() => setCreateOpen(true)}
								disabled={isLoading}
								className="gap-2 active:scale-95 transition-transform duration-100 cursor-pointer shadow-sm hover:shadow"
							>
								<Plus className="h-4 w-4" />
								New Course
							</Button>
						)}
						{onRefresh && (
							<Button
								variant="outline"
								onClick={onRefresh}
								disabled={isLoading}
								className="active:scale-95 transition-transform duration-100 cursor-pointer hover:bg-muted/50"
							>
								Refresh
							</Button>
						)}
					</motion.div>
				</div>
			)}

			<Card className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative">
				<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-primary/80 to-emerald-500"></div>
				<CardHeader className="py-4 border-b border-muted/20 bg-muted/[.03]">
					<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						<BookOpen className="h-5 w-5 text-primary" />
						Offered Academic Courses
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<DataTable
						columns={columns}
						data={courses || []}
						refreshing={isLoading}
						renderSubRow={renderSubRow}
						{...(paginationMode === "server" && {
							serverPagination: {
								pageIndex,
								search,
								onSearch: setSearch,
								onNext: goNext,
								onPrev: goPrev,
								canPrev: canPrev && pageIndex > 0,
								pagination: pagination,
								filters,
								setFilter,
								sort,
								sortDir,
								setSort,
								onLimitChange: setLimit,
							},
						})}
					>
						{(_, currentFilters, currentSetFilter) => {
							// For client mode, fallback to our hook state since serverPagination isn't passed
							const actualFilters =
								paginationMode === "server" && currentFilters
									? currentFilters
									: filters;
							const actualSetFilter =
								paginationMode === "server" && currentSetFilter
									? currentSetFilter
									: setFilter;

							return (
								<>
									{availableFilters.includes("year") && (
										<Select
											value={
												(actualFilters?.year as string) ||
												"all"
											}
											onValueChange={(val) =>
												actualSetFilter(
													"year",
													val === "all"
														? undefined
														: val,
												)
											}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9 w-[120px]">
												<SelectValue placeholder="Year" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													All Years
												</SelectItem>
												{[...Array(5)].map((_, i) => {
													const year =
														new Date().getFullYear() -
														i;
													return (
														<SelectItem
															key={year}
															value={year.toString()}
														>
															{year}
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									)}

									{availableFilters.includes("semester") && (
										<Select
											value={
												(actualFilters?.semester as string) ||
												"all"
											}
											onValueChange={(val) =>
												actualSetFilter(
													"semester",
													val === "all"
														? undefined
														: val,
												)
											}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9 w-[130px]">
												<SelectValue placeholder="Semester" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													All Semesters
												</SelectItem>
												<SelectItem value="Spring">
													Spring
												</SelectItem>
												<SelectItem value="Autumn">
													Autumn
												</SelectItem>
											</SelectContent>
										</Select>
									)}

									{availableFilters.includes("department") &&
										permissions.allowDepartmentFilter && (
											<Select
												value={
													(actualFilters?.department_id as unknown as string) ||
													"all"
												}
												onValueChange={(val) =>
													actualSetFilter(
														"department_id",
														val === "all"
															? undefined
															: val,
													)
												}
												disabled={isLoading}
											>
												<SelectTrigger className="h-9 w-40">
													<SelectValue placeholder="All Departments" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="all">
														All Departments
													</SelectItem>
													{departments.map((dept) => (
														<SelectItem
															key={
																dept.department_id
															}
															value={dept.department_id.toString()}
														>
															{
																dept.department_code
															}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)}

									{availableFilters.includes("type") && (
										<Select
											value={
												(actualFilters?.course_type as unknown as string) ||
												"all"
											}
											onValueChange={(val) =>
												actualSetFilter(
													"course_type",
													val === "all"
														? undefined
														: val,
												)
											}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9 w-[130px]">
												<SelectValue placeholder="All Types" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													All Types
												</SelectItem>
												<SelectItem value="Theory">
													Theory
												</SelectItem>
												<SelectItem value="Practical">
													Practical
												</SelectItem>
											</SelectContent>
										</Select>
									)}

									{availableFilters.includes("status") && (
										<Select
											value={
												actualFilters?.is_active ===
												undefined
													? "all"
													: String(
															actualFilters.is_active,
														)
											}
											onValueChange={(val) =>
												actualSetFilter(
													"is_active",
													val === "all"
														? undefined
														: val === "1"
															? 1
															: 0,
												)
											}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9 w-[130px]">
												<SelectValue placeholder="Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">
													All Statuses
												</SelectItem>
												<SelectItem value="1">
													Active
												</SelectItem>
												<SelectItem value="0">
													Inactive
												</SelectItem>
											</SelectContent>
										</Select>
									)}

									{hasActiveFilters && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setSearch("");
												actualSetFilter(
													"year",
													undefined,
												);
												actualSetFilter(
													"semester",
													undefined,
												);
												actualSetFilter(
													"department_id",
													department_id?.toString() ||
														undefined,
												);
												actualSetFilter(
													"is_active",
													undefined,
												);
											}}
											disabled={isLoading}
											className="h-9 px-2"
										>
											Clear
											<X className="ml-2 h-4 w-4" />
										</Button>
									)}
								</>
							);
						}}
					</DataTable>
				</CardContent>
			</Card>

			{/* Dialogs */}
			<CourseFormDialog
				mode="edit"
				courseType={mode}
				open={!!editTarget}
				initialData={editTarget}
				onOpenChange={(open) => !open && setEditTarget(null)}
				onSave={(data) =>
					handleEditSave(
						mode === "offering"
							? (editTarget?.offering_id ?? undefined)
							: editTarget?.course_id,
						data,
					)
				}
				isLoading={editSaving}
			/>
			<CourseFormDialog
				mode="create"
				courseType={mode}
				open={createOpen}
				onOpenChange={setCreateOpen}
				onSave={handleCreate}
				isLoading={createSaving}
			/>
<DeleteCourseDialog
				open={!!deleteTarget}
				course={deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				onConfirm={async () => {
					if (!deleteTarget) return;
					const targetId =
						mode === "offering"
							? (deleteTarget.offering_id ?? undefined)
							: deleteTarget.course_id;
					await handleDelete(targetId);
				}}
				isLoading={deleteSaving}
			/>
			<ReopenCourseDialog
				open={!!reopenTarget}
				course={reopenTarget}
				onOpenChange={(open) => !open && setReopenTarget(null)}
				onConfirm={handleReopenConfirm}
				isLoading={reopenSaving}
			/>
		</motion.div>
	);
}
