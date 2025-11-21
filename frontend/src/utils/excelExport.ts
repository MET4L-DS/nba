import ExcelJS from "exceljs";
import type {
	StudentMarks,
	AttainmentData,
	AttainmentThreshold,
} from "@/components/copo/types";

interface ExportData {
	studentsData: StudentMarks[];
	maxMarks: {
		[testName: string]: {
			total: number;
			CO1: number;
			CO2: number;
			CO3: number;
			CO4: number;
			CO5: number;
			CO6: number;
		};
	};
	attainmentData: AttainmentData;
	attainmentThresholds: AttainmentThreshold[];
	courseInfo: {
		courseCode: string;
		courseName: string;
		facultyName: string;
		departmentName: string;
		year: number;
		semester: number;
	};
	coThreshold: number;
	passingThreshold: number;
}

export async function exportToExcel(data: ExportData): Promise<void> {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet("CO Attainment");

	// Set column widths
	worksheet.getColumn(1).width = 5; // S.No
	worksheet.getColumn(2).width = 12; // Roll No
	worksheet.getColumn(3).width = 30; // Name
	worksheet.getColumn(4).width = 12; // Absentee Record

	// Set width = 5 for all columns starting from column E (5) onwards
	for (let col = 5; col <= 50; col++) {
		worksheet.getColumn(col).width = 6;
	}

	const testNames = Object.keys(data.maxMarks);
	const totalTests = testNames.length;

	// Add attainment criteria section at top
	addAttainmentCriteriaSection(worksheet, data.attainmentThresholds);

	// Add passing marks info
	addPassingMarksSection(worksheet, data.coThreshold, data.passingThreshold);

	// Add university header
	addUniversityHeader(worksheet, data.courseInfo, totalTests);

	// Add student marks table
	const studentTableStartRow = addStudentMarksTable(
		worksheet,
		data.studentsData,
		data.maxMarks,
		testNames,
		totalTests
	);

	// Add CO attainment tables
	addCOAttainmentTables(
		worksheet,
		data.attainmentData,
		data.attainmentThresholds,
		data.passingThreshold,
		studentTableStartRow
	);

	// Generate and download file
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `CO_Attainment_${data.courseInfo.courseCode}_${data.courseInfo.year}_${data.courseInfo.semester}.xlsx`;
	link.click();
	URL.revokeObjectURL(url);
}

function addAttainmentCriteriaSection(
	worksheet: ExcelJS.Worksheet,
	attainmentThresholds: AttainmentThreshold[]
): void {
	// Sort thresholds descending
	const sorted = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage
	);

	// Calculate total rows needed (only sorted thresholds, no level 0)
	const totalRows = sorted.length;

	// Merge cells vertically for "ATTAINMENT CRITERIA" label (columns A-B, rows 1 to totalRows)
	worksheet.mergeCells(1, 1, totalRows, 2);
	const headerCell = worksheet.getCell("A1");
	headerCell.value = "ATTAINMENT CRITERIA";
	headerCell.font = { bold: true, size: 11 };
	headerCell.alignment = { vertical: "middle", horizontal: "center" };
	headerCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Add each level to the right of the label
	sorted.forEach((threshold, index) => {
		const level = sorted.length - index;
		const row = index + 1;
		const percentCell = worksheet.getCell(row, 3); // Column C
		const levelCell = worksheet.getCell(row, 4); // Column D

		percentCell.value = threshold.percentage;
		percentCell.alignment = { horizontal: "center", vertical: "middle" };
		percentCell.font = { bold: true };
		percentCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFF9800" }, // Orange
		};
		percentCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};

		levelCell.value = level;
		levelCell.alignment = { horizontal: "center", vertical: "middle" };
		levelCell.font = { bold: true };
		levelCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFF9800" }, // Orange
		};
		levelCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	});
}

