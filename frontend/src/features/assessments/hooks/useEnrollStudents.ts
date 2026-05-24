import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import type { Course } from "@/services/api";

interface StudentEntry {
	rollno: string;
	name: string;
}

interface UseEnrollStudentsProps {
	course: Course | null;
	onOpenChange: (open: boolean) => void;
}

export function useEnrollStudents({
	course,
	onOpenChange,
}: UseEnrollStudentsProps) {
	const [students, setStudents] = useState<StudentEntry[]>([]);
	const [uploading, setUploading] = useState(false);
	const [enrolling, setEnrolling] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [manualRollno, setManualRollno] = useState("");
	const [manualName, setManualName] = useState("");
	const [activeTab, setActiveTab] = useState("csv");

	const parseCSV = useCallback((file: File) => {
		setUploading(true);
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				const lines = text.split("\n").filter((line) => line.trim());

				const startIndex = lines[0].toLowerCase().includes("rollno") ? 1 : 0;
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
					setStudents(parsedStudents);
					toast.success(`Parsed ${parsedStudents.length} students from CSV`);
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
	}, []);

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		if (!selectedFile.name.endsWith(".csv")) {
			toast.error("Please select a CSV file");
			return;
		}

		parseCSV(selectedFile);
	}, [parseCSV]);

	const handleEnroll = useCallback(async () => {
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
				students
			);

			if (data.failure_count > 0) {
				const failureDetails = data.failed
					.map((f) => `${f.rollno}: ${f.reason}`)
					.join("\n");
				toast.warning(
					`Enrolled ${data.success_count} student(s). ${data.failure_count} failed:\n${failureDetails}`
				);
				console.warn("Failed enrollments:", data.failed);
			} else {
				toast.success(
					`All ${data.success_count} students enrolled successfully!`
				);
			}

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
	}, [course, students, onOpenChange]);

	const handleClose = useCallback(() => {
		setStudents([]);
		setManualRollno("");
		setManualName("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		onOpenChange(false);
	}, [onOpenChange]);

	const handleAddManualStudent = useCallback(() => {
		const rollnoTrim = manualRollno.trim();
		const nameTrim = manualName.trim();

		if (!rollnoTrim) {
			toast.error("Please enter a roll number");
			return;
		}
		if (!nameTrim) {
			toast.error("Please enter student name");
			return;
		}

		if (students.some((s) => s.rollno === rollnoTrim)) {
			toast.error("This roll number is already in the list");
			return;
		}

		setStudents((prev) => [
			...prev,
			{ rollno: rollnoTrim, name: nameTrim },
		]);
		setManualRollno("");
		setManualName("");
		toast.success("Student added to enrollment list");
	}, [manualRollno, manualName, students]);

	const handleRemoveFromList = useCallback((rollno: string) => {
		setStudents((prev) => prev.filter((s) => s.rollno !== rollno));
	}, []);

	const clearAllStudents = useCallback(() => {
		setStudents([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const downloadTemplate = useCallback(() => {
		const csvContent =
			"rollno,name\nCS101,John Doe\nCS102,Jane Smith\nCS103,Bob Johnson";
		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "student_enrollment_template.csv";
		link.click();
		URL.revokeObjectURL(url);
	}, []);

	return {
		students,
		uploading,
		enrolling,
		fileInputRef,
		manualRollno,
		setManualRollno,
		manualName,
		setManualName,
		activeTab,
		setActiveTab,
		handleFileChange,
		handleEnroll,
		handleClose,
		handleAddManualStudent,
		handleRemoveFromList,
		clearAllStudents,
		downloadTemplate,
	};
}
