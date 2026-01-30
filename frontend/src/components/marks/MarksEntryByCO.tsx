import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { Course, Test } from "@/services/api";

interface MarksEntryByCOProps {
	test: Test;
	course: Course | null;
	onBack: () => void;
}

export function MarksEntryByCO({ test, course, onBack }: MarksEntryByCOProps) {
	const [studentId, setStudentId] = useState("");
	const [coMarks, setCoMarks] = useState({
		CO1: "",
		CO2: "",
		CO3: "",
		CO4: "",
		CO5: "",
		CO6: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [importing, setImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleCoMarkChange = (co: string, value: string) => {
		setCoMarks((prev) => ({
			...prev,
			[co]: value,
		}));
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			processCSV(text);
		};
		reader.readAsText(file);
		
		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const processCSV = async (text: string) => {
		const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
		if (lines.length < 2) {
			toast.error("CSV file is empty or missing header");
			return;
		}

		// Heuristic to detect name column
		const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
		let marksStartIndex = 1;
		if (headers.length > 1 && (headers[1].includes("name") || headers[1] === "student name")) {
			marksStartIndex = 2;
		} else {
             const firstData = lines[1].split(",");
             if (firstData.length > 1 && isNaN(parseFloat(firstData[1]))) {
                  marksStartIndex = 2;
             }
        }

		setImporting(true);
		
		let successCount = 0;
		let failCount = 0;
		const failures: string[] = [];

		for (const line of lines.slice(1)) {
			const values = line.split(",").map(v => v.trim());
			if (values.length < 2) continue;

			const rollNo = values[0];
			const coValues = values.slice(marksStartIndex);
			
			// CO1 to CO6
			const marksData: any = {
				test_id: test.id,
				student_id: rollNo,
				CO1: parseFloat(coValues[0] || "0") || 0,
				CO2: parseFloat(coValues[1] || "0") || 0,
				CO3: parseFloat(coValues[2] || "0") || 0,
				CO4: parseFloat(coValues[3] || "0") || 0,
				CO5: parseFloat(coValues[4] || "0") || 0,
				CO6: parseFloat(coValues[5] || "0") || 0
			};

			try {
				await apiService.saveMarksByCO(marksData);
				successCount++;
			} catch (error) {
				failCount++;
				failures.push(rollNo);
			}
		}

		setImporting(false);
		toast.success(`Import complete: ${successCount} successful, ${failCount} failed.`);
		if (failCount > 0) {
			console.error("Failed students:", failures);
			toast.error(`Failed to separate marks for: ${failures.slice(0, 5).join(", ")}...`);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!studentId.trim()) {
			toast.error("Please enter student ID");
			return;
		}

		// Convert marks to numbers
		const marksData: any = {
			test_id: test.id,
			student_id: studentId,
		};

		let hasMarks = false;
		for (const [co, value] of Object.entries(coMarks)) {
			if (value.trim() !== "") {
				const mark = parseFloat(value);
				if (isNaN(mark) || mark < 0) {
					toast.error(`Invalid mark for ${co}`);
					return;
				}
				marksData[co] = mark;
				hasMarks = true;
			} else {
				marksData[co] = 0;
			}
		}

		if (!hasMarks) {
			toast.error("Please enter at least one CO mark");
			return;
		}

		setSubmitting(true);
		try {
			await apiService.saveMarksByCO(marksData);
			toast.success(`Marks saved successfully for ${studentId}`);

			// Reset form
			setStudentId("");
			setCoMarks({
				CO1: "",
				CO2: "",
				CO3: "",
				CO4: "",
				CO5: "",
				CO6: "",
			});
		} catch (error) {
			console.error("Failed to save marks:", error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Failed to save marks");
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" onClick={onBack} className="gap-2">
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>
					<div>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
							{test.name}
						</h2>
						{course && (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{course.course_code} - {course.name}
							</p>
						)}
					</div>
				</div>
				<div>
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept=".csv"
						onChange={handleFileUpload}
					/>
					<Button 
						variant="outline" 
						onClick={() => fileInputRef.current?.click()}
						disabled={importing}
						className="gap-2"
					>
						<Upload className="w-4 h-4" />
						{importing ? "Importing..." : "Import CSV"}
					</Button>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Student Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="studentId">
								Student ID / Roll Number *
							</Label>
							<Input
								id="studentId"
								value={studentId}
								onChange={(e) => setStudentId(e.target.value)}
								placeholder="e.g., CS101"
								required
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>CO-wise Marks Entry</CardTitle>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Enter aggregated marks for each Course Outcome
							(leave empty for 0)
						</p>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{Object.keys(coMarks).map((co) => (
								<div key={co} className="space-y-2">
									<Label htmlFor={co}>{co}</Label>
									<Input
										id={co}
										type="number"
										step="0.5"
										min="0"
										value={
											coMarks[co as keyof typeof coMarks]
										}
										onChange={(e) =>
											handleCoMarkChange(
												co,
												e.target.value
											)
										}
										placeholder="0"
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-3">
					<Button type="button" variant="outline" onClick={onBack}>
						Cancel
					</Button>
					<Button type="submit" disabled={submitting}>
						<Save className="w-4 h-4 mr-2" />
						{submitting ? "Saving..." : "Save Marks"}
					</Button>
				</div>
			</form>
		</div>
	);
}