function addPassingMarksSection(
	worksheet: ExcelJS.Worksheet,
	coThreshold: number,
	passingThreshold: number
): void {
	const row = 1;

	// Merge cells for "PASSING MARKS (%)"
	worksheet.mergeCells(`F${row}:I${row}`);
	const headerCell = worksheet.getCell(`F${row}`);
	headerCell.value = "PASSING MARKS (%)";
	headerCell.font = { bold: true, size: 11 };
	headerCell.alignment = { vertical: "middle", horizontal: "center" };
	headerCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFD3D3D3" }, // Light gray
	};
	headerCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// CO threshold
	const coRow = 2;
	worksheet.mergeCells(`F${coRow}:H${coRow}`);
	const coLabelCell = worksheet.getCell(`F${coRow}`);
	coLabelCell.value = "Threshold % for CO attainment";
	coLabelCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
	};
	coLabelCell.font = { size: 10 };
	coLabelCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE8F5E9" }, // Light green
	};

	const coValueCell = worksheet.getCell(`I${coRow}`);
	coValueCell.value = coThreshold;
	coValueCell.alignment = { vertical: "middle", horizontal: "center" };
	coValueCell.font = { bold: true };
	coValueCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Passing threshold (if different from CO threshold)
	const passRow = 3;
	const passLabelCell = worksheet.getCell(`M${passRow}`);
	passLabelCell.value = passingThreshold;
	passLabelCell.alignment = { vertical: "middle", horizontal: "center" };
	passLabelCell.font = { bold: true };
}

function addUniversityHeader(
	worksheet: ExcelJS.Worksheet,
	_courseInfo: any,
	_totalTests: number
): void {
	const headerRow = 4;

	// Note row - start from column E (5) to avoid overlap with attainment criteria
	const noteRow = 3;
	const noteStartCol = 5; // Column E - after attainment criteria section
	const endCol = 8 + _totalTests * 7; // Adjust based on number of tests
	worksheet.mergeCells(noteRow, noteStartCol, noteRow, Math.min(50, endCol));
	const noteCell = worksheet.getCell(noteRow, noteStartCol);
	noteCell.value =
		'Please fill "AB" for Absent and "UR" for Unregistered candidate(s)';
	noteCell.font = { italic: true, size: 9 };
	noteCell.alignment = { vertical: "middle", horizontal: "center" };
	noteCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFBCE1B3" }, // pale green
	};
	noteCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// University name header - start from column E (5) to avoid attainment criteria overlap
	const univStartCol = 1; // Column E - after attainment criteria section
	worksheet.mergeCells(
		headerRow,
		univStartCol,
		headerRow,
		Math.min(endCol, 50)
	);
	const univCell = worksheet.getCell(headerRow, univStartCol);
	univCell.value = "TEZPUR UNIVERSITY";
	univCell.font = { bold: true, size: 12 };
	univCell.alignment = { vertical: "middle", horizontal: "center" };
	univCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFD2B48C" }, // Tan color
	};
	univCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "medium" },
		right: { style: "thin" },
	};
}

