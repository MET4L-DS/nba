import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { usePaginatedData } from "@/lib/usePaginatedData";
import type {
	PaginationParams,
	PaginatedResponse,
	BaseCourse,
} from "@/services/api";
import { DataTable } from "@/features/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { CourseFormDialog } from "./CourseFormDialog";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { sortableHeader } from "../shared/tableUtils";

export interface BaseCourseListProps {
	fetchFn?: (
		params: PaginationParams,
	) => Promise<PaginatedResponse<BaseCourse>>;

	permissions?: {
		canEdit?: boolean;
		canDelete?: boolean;
		canCreate?: boolean;
		canOffer?: boolean;
	};

	title?: string;
	hideHeader?: boolean;
	pageSize?: number;

	onCourseUpdate?: (courseId: number, data: any) => Promise<void>;
	onCourseDelete?: (courseId: number) => Promise<void>;
	onCourseCreate?: (data: any) => Promise<void>;
	onOfferCourse?: (baseCourse: BaseCourse) => void;
	onRefresh?: () => void;
}

function createBaseCourseColumns(
	canEdit?: boolean,
	canDelete?: boolean,
	canOffer?: boolean,
	onEdit?: (course: BaseCourse) => void,
	onDelete?: (courseId: number) => void,
	onOffer?: (course: BaseCourse) => void,
): ColumnDef<BaseCourse>[] {
	const columns: ColumnDef<BaseCourse>[] = [
		{
			accessorKey: "course_code",
			header: sortableHeader("Code"),
			cell: ({ row }) => (
				<Badge variant="outline" className="font-mono text-xs">
					{row.getValue("course_code")}
				</Badge>
			),
		},
		{
			accessorKey: "course_name",
			header: sortableHeader("Course Name"),
			cell: ({ row }) => (
				<div className="font-medium max-w-[250px] truncate">
					{row.getValue("course_name")}
				</div>
			),
		},
		{
			accessorKey: "course_type",
			header: "Type",
			cell: ({ row }) => (
				<Badge variant="secondary" className="text-xs">
					{(row.getValue("course_type") as string) ?? "—"}
				</Badge>
			),
		},
		{
			accessorKey: "course_level",
			header: "Level",
			cell: ({ row }) => {
				const val = row.getValue("course_level") as string;
				const label = val === "Undergraduate" ? "UG" : (val === "Postgraduate" ? "PG" : (val ?? "—"));
				return (
					<span className="text-sm">
						{label}
					</span>
				);
			},
		},
		{
			accessorKey: "credit",
			header: "Credits",
			cell: ({ row }) => (
				<div className="text-center">
					<Badge variant="outline">
						{(row.getValue("credit") as number) ?? "—"}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "is_active",
			header: "Status",
			cell: ({ row }) => {
				const status = row.getValue("is_active") as number | undefined;
				return (
					<Badge
						variant="outline"
						className={
							status === 1
								? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold shadow-sm"
								: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-semibold shadow-sm"
						}
					>
						{status === 1 ? "Active" : "Inactive"}
					</Badge>
				);
			},
		},
	];

	if (canEdit || canDelete || canOffer) {
		columns.push({
			id: "actions",
			header: "Actions",
			cell: ({ row }) => (
				<div className="flex gap-2">
					{canOffer && onOffer && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onOffer(row.original)}
							className="text-xs text-primary hover:text-primary hover:bg-primary/[0.06] font-semibold active:scale-95 duration-200 transition-all"
						>
							Offer
						</Button>
					)}
					{canEdit && onEdit && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 active:scale-95 duration-200 transition-all"
							onClick={() => onEdit(row.original)}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					)}
					{canDelete && onDelete && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50 active:scale-95 duration-200 transition-all"
							onClick={() => onDelete(row.original.course_id)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			),
		});
	}

	return columns;
}

