import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Settings, Upload } from "lucide-react";
import { useState, lazy, Suspense } from "react";
import { CSVUploader } from "@/features/shared/CSVUploader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { downloadCSVTemplate } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const AttainmentSettingsPanel = lazy(() =>
	import("./AttainmentSettingsPanel").then((m) => ({
		default: m.AttainmentSettingsPanel,
	}))
);
import { AttainmentCriteriaCard } from "./AttainmentCriteriaCard";
import { PassingMarksCard } from "./PassingMarksCard";
import { StudentMarksTable } from "./StudentMarksTable";
import { COAttainmentTable } from "./COAttainmentTable";
import { COPOMatrixTable } from "./COPOMatrixTable";
import { PODirectAttainmentTable } from "./PODirectAttainmentTable";
import { POComputation3PointTable } from "./POComputation3PointTable";
import { POComputationPercentageTable } from "./POComputationPercentageTable";
import type {
	StudentMarks,
	AttainmentThreshold,
	AttainmentData,
	COPOMatrixState,
} from "./types";

export interface MatrixViewProps {
	courseCode: string;
	courseName: string;
	facultyName: string;
	departmentName: string;
	programme: string;
	year: string | number;
	semester: string;
	readOnly?: boolean;
	saving: boolean;
	showSettings: boolean;
	setShowSettings: (val: boolean) => void;
	coThreshold: number;
	setCoThreshold: (val: number) => void;
	passingThreshold: number;
	setPassingThreshold: (val: number) => void;
	attainmentThresholds: AttainmentThreshold[];
	addThreshold: () => void;
	updateThreshold: (id: number, value: number) => void;
	removeThreshold: (id: number) => void;
	saveSettings: () => void;
	attainmentCriteria: any;
	getLevelColorFn: (level: number) => string;
	studentsData: StudentMarks[];
	maxMarks: any;
	loading: boolean;
	getPercentageColorFn: (percentage: number) => string;
	coMaxMarks: Record<string, number>;
	attainmentData: AttainmentData | null;
	getLevel: (percentage: number) => number;
	copoMatrix: COPOMatrixState;
	updateCOPOMapping: (co: string, po: string, val: number) => void;
	calculatePOAttainment: (po: string) => any;
	poComputations: any;
	handleCSVDataParsed: (data: any[]) => void;
	saveMatrix: () => void;
	handleExportAttainment: (headerOverrides?: {
		programme?: string;
		programme_id?: number;
		year?: string;
		semester?: string;
		session?: string;
	}) => void;
	snapshotIndirectData?: Array<{
		co_name: string;
		attainment_percentage: number;
		attainment_level: number;
		indirect_attainment_percentage?: number | null;
		indirect_attainment_level?: number | null;
		final_attainment_percentage?: number | null;
		final_attainment_level?: number | null;
	}>;
}