function addStudentMarksTable(
	worksheet: ExcelJS.Worksheet,
	studentsData: StudentMarks[],
	maxMarks: any,
	testNames: string[],
	_totalTests: number
): number {
	const startRow = 5; // Start after university header at row 4

	// Add course info row (Faculty Name)
	const infoRow = startRow;

	// Faculty Name label and value
	worksheet.mergeCells(`A${infoRow}:B${infoRow}`);
	const facultyLabel = worksheet.getCell(`A${infoRow}`);
	facultyLabel.value = "Faculty Name:";
	facultyLabel.font = { bold: true, size: 10 };
	facultyLabel.alignment = { vertical: "middle", horizontal: "left" };
	facultyLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	facultyLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	const facultyValue = worksheet.getCell(`C${infoRow}`);
	facultyValue.value = "Dr S. S. Satapathy";
	facultyValue.font = { size: 10 };
	facultyValue.alignment = { vertical: "middle", horizontal: "left" };
	facultyValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	facultyValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// BRANCH label and value
	const branchLabel = worksheet.getCell(`E${infoRow}`);
	branchLabel.value = "BRANCH";
	branchLabel.font = { bold: true, size: 10 };
	branchLabel.alignment = { vertical: "middle", horizontal: "center" };
	branchLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	branchLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	worksheet.mergeCells(`F${infoRow}:H${infoRow}`);
	const branchValue = worksheet.getCell(`F${infoRow}`);
	branchValue.value = "Mechanical Engineering";
	branchValue.font = { size: 10 };
	branchValue.alignment = { vertical: "middle", horizontal: "left" };
	branchValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	branchValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Course label and value
	const courseLabel = worksheet.getCell(`S${infoRow}`);
	courseLabel.value = "Course:";
	courseLabel.font = { bold: true, size: 10 };
	courseLabel.alignment = { vertical: "middle", horizontal: "left" };
	courseLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	courseLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	worksheet.mergeCells(`T${infoRow}:AE${infoRow}`);
	const courseValue = worksheet.getCell(`T${infoRow}`);
	courseValue.value = "Introductory Computing";
	courseValue.font = { size: 10 };
	courseValue.alignment = { vertical: "middle", horizontal: "left" };
	courseValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	courseValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Programme row
	const progRow = startRow + 1;

	// Programme label and value
	worksheet.mergeCells(`A${progRow}:B${progRow}`);
	const progLabel = worksheet.getCell(`A${progRow}`);
	progLabel.value = "Programme:";
	progLabel.font = { bold: true, size: 10 };
	progLabel.alignment = { vertical: "middle", horizontal: "left" };
	progLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	}; // Yellow
	progLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	worksheet.mergeCells(`C${progRow}:D${progRow}`);
	const progValue = worksheet.getCell(`C${progRow}`);
	progValue.value = "B. Tech";
	progValue.font = { size: 10 };
	progValue.alignment = { vertical: "middle", horizontal: "left" };
	progValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	progValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// YEAR label and value
	const yearLabel = worksheet.getCell(`E${progRow}`);
	yearLabel.value = "YEAR";
	yearLabel.font = { bold: true, size: 10 };
	yearLabel.alignment = { vertical: "middle", horizontal: "center" };
	yearLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	yearLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	const yearValue = worksheet.getCell(`F${progRow}`);
	yearValue.value = "I";
	yearValue.font = { size: 10 };
	yearValue.alignment = { vertical: "middle", horizontal: "center" };
	yearValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	yearValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// SEM label and value
	const semLabel = worksheet.getCell(`G${progRow}`);
	semLabel.value = "SEM";
	semLabel.font = { bold: true, size: 10 };
	semLabel.alignment = { vertical: "middle", horizontal: "center" };
	semLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	semLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	const semValue = worksheet.getCell(`H${progRow}`);
	semValue.value = "II";
	semValue.font = { size: 10 };
	semValue.alignment = { vertical: "middle", horizontal: "center" };
	semValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	semValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Course Code label and value
	const courseCodeLabel = worksheet.getCell(`S${progRow}`);
	courseCodeLabel.value = "Course Code:";
	courseCodeLabel.font = { bold: true, size: 10 };
	courseCodeLabel.alignment = { vertical: "middle", horizontal: "left" };
	courseCodeLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	courseCodeLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	worksheet.mergeCells(`T${progRow}:U${progRow}`);
	const courseCodeValue = worksheet.getCell(`T${progRow}`);
	courseCodeValue.value = "CO103";
	courseCodeValue.font = { size: 10 };
	courseCodeValue.alignment = { vertical: "middle", horizontal: "center" };
	courseCodeValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	courseCodeValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// SESSION label and value
	const sessionLabel = worksheet.getCell(`AC${progRow}`);
	sessionLabel.value = "SESSION";
	sessionLabel.font = { bold: true, size: 10 };
	sessionLabel.alignment = { vertical: "middle", horizontal: "center" };
	sessionLabel.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	sessionLabel.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	worksheet.mergeCells(`AD${progRow}:AE${progRow}`);
	const sessionValue = worksheet.getCell(`AD${progRow}`);
	sessionValue.value = "2021-22";
	sessionValue.font = { size: 10 };
	sessionValue.alignment = { vertical: "middle", horizontal: "center" };
	sessionValue.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFFFF" },
	};
	sessionValue.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Add assessment headers
	const assessmentRow = startRow + 2;
	let currentCol = 5; // Column I

	testNames.forEach((testName) => {
		// Merge cells for test name
		worksheet.mergeCells(
			assessmentRow,
			currentCol,
			assessmentRow,
			currentCol + 5
		);
		const testCell = worksheet.getCell(assessmentRow, currentCol);
		testCell.value = `Assessment of ${testName}`;
		testCell.font = { bold: true, size: 10 };
		testCell.alignment = { vertical: "middle", horizontal: "center" };
		testCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" }, // Yellow
		};
		testCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};

		currentCol += 6;
	});

	// Add Maximum Marks row for each assessment
	const maxMarksHeaderRow = assessmentRow + 1;
	currentCol = 5;
	testNames.forEach((testName) => {
		// Merge cells for "Maximum Marks: XX"
		worksheet.mergeCells(
			maxMarksHeaderRow,
			currentCol,
			maxMarksHeaderRow,
			currentCol + 5
		);
		const maxCell = worksheet.getCell(maxMarksHeaderRow, currentCol);
		const testMax = maxMarks[testName]?.total || 0;
		maxCell.value = `Maximum Marks       ${testMax}`;
		maxCell.font = { bold: true, size: 10 };
		maxCell.alignment = { vertical: "middle", horizontal: "center" };
		maxCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFB3D9FF" }, // Light blue
		};
		maxCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};

		currentCol += 6;
	});

	// Add headers row (S.No, Roll No, Name, etc.)
	const headerRow = startRow + 3; // Move up one row to align with assessment headers

	// S.No - merge 3 rows vertically (spans all 3 header rows)
	worksheet.mergeCells(headerRow, 1, headerRow + 2, 1);
	const snoCell = worksheet.getCell(headerRow, 1);
	snoCell.value = "S.No.";
	snoCell.font = { bold: true, size: 9 };
	snoCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	snoCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	snoCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Roll No - merge 3 rows vertically
	worksheet.mergeCells(headerRow, 2, headerRow + 2, 2);
	const rollNoCell = worksheet.getCell(headerRow, 2);
	rollNoCell.value = "Roll No.";
	rollNoCell.font = { bold: true, size: 9 };
	rollNoCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	rollNoCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	rollNoCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Name of Student - merge 2 rows vertically
	worksheet.mergeCells(headerRow, 3, headerRow + 1, 3);
	const nameCell = worksheet.getCell(headerRow, 3);
	nameCell.value = "Name of Student";
	nameCell.font = { bold: true, size: 9 };
	nameCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	nameCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	nameCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Absentee Record - merge 2 rows vertically
	worksheet.mergeCells(headerRow, 4, headerRow + 1, 4);
	const absenteeCell = worksheet.getCell(headerRow, 4);
	absenteeCell.value = "ABSENTEE RECORD";
	absenteeCell.font = { bold: true, size: 9 };
	absenteeCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	absenteeCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	absenteeCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// CO headers for each test (row with CO1, CO2, etc.)
	currentCol = 5;
	testNames.forEach(() => {
		for (let co = 1; co <= 6; co++) {
			const cell = worksheet.getCell(headerRow + 1, currentCol);
			cell.value = `CO${co}`;
			cell.font = { bold: true, size: 9 };
			cell.alignment = { vertical: "middle", horizontal: "center" };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFE0E0E0" },
			};
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
			currentCol++;
		}
	});

	// Add CO totals headers (TOTAL%, CO1%, etc.)
	worksheet.mergeCells(headerRow, currentCol, headerRow, currentCol);
	const totalHeaderCell = worksheet.getCell(headerRow, currentCol);
	totalHeaderCell.value = "TOTAL\n%";
	totalHeaderCell.font = { bold: true, size: 9 };
	totalHeaderCell.alignment = {
		wrapText: true,
		vertical: "middle",
		horizontal: "center",
	};
	totalHeaderCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	totalHeaderCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	currentCol++;

	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(headerRow, currentCol);
		cell.value = `CO${co}\n%`;
		cell.font = { bold: true, size: 9 };
		cell.alignment = {
			wrapText: true,
			vertical: "middle",
			horizontal: "center",
		};
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
		currentCol++;
	}

	const sigmaCell = worksheet.getCell(headerRow, currentCol);
	sigmaCell.value = "ΣCO\n%";
	sigmaCell.font = { bold: true, size: 9 };
	sigmaCell.alignment = {
		wrapText: true,
		vertical: "middle",
		horizontal: "center",
	};
	sigmaCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	sigmaCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Add max marks row (CO WISE MAXIMUM MARKS)
	const maxMarksRow = headerRow + 2;
	worksheet.getCell(maxMarksRow, 3).value = "CO WISE MAXIMUM MARKS";
	const maxMarksRowCell = worksheet.getCell(maxMarksRow, 3);
	maxMarksRowCell.font = { bold: true, size: 9 };
	maxMarksRowCell.alignment = { vertical: "middle", horizontal: "center" };
	maxMarksRowCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	maxMarksRowCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Style the "AB" or "UR" cell
	const abUrCell = worksheet.getCell(maxMarksRow, 4);
	abUrCell.value = '"AB" or "UR"';
	abUrCell.font = { bold: true, size: 8 };
	abUrCell.alignment = {
		vertical: "middle",
		horizontal: "center",
		wrapText: true,
	};
	abUrCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	};
	abUrCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Add CO max marks values
	currentCol = 5;
	testNames.forEach((testName) => {
		const testMaxMarks = maxMarks[testName];
		for (let co = 1; co <= 6; co++) {
			const cell = worksheet.getCell(maxMarksRow, currentCol++);
			cell.value = testMaxMarks[`CO${co}`] || 0;
			cell.alignment = { vertical: "middle", horizontal: "center" };
			cell.font = { bold: true };
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		}
	});

	// Add total max marks (100)
	const totalMaxCell = worksheet.getCell(maxMarksRow, currentCol);
	totalMaxCell.value = 100;
	totalMaxCell.alignment = { vertical: "middle", horizontal: "center" };
	totalMaxCell.font = { bold: true };
	totalMaxCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	currentCol++;

	// Add student data
	let dataRow = maxMarksRow + 1;
	studentsData.forEach((student, index) => {
		worksheet.getCell(dataRow, 1).value = index + 1;
		worksheet.getCell(dataRow, 2).value = student.rollNo;
		worksheet.getCell(dataRow, 3).value = student.name;
		worksheet.getCell(dataRow, 4).value = student.absentee || "";

		// Add test marks
		currentCol = 5;
		testNames.forEach((testName) => {
			const testMarks = student.tests[testName] || {
				CO1: 0,
				CO2: 0,
				CO3: 0,
				CO4: 0,
				CO5: 0,
				CO6: 0,
			};
			for (let co = 1; co <= 6; co++) {
				const cell = worksheet.getCell(dataRow, currentCol++);
				cell.value = testMarks[`CO${co}`] || 0;
				cell.alignment = { vertical: "middle", horizontal: "center" };
			}
		});

		// Add totals
		const totalCell = worksheet.getCell(dataRow, currentCol++);
		totalCell.value = student.total.toFixed(2);
		totalCell.numFmt = "0.00";
		totalCell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFFFFF00" },
		};

		// Add CO percentages
		for (let co = 1; co <= 6; co++) {
			const cell = worksheet.getCell(dataRow, currentCol++);
			const coKey = `CO${co}` as
				| "CO1"
				| "CO2"
				| "CO3"
				| "CO4"
				| "CO5"
				| "CO6";
			const percentage = student.coTotals[coKey];
			cell.value = percentage.toFixed(2);
			cell.numFmt = "0.00";

			// Color coding based on percentage
			if (percentage >= 70) {
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FF90EE90" },
				};
			} else if (percentage >= 60) {
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFFFF99" },
				};
			} else if (percentage >= 50) {
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFFA500" },
				};
			} else {
				cell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFFF6B6B" },
				};
			}
		}

		// ΣCO
		const sumCell = worksheet.getCell(dataRow, currentCol);
		sumCell.value = student.coTotals.ΣCO.toFixed(2);
		sumCell.numFmt = "0.00";

		dataRow++;
	});

	return dataRow;
}

