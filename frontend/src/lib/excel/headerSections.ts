import ExcelJS from "exceljs";
import { styleCell, mergeAndStyle, standardCellBorder } from "./excelUtils";

export function createAttainmentCriteriaSection(
	ws: ExcelJS.Worksheet,
	attainmentThresholds: { id: number; percentage: number }[]
) {
	const sorted = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage
	);
	const rowsNeeded = Math.max(sorted.length, 3);

	// Merged label for ATTAINMENT CRITERIA
	mergeAndStyle(ws, 1, 1, rowsNeeded, 2, {
		value: "ATTAINMENT\nCRITERIA",
		bold: true,
		size: 12,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
		fillColor: "FFCCEEFF",
	});

	// Fill thresholds and level numbers
	for (let i = 0; i < rowsNeeded; i++) {
		const rowIndex = i + 1;
		const thr = sorted[i];
		const valueCell = ws.getCell(rowIndex, 3);
		const levelCell = ws.getCell(rowIndex, 4);

		if (thr) {
			valueCell.value = thr.percentage;
			styleCell(valueCell, { bold: true, align: "center" });

			const level = sorted.length - i;
			levelCell.value = level > 0 ? `${level}` : "0";
			styleCell(levelCell, {
				bold: true,
				align: "center",
				fillColor: "FFE68A00",
			});
		} else {
			valueCell.value = "";
			levelCell.value = "";
		}
	}

	return rowsNeeded;
}

export function createPassingMarksSection(
	ws: ExcelJS.Worksheet,
	passingThreshold: number,
	coThreshold: number,
	totalCols: number
) {
	// Passing Marks label and value
	mergeAndStyle(ws, 1, 7, 1, 13, {
		value: "PASSING MARKS (%)",
		bold: true,
		align: "center",
		fillColor: "FFEEEEEE",
	});

	const passValue = ws.getCell(1, 14);
	passValue.value = passingThreshold;
	styleCell(passValue, {
		bold: true,
		align: "center",
		fillColor: "FFDDEEFF",
	});

	// CO Threshold label and value
	mergeAndStyle(ws, 2, 7, 2, 13, {
		value: "Threshold % for CO attainment",
		bold: true,
		align: "center",
		fillColor: "FFEEEEEE",
	});

	const thrValue = ws.getCell(2, 14);
	thrValue.value = coThreshold;
	styleCell(thrValue, {
		bold: true,
		align: "center",
		fillColor: "FFFFF2CC",
	});

	// Note label
	mergeAndStyle(ws, 3, 7, 3, totalCols, {
		value: 'Please fill "AB" for Absent and "UR" for Unregistered candidate(s)',
		italic: true,
		size: 10,
		align: "center",
		fillColor: "FFC6E0B4",
	});
}

export function createUniversitySection(
	ws: ExcelJS.Worksheet,
	universityRow: number,
	totalCols: number
) {
	mergeAndStyle(ws, universityRow, 1, universityRow, totalCols, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
}

export function createFacultyInfoSection(
	ws: ExcelJS.Worksheet,
	infoRow1: number,
	infoRow2: number,
	options: {
		facultyName: string;
		branch: string;
		courseName: string;
		programme: string;
		year: string;
		semester: string;
		courseCode?: string;
		session: string;
	},
	totalCols: number
) {
	// Row 1: Faculty Name and Branch
	mergeAndStyle(ws, infoRow1, 1, infoRow1, 2, {
		value: "Faculty Name:",
		bold: true,
		align: "center",
		fillColor: "FFFFFF00",
	});

	mergeAndStyle(ws, infoRow1, 3, infoRow1, 4, {
		value: options.facultyName,
		align: "center",
	});

	mergeAndStyle(ws, infoRow1, 5, infoRow1, 6, {
		value: "BRANCH",
		bold: true,
		align: "center",
	});

	// Partition remaining columns for Branch value, Course label, and Course value
	const startColForBranch = 7;
	const remainingCols = totalCols - startColForBranch + 1;
	const partSize = Math.floor(remainingCols / 3);

	const branchEndCol = startColForBranch + partSize - 1;
	const courseLabelStartCol = branchEndCol + 1;
	const courseLabelEndCol = courseLabelStartCol + partSize - 1;
	const courseValueStartCol = courseLabelEndCol + 1;

	mergeAndStyle(ws, infoRow1, startColForBranch, infoRow1, branchEndCol, {
		value: options.branch,
		align: "center",
	});

	mergeAndStyle(ws, infoRow1, courseLabelStartCol, infoRow1, courseLabelEndCol, {
		value: "Course:",
		align: "center",
	});

	mergeAndStyle(ws, infoRow1, courseValueStartCol, infoRow1, totalCols, {
		value: options.courseName,
		align: "center",
	});

	// Row 2: Programme, Year, Sem, Course Code, Session
	mergeAndStyle(ws, infoRow2, 1, infoRow2, 2, {
		value: "Programme:",
		bold: true,
		align: "center",
		fillColor: "FFFFFF00",
	});

	mergeAndStyle(ws, infoRow2, 3, infoRow2, 4, {
		value: options.programme,
		align: "center",
	});

	mergeAndStyle(ws, infoRow2, 5, infoRow2, 6, {
		value: "YEAR",
		bold: true,
		align: "center",
	});

	mergeAndStyle(ws, infoRow2, 7, infoRow2, 8, {
		value: options.year,
		align: "center",
	});

	const semLabelCell = ws.getCell(infoRow2, 9);
	semLabelCell.value = "SEM";
	styleCell(semLabelCell, { bold: true, align: "center" });

	const semValueCell = ws.getCell(infoRow2, 10);
	semValueCell.value = options.semester;
	styleCell(semValueCell, { align: "center" });

	// Border empty spacing
	for (let col = 11; col <= 12; col++) {
		ws.getCell(infoRow2, col).border = standardCellBorder;
	}

	// Partition remaining columns for Course Code Label, Value, Session Label, Value
	const startColForCode = 13;
	const remainingForCode = totalCols - startColForCode + 1;
	
	const codeLabelWidth = Math.max(2, Math.floor(remainingForCode * 0.35));
	const codeValueWidth = Math.max(2, Math.floor(remainingForCode * 0.25));
	const sessionLabelWidth = Math.max(2, Math.floor(remainingForCode * 0.15));

	const codeLabelEndCol = startColForCode + codeLabelWidth - 1;
	const codeValueStartCol = codeLabelEndCol + 1;
	const codeValueEndCol = codeValueStartCol + codeValueWidth - 1;
	const sessionLabelStartCol = codeValueEndCol + 1;
	const sessionLabelEndCol = sessionLabelStartCol + sessionLabelWidth - 1;
	const sessionValueStartCol = sessionLabelEndCol + 1;

	mergeAndStyle(ws, infoRow2, startColForCode, infoRow2, codeLabelEndCol, {
		value: "Course Code:",
		align: "center",
	});

	mergeAndStyle(ws, infoRow2, codeValueStartCol, infoRow2, codeValueEndCol, {
		value: options.courseCode,
		align: "center",
	});

	mergeAndStyle(ws, infoRow2, sessionLabelStartCol, infoRow2, sessionLabelEndCol, {
		value: "SESSION",
		bold: true,
		align: "center",
	});

	mergeAndStyle(ws, infoRow2, sessionValueStartCol, infoRow2, totalCols, {
		value: options.session,
		align: "center",
	});
}