export function MatrixView({
	courseCode,
	courseName,
	facultyName,
	departmentName,
	programme,
	year,
	semester,
	readOnly,
	saving,
	showSettings,
	setShowSettings,
	coThreshold,
	setCoThreshold,
	passingThreshold,
	setPassingThreshold,
	attainmentThresholds,
	addThreshold,
	updateThreshold,
	removeThreshold,
	saveSettings,
	attainmentCriteria,
	getLevelColorFn,
	studentsData,
	maxMarks,
	loading,
	getPercentageColorFn,
	coMaxMarks,
	attainmentData,
	getLevel,
	copoMatrix,
	updateCOPOMapping,
	calculatePOAttainment,
	poComputations,
	handleCSVDataParsed,
	saveMatrix,
	handleExportAttainment,
	snapshotIndirectData,
}: MatrixViewProps) {
	const [editableProgramme, setEditableProgramme] = useState(programme);
	const [editableYear, setEditableYear] = useState(String(year));
	const [editableSemester, setEditableSemester] = useState(semester);
	const [editableSession, setEditableSession] = useState(String(year)); // default session = year

	const repeaterCount = studentsData.filter((s) => s.is_repeater).length;

	const handleProgrammeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditableProgramme(e.target.value);
	};

	const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditableYear(e.target.value);
	};

	const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditableSemester(e.target.value);
	};

	const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditableSession(e.target.value);
	};

	const handleDownloadTemplate = () => {
		const headers = ["CO", "PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2", "PSO3"];
		const sampleRows = [
			["CO1", "3", "2", "1", "", "", "", "", "", "", "", "", "", "2", "", ""],
			["CO2", "2", "3", "", "", "", "", "", "", "", "", "", "", "", "3", ""],
			["CO3", "", "", "3", "2", "", "", "", "", "", "", "", "", "", "", "2"],
		];
		downloadCSVTemplate("co_po_matrix_template.csv", headers, sampleRows);
	};

	return (
		<div className="space-y-6 pb-8">
			{/* Header Section with Card */}
			<Card className="border-0 shadow-none bg-transparent">
				<CardHeader className="px-0">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
						<div>
							<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
								CO-PO Mapping
							</CardTitle>
							<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
								Course: {courseCode} - {courseName}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end">
							{!readOnly && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											onClick={() =>
												setShowSettings(!showSettings)
											}
											variant="outline"
											size="sm"
											className="flex items-center gap-2"
										>
											<Settings className="h-4 w-4" />
											Attainment Settings
										</Button>
									</TooltipTrigger>
									<TooltipContent side="top">
										Configure attainment levels and threshold options
									</TooltipContent>
								</Tooltip>
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										onClick={() =>
											handleExportAttainment({
												programme: editableProgramme,
												year: editableYear,
												semester: editableSemester,
												session: editableSession,
											})
										}
										variant="outline"
										size="sm"
										className="flex items-center gap-2"
									>
										<Upload className="h-4 w-4" />
										Export Attainment Excel
									</Button>
								</TooltipTrigger>
								<TooltipContent side="top">
									Export direct and indirect CO attainment tables to Excel
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</CardHeader>
			</Card>

			<Card className="w-full border-0 shadow-none bg-transparent">
				<CardContent className="w-full px-0 pt-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
						<div className="flex items-center gap-2 w-full">
							<Label
								htmlFor="programme"
								className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
							>
								Programme:
							</Label>
							<Input
								id="programme"
								type="text"
								value={editableProgramme}
								onChange={handleProgrammeChange}
								className="w-full text-xs border-b border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 focus:outline-none focus:border-blue-500"
								placeholder="Programme"
							/>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Label
								htmlFor="year"
								className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
							>
								Year:
							</Label>
							<Input
								id="year"
								type="text"
								value={editableYear}
								onChange={handleYearChange}
								className="w-full text-xs border-b border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 focus:outline-none focus:border-blue-500"
								placeholder="Year"
							/>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Label
								htmlFor="semester"
								className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
							>
								SEM:
							</Label>
							<Input
								id="semester"
								type="text"
								value={editableSemester}
								onChange={handleSemesterChange}
								className="w-full text-xs border-b border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 focus:outline-none focus:border-blue-500"
								placeholder="SEM"
							/>
						</div>
						<div className="flex items-center gap-2 w-full">
							<Label
								htmlFor="session"
								className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
							>
								Session:
							</Label>
							<Input
								id="session"
								type="text"
								value={editableSession}
								onChange={handleSessionChange}
								className="w-full text-xs border-b border-gray-300 dark:border-gray-600 bg-transparent px-2 py-0.5 focus:outline-none focus:border-blue-500"
								placeholder="Session"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Settings Panel */}
			{showSettings && (
				<Sheet open={showSettings} onOpenChange={setShowSettings}>
					<SheetContent className="w-full sm:w-[600px] md:w-[800px] lg:w-[1050px] xl:w-[1250px] sm:max-w-none max-w-full overflow-y-auto h-full p-6 border-l border-muted/50 bg-background/95 backdrop-blur-md">
						<Suspense
							fallback={
								<div className="space-y-6 p-4">
									<div className="h-8 bg-muted/20 animate-pulse rounded-lg w-1/3" />
									<div className="space-y-4">
										<div className="h-10 bg-muted/20 animate-pulse rounded-lg w-full" />
										<div className="h-[200px] bg-muted/20 animate-pulse rounded-xl w-full" />
									</div>
								</div>
							}
						>
							<AttainmentSettingsPanel
								showSettings={showSettings}
								coThreshold={coThreshold}
								setCoThreshold={setCoThreshold}
								passingThreshold={passingThreshold}
								setPassingThreshold={setPassingThreshold}
								attainmentThresholds={attainmentThresholds}
								addThreshold={addThreshold}
								updateThreshold={updateThreshold}
								removeThreshold={removeThreshold}
								saveSettings={saveSettings}
							/>
						</Suspense>
					</SheetContent>
				</Sheet>
			)}

			{/* Attainment Criteria Card */}
			<AttainmentCriteriaCard
				attainmentCriteria={attainmentCriteria}
				getLevelColor={getLevelColorFn}
			/>

			{/* Passing Marks Card */}
			<PassingMarksCard
				coThreshold={coThreshold}
				passingThreshold={passingThreshold}
			/>

			{repeaterCount > 0 && (
				<div className="p-4 mb-2 text-sm rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 shadow-sm flex items-center gap-2">
					<span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
					<span>
						<strong>Note:</strong> {repeaterCount} repeater {repeaterCount === 1 ? "student is" : "students are"} excluded from the final Batch PO attainment calculation.
					</span>
				</div>
			)}

		{/* Student Marks Table */}
		<StudentMarksTable
			studentsData={studentsData}
			maxMarks={maxMarks}
			facultyName={facultyName}
			departmentName={departmentName}
			courseName={courseName}
			courseCode={courseCode}
			year={editableYear}
			semester={editableSemester}
			programme={editableProgramme}
			session={editableSession}
			loading={loading}
			getPercentageColor={getPercentageColorFn}
			coMaxMarks={coMaxMarks}
		/>

			{/* CO Attainment Tables */}
			{attainmentData && (
				<COAttainmentTable
					attainmentData={attainmentData}
					getAttainmentLevel={getLevel}
					getPercentageColor={getPercentageColorFn}
					coThreshold={coThreshold}
					coMaxMarks={coMaxMarks}
					snapshotIndirectData={snapshotIndirectData}
				/>
			)}

			{/* Action Buttons: Import & Save */}
			{!readOnly && (
				<div className="flex items-center gap-2 justify-end mt-4">
					<CSVUploader
						onDataParsed={handleCSVDataParsed}
						accept=".csv"
						buttonText="Import Matrix"
						onDownloadTemplate={handleDownloadTemplate}
						uploadTooltipText="Upload CO-PO mapping CSV file"
						downloadTooltipText="Download sample CSV template for CO-PO matrix mapping"
					/>
					<Tooltip>
						<TooltipTrigger asChild>
							<span>
								<Button
									onClick={saveMatrix}
									disabled={saving}
									variant="default"
									size="sm"
									className="gap-2 disabled:opacity-50 disabled:pointer-events-none"
								>
									Save Matrix
								</Button>
							</span>
						</TooltipTrigger>
						<TooltipContent side="top">
							Save CO-PO-PSO matrix mappings to database
						</TooltipContent>
					</Tooltip>
				</div>
			)}

			{/* CO-PO-PSO Matrix Table */}
			<COPOMatrixTable
				copoMatrix={copoMatrix}
				readOnly={readOnly}
				courseInfo={{
					university_name: "TEZPUR UNIVERSITY",
					faculty_name: facultyName,
					branch: departmentName,
					programme_name: editableProgramme,
					year: editableYear,
					semester: editableSemester,
					course_name: courseName,
					course_code: courseCode,
					session: editableSession,
				}}
				updateCOPOMapping={updateCOPOMapping}
				calculatePOAttainment={calculatePOAttainment}
				getPercentageColor={getPercentageColorFn}
				attainmentData={attainmentData}
				getAttainmentLevel={getLevel}
				getLevelColor={getLevelColorFn}
				attainmentThresholds={attainmentThresholds}
				coMaxMarks={coMaxMarks}
				snapshotIndirectData={snapshotIndirectData}
			/>

			{/* PO Direct Attainment Table (Sum of Mappings) */}
			<PODirectAttainmentTable
				copoMatrix={copoMatrix}
				coMaxMarks={coMaxMarks}
			/>

			{/* Detailed PO Computation Tables */}
			{poComputations && (
				<>
					<POComputation3PointTable
						data={poComputations.data3Point}
					/>
					<POComputationPercentageTable
						data={poComputations.dataPercentage}
					/>
				</>
			)}
		</div>
	);
}