function addCOAttainmentTables(
	worksheet: ExcelJS.Worksheet,
	attainmentData: AttainmentData,
	attainmentThresholds: AttainmentThreshold[],
	_passingThreshold: number,
	startRow: number
): void {
	let currentRow = startRow + 2;

	// Add CO ATTAINMENT section header
	worksheet.mergeCells(currentRow, 1, currentRow + 1, 13);
	const attainmentHeader = worksheet.getCell(currentRow, 1);
	attainmentHeader.value = "CO ATTAINMENT  in 3.0 POINT Scale";
	attainmentHeader.font = { bold: true, size: 11 };
	attainmentHeader.alignment = { vertical: "middle", horizontal: "center" };
	attainmentHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFC0CB" }, // Pink
	};

	currentRow += 2;

	// Add attainment table data
	addAttainmentTableData(
		worksheet,
		attainmentData,
		attainmentThresholds,
		currentRow
	);

	// Add absolute scale section
	currentRow += 8;
	worksheet.mergeCells(currentRow, 1, currentRow + 1, 13);
	const absoluteHeader = worksheet.getCell(currentRow, 1);
	absoluteHeader.value = "CO ATTAINMENT  in ABSOLUTE Scale";
	absoluteHeader.font = { bold: true, size: 11 };
	absoluteHeader.alignment = { vertical: "middle", horizontal: "center" };
	absoluteHeader.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFC0CB" },
	};

	currentRow += 2;
	addAbsoluteAttainmentTable(worksheet, attainmentData, currentRow);
}

