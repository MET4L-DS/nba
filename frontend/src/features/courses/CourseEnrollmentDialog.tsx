import { useState, useEffect, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/features/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
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
import { Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { staffApi } from "@/services/api/staff";
import type { AdminCourse, Enrollment } from "@/services/api";
import { StaffStudentUpload, type StudentEntry } from "@/components/staff/StaffStudentUpload";

interface CourseEnrollmentDialogProps {
	course: AdminCourse | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onRefreshParent?: () => void;
}

export function CourseEnrollmentDialog({
	course,
	open,
	onOpenChange,
	onRefreshParent,
}: CourseEnrollmentDialogProps) {
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
	const [loadingEnrollments, setLoadingEnrollments] = useState(false);
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [enrolling, setEnrolling] = useState(false);
	const [key, setKey] = useState(0); // Key to force re-render/reset StaffStudentUpload

	// Load enrollments when course changes or dialog opens
	useEffect(() => {
		if (open && course && course.offering_id) {
			loadEnrollments(course.offering_id);
			setStudents([]);
			setKey((k) => k + 1);
		} else {
			setEnrollments([]);
			setStudents([]);
		}
	}, [open, course]);

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
		if (!course || !course.offering_id) {
			toast.error("No course offering available");
			return;
		}

		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const result = await staffApi.bulkEnrollStudents(
				course.offering_id,
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
			setKey((k) => k + 1);
			await loadEnrollments(course.offering_id);
			onRefreshParent?.();
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
		if (!course || !course.offering_id) return;

		try {
			await staffApi.removeEnrollment(
				course.offering_id,
				rollno,
			);
			toast.success("Student removed from course successfully");
			await loadEnrollments(course.offering_id);
			onRefreshParent?.();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to remove student",
			);
		}
	};

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
		[course],
	);

	if (!course) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-2xl shadow-2xl">
				<DialogHeader className="border-b border-muted/20 pb-4 mb-4">
					<DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						<Users className="w-6 h-6 text-amber-500" />
						Manage Enrollments
					</DialogTitle>
					<p className="text-xs font-semibold text-muted-foreground mt-1">
						Course:{" "}
						<span className="font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mr-1">
							{course.course_code}
						</span>{" "}
						- {course.course_name}
					</p>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
					{/* Add Students Section */}
					<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-xl relative group overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
								<Users className="w-4 h-4 text-amber-500" />
								Add Students to Course
							</CardTitle>
							<p className="text-xs font-medium text-muted-foreground mt-0.5">
								Enroll students using CSV upload or manual entry
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<StaffStudentUpload
								key={key}
								course={course as any}
								onStudentsChange={setStudents}
							/>
							{students.length > 0 && (
								<Button
									onClick={handleEnroll}
									disabled={enrolling}
									className="w-full mt-4 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10"
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

					{/* Current Enrollments List */}
					<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-xl relative group overflow-hidden">
						<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
						<CardHeader className="pb-3 border-b border-muted/20">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
										<Users className="w-4 h-4 text-amber-500" />
										Current Enrollments
									</CardTitle>
									<p className="text-xs font-medium text-muted-foreground">
										Students enrolled in this offering
									</p>
								</div>
								<Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm font-semibold rounded-lg">
									{enrollments.length} Student{enrollments.length !== 1 ? "s" : ""}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="pt-4 max-h-[50vh] overflow-y-auto">
							<DataTable
								columns={enrollmentColumns}
								data={enrollments}
								refreshing={loadingEnrollments}
							/>
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}
