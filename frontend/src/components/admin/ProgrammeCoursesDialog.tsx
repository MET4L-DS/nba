import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/api/admin";
import type { Programme, ProgrammeCourse, ProgrammeCourseResponse } from "@/services/api";

interface ProgrammeCourseApi {
	getProgrammeCourses: (programmeId: number) => Promise<ProgrammeCourseResponse>;
	addProgrammeCourse: (programmeId: number, courseId: number) => Promise<void>;
	removeProgrammeCourse: (programmeId: number, courseId: number) => Promise<void>;
}

interface ProgrammeCoursesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	programme: Programme | null;
	onSuccess?: () => void;
	api?: ProgrammeCourseApi;
}

export function ProgrammeCoursesDialog({
	open,
	onOpenChange,
	programme,
	onSuccess,
	api = adminApi,
}: ProgrammeCoursesDialogProps) {
	const [courses, setCourses] = useState<ProgrammeCourse[]>([]);
	const [availableCourses, setAvailableCourses] = useState<
		Array<{ course_id: number; course_code: string; course_name: string; credits: number | null }>
	>([]);
	const [loading, setLoading] = useState(false);
	const [selectedCourseId, setSelectedCourseId] = useState<string>("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open && programme) {
			loadCourses();
		}
	}, [open, programme]);

	const loadCourses = async () => {
		if (!programme) return;
		setLoading(true);
		try {
			const data = await api.getProgrammeCourses(programme.programme_id);
			setCourses(data.courses);
			setAvailableCourses(data.available);
		} catch (error) {
			console.error("Failed to load programme courses:", error);
			toast.error("Failed to load courses");
		} finally {
			setLoading(false);
		}
	};

	const handleAddCourse = async () => {
		if (!programme || !selectedCourseId) return;

		const courseId = parseInt(selectedCourseId);
		setSaving(true);
		try {
			await api.addProgrammeCourse(programme.programme_id, courseId);
			toast.success("Course assigned to programme");
			setSelectedCourseId("");
			await loadCourses();
			if (onSuccess) onSuccess();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to assign course");
		} finally {
			setSaving(false);
		}
	};

	const handleRemoveCourse = async (course: ProgrammeCourse) => {
		if (!programme) return;

		try {
			await api.removeProgrammeCourse(programme.programme_id, course.course_id);
			toast.success(`"${course.course_code}" removed from programme`);
			await loadCourses();
			if (onSuccess) onSuccess();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to remove course");
		}
	};

	const handleClose = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] border border-muted/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent" />
				<DialogHeader className="pt-2">
					<DialogTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						<BookOpen className="w-5 h-5 text-indigo-500" />
						Programme Courses
					</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">
						Manage academic courses assigned to{" "}
						<span className="font-semibold text-foreground">{programme?.programme_name || "the selected programme"}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2">
					{/* Add Course Section */}
					<div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
						<h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 mb-3">
							<Plus className="w-4 h-4 text-indigo-500" />
							Assign Course
						</h4>
						<div className="flex gap-3 items-end">
							<div className="flex-1 space-y-1.5">
								<Label htmlFor="add-course" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Course</Label>
								<Select
									value={selectedCourseId}
									onValueChange={setSelectedCourseId}
								>
									<SelectTrigger id="add-course" className="bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/30 active:scale-95 duration-200">
										<SelectValue placeholder="Choose a course..." />
									</SelectTrigger>
									<SelectContent className="bg-popover/90 backdrop-blur-md border-muted/50 rounded-xl">
										{availableCourses.length === 0 ? (
											<SelectItem value="__none__" disabled className="rounded-lg">
												No courses available
											</SelectItem>
										) : (
											availableCourses.map((c) => (
												<SelectItem
													key={c.course_id}
													value={c.course_id.toString()}
													className="rounded-lg focus:bg-muted/60"
												>
													{c.course_code} — {c.course_name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</div>
							<Button
								onClick={handleAddCourse}
								disabled={!selectedCourseId || saving}
								className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-indigo-500/30 shadow-md shadow-indigo-500/10 h-10 px-4 shrink-0"
							>
								<Plus className="w-4 h-4 mr-1" />
								Add
							</Button>
						</div>
					</div>

					{/* Assigned Courses Table */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
							<span>Assigned Courses</span>
							<Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-bold rounded-lg font-mono">
								{courses.length}
							</Badge>
						</h4>
						{loading ? (
							<div className="text-center py-12 text-muted-foreground text-sm font-medium">
								Loading assigned courses...
							</div>
						) : courses.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground text-sm font-medium border border-dashed rounded-xl bg-background/20 border-muted/50">
								No courses assigned to this programme yet
							</div>
						) : (
							<div className="max-h-64 overflow-y-auto rounded-xl border border-muted/50 bg-background/40">
								<Table>
									<TableHeader>
										<TableRow className="hover:bg-transparent border-muted/40">
											<TableHead className="text-xs uppercase tracking-wider font-bold">Code</TableHead>
											<TableHead className="text-xs uppercase tracking-wider font-bold">Course Name</TableHead>
											<TableHead className="w-20 text-center text-xs uppercase tracking-wider font-bold">
												Credits
											</TableHead>
											<TableHead className="w-16" />
										</TableRow>
									</TableHeader>
									<TableBody>
										{courses.map((course) => (
											<TableRow key={course.id} className="border-muted/30 hover:bg-muted/10">
												<TableCell className="py-2">
													<Badge
														variant="outline"
														className="font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold"
													>
														{course.course_code}
													</Badge>
												</TableCell>
												<TableCell className="font-medium text-sm py-2">
													{course.course_name}
												</TableCell>
												<TableCell className="text-center text-sm py-2 font-semibold">
													{course.credits ?? "—"}
												</TableCell>
												<TableCell className="py-2 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all rounded-xl"
														onClick={() =>
															handleRemoveCourse(course)
														}
													>
														<X className="w-4 h-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</div>
				</div>

				<DialogFooter className="pt-2 border-t border-muted/30">
					<Button
						variant="outline"
						onClick={handleClose}
						className="rounded-xl active:scale-95 duration-200 transition-all border-muted/50 bg-background/40 hover:bg-muted/50"
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