function addAttainmentTableData(
	worksheet: ExcelJS.Worksheet,
	attainmentData: AttainmentData,
	attainmentThresholds: AttainmentThreshold[],
	startRow: number
): void {
	const sorted = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage
	);

	// Headers - First row: "ATTAINMENT TABLE" spanning column 7-13
	worksheet.mergeCells(startRow, 1, startRow, 7);
	const tableHeaderCell = worksheet.getCell(startRow, 1);
	tableHeaderCell.value = "ATTAINMENT TABLE";
	tableHeaderCell.font = { bold: true, size: 11 };
	tableHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
	tableHeaderCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	tableHeaderCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Second row: "CO1 to CO6"
	worksheet.mergeCells(startRow, 8, startRow, 13);
	const coHeaderCell = worksheet.getCell(startRow, 8);
	coHeaderCell.value = "CO1 to CO6";
	coHeaderCell.font = { bold: true, size: 10 };
	coHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
	coHeaderCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFB3D9FF" },
	};
	coHeaderCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Third row: Individual CO headers (CO1, CO2, CO3, CO4, CO5, CO6)
	const coHeaderRow = startRow + 1;
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(coHeaderRow, 7 + co);
		cell.value = `CO${co}`;
		cell.font = { bold: true, size: 10 };
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}

	let row = startRow + 2;

	// Absentee row
	worksheet.mergeCells(row, 1, row, 7);
	const absenteeCell = worksheet.getCell(row, 1);
	absenteeCell.value = "ABSENTEE+NOT ATTEMPT";
	absenteeCell.font = { size: 10 };
	absenteeCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
	};
	absenteeCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = attainmentData.absentees;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Present students
	worksheet.mergeCells(row, 1, row, 7);
	const presentCell = worksheet.getCell(row, 1);
	presentCell.value = "PRESENT STUDENT OR ATTEMPT";
	presentCell.font = { size: 10 };
	presentCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
	};
	presentCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = attainmentData.presentStudents;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Students above threshold
	worksheet.mergeCells(row, 1, row, 7);
	const thresholdLabelCell = worksheet.getCell(row, 1);
	thresholdLabelCell.value = `NO. OF STUDENTS SECURE MARKS > THRESHOLD % FOR CO ATTAINMENT`;
	thresholdLabelCell.font = { size: 10 };
	thresholdLabelCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
		wrapText: true,
	};
	thresholdLabelCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const count = attainmentData.coStats[coKey].above70;
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = count;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF808080" },
		};
		cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Percentage of students
	worksheet.mergeCells(row, 1, row, 7);
	const percentLabelCell = worksheet.getCell(row, 1);
	percentLabelCell.value = `PC. OF STUDENTS SECURE MARKS > THRESHOLD % FOR CO ATTAINMENT`;
	percentLabelCell.font = { size: 10 };
	percentLabelCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
		wrapText: true,
	};
	percentLabelCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[coKey].above70 /
						attainmentData.presentStudents) *
				  100
				: 0;
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = percentage.toFixed(2);
		cell.numFmt = "0.00";
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// CO Attainment level
	worksheet.mergeCells(row, 1, row, 7);
	const attainmentLabelCell = worksheet.getCell(row, 1);
	attainmentLabelCell.value = `CO Attainment (${sorted
		.map((t, i) => `${sorted.length - i} ≥ ${t.percentage}%`)
		.join(", ")})`;
	attainmentLabelCell.font = { size: 10 };
	attainmentLabelCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
		wrapText: true,
	};
	attainmentLabelCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[coKey].above70 /
						attainmentData.presentStudents) *
				  100
				: 0;

		let level = 0;
		for (let i = 0; i < sorted.length; i++) {
			if (percentage >= sorted[i].percentage) {
				level = sorted.length - i;
				break;
			}
		}

		const cell = worksheet.getCell(row, 7 + co);
		cell.value = level.toFixed(2);
		cell.numFmt = "0.00";
		cell.font = { bold: true };
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF87CEEB" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
}

