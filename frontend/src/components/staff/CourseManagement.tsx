import { CourseDialog } from "./CourseDialog";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/features/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import { staffApi, type StaffCourse } from "@/services/api";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { getCourseColumns } from "./CourseManagement.columns";

interface Faculty {
	employee_id: string;
	username: string;
	email: string;
	role: string;
}

interface CourseFormData {
	course_code: string;
	name: string;
	credit: number;
	faculty_id: string;
	year: number;
	semester: string;
}

// Unused props removed

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];
const semesters = ["Spring", "Autumn"] as const;

export function CourseManagement() {
	const {
		data: courses,
		loading: isLoading,
		refresh: onRefresh,
		pagination,
		goNext,
		goPrev,
		canPrev,
		pageIndex,
		search,
		setSearch,
		filters,
		setFilter,
	} = usePaginatedData<StaffCourse, { year?: number; semester?: string }>({
		fetchFn: (params) => staffApi.getDepartmentCourses(params),
		limit: 50,
		defaultSort: "c.course_code",
	});

	const { data: faculty, loading: isLoadingFaculty } =
		usePaginatedData<Faculty>({
			fetchFn: (params) => staffApi.getDepartmentFaculty(params),
			limit: 100,
			defaultSort: "u.username",
		});
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<StaffCourse | null>(
		null,
	);
	const [formData, setFormData] = useState<CourseFormData>({
		course_code: "",
		name: "",
		credit: 3,
		faculty_id: "",
		year: currentYear,
		semester: "Spring",
	});
	const [editFormData, setEditFormData] = useState<CourseFormData>({
		course_code: "",
		name: "",
		credit: 3,
		faculty_id: "",
		year: currentYear,
		semester: "Spring",
	});

	const columns = useMemo<ColumnDef<StaffCourse>[]>(
		() =>
			getCourseColumns({
				onEdit: openEditDialog,
				onDelete: handleDeleteCourse,
			}),
		[],
	);

	const resetForm = () => {
		setFormData({
			course_code: "",
			name: "",
			credit: 3,
			faculty_id: "",
			year: currentYear,
			semester: "Spring",
		});
	};

	const handleCreateCourse = async () => {
		if (!formData.course_code || !formData.name || !formData.faculty_id) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);
		try {
			await staffApi.createCourse({
				...formData,
				semester: formData.semester,
			});
			toast.success("Course created successfully");
			setIsAddDialogOpen(false);
			resetForm();
			onRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to create course",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteCourse = async (courseId: number, courseName: string) => {
		try {
			await staffApi.deleteCourse(courseId);
			toast.success(`Course "${courseName}" deleted successfully`);
			onRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to delete course",
			);
		}
	};

	const openEditDialog = (course: StaffCourse) => {
		setSelectedCourse(course);
		setEditFormData({
			course_code: course.course_code,
			name: course.course_name,
			credit: course.credit,
			faculty_id: course.faculty_id ? String(course.faculty_id) : "",
			year: course.year ?? currentYear,
			semester: course.semester ?? "Spring",
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdateCourse = async () => {
		if (!selectedCourse) return;

		if (
			!editFormData.course_code ||
			!editFormData.name ||
			!editFormData.faculty_id
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSubmitting(true);
		try {
			await staffApi.updateCourse(selectedCourse.course_id, {
				...editFormData,
				semester: editFormData.semester,
			});
			toast.success("Course updated successfully");
			setIsEditDialogOpen(false);
			setSelectedCourse(null);
			onRefresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to update course",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
			<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
			<CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-muted/20 pt-6">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
						<BookOpen className="w-5 h-5" />
					</div>
					<div>
						<CardTitle className="text-lg font-bold text-foreground">Department Courses</CardTitle>
						<p className="text-xs font-medium text-muted-foreground mt-0.5">
							Manage courses for your department
						</p>
					</div>
				</div>
				<Button
					className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10 h-10 px-4"
					onClick={() => setIsAddDialogOpen(true)}
				>
					<Plus className="w-4 h-4" />
					Add Course
				</Button>
				<CourseDialog
					mode="add"
					open={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
					formData={formData}
					setFormData={setFormData}
					faculty={faculty}
					isLoadingFaculty={isLoadingFaculty}
					onSubmit={handleCreateCourse}
					isSubmitting={isSubmitting}
					onCancel={() => {
						setIsAddDialogOpen(false);
						resetForm();
					}}
					years={years}
					semesters={semesters}
				/>
			</CardHeader>
			<CardContent className="pt-6">
				<DataTable
					columns={columns}
					data={courses || []}
					refreshing={isLoading}
					serverPagination={{
						pagination,
						onNext: goNext,
						onPrev: goPrev,
						canPrev,
						pageIndex,
						search,
						onSearch: setSearch,
					}}
				>
					{() => (
						<div className="flex items-center gap-2 flex-wrap">
							<div className="flex items-center gap-1.5 bg-background/60 shadow-inner rounded-xl border border-muted/50 px-2 py-1">
								<Select
									value={
										filters.year !== undefined
											? String(filters.year)
											: ""
									}
									onValueChange={(v) =>
										setFilter("year", v ? Number(v) : undefined)
									}
								>
									<SelectTrigger className="w-[100px] bg-transparent border-0 shadow-none focus:ring-0 h-7 text-xs font-semibold focus-visible:ring-0">
										<SelectValue placeholder="All Years" />
									</SelectTrigger>
									<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
										{years.map((y) => (
											<SelectItem key={y} value={String(y)} className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg text-xs py-1.5">
												{y}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{filters.year !== undefined && (
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-md active:scale-95 duration-200 transition-all shrink-0"
										onClick={() => setFilter("year", undefined)}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>

							<div className="flex items-center gap-1.5 bg-background/60 shadow-inner rounded-xl border border-muted/50 px-2 py-1">
								<Select
									value={filters.semester ?? ""}
									onValueChange={(v) =>
										setFilter("semester", v || undefined)
									}
								>
									<SelectTrigger className="w-[130px] bg-transparent border-0 shadow-none focus:ring-0 h-7 text-xs font-semibold focus-visible:ring-0">
										<SelectValue placeholder="All Semesters" />
									</SelectTrigger>
									<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
										{semesters.map((s) => (
											<SelectItem key={s} value={s} className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg text-xs py-1.5">
												{s} Semester
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{filters.semester !== undefined && (
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-md active:scale-95 duration-200 transition-all shrink-0"
										onClick={() =>
											setFilter("semester", undefined)
										}
									>
										<X className="h-3 w-3" />
									</Button>
								)}
							</div>
						</div>
					)}
				</DataTable>
			</CardContent>

			{/* Edit Course Dialog */}
			<CourseDialog
				mode="edit"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formData={editFormData}
				setFormData={setEditFormData}
				faculty={faculty}
				isLoadingFaculty={isLoadingFaculty}
				onSubmit={handleUpdateCourse}
				isSubmitting={isSubmitting}
				onCancel={() => {
					setIsEditDialogOpen(false);
					setSelectedCourse(null);
				}}
				years={years}
				semesters={semesters}
			/>
		</Card>
	);
}
