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
import { CSVFormatInfo } from "@/features/assessments/CSVFormatInfo";
import { CSVFileUpload } from "@/features/assessments/CSVFileUpload";
import { BatchSelector } from "@/features/shared/BatchSelector";
import type { Programme, ProgrammeBulkEnrollRequest } from "@/services/api";

interface BulkEnrollApi {
	bulkEnrollStudentsToProgramme(
		programmeId: number,
		data: ProgrammeBulkEnrollRequest,
	): Promise<any>;
}

interface BulkEnrollStudentsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	programme: Programme | null;
	onSuccess?: () => void;
	api: BulkEnrollApi;
}

interface StudentEntry {
	rollno: string;
	name: string;
	batch_year?: number;
}

function extractBatchYearFromRollNo(rollno: string): number | null {
	const match = rollno.match(/(\d{2})/);
	if (!match) return null;
	const twoDigit = match[1];
	const fullYear = parseInt("20" + twoDigit);
	if (fullYear >= 2010 && fullYear <= 2035) return fullYear;
	return null;
}

export function BulkEnrollStudentsDialog({
	open,
	onOpenChange,
	programme,
	onSuccess,
	api,
}: BulkEnrollStudentsDialogProps) {
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [uploading, setUploading] = useState(false);
	const [enrolling, setEnrolling] = useState(false);
	const [batchYear, setBatchYear] = useState<string>("");

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Manual enrollment state
	const [manualRollno, setManualRollno] = useState("");
	const [manualName, setManualName] = useState("");

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
							parsedStudents.push({
								rollno,
								name,
								batch_year: extractBatchYearFromRollNo(rollno) ?? undefined,
							});
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
		if (!programme) {
			toast.error("No programme selected");
			return;
		}

		if (students.length === 0) {
			toast.error("No students to enroll");
			return;
		}

		setEnrolling(true);
		try {
			const overrideYear = batchYear.trim() ? parseInt(batchYear.trim()) : null;
			const studentsPayload = students.map((s) => ({
				rollno: s.rollno,
				name: s.name,
				...(overrideYear
					? { batch_year: overrideYear }
					: s.batch_year
						? { batch_year: s.batch_year }
						: {}),
			}));

			const data = await api.bulkEnrollStudentsToProgramme(
				programme.programme_id,
				{ students: studentsPayload },
			);

			if (data.failure_count > 0) {
				const failureDetails = data.failed
					.map((f: any) => `${f.rollno}: ${f.reason}`)
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
			if (onSuccess) onSuccess();
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
		setBatchYear("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onOpenChange(false);
	};

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

		const newStudent: StudentEntry = {
			rollno: manualRollno.trim(),
			name: manualName.trim(),
			batch_year: extractBatchYearFromRollNo(manualRollno.trim()) ?? undefined,
		};
		setStudents((prev) => [...prev, newStudent]);
		setManualRollno("");
		setManualName("");
		toast.success("Student added to enrollment list");
	};

	const handleRemoveFromList = (rollno: string) => {
		setStudents((prev) => prev.filter((s) => s.rollno !== rollno));
	};

	const clearAllStudents = () => {
		setStudents([]);
		setBatchYear("");
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
		link.download = "programme_enrollment_template.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px] border border-muted/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-slate-500 to-transparent" />
				<DialogHeader className="pt-2">
					<DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">Bulk Enroll Students</DialogTitle>
					<DialogDescription className="text-muted-foreground text-sm">
						Upload a CSV file or manually add students to enroll in{" "}
						<span className="font-semibold text-foreground">{programme?.programme_name || "the selected programme"}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2">
					<div className="space-y-2">
						<Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Batch <span className="text-muted-foreground/60">(optional)</span></Label>
						<BatchSelector
							label=""
							programmeId={programme?.programme_id ?? null}
							value={null}
							onChange={(_, batch) => {
								setBatchYear(batch?.batch_year ? String(batch.batch_year) : "");
							}}
						/>
						<p className="text-[11px] text-muted-foreground font-medium">
							Applies to all students in this enrollment run
						</p>
					</div>

					<Tabs defaultValue="csv" className="w-full">
						<TabsList className="grid w-full grid-cols-2 p-1 bg-muted/40 backdrop-blur-sm border border-muted/50 rounded-xl mb-4">
							<TabsTrigger
								value="csv"
								className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 data-[state=active]:bg-background/90 data-[state=active]:shadow-sm"
							>
								<Upload className="w-4 h-4" />
								CSV Upload
							</TabsTrigger>
							<TabsTrigger
								value="manual"
								className="flex items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 data-[state=active]:bg-background/90 data-[state=active]:shadow-sm"
							>
								<UserPlus className="w-4 h-4" />
								Manual Entry
							</TabsTrigger>
						</TabsList>

						{/* CSV Upload Tab */}
						<TabsContent value="csv" className="space-y-4 focus-visible:outline-none">
							<CSVFormatInfo
								onDownloadTemplate={downloadTemplate}
							/>
							<CSVFileUpload
								fileInputRef={fileInputRef}
								onFileChange={handleFileChange}
								uploading={uploading}
								enrolling={enrolling}
							/>
						</TabsContent>

						{/* Manual Entry Tab */}
						<TabsContent value="manual" className="space-y-4 focus-visible:outline-none">
							<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
								<UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
								<div>
									<h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
										Manual Student Entry
									</h4>
									<p className="text-xs text-emerald-700/95 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
										Add students one by one to the list below, then click "Enroll Students" to commit.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="rollno" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Roll Number
										</Label>
										<Input
											id="rollno"
											placeholder="e.g., CS101"
											value={manualRollno}
											onChange={(e) =>
												setManualRollno(e.target.value)
											}
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
											className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all font-mono"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="studentName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Student Name
										</Label>
										<Input
											id="studentName"
											placeholder="e.g., John Doe"
											value={manualName}
											onChange={(e) =>
												setManualName(e.target.value)
											}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleAddManualStudent();
												}
											}}
											className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-indigo-500/30 rounded-xl border-muted/50 transition-all"
										/>
									</div>
								</div>
								<Button
									onClick={handleAddManualStudent}
									className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-indigo-500/30 shadow-md shadow-indigo-500/10"
								>
									<UserPlus className="w-4 h-4 mr-2" />
									Add Student
								</Button>
							</div>
						</TabsContent>
					</Tabs>

					{/* Preview Table - Shows for both tabs */}
					{students.length > 0 && (
						<div className="space-y-4 pt-4 border-t border-muted/30">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15">
									<CheckCircle2 className="w-4 h-4" />
									<span>
										Ready to enroll {students.length}{" "}
										student
										{students.length > 1 ? "s" : ""}
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={clearAllStudents}
									className="h-8 rounded-lg text-xs font-bold hover:bg-muted/50 text-muted-foreground hover:text-foreground active:scale-95 duration-200 transition-all"
								>
									Clear All
								</Button>
							</div>

							<div className="max-h-48 overflow-y-auto rounded-xl border border-muted/50 bg-background/40">
								<Table>
									<TableHeader>
										<TableRow className="hover:bg-transparent border-muted/40">
											<TableHead className="text-xs uppercase tracking-wider font-bold">Roll No</TableHead>
											<TableHead className="text-xs uppercase tracking-wider font-bold">Name</TableHead>
											<TableHead className="w-16 text-center text-xs uppercase tracking-wider font-bold">
												Remove
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{students.map((student, index) => (
											<TableRow key={index} className="border-muted/30 hover:bg-muted/10">
												<TableCell className="font-mono text-sm py-2">
													{student.rollno}
												</TableCell>
												<TableCell className="text-sm py-2 font-medium">
													{student.name}
												</TableCell>
												<TableCell className="py-2 text-center">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 active:scale-95 duration-200 transition-all rounded-xl"
														onClick={() =>
															handleRemoveFromList(
																student.rollno,
															)
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
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-muted/30">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={enrolling}
						className="rounded-xl active:scale-95 duration-200 transition-all border-muted/50 bg-background/40 hover:bg-muted/50"
					>
						Cancel
					</Button>
					<Button
						onClick={handleEnroll}
						disabled={
							students.length === 0 || uploading || enrolling
						}
						className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-lg active:scale-95 duration-200 transition-all border border-indigo-500/30"
					>
						{enrolling ? "Enrolling..." : "Enroll Students"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