function addAbsoluteAttainmentTable(
	worksheet: ExcelJS.Worksheet,
	attainmentData: AttainmentData,
	startRow: number
): void {
	// Headers - First row: "ATTAINMENT TABLE"
	worksheet.mergeCells(startRow, 1, startRow, 7);
	const tableHeaderCell = worksheet.getCell(startRow, 1);
	tableHeaderCell.value = "ATTAINMENT TABLE";
	tableHeaderCell.font = { bold: true, size: 11 };
	tableHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
	tableHeaderCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFFFFF00" },
	};
	tableHeaderCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Second row: "CO1 to CO6"
	worksheet.mergeCells(startRow, 8, startRow, 13);
	const coHeaderCell = worksheet.getCell(startRow, 8);
	coHeaderCell.value = "CO1 to CO6";
	coHeaderCell.font = { bold: true, size: 10 };
	coHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
	coHeaderCell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFB3D9FF" },
	};
	coHeaderCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};

	// Third row: Individual CO headers
	const coHeaderRow = startRow + 1;
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(coHeaderRow, 7 + co);
		cell.value = `CO${co}`;
		cell.font = { bold: true, size: 10 };
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}

	let row = startRow + 2;

	// Absentee
	worksheet.mergeCells(row, 1, row, 7);
	const absenteeCell = worksheet.getCell(row, 1);
	absenteeCell.value = "ABSENTEE+NOT ATTEMPT";
	absenteeCell.font = { size: 10 };
	absenteeCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
	};
	absenteeCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = attainmentData.absentees;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Present students
	worksheet.mergeCells(row, 1, row, 7);
	const presentCell = worksheet.getCell(row, 1);
	presentCell.value = "PRESENT STUDENT OR ATTEMPT";
	presentCell.font = { size: 10 };
	presentCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
	};
	presentCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = attainmentData.presentStudents;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Students above passing marks
	worksheet.mergeCells(row, 1, row, 7);
	const passLabelCell = worksheet.getCell(row, 1);
	passLabelCell.value = "NO. OF STUDENTS SECURE MARKS > PASSING MARKS";
	passLabelCell.font = { size: 10 };
	passLabelCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
		wrapText: true,
	};
	passLabelCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const count = attainmentData.coStats[coKey].abovePass;
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = count;
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF808080" },
		};
		cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Percentage
	worksheet.mergeCells(row, 1, row, 7);
	const percentCell = worksheet.getCell(row, 1);
	percentCell.value = "PC. OF STUDENTS SECURE MARKS > PASSING MARKS";
	percentCell.font = { size: 10 };
	percentCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1,
		wrapText: true,
	};
	percentCell.border = {
		top: { style: "thin" },
		left: { style: "thin" },
		bottom: { style: "thin" },
		right: { style: "thin" },
	};
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[coKey].abovePass /
						attainmentData.presentStudents) *
				  100
				: 0;
		const cell = worksheet.getCell(row, 7 + co);
		cell.value = percentage.toFixed(2);
		cell.numFmt = "0.00";
		cell.font = { bold: true };
		cell.alignment = { vertical: "middle", horizontal: "center" };
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FF90EE90" },
		};
		cell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
	}
	row++;

	// Average attainment
	worksheet.getCell(row, 7).value =
		"CO Attainment (AVERAGE OF PERCENTAGE ATTAINMENTS)";
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[coKey].abovePass /
						attainmentData.presentStudents) *
				  100
				: 0;
		const cell = worksheet.getCell(row, 8 + co - 1);
		cell.value = percentage.toFixed(2);
		cell.numFmt = "0.00";
	}
	row++;

	// Final attainment
	worksheet.getCell(row, 7).value =
		"Final attainment level CO (IN ABSOLUTE SCALE):";
	for (let co = 1; co <= 6; co++) {
		const coKey = `CO${co}` as
			| "CO1"
			| "CO2"
			| "CO3"
			| "CO4"
			| "CO5"
			| "CO6";
		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[coKey].abovePass /
						attainmentData.presentStudents) *
				  100
				: 0;
		const cell = worksheet.getCell(row, 8 + co - 1);
		cell.value = percentage.toFixed(2);
		cell.numFmt = "0.00";
		cell.font = { bold: true };
	}
}
