import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
}

export interface StudentMarksData {
	sNo: number;
	rollNo: string;
	name: string;
	absentee?: string;
	assessmentMarks: { [assessmentName: string]: COMarks };
	coTotals: COMarks & { total: number };
}

export interface COMarks {
	CO1: number;
	CO2: number;
	CO3: number;
	CO4: number;
	CO5: number;
	CO6: number;
}

export interface AssessmentInfo {
	name: string;
	maxMarks: number;
	coMaxMarks: COMarks;
}

export async function exportAttainmentExcel(opts: AttainmentExportOptions) {
	const {
		attainmentThresholds,
		coThreshold,
		passingThreshold,
		courseCode,
		facultyName = "Dr S. S. Satapathy",
		branch = "Mechanical Engineering",
		programme = "B. Tech",
		year = "I",
		semester = "II",
		courseName = "Introductory Computing",
		session = "2021-22",
		studentsData = [],
		assessments = [],
	} = opts;

	// Sort thresholds descending
	const sorted = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage
	);

	const wb = new ExcelJS.Workbook();
	wb.creator = "NBA System";
	wb.created = new Date();

	const ws = wb.addWorksheet("Attainment");

	// Set default column width for all columns starting from E (column 5) onwards
	for (let col = 5; col <= 100; col++) {
		ws.getColumn(col).width = 6;
	}

	// Columns widths for nice layout (A-D remain custom)
	ws.getColumn(1).width = 14;
	ws.getColumn(2).width = 14;
	ws.getColumn(3).width = 12;
	ws.getColumn(4).width = 12;

	// Left block: merged label for ATTAINMENT CRITERIA covering rows equal to thresholds (or at least 3)
	const rowsNeeded = Math.max(sorted.length, 3);
	ws.mergeCells(1, 1, rowsNeeded, 2); // A1:B{rowsNeeded}
	const leftCell = ws.getCell(1, 1);
	leftCell.value = "ATTAINMENT\nCRITERIA";
	leftCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	leftCell.font = { bold: true, size: 12 };
	leftCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFCCEEFF" },
	};
	leftCell.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Fill thresholds and level numbers in adjacent columns
	for (let i = 0; i < rowsNeeded; i++) {
		const rowIndex = i + 1;
		const thr = sorted[i];
		const valueCell = ws.getCell(rowIndex, 3); // C
		const levelCell = ws.getCell(rowIndex, 4); // D

		if (thr) {
			valueCell.value = thr.percentage;
			valueCell.alignment = { horizontal: "center", vertical: "middle" };
			valueCell.font = { bold: true };
			valueCell.border = {
				top: { style: "thin" },
				right: { style: "thin" },
				bottom: { style: "thin" },
				left: { style: "thin" },
			};

			// Level calculation: top threshold -> highest level (n), next -> n-1, ...
			const level = sorted.length - i;
			levelCell.value = level > 0 ? `${level}` : "0";
			levelCell.alignment = { horizontal: "center", vertical: "middle" };
			levelCell.font = { bold: true };
			levelCell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE68A00" },
			};
			levelCell.border = {
				top: { style: "thin" },
				right: { style: "thin" },
				bottom: { style: "thin" },
				left: { style: "thin" },
			};
		} else {
			valueCell.value = "";
			levelCell.value = "";
		}
	}

	// Right block: Passing marks and CO threshold
	// Row 1: Passing Marks label (G1:M1) and value (N1)
	ws.mergeCells(1, 7, 1, 13); // G1:M1
	const passHeader = ws.getCell(1, 7);
	passHeader.value = "PASSING MARKS (%)";
	passHeader.alignment = { horizontal: "center", vertical: "middle" };
	passHeader.font = { bold: true };
	passHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFEEEEEE" },
	};
	passHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Value for Passing Marks on the right (N1)
	const passValue = ws.getCell(1, 14);
	passValue.value = passingThreshold;
	passValue.alignment = { horizontal: "center", vertical: "middle" };
	passValue.font = { bold: true };
	passValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFDDEEFF" },
	};
	passValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Row 2: Threshold label (G2:M2) and value (N2)
	ws.mergeCells(2, 7, 2, 13); // G2:M2
	const thrHeader = ws.getCell(2, 7);
	thrHeader.value = "Threshold % for CO attainment";
	thrHeader.alignment = { horizontal: "center", vertical: "middle" };
	thrHeader.font = { bold: true };
	thrHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFEEEEEE" },
	};
	thrHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Value for CO threshold on the right (N2)
	const thrValue = ws.getCell(2, 14);
	thrValue.value = coThreshold;
	thrValue.alignment = { horizontal: "center", vertical: "middle" };
	thrValue.font = { bold: true };
	thrValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFF2CC" },
	};
	thrValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Row 3: Note label below threshold
	ws.mergeCells(3, 7, 3, 31); // G3:AE3
	const noteCell = ws.getCell(3, 7);
	noteCell.value =
		'Please fill "AB" for Absent and "UR" for Unregistered candidate(s)';
	noteCell.alignment = { horizontal: "center", vertical: "middle" };
	noteCell.font = { italic: true, size: 10 };
	noteCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFC6E0B4" },
	};
	noteCell.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// University label below attainment criteria (starts at row after criteria block)
	const universityRow = rowsNeeded + 1;
	ws.mergeCells(universityRow, 1, universityRow, 31); // A{universityRow}:AE{universityRow}
	const universityCell = ws.getCell(universityRow, 1);
	universityCell.value = "TEZPUR UNIVERSITY";
	universityCell.alignment = { horizontal: "center", vertical: "middle" };
	universityCell.font = { bold: true, size: 12 };
	universityCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE4B57E" },
	};
	universityCell.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Faculty and course information rows
	const infoRow1 = universityRow + 1;
	const infoRow2 = universityRow + 2;

	// Row 1: Faculty Name and Branch
	// Faculty Name: label
	ws.mergeCells(infoRow1, 1, infoRow1, 2); // A:B
	const facultyLabel = ws.getCell(infoRow1, 1);
	facultyLabel.value = "Faculty Name:";
	facultyLabel.alignment = { horizontal: "center", vertical: "middle" };
	facultyLabel.font = { bold: true };
	facultyLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	facultyLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Faculty Name: value
	ws.mergeCells(infoRow1, 3, infoRow1, 8); // C:H
	const facultyValue = ws.getCell(infoRow1, 3);
	facultyValue.value = facultyName;
	facultyValue.alignment = { horizontal: "center", vertical: "middle" };
	facultyValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// BRANCH label
	ws.getCell(infoRow1, 9).value = "BRANCH";
	ws.getCell(infoRow1, 9).alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	ws.getCell(infoRow1, 9).font = { bold: true };
	ws.getCell(infoRow1, 9).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Branch value
	ws.mergeCells(infoRow1, 10, infoRow1, 14); // J:N
	const branchValue = ws.getCell(infoRow1, 10);
	branchValue.value = branch;
	branchValue.alignment = { horizontal: "center", vertical: "middle" };
	branchValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Course label
	ws.mergeCells(infoRow1, 15, infoRow1, 22); // O:V
	const courseLabel = ws.getCell(infoRow1, 15);
	courseLabel.value = "Course:";
	courseLabel.alignment = { horizontal: "center", vertical: "middle" };
	courseLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Course value
	ws.mergeCells(infoRow1, 23, infoRow1, 31); // W:AE
	const courseValue = ws.getCell(infoRow1, 23);
	courseValue.value = courseName;
	courseValue.alignment = { horizontal: "center", vertical: "middle" };
	courseValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Row 2: Programme, Year, Sem, Course Code, Session
	// Programme label
	ws.mergeCells(infoRow2, 1, infoRow2, 2); // A:B
	const programmeLabel = ws.getCell(infoRow2, 1);
	programmeLabel.value = "Programme:";
	programmeLabel.alignment = { horizontal: "center", vertical: "middle" };
	programmeLabel.font = { bold: true };
	programmeLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	programmeLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Programme value
	ws.mergeCells(infoRow2, 3, infoRow2, 5); // C:E
	const programmeValue = ws.getCell(infoRow2, 3);
	programmeValue.value = programme;
	programmeValue.alignment = { horizontal: "center", vertical: "middle" };
	programmeValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Empty cell
	ws.getCell(infoRow2, 6).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// YEAR label
	ws.getCell(infoRow2, 7).value = "YEAR";
	ws.getCell(infoRow2, 7).alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	ws.getCell(infoRow2, 7).font = { bold: true };
	ws.getCell(infoRow2, 7).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Year value
	ws.getCell(infoRow2, 8).value = year;
	ws.getCell(infoRow2, 8).alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	ws.getCell(infoRow2, 8).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// SEM label
	ws.getCell(infoRow2, 9).value = "SEM";
	ws.getCell(infoRow2, 9).alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	ws.getCell(infoRow2, 9).font = { bold: true };
	ws.getCell(infoRow2, 9).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Semester value
	ws.getCell(infoRow2, 10).value = semester;
	ws.getCell(infoRow2, 10).alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	ws.getCell(infoRow2, 10).border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Empty cells
	for (let col = 11; col <= 14; col++) {
		ws.getCell(infoRow2, col).border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};
	}

	// Course Code label
	ws.mergeCells(infoRow2, 15, infoRow2, 22); // O:V
	const courseCodeLabel = ws.getCell(infoRow2, 15);
	courseCodeLabel.value = "Course Code:";
	courseCodeLabel.alignment = { horizontal: "center", vertical: "middle" };
	courseCodeLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Course Code value
	ws.mergeCells(infoRow2, 23, infoRow2, 26); // W:Z
	const courseCodeValue = ws.getCell(infoRow2, 23);
	courseCodeValue.value = courseCode;
	courseCodeValue.alignment = { horizontal: "center", vertical: "middle" };
	courseCodeValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// SESSION label
	ws.mergeCells(infoRow2, 27, infoRow2, 28); // AA:AB
	const sessionLabel = ws.getCell(infoRow2, 27);
	sessionLabel.value = "SESSION";
	sessionLabel.alignment = { horizontal: "center", vertical: "middle" };
	sessionLabel.font = { bold: true };
	sessionLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Session value
	ws.mergeCells(infoRow2, 29, infoRow2, 31); // AC:AE
	const sessionValue = ws.getCell(infoRow2, 29);
	sessionValue.value = session;
	sessionValue.alignment = { horizontal: "center", vertical: "middle" };
	sessionValue.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Student marks table
	const tableStartRow = infoRow2 + 1;

	// Header row 1: Assessment titles (yellow background)
	const headerRow1 = tableStartRow;

	// Empty cells for S.No, Roll No, Name columns
	ws.mergeCells(headerRow1, 1, headerRow1 + 3, 1); // A - S.No.
	const sNoHeader = ws.getCell(headerRow1, 1);
	sNoHeader.value = "S.No.";
	sNoHeader.alignment = {
		horizontal: "center",
		vertical: "middle",
		wrapText: true,
	};
	sNoHeader.font = { bold: true };
	sNoHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	sNoHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	ws.mergeCells(headerRow1, 2, headerRow1 + 3, 2); // B - Roll No.
	const rollNoHeader = ws.getCell(headerRow1, 2);
	rollNoHeader.value = "Roll No.";
	rollNoHeader.alignment = {
		horizontal: "center",
		vertical: "middle",
		wrapText: true,
	};
	rollNoHeader.font = { bold: true };
	rollNoHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	rollNoHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	ws.mergeCells(headerRow1, 3, headerRow1 + 2, 3); // C - Name of Student
	const nameHeader = ws.getCell(headerRow1, 3);
	nameHeader.value = "Name of Student";
	nameHeader.alignment = {
		horizontal: "center",
		vertical: "middle",
		wrapText: true,
	};
	nameHeader.font = { bold: true };
	nameHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// ABSENTEE RECORD column
	ws.mergeCells(headerRow1, 4, headerRow1 + 2, 4); // D
	const absenteeHeader = ws.getCell(headerRow1, 4);
	absenteeHeader.value = "ABSENTEE RECORD";
	absenteeHeader.alignment = {
		horizontal: "center",
		vertical: "middle",
		wrapText: true,
	};
	absenteeHeader.font = { bold: true };
	absenteeHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	let currentCol = 5;

	// Add assessments dynamically
	const assessmentColumns: {
		name: string;
		startCol: number;
		endCol: number;
	}[] = [];

	assessments.forEach((assessment) => {
		const assessmentStartCol = currentCol;
		const numCols = 6; // 6 COs only
		const assessmentEndCol = currentCol + numCols - 1;

		// Assessment title (spans across all CO columns)
		ws.mergeCells(
			headerRow1,
			assessmentStartCol,
			headerRow1,
			assessmentEndCol
		);
		const assessmentCell = ws.getCell(headerRow1, assessmentStartCol);
		assessmentCell.value = assessment.name;
		assessmentCell.alignment = { horizontal: "center", vertical: "middle" };
		assessmentCell.font = { bold: true };
		assessmentCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" },
		};
		assessmentCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		assessmentColumns.push({
			name: assessment.name,
			startCol: assessmentStartCol,
			endCol: assessmentEndCol,
		});
		currentCol += numCols;
	});

	// TOTAL column at the end
	const totalStartCol = currentCol;
	ws.mergeCells(headerRow1, totalStartCol, headerRow1 + 1, totalStartCol); // TOTAL spans 2 rows
	const totalHeader = ws.getCell(headerRow1, totalStartCol);
	totalHeader.value = "TOTAL";
	totalHeader.alignment = { horizontal: "center", vertical: "middle" };
	totalHeader.font = { bold: true };
	totalHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF87CEEB" },
	};
	totalHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// CO columns - individual headers
	const coStartCol = totalStartCol + 1;
	for (let i = 1; i <= 6; i++) {
		ws.mergeCells(
			headerRow1,
			coStartCol + i - 1,
			headerRow1 + 1,
			coStartCol + i - 1
		);
		const coHeader = ws.getCell(headerRow1, coStartCol + i - 1);
		coHeader.value = `CO${i}`;
		coHeader.alignment = { horizontal: "center", vertical: "middle" };
		coHeader.font = { bold: true };
		coHeader.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" },
		};
		coHeader.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};
	}

	// ΣCO column after CO6
	const sigmaCoCol = coStartCol + 6;
	ws.mergeCells(headerRow1, sigmaCoCol, headerRow1 + 1, sigmaCoCol);
	const sigmaCoHeader = ws.getCell(headerRow1, sigmaCoCol);
	sigmaCoHeader.value = "ΣCO";
	sigmaCoHeader.alignment = { horizontal: "center", vertical: "middle" };
	sigmaCoHeader.font = { bold: true };
	sigmaCoHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	sigmaCoHeader.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Header row 2: CO1-CO6 labels for each assessment
	const headerRow2 = tableStartRow + 1;

	assessmentColumns.forEach(({ startCol }) => {
		for (let i = 0; i < 6; i++) {
			const coCell = ws.getCell(headerRow2, startCol + i);
			coCell.value = `CO${i + 1}`;
			coCell.alignment = { horizontal: "center", vertical: "middle" };
			coCell.font = { bold: true };
			coCell.border = {
				top: { style: "thin" },
				right: { style: "thin" },
				bottom: { style: "thin" },
				left: { style: "thin" },
			};
		}
	});

	// Header row 3: "Maximum Marks" for each assessment and % for TOTAL/COs
	const headerRow3 = tableStartRow + 2;

	// Add % label for TOTAL column
	const totalPercentLabel = ws.getCell(headerRow3, totalStartCol);
	totalPercentLabel.value = "%";
	totalPercentLabel.alignment = { horizontal: "center", vertical: "middle" };
	totalPercentLabel.font = { bold: true };
	totalPercentLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF87CEEB" },
	};
	totalPercentLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Add % labels for CO columns
	for (let i = 0; i < 6; i++) {
		const coPercentLabel = ws.getCell(headerRow3, coStartCol + i);
		coPercentLabel.value = "%";
		coPercentLabel.alignment = { horizontal: "center", vertical: "middle" };
		coPercentLabel.font = { bold: true };
		coPercentLabel.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};
	}

	// Add % label for ΣCO column
	const sigmaCoPercentLabel = ws.getCell(headerRow3, sigmaCoCol);
	sigmaCoPercentLabel.value = "%";
	sigmaCoPercentLabel.alignment = {
		horizontal: "center",
		vertical: "middle",
	};
	sigmaCoPercentLabel.font = { bold: true };
	sigmaCoPercentLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	assessmentColumns.forEach(({ startCol }, idx) => {
		const assessment = assessments[idx];
		// Maximum Marks label (merged across CO1-CO5)
		ws.mergeCells(headerRow3, startCol, headerRow3, startCol + 4);
		const maxMarksCell = ws.getCell(headerRow3, startCol);
		maxMarksCell.value = "Maximum Marks";
		maxMarksCell.alignment = { horizontal: "center", vertical: "middle" };
		maxMarksCell.font = { bold: true };
		maxMarksCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// Maximum Marks value in CO6 column
		const maxMarksValueCell = ws.getCell(headerRow3, startCol + 5);
		maxMarksValueCell.value = assessment.maxMarks;
		maxMarksValueCell.alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		maxMarksValueCell.font = { bold: true };
		maxMarksValueCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" },
		};
		maxMarksValueCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};
	});

	// Header row 4: CO max marks values for each assessment
	const headerRow4 = tableStartRow + 3;

	// "CO WISE MAXIMUM MARKS" label in name column
	const coWiseLabel = ws.getCell(headerRow4, 3);
	coWiseLabel.value = "CO WISE MAXIMUM MARKS";
	coWiseLabel.alignment = { horizontal: "center", vertical: "middle" };
	coWiseLabel.font = { bold: true };
	coWiseLabel.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// "AB" or 0 in absentee column
	const absenteeRow4 = ws.getCell(headerRow4, 4);
	absenteeRow4.value = '"AB" or 0';
	absenteeRow4.alignment = { horizontal: "center", vertical: "middle" };
	absenteeRow4.font = { bold: true };
	absenteeRow4.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	assessmentColumns.forEach(({ startCol }, idx) => {
		const assessment = assessments[idx];
		// CO1-CO6 max marks values
		for (let i = 0; i < 6; i++) {
			const coKey = `CO${i + 1}` as keyof COMarks;
			const coCell = ws.getCell(headerRow4, startCol + i);
			const maxMarkValue = assessment.coMaxMarks[coKey];
			coCell.value = maxMarkValue > 0 ? maxMarkValue : "";
			coCell.alignment = { horizontal: "center", vertical: "middle" };
			coCell.font = { bold: true };
			coCell.border = {
				top: { style: "thin" },
				right: { style: "thin" },
				bottom: { style: "thin" },
				left: { style: "thin" },
			};
		}
	});

	// Total max marks sum
	const totalCOMaxMarks = assessments.reduce(
		(acc, a) => {
			acc.CO1 += a.coMaxMarks.CO1;
			acc.CO2 += a.coMaxMarks.CO2;
			acc.CO3 += a.coMaxMarks.CO3;
			acc.CO4 += a.coMaxMarks.CO4;
			acc.CO5 += a.coMaxMarks.CO5;
			acc.CO6 += a.coMaxMarks.CO6;
			return acc;
		},
		{ CO1: 0, CO2: 0, CO3: 0, CO4: 0, CO5: 0, CO6: 0 }
	);
	const totalMaxSum = Object.values(totalCOMaxMarks).reduce(
		(sum, v) => sum + v,
		0
	);
	const totalMaxCell = ws.getCell(headerRow4, totalStartCol);
	totalMaxCell.value = totalMaxSum;
	totalMaxCell.alignment = { horizontal: "center", vertical: "middle" };
	totalMaxCell.font = { bold: true };
	totalMaxCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF87CEEB" },
	};
	totalMaxCell.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// CO percentage headers (100, 100, ...)
	for (let i = 0; i < 6; i++) {
		const percentCell = ws.getCell(headerRow4, coStartCol + i);
		percentCell.value = 100;
		percentCell.alignment = { horizontal: "center", vertical: "middle" };
		percentCell.font = { bold: true };
		percentCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};
	}

	// ΣCO average percentage (100)
	const sigmaCoSumCell = ws.getCell(headerRow4, sigmaCoCol);
	sigmaCoSumCell.value = 100;
	sigmaCoSumCell.alignment = { horizontal: "center", vertical: "middle" };
	sigmaCoSumCell.font = { bold: true };
	sigmaCoSumCell.border = {
		top: { style: "thin" },
		right: { style: "thin" },
		bottom: { style: "thin" },
		left: { style: "thin" },
	};

	// Determine which COs have questions (max marks > 0 in any assessment)
	const coHasQuestions = [false, false, false, false, false, false];
	for (let i = 0; i < 6; i++) {
		const coKey = `CO${i + 1}` as keyof COMarks;
		coHasQuestions[i] = assessments.some(
			(assessment) => assessment.coMaxMarks[coKey] > 0
		);
	}
	const activeCOCount = coHasQuestions.filter((hasQ) => hasQ).length;

	// Student data rows
	let currentRow = headerRow4 + 1;
	studentsData.forEach((student) => {
		// S.No.
		ws.getCell(currentRow, 1).value = student.sNo;
		ws.getCell(currentRow, 1).alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		ws.getCell(currentRow, 1).border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// Roll No
		ws.getCell(currentRow, 2).value = student.rollNo;
		ws.getCell(currentRow, 2).alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		ws.getCell(currentRow, 2).border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// Name
		ws.getCell(currentRow, 3).value = student.name.toUpperCase();
		ws.getCell(currentRow, 3).alignment = {
			horizontal: "left",
			vertical: "middle",
		};
		ws.getCell(currentRow, 3).border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// Absentee
		ws.getCell(currentRow, 4).value = student.absentee || "";
		ws.getCell(currentRow, 4).alignment = {
			horizontal: "center",
			vertical: "middle",
		};
		ws.getCell(currentRow, 4).border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// Assessment marks
		assessmentColumns.forEach(({ name, startCol }, idx) => {
			const assessment = assessments[idx];
			const marks = student.assessmentMarks[name] || {
				CO1: 0,
				CO2: 0,
				CO3: 0,
				CO4: 0,
				CO5: 0,
				CO6: 0,
			};
			for (let i = 0; i < 6; i++) {
				const coKey = `CO${i + 1}` as keyof COMarks;
				const markValue = marks[coKey] || 0;
				const cell = ws.getCell(currentRow, startCol + i);
				// Only show value if this CO has questions in this assessment
				cell.value = assessment.coMaxMarks[coKey] > 0 ? markValue : "";
				cell.alignment = { horizontal: "center", vertical: "middle" };
				cell.border = {
					top: { style: "thin" },
					right: { style: "thin" },
					bottom: { style: "thin" },
					left: { style: "thin" },
				};
			}
		});

		// Grand total
		const grandTotal = student.coTotals.total;
		const grandTotalCell = ws.getCell(currentRow, totalStartCol);
		grandTotalCell.value = grandTotal.toFixed(2);
		grandTotalCell.alignment = { horizontal: "center", vertical: "middle" };
		grandTotalCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" },
		};
		grandTotalCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		// CO percentages
		let coPercentagesSum = 0;
		for (let i = 0; i < 6; i++) {
			const coKey = `CO${i + 1}` as keyof COMarks;
			const percentage = student.coTotals[coKey];
			// Only add to sum if this CO has questions
			if (coHasQuestions[i]) {
				coPercentagesSum += percentage;
			}
			const cell = ws.getCell(currentRow, coStartCol + i);
			// Only show percentage if this CO has questions
			cell.value = coHasQuestions[i] ? percentage.toFixed(2) : "";
			cell.alignment = { horizontal: "center", vertical: "middle" };

			// Color code based on percentage (only if CO has questions)
			if (coHasQuestions[i]) {
				if (percentage >= 70) {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FF90EE90" },
					}; // Light green
				} else if (percentage >= 60) {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFFFFF00" },
					}; // Yellow
				} else if (percentage >= 50) {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFFFA500" },
					}; // Orange
				} else {
					cell.fill = {
						type: "pattern",
						pattern: "solid",
						fgColor: { argb: "FFFF6B6B" },
					}; // Red
				}
			}

			cell.border = {
				top: { style: "thin" },
				right: { style: "thin" },
				bottom: { style: "thin" },
				left: { style: "thin" },
			};
		}

		// ΣCO average percentage (only for COs with questions)
		const sigmaCoAverage =
			activeCOCount > 0 ? coPercentagesSum / activeCOCount : 0;
		const sigmaCoCell = ws.getCell(currentRow, sigmaCoCol);
		sigmaCoCell.value = sigmaCoAverage.toFixed(2);
		sigmaCoCell.alignment = { horizontal: "center", vertical: "middle" };
		sigmaCoCell.border = {
			top: { style: "thin" },
			right: { style: "thin" },
			bottom: { style: "thin" },
			left: { style: "thin" },
		};

		currentRow++;
	});

	// Finalize and save
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const fileName = `${courseCode || "attainment"}_attainment.xlsx`;
	saveAs(blob, fileName);
}
