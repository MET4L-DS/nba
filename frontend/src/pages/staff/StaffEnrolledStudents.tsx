import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, useOutletContext } from "react-router-dom";
import { AppHeader } from "@/components/layout";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, Trash2, ChevronLeft, Plus, GraduationCap, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { staffApi } from "@/services/api/staff";
import type { Enrollment, ProgrammeBatch } from "@/services/api";
import { StaffStudentUpload, type StudentEntry } from "@/components/staff/StaffStudentUpload";
import { StudentList } from "@/features/users/StudentList";

export function StaffEnrolledStudents() {
	const { sidebarOpen, setSidebarOpen } = useOutletContext<{
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}>();

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const type = searchParams.get("type") as "course" | "programme" | null;

	// Course Offering State
	const offeringIdStr = searchParams.get("offeringId");
	const offeringId = offeringIdStr ? parseInt(offeringIdStr, 10) : null;
	const courseCode = searchParams.get("courseCode") || "";
	const courseName = searchParams.get("courseName") || "";

	// Programme Batch State
	const programmeIdStr = searchParams.get("programmeId");
	const programmeId = programmeIdStr ? parseInt(programmeIdStr, 10) : null;
	const programmeName = searchParams.get("programmeName") || "";
	const initialBatchYear = searchParams.get("batchYear") || "";

	// Shared State
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [enrolling, setEnrolling] = useState(false);
	const [key, setKey] = useState(0); // To reset StaffStudentUpload
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Course Offering specific state
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
	const [loadingEnrollments, setLoadingEnrollments] = useState(false);

	// Programme specific state
	const [batches, setBatches] = useState<ProgrammeBatch[]>([]);
	const [loadingBatches, setLoadingBatches] = useState(false);
	const [selectedBatchYear, setSelectedBatchYear] = useState<string>(initialBatchYear);

	// Dialog for creating a new batch year (if none exist)
	const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
	const [newBatchYear, setNewBatchYear] = useState("");
	const [creatingBatch, setCreatingBatch] = useState(false);

	// Load course enrollments
	const loadEnrollments = async (id: number) => {
		setLoadingEnrollments(true);
		try {
			const data = await staffApi.getCourseEnrollments(id);
			setEnrollments(data.enrollments);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to load course enrollments",
			);
		} finally {
			setLoadingEnrollments(false);
		}
	};

	// Load programme batches
	const loadBatches = async (id: number) => {
		setLoadingBatches(true);
		try {
			const data = await staffApi.getBatchesByProgramme(id);
			setBatches(data);
			if (data.length > 0 && !selectedBatchYear) {
				// Select first active batch or just the first batch in list
				const activeBatch = data.find((b) => b.status === "active");
				setSelectedBatchYear(activeBatch ? String(activeBatch.batch_year) : String(data[0].batch_year));
			}
		} catch (error) {
			toast.error("Failed to load programme batches");
			console.error(error);
		} finally {
			setLoadingBatches(false);
		}
	};

	// Fetch data depending on active context
	useEffect(() => {
		if (type === "course" && offeringId) {
			loadEnrollments(offeringId);
			setStudents([]);
			setKey((k) => k + 1);
		} else if (type === "programme" && programmeId) {
			loadBatches(programmeId);
			setStudents([]);
			setKey((k) => k + 1);
		}
	}, [type, offeringId, programmeId, refreshTrigger]);

	// Course enrollments bulk commit
	const handleCourseEnrollSubmit = async () => {
		if (!offeringId) return;
		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const result = await staffApi.bulkEnrollStudents(offeringId, students);
			if (result.failure_count > 0) {
				toast.warning(
					`Enrollment completed with ${result.failure_count} failures. ${result.success_count} students enrolled successfully.`,
				);
			} else {
				toast.success(`All ${result.success_count} students enrolled successfully!`);
			}
			setStudents([]);
			setKey((k) => k + 1);
			await loadEnrollments(offeringId);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to enroll students",
			);
		} finally {
			setEnrolling(false);
		}
	};

	// Programme batch bulk commit
	const handleProgrammeEnrollSubmit = async () => {
		if (!programmeId) return;
		if (!selectedBatchYear) {
			toast.error("Please select or create a batch year first");
			return;
		}
		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const batchYearInt = parseInt(selectedBatchYear, 10);
			const payload = students.map((s) => ({
				rollno: s.rollno,
				name: s.name,
				batch_year: batchYearInt,
			}));

			const result = await staffApi.bulkEnrollStudentsToProgramme(programmeId, {
				students: payload,
			});

			if (result.failure_count > 0) {
				const details = result.failed
					.map((f: any) => `${f.rollno}: ${f.reason}`)
					.join("\n");
				toast.warning(
					`Enrolled ${result.success_count} student(s). ${result.failure_count} failed:\n${details}`,
				);
			} else {
				toast.success(`All ${result.success_count} students enrolled successfully!`);
			}

			setStudents([]);
			setKey((k) => k + 1);
			setRefreshTrigger((t) => t + 1); // Refresh StudentList
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to enroll students to programme batch",
			);
		} finally {
			setEnrolling(false);
		}
	};

	// Remove course enrollment
	const handleRemoveCourseEnrollment = async (rollno: string) => {
		if (!offeringId) return;
		try {
			await staffApi.removeEnrollment(offeringId, rollno);
			toast.success("Student removed from course successfully");
			await loadEnrollments(offeringId);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to remove student",
			);
		}
	};

	// Create new batch for programme
	const handleCreateBatch = async () => {
		if (!programmeId) return;
		const year = parseInt(newBatchYear.trim(), 10);
		if (isNaN(year) || year < 2010 || year > 2040) {
			toast.error("Please enter a valid batch year (between 2010 and 2040)");
			return;
		}

		setCreatingBatch(true);
		try {
			await staffApi.createBatch(programmeId, year, "active");
			toast.success(`Batch ${year} created successfully`);
			setIsNewBatchOpen(false);
			setNewBatchYear("");
			setSelectedBatchYear(String(year));
			setRefreshTrigger((t) => t + 1);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create batch year",
			);
		} finally {
			setCreatingBatch(false);
		}
	};

	const handleBack = () => {
		if (type === "course") {
			navigate("/staff/courses");
		} else {
			navigate("/staff/programmes");
		}
	};

	// Course Enrollment Columns
	const courseColumns = useMemo<ColumnDef<Enrollment>[]>(
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
					<div className="flex items-center gap-1.5 flex-wrap">
						<span className="font-semibold text-foreground">{row.original.student_name}</span>
						{row.original.is_repeater && (
							<Badge variant="secondary" className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-900 py-0 px-1 font-semibold uppercase tracking-wider">
								Repeater
							</Badge>
						)}
					</div>
				),
			},
			{
				accessorKey: "enrolled_at",
				header: "Enrolled At",
				cell: ({ row }) => (
					<span className="text-sm font-medium text-muted-foreground">
						{new Date(row.original.enrolled_at).toLocaleDateString(undefined, {
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
										({enrollment.student_rollno}) from this course? This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter className="mt-4 gap-2">
									<AlertDialogCancel className="bg-background/60 shadow-sm border-muted/50 rounded-xl active:scale-95 duration-200 transition-all font-semibold">
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => handleRemoveCourseEnrollment(enrollment.student_rollno)}
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
		[offeringId],
	);

	// Dummy course object to trigger resets in StaffStudentUpload
	const dummyCourseObj = useMemo(() => {
		if (type === "course") {
			return { offering_id: offeringId, course_code: courseCode } as any;
		}
		return { offering_id: programmeId, course_code: selectedBatchYear } as any;
	}, [type, offeringId, courseCode, programmeId, selectedBatchYear]);

	if (!type || (type === "course" && !offeringId) || (type === "programme" && !programmeId)) {
		return (
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AppHeader
					title="Enrolled Students"
					sidebarOpen={sidebarOpen}
					onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
				/>
				<div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
					<p className="text-muted-foreground font-medium text-sm">Invalid search query parameters or missing IDs.</p>
					<Button variant="outline" onClick={() => navigate("/staff/courses")}>
						Go to Courses
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background/50">
			<AppHeader
				title="Manage Enrolled Students"
				sidebarOpen={sidebarOpen}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>

			{/* Sub-header bar */}
			<div className="bg-card/40 border-b border-muted/40 p-4 md:px-6 flex items-center justify-between flex-shrink-0 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleBack}
						className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200 rounded-lg active:scale-90"
					>
						<ChevronLeft className="w-5 h-5" />
					</Button>
					<div>
						<h2 className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
							{type === "course" ? (
								<>
									<FileSpreadsheet className="w-4 h-4 text-amber-500 shrink-0" />
									Course Offering: <span className="font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-xs">{courseCode}</span> - {courseName}
								</>
							) : (
								<>
									<GraduationCap className="w-5 h-5 text-indigo-500 shrink-0" />
									Programme Batch: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{programmeName}</span>
								</>
							)}
						</h2>
						<p className="text-xs text-muted-foreground font-medium mt-0.5">
							{type === "course"
								? "View and enroll students for this specific semester course"
								: "View department catalog students and manage batch intakes"}
						</p>
					</div>
				</div>

				{/* Programme Batch Selection Bar */}
				{type === "programme" && (
					<div className="flex items-center gap-2">
						{loadingBatches ? (
							<Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
						) : (
							<>
								<Select value={selectedBatchYear} onValueChange={setSelectedBatchYear}>
									<SelectTrigger className="w-[140px] h-9 text-xs font-semibold bg-background shadow-sm border-muted/60 rounded-xl">
										<SelectValue placeholder="Select Batch" />
									</SelectTrigger>
									<SelectContent>
										{batches.map((batch) => (
											<SelectItem key={batch.batch_id} value={String(batch.batch_year)} className="text-xs font-medium">
												Batch {batch.batch_year} ({batch.status})
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{/* Create Batch Dialog */}
								<AlertDialog open={isNewBatchOpen} onOpenChange={setIsNewBatchOpen}>
									<AlertDialogTrigger asChild>
										<Button
											variant="outline"
											size="sm"
											className="h-9 gap-1 text-xs font-bold border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-xl"
										>
											<Plus className="w-3.5 h-3.5" />
											New Batch
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className="bg-card/95 backdrop-blur-lg border border-muted/50 rounded-2xl max-w-sm">
										<AlertDialogHeader>
											<AlertDialogTitle className="text-base font-bold text-foreground">
												Create New Batch
											</AlertDialogTitle>
											<AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
												Create a new intake year for this programme. Students can then be bulk enrolled under it.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<div className="py-4 space-y-2">
											<Label htmlFor="new-batch-year" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
												Batch Year *
											</Label>
											<Input
												id="new-batch-year"
												type="number"
												placeholder="e.g., 2026"
												value={newBatchYear}
												onChange={(e) => setNewBatchYear(e.target.value)}
												className="rounded-xl shadow-inner border-muted/50 font-mono text-sm h-10 bg-background/60"
											/>
										</div>
										<AlertDialogFooter className="gap-2">
											<AlertDialogCancel className="bg-background/60 shadow-sm border-muted/50 rounded-xl font-semibold text-xs h-9">
												Cancel
											</AlertDialogCancel>
											<Button
												onClick={handleCreateBatch}
												disabled={creatingBatch}
												className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl h-9 px-4 active:scale-95 transition-all shadow-md shadow-indigo-500/10"
											>
												{creatingBatch ? "Creating..." : "Create"}
											</Button>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</>
						)}
					</div>
				)}
			</div>

			{/* Main content grid */}
			<div className="flex-1 overflow-y-auto p-4 md:p-6">
				{type === "programme" && batches.length === 0 && !loadingBatches ? (
					<Card className="bg-card/45 border-muted/50 rounded-2xl p-8 max-w-lg mx-auto text-center shadow-md">
						<CardContent className="space-y-4 pt-4">
							<div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
								<Plus className="w-6 h-6" />
							</div>
							<h3 className="text-base font-bold text-foreground">No Batches Configured</h3>
							<p className="text-xs text-muted-foreground leading-relaxed">
								There are no intake batches set up for <strong className="text-foreground">{programmeName}</strong>.
								Please create a new batch year to start enrolling and viewing students.
							</p>
							<div className="pt-2">
								<Input
									type="number"
									placeholder="e.g., 2025"
									value={newBatchYear}
									onChange={(e) => setNewBatchYear(e.target.value)}
									className="rounded-xl shadow-inner max-w-[180px] mx-auto text-center font-mono border-muted/50 mb-3 bg-background/60"
								/>
								<Button
									onClick={handleCreateBatch}
									disabled={creatingBatch}
									className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl px-5 py-2 active:scale-95 duration-200 transition-all border border-indigo-500/30 shadow-md shadow-indigo-500/10"
								>
									{creatingBatch ? "Creating..." : "Create Intake Batch"}
								</Button>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
						{/* Bulk enroll card */}
						<Card className="lg:col-span-5 bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl relative group overflow-hidden shadow-md">
							<div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${type === "course" ? "from-amber-500 via-orange-500 to-transparent" : "from-indigo-500 via-purple-500 to-transparent"}`} />
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
									<Users className={`w-4 h-4 ${type === "course" ? "text-amber-500" : "text-indigo-500"}`} />
									{type === "course" ? "Add Students to Course" : "Add Students to Batch"}
								</CardTitle>
								<p className="text-xs font-medium text-muted-foreground mt-0.5">
									{type === "course"
										? "Enroll students in this course via CSV file or manual entry"
										: `Enroll students in Batch ${selectedBatchYear} via CSV or manual entry`}
								</p>
							</CardHeader>
							<CardContent className="space-y-4">
								<StaffStudentUpload
									key={key}
									course={dummyCourseObj}
									onStudentsChange={setStudents}
								/>
								{students.length > 0 && (
									<Button
										onClick={type === "course" ? handleCourseEnrollSubmit : handleProgrammeEnrollSubmit}
										disabled={enrolling}
										className={`w-full mt-4 h-11 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all shadow-md ${
											type === "course"
												? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border border-orange-500/30 shadow-orange-500/10"
												: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/30 shadow-indigo-500/10"
										}`}
									>
										{enrolling ? (
											<div className="flex items-center justify-center gap-2">
												<Loader2 className="animate-spin h-4 w-4 text-white" />
												<span>Enrolling Students...</span>
											</div>
										) : (
											<div className="flex items-center justify-center gap-2">
												<Users className="w-4 h-4" />
												<span>Enroll {students.length} Student{students.length !== 1 ? "s" : ""}</span>
											</div>
										)}
									</Button>
								)}
							</CardContent>
						</Card>

						{/* Display students list */}
						<div className="lg:col-span-7 space-y-4">
							{type === "course" ? (
								<Card className="bg-card/45 backdrop-blur-md border border-muted/50 rounded-2xl relative group overflow-hidden shadow-md">
									<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-transparent" />
									<CardHeader className="pb-3 border-b border-muted/20">
										<div className="flex items-center justify-between">
											<div className="space-y-0.5">
												<CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
													<Users className="w-4 h-4 text-amber-500" />
													Current Enrollments
												</CardTitle>
												<p className="text-xs font-medium text-muted-foreground">
													Students currently registered in this semester course offering
												</p>
											</div>
											<Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm font-bold rounded-lg text-xs px-2.5 py-1">
												{enrollments.length} Student{enrollments.length !== 1 ? "s" : ""}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-4 max-h-[60vh] overflow-y-auto">
										<DataTable
											columns={courseColumns}
											data={enrollments}
											refreshing={loadingEnrollments}
										/>
									</CardContent>
								</Card>
							) : (
								selectedBatchYear && (
									<div className="space-y-2">
										<div className="flex items-center justify-between px-1">
											<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
												<GraduationCap className="w-4 h-4 text-indigo-500" />
												Current Batch Students
											</h3>
											<Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm font-bold rounded-lg text-xs px-2.5 py-1">
												Batch Year: {selectedBatchYear}
											</Badge>
										</div>
										<StudentList
											key={`student-list-${programmeId}-${selectedBatchYear}-${refreshTrigger}`}
											fetchFn={(params) =>
												staffApi.getDepartmentStudents({
													...params,
													programme_id: String(programmeId),
													batch_year: selectedBatchYear,
												})
											}
											permissions={{
												canEdit: true,
												canDelete: true,
												canViewDepartment: false,
											}}
											title={`Enrolled Students in ${programmeName}`}
											availableFilters={["status"]}
											hideHeader={true}
											onRefresh={() => setRefreshTrigger((t) => t + 1)}
										/>
									</div>
								)
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
