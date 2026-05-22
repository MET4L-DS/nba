import { useState, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CheckCircle2, Upload, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { CSVFormatInfo } from "./CSVFormatInfo";
import { CSVFileUpload } from "./CSVFileUpload";
import { apiService } from "@/services/api";
import type { Course } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

interface EnrollStudentsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course: Course | null;
}

interface StudentEntry {
	rollno: string;
	name: string;
}

const MotionButton = motion(Button);

export function EnrollStudentsDialog({
	open,
	onOpenChange,
	course,
}: EnrollStudentsDialogProps) {
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [uploading, setUploading] = useState(false);
	const [enrolling, setEnrolling] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Manual enrollment state
	const [manualRollno, setManualRollno] = useState("");
	const [manualName, setManualName] = useState("");
	const [activeTab, setActiveTab] = useState("csv");

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		if (!selectedFile.name.endsWith(".csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		parseCSV(selectedFile);
	};

	const parseCSV = (file: File) => {
		setUploading(true);
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				const lines = text.split("\n").filter((line) => line.trim());

				// Skip header row if it exists
				const startIndex = lines[0].toLowerCase().includes("rollno")
					? 1
					: 0;

				const parsedStudents: StudentEntry[] = [];

				for (let i = startIndex; i < lines.length; i++) {
					const line = lines[i].trim();
					if (!line) continue;

					// Split by comma and handle quoted values
					const parts = line
						.split(",")
						.map((part) => part.trim().replace(/^"|"$/g, ""));

					if (parts.length >= 2) {
						const rollno = parts[0];
						const name = parts[1];

						if (rollno && name) {
							parsedStudents.push({ rollno, name });
						}
					}
				}

				if (parsedStudents.length === 0) {
					toast.error("No valid student entries found in CSV");
				} else {
					setStudents(parsedStudents);
					toast.success(
						`Parsed ${parsedStudents.length} students from CSV`,
					);
				}
			} catch (error) {
				console.error("CSV parsing error:", error);
				toast.error("Failed to parse CSV file");
			} finally {
				setUploading(false);
			}
		};

		reader.onerror = () => {
			toast.error("Failed to read file");
			setUploading(false);
		};

		reader.readAsText(file);
	};

	const handleEnroll = async () => {
		if (!course) {
			toast.error("No course selected");
			return;
		}

		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const data = await apiService.enrollStudents(
				course.offering_id ?? course.course_id,
				students,
			);

			if (data.failure_count > 0) {
				const failureDetails = data.failed
					.map((f) => `${f.rollno}: ${f.reason}`)
					.join("\n");
				toast.warning(
					`Enrolled ${data.success_count} student(s). ${data.failure_count} failed:\n${failureDetails}`,
				);
				console.warn("Failed enrollments:", data.failed);
			} else {
				toast.success(
					`All ${data.success_count} students enrolled successfully!`,
				);
			}

			// Reset and close
			setStudents([]);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			onOpenChange(false);
		} catch (error) {
			console.error("Enrollment error:", error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to enroll students");
			}
		} finally {
			setEnrolling(false);
		}
	};

	const handleClose = () => {
		setStudents([]);
		setManualRollno("");
		setManualName("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onOpenChange(false);
	};

	// Manual enrollment handlers
	const handleAddManualStudent = () => {
		if (!manualRollno.trim()) {
			toast.error("Please enter a roll number");
			return;
		}
		if (!manualName.trim()) {
			toast.error("Please enter student name");
			return;
		}

		// Check for duplicate
		if (students.some((s) => s.rollno === manualRollno.trim())) {
			toast.error("This roll number is already in the list");
			return;
		}

		setStudents((prev) => [
			...prev,
			{ rollno: manualRollno.trim(), name: manualName.trim() },
		]);
		setManualRollno("");
		setManualName("");
		toast.success("Student added to enrollment list");
	};

	const handleRemoveFromList = (rollno: string) => {
		setStudents((prev) => prev.filter((s) => s.rollno !== rollno));
	};

	const clearAllStudents = () => {
		setStudents([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const downloadTemplate = () => {
		const csvContent =
			"rollno,name\nCS101,John Doe\nCS102,Jane Smith\nCS103,Bob Johnson";
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "student_enrollment_template.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] border border-muted/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden p-6">
				<motion.div
					initial={{ opacity: 0, y: 15, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ type: "spring" as const, stiffness: 280, damping: 22 }}
					className="space-y-4"
				>
					<DialogHeader>
						<DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Enroll Students
						</DialogTitle>
						<DialogDescription className="text-sm text-muted-foreground mt-1">
							Upload a CSV file to enroll students in{" "}
							<span className="font-semibold text-primary">{course?.course_code || "the selected course"}</span>
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/65 p-1 rounded-xl">
								<TabsTrigger
									value="csv"
									className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all"
								>
									<Upload className="w-4 h-4" />
									CSV Upload
								</TabsTrigger>
								<TabsTrigger
									value="manual"
									className="flex items-center gap-2 rounded-lg font-semibold py-2 transition-all"
								>
									<UserPlus className="w-4 h-4" />
									Manual Entry
								</TabsTrigger>
							</TabsList>

							<AnimatePresence mode="wait">
								{/* CSV Upload Tab */}
								{activeTab === "csv" && (
									<TabsContent key="csv" value="csv" className="space-y-4 mt-0 focus-visible:ring-0">
										<motion.div
											initial={{ opacity: 0, x: -12 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 12 }}
											transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
											className="space-y-4"
										>
											<CSVFormatInfo
												onDownloadTemplate={downloadTemplate}
											/>
											<CSVFileUpload
												fileInputRef={fileInputRef}
												onFileChange={handleFileChange}
												uploading={uploading}
												enrolling={enrolling}
											/>
										</motion.div>
									</TabsContent>
								)}

								{/* Manual Entry Tab */}
								{activeTab === "manual" && (
									<TabsContent key="manual" value="manual" className="space-y-4 mt-0 focus-visible:ring-0">
										<motion.div
											initial={{ opacity: 0, x: 12 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -12 }}
											transition={{ type: "spring" as const, stiffness: 300, damping: 24 }}
											className="space-y-4"
										>
											<div className="bg-green-50/50 dark:bg-green-950/10 rounded-xl p-4 border border-green-100/30">
												<h4 className="text-sm font-bold text-green-900 dark:text-green-300 flex items-center gap-2">
													<UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
													Manual Student Entry
												</h4>
												<p className="text-xs text-green-700 dark:text-green-400 mt-1">
													Add students one by one to the enrollment list
												</p>
											</div>

											<div className="grid grid-cols-1 gap-4">
												<div className="grid grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="rollno" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
															Roll Number
														</Label>
														<Input
															id="rollno"
															placeholder="e.g., CS101"
															value={manualRollno}
															onChange={(e) =>
																setManualRollno(e.target.value)
															}
															className="focus-visible:ring-indigo-500/30 transition-all font-mono font-bold bg-background/50 h-10"
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	document
																		.getElementById(
																			"studentName",
																		)
																		?.focus();
																}
															}}
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor="studentName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
															Student Name
														</Label>
														<Input
															id="studentName"
															placeholder="e.g., John Doe"
															value={manualName}
															onChange={(e) =>
																setManualName(e.target.value)
															}
															className="focus-visible:ring-indigo-500/30 transition-all font-semibold bg-background/50 h-10"
															onKeyDown={(e) => {
																if (e.key === "Enter") {
																	e.preventDefault();
																	handleAddManualStudent();
																}
															}}
														/>
													</div>
												</div>
												<MotionButton
													onClick={handleAddManualStudent}
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
													className="w-full font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40 h-10 transition-all gap-1.5"
												>
													<UserPlus className="w-4 h-4" />
													Add Student
												</MotionButton>
											</div>
										</motion.div>
									</TabsContent>
								)}
							</AnimatePresence>
						</Tabs>

						{/* Preview Table - Shows for both tabs */}
						<AnimatePresence>
							{students.length > 0 && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 overflow-hidden"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
											<CheckCircle2 className="w-4 h-4" />
											<span>
												Ready to enroll {students.length} student
												{students.length > 1 ? "s" : ""}
											</span>
										</div>
										<MotionButton
											variant="ghost"
											size="sm"
											whileHover={{ scale: 1.02, backgroundColor: "rgba(239,68,68,0.06)" }}
											whileTap={{ scale: 0.98 }}
											onClick={clearAllStudents}
											className="h-8 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors"
										>
											Clear All
										</MotionButton>
									</div>

									<div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-background/50">
										<Table>
											<TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
												<TableRow>
													<TableHead className="text-[10px] font-bold uppercase py-3 pl-4">Roll No</TableHead>
													<TableHead className="text-[10px] font-bold uppercase py-3">Name</TableHead>
													<TableHead className="text-[10px] font-bold uppercase py-3 w-16 text-center">Remove</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												<AnimatePresence initial={false}>
													{students.map((student) => (
														<motion.tr
															key={student.rollno}
															initial={{ opacity: 0, y: -8 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, x: 20 }}
															transition={{ type: "spring" as const, stiffness: 350, damping: 25 }}
															className="border-b last:border-0 hover:bg-slate-50/40 dark:hover:bg-slate-900/20"
														>
															<TableCell className="font-mono font-bold text-xs py-2.5 pl-4">
																{student.rollno}
															</TableCell>
															<TableCell className="text-xs font-semibold py-2.5">
																{student.name}
															</TableCell>
															<TableCell className="py-2.5 text-center">
																<MotionButton
																	variant="ghost"
																	size="icon"
																	whileHover={{ scale: 1.1, backgroundColor: "rgba(239,68,68,0.08)", color: "rgb(239,68,68)" }}
																	whileTap={{ scale: 0.9 }}
																	className="h-7 w-7 text-muted-foreground rounded-full transition-all"
																	onClick={() =>
																		handleRemoveFromList(
																			student.rollno,
																		)
																	}
																>
																	<X className="w-4 h-4" />
																</MotionButton>
															</TableCell>
														</motion.tr>
													))}
												</AnimatePresence>
											</TableBody>
										</Table>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
						<MotionButton
							variant="outline"
							onClick={handleClose}
							disabled={enrolling}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="font-semibold"
						>
							Cancel
						</MotionButton>
						<MotionButton
							onClick={handleEnroll}
							disabled={
								students.length === 0 || uploading || enrolling
							}
							whileHover={{ scale: 1.01 }}
							whileTap={{ scale: 0.99 }}
							className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border-none shadow-md"
						>
							{enrolling ? "Enrolling..." : "Enroll Students"}
						</MotionButton>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
