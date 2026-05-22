import { useState, useRef, useMemo, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/features/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Upload,
	Download,
	UserPlus,
	FileText,
	X,
	CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { StaffCourse } from "@/services/api";

export interface StudentEntry {
	rollno: string;
	name: string;
}

interface StaffStudentUploadProps {
	course: StaffCourse;
	onStudentsChange: (students: StudentEntry[]) => void;
}

export function StaffStudentUpload({
	course,
	onStudentsChange,
}: StaffStudentUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [students, setStudentsState] = useState<StudentEntry[]>([]);
	const [manualRollno, setManualRollno] = useState("");
	const [manualName, setManualName] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Reset when course changes
	useEffect(() => {
		setFile(null);
		setStudentsState([]);
		setManualRollno("");
		setManualName("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, [course]);

	const setStudentsWrapper = (
		newStudents:
			| StudentEntry[]
			| ((prev: StudentEntry[]) => StudentEntry[]),
	) => {
		setStudentsState((prev) => {
			const next =
				typeof newStudents === "function"
					? newStudents(prev)
					: newStudents;
			onStudentsChange(next);
			return next;
		});
	};

	// Make sure we expose clearUpload capability if parent needs it, but parent only re-mounts or we handle success there
	// Actually wait, how does parent clear on success? It changes students to [], but here we have local state.
	// Parent should just reset students. We can use a key or reset on success via refs, but easiest is changing a key on the component

	const studentColumns = useMemo<ColumnDef<StudentEntry>[]>(
		() => [
			{
				accessorKey: "rollno",
				header: "Roll No",
				cell: ({ row }) => (
					<span className="font-mono">{row.original.rollno}</span>
				),
			},
			{
				accessorKey: "name",
				header: "Name",
			},
			{
				id: "remove",
				header: "Remove",
				cell: ({ row }) => (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
						onClick={() =>
							handleRemoveFromList(row.original.rollno)
						}
					>
						<X className="w-4 h-4" />
					</Button>
				),
			},
		],
		[],
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		if (!selectedFile.name.endsWith(".csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		setFile(selectedFile);
		parseCSV(selectedFile);
	};

	const parseCSV = (file: File) => {
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
					setStudentsWrapper(parsedStudents);
					toast.success(
						`Parsed ${parsedStudents.length} students from CSV`,
					);
				}
			} catch (error) {
				console.error("CSV parsing error:", error);
				toast.error("Failed to parse CSV file");
			}
		};

		reader.onerror = () => {
			toast.error("Failed to read file");
		};

		reader.readAsText(file);
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

	const clearUpload = () => {
		setFile(null);
		setStudentsWrapper([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
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

		if (students.some((s) => s.rollno === manualRollno.trim())) {
			toast.error("This roll number is already in the list");
			return;
		}

		setStudentsWrapper((prev) => [
			...prev,
			{ rollno: manualRollno.trim(), name: manualName.trim() },
		]);
		setManualRollno("");
		setManualName("");
		toast.success("Student added to enrollment list");
	};

	const handleRemoveFromList = (rollno: string) => {
		setStudentsWrapper((prev) => prev.filter((s) => s.rollno !== rollno));
	};

	return (
		<div className="space-y-4 w-full">
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
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
						<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex-1">
							<h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
								<FileText className="w-4 h-4 text-amber-500" />
								CSV Format Requirements
							</h4>
							<ul className="text-xs text-amber-700/90 dark:text-amber-300/80 mt-2 space-y-1 list-disc list-inside leading-relaxed font-medium">
								<li>First row should contain column headers: <code className="font-bold font-mono text-[11px] bg-amber-500/10 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400">rollno,name</code></li>
								<li>Each subsequent row: <code className="font-bold font-mono text-[11px] bg-amber-500/10 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400">roll_number,student_name</code></li>
								<li>Example: <code className="font-mono text-[11px]">CS101,John Doe</code></li>
							</ul>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={downloadTemplate}
							className="bg-background/60 shadow-sm border-muted/50 rounded-xl transition-all active:scale-95 duration-200 flex items-center justify-center gap-2 self-start sm:self-center h-10 px-4"
						>
							<Download className="w-4 h-4 text-amber-500" />
							Template
						</Button>
					</div>

					<div className="border-2 border-dashed border-amber-500/25 hover:border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/5 dark:hover:bg-amber-500/10 rounded-2xl p-8 transition-all duration-300 group cursor-pointer relative overflow-hidden">
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv"
							onChange={handleFileChange}
							className="hidden"
							id="csv-upload"
						/>
						<label
							htmlFor="csv-upload"
							className="flex flex-col items-center cursor-pointer w-full"
						>
							<Upload className="w-10 h-10 text-amber-500/70 group-hover:text-amber-500 group-hover:scale-110 mb-3 transition-all duration-300" />
							<span className="text-sm font-bold text-foreground">
								{file ? file.name : "Click to upload CSV file"}
							</span>
							<span className="text-xs text-muted-foreground mt-1 font-medium">
								or drag and drop here
							</span>
						</label>
					</div>
				</TabsContent>

				{/* Manual Entry Tab */}
				<TabsContent value="manual" className="space-y-4 focus-visible:outline-none">
					<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
						<UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
						<div>
							<h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
								Manual Student Entry
							</h4>
							<p className="text-xs text-amber-700/95 dark:text-amber-300/80 mt-0.5 leading-relaxed font-medium">
								Add students one by one to the list. Use this for quick enrollments or small batches.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
						<div className="space-y-2">
							<Label htmlFor="rollno" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roll Number</Label>
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
											.getElementById("studentName")
											?.focus();
									}
								}}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-amber-500/30 rounded-xl border-muted/50 transition-all font-mono"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="studentName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Name</Label>
							<Input
								id="studentName"
								placeholder="e.g., John Doe"
								value={manualName}
								onChange={(e) => setManualName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddManualStudent();
									}
								}}
								className="bg-background/60 shadow-inner focus-visible:ring-1 focus-visible:ring-amber-500/30 rounded-xl border-muted/50 transition-all"
							/>
						</div>
						<Button
							onClick={handleAddManualStudent}
							className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl active:scale-95 duration-200 transition-all border border-orange-500/30 shadow-md shadow-orange-500/10 px-6 shrink-0"
						>
							<UserPlus className="w-4 h-4 mr-2" />
							Add Student
						</Button>
					</div>
				</TabsContent>
			</Tabs>

			{students.length > 0 && (
				<div className="space-y-4 mt-6 pt-6 border-t border-muted/30">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15">
							<CheckCircle2 className="w-4 h-4" />
							<span>
								{students.length} student{students.length > 1 ? "s" : ""} ready to enroll
							</span>
						</div>
						<Button 
							variant="ghost" 
							size="sm" 
							onClick={clearUpload}
							className="h-8 rounded-lg text-xs font-bold hover:bg-muted/50 text-muted-foreground hover:text-foreground active:scale-95 duration-200 transition-all"
						>
							Clear All
						</Button>
					</div>

					<div className="max-h-64 overflow-y-auto rounded-xl border border-muted/50 bg-background/40">
						<DataTable columns={studentColumns} data={students} />
					</div>
				</div>
			)}
		</div>
	);
}
