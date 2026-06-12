import { Download, FileSpreadsheet, Upload } from "lucide-react";
import type { Course, Test } from "@/services/api";
import { MarksEntryHeader } from "./MarksEntryHeader";
import { TestInfoCard } from "./TestInfoCard";
import { BulkMarksTable } from "./BulkMarksTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMarksEntryByQuestion } from "./useMarksEntryByQuestion";
import { downloadCSVTemplate } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface MarksEntryByQuestionProps {
	test: Test;
	course: Course | null;
	onBack: () => void;
}

export function MarksEntryByQuestion({
	test,
	course,
	onBack,
}: MarksEntryByQuestionProps) {
	const {
		questions,
		enrollments,
		marks,
		dirtyRows,
		loading,
		submitting,
		searchTerm,
		setSearchTerm,
		validateMarks,
		setValidateMarks,
		fileInputRef,
		handleFileUpload,
		handleMarkChange,
		handleSubmit,
	} = useMarksEntryByQuestion(test, course);

	const handleDownloadTemplate = () => {
		const headers = ["rollno", "name", ...questions.map(q => q.question_identifier)];
		const sampleRows = [
			["22CS001", "John Doe", ...questions.map(q => String(q.max_marks > 0 ? Math.round(q.max_marks * 0.8) : 8))],
			["22CS002", "Jane Smith", ...questions.map(q => String(q.max_marks > 0 ? Math.round(q.max_marks * 0.9) : 9))],
		];
		downloadCSVTemplate(`${test.name.toLowerCase().replace(/\s+/g, "_")}_question_template.csv`, headers, sampleRows);
	};

	const handleExportMarks = () => {
		const headers = ["rollno", "name", ...questions.map(q => q.question_identifier)];
		const rows = enrollments.map((e) => {
			const rollno = e.student_rollno;
			const name = e.student_name;
			const studentMarks = marks[rollno] || {};
			return [
				rollno,
				name,
				...questions.map((q) => studentMarks[q.question_identifier] ?? ""),
			];
		});
		downloadCSVTemplate(
			`${test.name.toLowerCase().replace(/\s+/g, "_")}_question_marks.csv`,
			headers,
			rows
		);
	};

	const filteredEnrollments = enrollments.filter(
		(e) =>
			e.student_rollno.toLowerCase().includes(searchTerm.toLowerCase()) ||
			e.student_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="space-y-2 w-full min-w-0">
			<MarksEntryHeader
				title="Bulk Marks Entry (By Question)"
				course={course}
				onBack={onBack}
			/>

			<TestInfoCard
				test={test}
				onSave={handleSubmit}
				isSaving={submitting}
				isDisabled={enrollments.length === 0}
				searchTerm={searchTerm}
				onSearch={setSearchTerm}
				searchPlaceholder="Search by roll no or name..."
				extraActions={
					<>
						<div className="flex items-center space-x-2 mr-2">
							<Switch
								id="validate-marks"
								checked={validateMarks}
								onCheckedChange={setValidateMarks}
							/>
							<Label
								htmlFor="validate-marks"
								className="whitespace-nowrap"
							>
								Validate Marks
							</Label>
						</div>
						<input
							type="file"
							ref={fileInputRef}
							className="hidden"
							accept=".csv"
							onChange={handleFileUpload}
						/>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={handleDownloadTemplate}
									className="gap-2"
								>
									<FileSpreadsheet className="w-4 h-4 text-emerald-500" />
									Download Template
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Download sample CSV template for question-wise marks import
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={handleExportMarks}
									className="gap-2"
								>
									<Upload className="w-4 h-4 text-blue-500" />
									Export CSV
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Export current marks to a CSV file
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
									className="gap-2"
								>
									<Download className="w-4 h-4 text-violet-500" />
									Import CSV
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">
								Upload question-wise marks CSV file
							</TooltipContent>
						</Tooltip>
					</>
				}
			>
				{loading ? (
					<div className="text-center py-8 text-muted-foreground">
						Loading students and questions...
					</div>
				) : (
					<BulkMarksTable
						questions={questions}
						enrollments={filteredEnrollments}
						marks={marks}
						dirtyRows={dirtyRows}
						onMarkChange={handleMarkChange}
						validateMarks={validateMarks}
					/>
				)}
			</TestInfoCard>
		</div>
	);
}