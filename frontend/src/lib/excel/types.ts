export interface AttainmentExportOptions {
	attainmentThresholds: { id: number; percentage: number }[];
	coThreshold: number;
	passingThreshold: number;
	courseCode?: string;
	facultyName?: string;
	branch?: string;
	programme?: string;
	year?: string;
	semester?: string;
	courseName?: string;
	session?: string;
	studentsData?: StudentMarksData[];
	assessments?: AssessmentInfo[];
	copoMatrix?: COPOMatrix;
	snapshotIndirectData?: Array<{
		co_name: string;
		attainment_percentage: number;
		attainment_level: number;
		indirect_attainment_percentage?: number | null;
		indirect_attainment_level?: number | null;
		final_attainment_percentage?: number | null;
		final_attainment_level?: number | null;
	}>;
	directWeightage?: number;
	indirectWeightage?: number;
}

export interface COPOMatrix {
	[co: string]: {
		[po: string]: number;
	};
}

export interface StudentMarksData {
	sNo: number;
	rollNo: string;
	name: string;
	programmeName?: string;
	absentee?: string;
	assessmentMarks: { [assessmentName: string]: COMarks };
	coTotals: COMarks & { total: number };
}

export interface COMarks {
	[coName: string]: number;
}

export interface AssessmentInfo {
	name: string;
	maxMarks: number;
	coMaxMarks: COMarks;
}

export interface AssessmentColumn {
	name: string;
	startCol: number;
	endCol: number;
}

/**
 * Calculate total max marks per CO from all assessments
 */
export function calculateTotalCOMaxMarks(
	assessments: AssessmentInfo[]
): COMarks {
	const totals: COMarks = {};
	if (!assessments) return totals;
	assessments.forEach((assessment) => {
		if (assessment.coMaxMarks) {
			Object.entries(assessment.coMaxMarks).forEach(([co, marks]) => {
				totals[co] = (totals[co] || 0) + (marks || 0);
			});
		}
	});
	return totals;
}

/**
 * Check if a CO is assessed (has max marks > 0)
 */
export function isCOAssessed(co: string, coMaxMarks: COMarks): boolean {
	return (coMaxMarks && coMaxMarks[co] || 0) > 0;
}

