import ExcelJS from "exceljs";
import type { AssessmentInfo, AssessmentColumn } from "./types";
import { styleCell, mergeAndStyle } from "./excelUtils";

export function createTableHeaders(
	ws: ExcelJS.Worksheet,
	tableStartRow: number,
	assessments: AssessmentInfo[],
	coNames: string[]
): {
	assessmentColumns: AssessmentColumn[];
	totalStartCol: number;
	coStartCol: number;
	sigmaCoCol: number;
} {
	const headerRow1 = tableStartRow;
	const numCOs = coNames.length;

	// S.No column
	mergeAndStyle(ws, headerRow1, 1, headerRow1 + 3, 1, {
		value: "S.No.",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
		fillColor: "FFFFFF00", // Yellow
	});

	// Roll No column
	mergeAndStyle(ws, headerRow1, 2, headerRow1 + 3, 2, {
		value: "Roll No.",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
		fillColor: "FFFFFF00", // Yellow
	});

	// Name column
	mergeAndStyle(ws, headerRow1, 3, headerRow1 + 2, 3, {
		value: "Name of Student",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
	});

	// Absentee column
	mergeAndStyle(ws, headerRow1, 4, headerRow1 + 2, 4, {
		value: "ABSENTEE RECORD",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
	});

	let currentCol = 5;
	const assessmentColumns: AssessmentColumn[] = [];

	// Create assessment headers
	assessments.forEach((assessment) => {
		const assessmentStartCol = currentCol;
		const assessmentEndCol = currentCol + numCOs - 1;

		mergeAndStyle(ws, headerRow1, assessmentStartCol, headerRow1, assessmentEndCol, {
			value: assessment.name,
			bold: true,
			align: "center",
			verticalAlign: "middle",
			fillColor: "FFFFFF00",
		});

		assessmentColumns.push({
			name: assessment.name,
			startCol: assessmentStartCol,
			endCol: assessmentEndCol,
		});
		currentCol += numCOs;
	});

	// TOTAL column
	const totalStartCol = currentCol;
	mergeAndStyle(ws, headerRow1, totalStartCol, headerRow1 + 1, totalStartCol, {
		value: "TOTAL",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		fillColor: "FF87CEEB", // Light sky blue
	});

	// CO columns
	const coStartCol = totalStartCol + 1;
	coNames.forEach((coName, i) => {
		mergeAndStyle(ws, headerRow1, coStartCol + i, headerRow1 + 1, coStartCol + i, {
			value: coName,
			bold: true,
			align: "center",
			verticalAlign: "middle",
			fillColor: "FFFFFF00",
		});
	});

	// ΣCO column
	const sigmaCoCol = coStartCol + numCOs;
	mergeAndStyle(ws, headerRow1, sigmaCoCol, headerRow1 + 1, sigmaCoCol, {
		value: "ΣCO",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		fillColor: "FFFFFF00",
	});

	// Row 2: CO labels for each assessment
	const headerRow2 = tableStartRow + 1;
	assessmentColumns.forEach(({ startCol }) => {
		coNames.forEach((coName, i) => {
			const coCell = ws.getCell(headerRow2, startCol + i);
			coCell.value = coName;
			styleCell(coCell, {
				bold: true,
				align: "center",
				verticalAlign: "middle",
			});
		});
	});

	// Row 3: Maximum Marks and % labels
	const headerRow3 = tableStartRow + 2;

	const totalPercentLabel = ws.getCell(headerRow3, totalStartCol);
	totalPercentLabel.value = "%";
	styleCell(totalPercentLabel, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
		fillColor: "FF87CEEB",
	});

	coNames.forEach((_, i) => {
		const coPercentLabel = ws.getCell(headerRow3, coStartCol + i);
		coPercentLabel.value = "%";
		styleCell(coPercentLabel, {
			bold: true,
			align: "center",
			verticalAlign: "middle",
		});
	});

	const sigmaCoPercentLabel = ws.getCell(headerRow3, sigmaCoCol);
	sigmaCoPercentLabel.value = "%";
	styleCell(sigmaCoPercentLabel, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
	});

	assessmentColumns.forEach(({ startCol }, idx) => {
		const assessment = assessments[idx];
		if (numCOs > 1) {
			mergeAndStyle(ws, headerRow3, startCol, headerRow3, startCol + numCOs - 2, {
				value: "Maximum Marks",
				bold: true,
				align: "center",
				verticalAlign: "middle",
			});
		} else {
			const cell = ws.getCell(headerRow3, startCol);
			cell.value = "Max Marks";
			styleCell(cell, {
				bold: true,
				align: "center",
				verticalAlign: "middle",
			});
		}

		const maxMarksValueCell = ws.getCell(headerRow3, startCol + numCOs - 1);
		maxMarksValueCell.value = assessment.maxMarks;
		styleCell(maxMarksValueCell, {
			bold: true,
			align: "center",
			verticalAlign: "middle",
			fillColor: "FFFFFF00",
		});
	});

	// Row 4: CO max marks
	const headerRow4 = tableStartRow + 3;

	const coWiseLabel = ws.getCell(headerRow4, 3);
	coWiseLabel.value = "CO WISE MAXIMUM MARKS";
	styleCell(coWiseLabel, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
	});

	const absenteeRow4 = ws.getCell(headerRow4, 4);
	absenteeRow4.value = '"AB" or 0';
	styleCell(absenteeRow4, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
	});

	assessmentColumns.forEach(({ startCol }, idx) => {
		const assessment = assessments[idx];
		coNames.forEach((coName, i) => {
			const coCell = ws.getCell(headerRow4, startCol + i);
			const maxMarkValue = (assessment.coMaxMarks && assessment.coMaxMarks[coName]) || 0;
			coCell.value = maxMarkValue > 0 ? maxMarkValue : "";
			styleCell(coCell, {
				bold: true,
				align: "center",
				verticalAlign: "middle",
			});
		});
	});

	const totalCOMaxMarks = assessments.reduce(
		(acc, a) => {
			coNames.forEach((coName) => {
				acc[coName] = (acc[coName] || 0) + ((a.coMaxMarks && a.coMaxMarks[coName]) || 0);
			});
			return acc;
		},
		{} as Record<string, number>
	);

	const totalMaxSum = Object.values(totalCOMaxMarks).reduce(
		(sum, v) => sum + v,
		0
	);

	const totalMaxCell = ws.getCell(headerRow4, totalStartCol);
	totalMaxCell.value = totalMaxSum;
	styleCell(totalMaxCell, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
		fillColor: "FF87CEEB",
	});

	coNames.forEach((_, i) => {
		const percentCell = ws.getCell(headerRow4, coStartCol + i);
		percentCell.value = 100;
		styleCell(percentCell, {
			bold: true,
			align: "center",
			verticalAlign: "middle",
		});
	});

	const sigmaCoSumCell = ws.getCell(headerRow4, sigmaCoCol);
	sigmaCoSumCell.value = 100;
	styleCell(sigmaCoSumCell, {
		bold: true,
		align: "center",
		verticalAlign: "middle",
	});

	return { assessmentColumns, totalStartCol, coStartCol, sigmaCoCol };
}