export function BaseCourseList({
	fetchFn,
	permissions = {},
	title = "Course Catalog",
	hideHeader = false,
	pageSize = 20,
	onCourseUpdate,
	onCourseDelete,
	onCourseCreate,
	onOfferCourse,
	onRefresh,
}: BaseCourseListProps) {
	// Dialog controls
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingCourse, setEditingCourse] = useState<BaseCourse | null>(null);
	const [deletingCourseId, setDeletingCourseId] = useState<number | null>(
		null,
	);
	const [saving, setSaving] = useState(false);

	// Data fetching
	const {
		data: courses,
		loading: isLoading,
		error,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
		sort,
		sortDir,
		setSort,
		setLimit,
		refresh,
	} = usePaginatedData<
		BaseCourse,
		{ is_active?: string; year?: string; course_type?: string }
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
		defaultSort: "course_code",
		defaultSortDir: "ASC",
	});

	// Handlers
	const handleCreate = useCallback(
		async (data: any) => {
			if (!onCourseCreate) return;
			setSaving(true);
			try {
				await onCourseCreate(data);
				toast.success("Course template created successfully");
				setIsCreateDialogOpen(false);
				refresh();
			} catch (error: any) {
				toast.error(error.message || "Failed to create course");
			} finally {
				setSaving(false);
			}
		},
		[onCourseCreate, refresh],
	);

	const handleUpdate = useCallback(
		async (courseId: number | undefined, data: any) => {
			if (!onCourseUpdate || !courseId) return;
			setSaving(true);
			try {
				await onCourseUpdate(courseId, data);
				toast.success("Course template updated successfully");
				setEditingCourse(null);
				refresh();
			} catch (error: any) {
				toast.error(error.message || "Failed to update course");
			} finally {
				setSaving(false);
			}
		},
		[onCourseUpdate, refresh],
	);

	const handleDelete = useCallback(async () => {
		if (!onCourseDelete || !deletingCourseId) return;
		setSaving(true);
		try {
			await onCourseDelete(deletingCourseId);
			toast.success("Course template deleted successfully");
			setDeletingCourseId(null);
			refresh();
		} catch (error: any) {
			toast.error(error.message || "Failed to delete course");
		} finally {
			setSaving(false);
		}
	}, [onCourseDelete, deletingCourseId, refresh]);

	// Filter courses by status and search (handled server-side now)
	const filteredCourses = courses;

	// Create columns
	const columns = useMemo(
		() =>
			createBaseCourseColumns(
				permissions.canEdit,
				permissions.canDelete,
				permissions.canOffer,
				(course) => setEditingCourse(course),
				(courseId) => setDeletingCourseId(courseId),
				onOfferCourse ? (course) => onOfferCourse(course) : undefined,
			),
		[permissions, onOfferCourse],
	);

	if (error) {
		return (
			<div className="text-red-500 p-4">
				Failed to load courses: {error}
			</div>
		);
	}

	return (
		<div className="space-y-4 w-full">
			{!hideHeader && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold tracking-tight">
								{title}
							</h2>
							<p className="text-muted-foreground">
								Total: {filteredCourses.length} course
								{filteredCourses.length !== 1 ? "s" : ""}
							</p>
						</div>
						<div className="flex gap-2">
							{permissions.canCreate && (
								<Button
									onClick={() => setIsCreateDialogOpen(true)}
									disabled={isLoading}
									className="gap-2"
								>
									<Plus className="h-4 w-4" />
									New Template
								</Button>
							)}
							{onRefresh && (
								<Button
									variant="outline"
									onClick={() => {
										refresh();
										onRefresh?.();
									}}
									disabled={isLoading}
								>
									Refresh
								</Button>
							)}
						</div>
					</div>

					<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
						<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary/80 via-primary/50 to-transparent"></div>
						<CardHeader className="py-4 border-b bg-muted/[.06]">
							<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
								Course Templates Catalog
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-6">
							<DataTable
								columns={columns}
								data={filteredCourses || []}
								refreshing={isLoading}
								serverPagination={{
									pagination,
									onNext: goNext,
									onPrev: goPrev,
									canPrev,
									pageIndex,
									search,
									onSearch: setSearch,
									onLimitChange: setLimit,
									sort,
									sortDir,
									setSort,
								}}
							>
								{/* Custom Filters inside header */}
								<div className="flex gap-4 flex-wrap items-center">
									<div className="relative">
										<Input
											placeholder="Search by code or name..."
											value={search}
											onChange={(e) =>
												setSearch(e.target.value)
											}
											className="pl-8 h-9 w-[200px] lg:w-[300px]"
											disabled={isLoading}
										/>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</div>

									<div className="w-[150px]">
										<Select
											value={filters.is_active || "all"}
											onValueChange={(val) => {
												setFilter("is_active", val === "all" ? undefined : val);
											}}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9">
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
									</div>

									<div className="w-[150px]">
										<Select
											value={filters.course_type || "all"}
											onValueChange={(val) => {
												setFilter("course_type", val === "all" ? undefined : val);
											}}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9">
												<SelectValue placeholder="Course Type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Types</SelectItem>
												<SelectItem value="Theory">Theory</SelectItem>
												<SelectItem value="Lab">Lab</SelectItem>
												<SelectItem value="Project">Project</SelectItem>
												<SelectItem value="Seminar">Seminar</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="w-[150px]">
										<Select
											value={filters.year || "all"}
											onValueChange={(val) => {
												setFilter("year", val === "all" ? undefined : val);
											}}
											disabled={isLoading}
										>
											<SelectTrigger className="h-9">
												<SelectValue placeholder="Offering Year" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Years</SelectItem>
												{Array.from(
													{ length: 8 },
													(_, i) => new Date().getFullYear() - 5 + i,
												)
													.reverse()
													.map((y) => (
														<SelectItem key={y} value={y.toString()}>
															{y}
														</SelectItem>
													))}
											</SelectContent>
										</Select>
									</div>

									{(search || filters.is_active || filters.course_type || filters.year) && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setSearch("");
												setFilter("is_active", undefined);
												setFilter("course_type", undefined);
												setFilter("year", undefined);
											}}
											disabled={isLoading}
										>
											<X className="h-4 w-4 mr-1" />
											Clear
										</Button>
									)}
								</div>
							</DataTable>
						</CardContent>
					</Card>

					{permissions.canCreate && (
						<CourseFormDialog
							mode="create"
							courseType="base"
							open={isCreateDialogOpen}
							onOpenChange={setIsCreateDialogOpen}
							onSave={handleCreate}
							isLoading={saving}
						/>
					)}

					{permissions.canEdit && editingCourse && (
						<CourseFormDialog
							mode="edit"
							courseType="base"
							open={!!editingCourse}
							initialData={editingCourse}
							onOpenChange={(open) =>
								!open && setEditingCourse(null)
							}
							onSave={(data) =>
								handleUpdate(editingCourse.course_id, data)
							}
							isLoading={saving}
						/>
					)}

					{permissions.canDelete && deletingCourseId && (
						<DeleteCourseDialog
							open={!!deletingCourseId}
							course={
								{
									course_id: deletingCourseId,
									course_name:
										courses.find(
											(c) =>
												c.course_id ===
												deletingCourseId,
										)?.course_name || "this course",
								} as any
							}
							onOpenChange={(open) =>
								!open && setDeletingCourseId(null)
							}
							onConfirm={async () => handleDelete()}
							isLoading={saving}
						/>
					)}
				</div>
			)}
		</div>
	);
}
