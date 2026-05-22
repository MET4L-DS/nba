import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/features/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BookOpen, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { staffApi } from "@/services/api";
import type { StaffCourse, Enrollment } from "@/services/api";
import { usePaginatedData } from "@/lib/usePaginatedData";
import { StaffStudentUpload } from "./StaffStudentUpload";

interface StudentEntry {
	rollno: string;
	name: string;
}

export function StaffEnrollmentView() {
	const currentYear = new Date().getFullYear();
	const currentSemester = new Date().getMonth() < 6 ? "Spring" : "Autumn";

	const {
		data: courses,
		refresh: refreshCourses,
		loading: isLoading,
	} = usePaginatedData<StaffCourse>({
		fetchFn: (params) =>
			staffApi.getDepartmentCourses({
				...params,
				year: currentYear.toString(),
				semester: currentSemester,
			}),
		limit: 100,
	});
	const [selectedCourse, setSelectedCourse] = useState<StaffCourse | null>(
		null,
	);
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
	const [loadingEnrollments, setLoadingEnrollments] = useState(false);
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [enrolling, setEnrolling] = useState(false);

	const enrollmentColumns = useMemo<ColumnDef<Enrollment>[]>(
		() => [
			{
				accessorKey: "student_rollno",
				header: "Roll No",
				cell: ({ row }) => (
					<span className="font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-xs font-semibold shadow-sm">
						{row.original.student_rollno}
					</span>
				),
			},
			{
				accessorKey: "student_name",
				header: "Name",
				cell: ({ row }) => (
					<span className="font-semibold text-foreground">{row.original.student_name}</span>
				),
			},
			{
				accessorKey: "enrolled_at",
				header: "Enrolled At",
				cell: ({ row }) => (
					<span className="text-sm font-medium text-muted-foreground">
						{new Date(
							row.original.enrolled_at,
						).toLocaleDateString(undefined, {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</span>
				),
			},
			{
				id: "actions",
				header: "Actions",
				cell: ({ row }) => {
					const enrollment = row.original;
					return (
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 duration-200 transition-all rounded-lg"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent className="bg-card/90 backdrop-blur-lg border border-muted/50 rounded-2xl max-w-md">
								<AlertDialogHeader>
									<AlertDialogTitle className="text-lg font-bold text-foreground">
										Remove Student
									</AlertDialogTitle>
									<AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
										Are you sure you want to remove{" "}
										<strong className="text-foreground font-semibold">
											{enrollment.student_name}
										</strong>{" "}
										({enrollment.student_rollno}) from this
										course? This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className="mt-4 gap-2">
									<AlertDialogCancel className="bg-background/60 shadow-sm border-muted/50 rounded-xl active:scale-95 duration-200 transition-all font-semibold">
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() =>
											handleRemoveEnrollment(
												enrollment.student_rollno,
											)
										}
										className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-red-500/30 shadow-md shadow-red-500/10"
									>
										Remove
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					);
				},
			},
		],
		[selectedCourse],
	);

	const handleCourseChange = async (courseId: string) => {
		const course = courses.find((c) => c.course_id.toString() === courseId);
		setSelectedCourse(course || null);
		setEnrollments([]);
		setStudents([]);

		if (course) {
			await loadEnrollments(course.offering_id!);
		}
	};

	const loadEnrollments = async (offeringId: number) => {
		setLoadingEnrollments(true);
		try {
			const data = await staffApi.getCourseEnrollments(offeringId);
			setEnrollments(data.enrollments);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to load enrollments",
			);
		} finally {
			setLoadingEnrollments(false);
		}
	};

	const handleEnroll = async () => {
		if (!selectedCourse) {
			toast.error("No course selected");
			return;
		}

		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const result = await staffApi.bulkEnrollStudents(
				selectedCourse.offering_id!,
				students,
			);

			if (result.failure_count > 0) {
				toast.warning(
					`Enrollment completed with ${result.failure_count} failures. ${result.success_count} students enrolled successfully.`,
				);
			} else {
				toast.success(
					`All ${result.success_count} students enrolled successfully!`,
				);
			}

			// Reset and reload
			setStudents([]);
			await loadEnrollments(selectedCourse.offering_id!);
			refreshCourses();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to enroll students",
			);
		} finally {
			setEnrolling(false);
		}
	};

	const handleRemoveEnrollment = async (rollno: string) => {
		if (!selectedCourse) return;

		try {
			await staffApi.removeEnrollment(
				selectedCourse.offering_id!,
				rollno,
			);
			toast.success("Student removed from course successfully");
			await loadEnrollments(selectedCourse.offering_id!);
			refreshCourses();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to remove student",
			);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Course Selection */}
			<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
						<BookOpen className="w-5 h-5 text-amber-500" />
						Select Course
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Select
						value={selectedCourse?.course_id.toString() || ""}
						onValueChange={handleCourseChange}
					>
						<SelectTrigger className="w-full md:w-[400px] bg-background/60 shadow-inner focus:ring-1 focus:ring-amber-500/30 transition-all rounded-xl border-muted/50 h-10">
							<SelectValue placeholder="Select a course to manage enrollments" />
						</SelectTrigger>
						<SelectContent className="bg-card/95 backdrop-blur-md border border-muted/50 rounded-xl">
							{courses.map((course) => (
								<SelectItem
									key={course.offering_id || course.course_id}
									value={course.course_id.toString()}
									className="focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400 rounded-lg py-2"
								>
									<span className="font-mono mr-2 font-semibold text-amber-600 dark:text-amber-400">
										{course.course_code}
									</span>
									<span className="text-muted-foreground font-medium">- {course.course_name}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{selectedCourse && (
				<>
					{/* Enrollment Section */}
					<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
								<Users className="w-5 h-5 text-amber-500" />
								Add Students to Course
							</CardTitle>
							<p className="text-xs font-medium text-muted-foreground mt-0.5">
								Enroll students using CSV upload or manual entry
							</p>
						</CardHeader>
						<CardContent>
							<div className="mb-4">
								<StaffStudentUpload
									course={selectedCourse}
									onStudentsChange={setStudents}
								/>
							</div>
							{students.length > 0 && (
								<Button
									onClick={handleEnroll}
									disabled={enrolling}
									className="w-full mt-4 h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10"
								>
									{enrolling ? (
										<div className="flex items-center justify-center gap-2">
											<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
											<span>Enrolling Students...</span>
										</div>
									) : (
										<div className="flex items-center justify-center gap-2">
											<Users className="w-4 h-4" />
											<span>Enroll {students.length} Students</span>
										</div>
									)}
								</Button>
							)}
						</CardContent>
					</Card>

					{/* Current Enrollments */}
					<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
						<CardHeader className="pb-3 border-b border-muted/20">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
										<Users className="w-5 h-5 text-amber-500" />
										Current Enrollments
									</CardTitle>
									<p className="text-xs font-medium text-muted-foreground">
										Students enrolled in{" "}
										<span className="font-semibold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
											{selectedCourse.course_code}
										</span>
										{" "}- {selectedCourse.course_name}
									</p>
								</div>
								<Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm font-semibold rounded-lg">
									{enrollments.length} Student{enrollments.length !== 1 ? "s" : ""}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="pt-4">
							<DataTable
								columns={enrollmentColumns}
								data={enrollments}
								refreshing={loadingEnrollments}
							/>
						</CardContent>
					</Card>
				</>
			)}

			{!selectedCourse && (
				<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
					<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
					<CardContent className="flex flex-col items-center justify-center py-16">
						<BookOpen className="w-12 h-12 text-amber-500/40 mb-4 animate-pulse" />
						<h3 className="text-lg font-bold text-foreground">
							Select a Course
						</h3>
						<p className="text-xs font-medium text-muted-foreground mt-2 max-w-sm text-center leading-relaxed">
							Choose a course from the dropdown above to manage student enrollments, upload CSV cohorts, or update manual lists
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
