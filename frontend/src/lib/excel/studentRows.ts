import ExcelJS from "exceljs";
import type {
	StudentMarksData,
	AssessmentInfo,
	AssessmentColumn,
} from "./types";
import { styleCell } from "./excelUtils";

export function fillStudentData(
	ws: ExcelJS.Worksheet,
	startRow: number,
	studentsData: StudentMarksData[],
	assessments: AssessmentInfo[],
	assessmentColumns: AssessmentColumn[],
	totalStartCol: number,
	coStartCol: number,
	sigmaCoCol: number,
	coNames: string[]
) {
	// Determine which COs have questions
	const coHasQuestions: Record<string, boolean> = {};
	coNames.forEach((coName) => {
		coHasQuestions[coName] = assessments.some(
			(assessment) => (assessment.coMaxMarks[coName] || 0) > 0
		);
	});
	const activeCOCount = coNames.filter((coName) => coHasQuestions[coName]).length;

	let currentRow = startRow;

	studentsData.forEach((student) => {
		// S.No.
		const sNoCell = ws.getCell(currentRow, 1);
		sNoCell.value = student.sNo;
		styleCell(sNoCell, { align: "center" });

		// Roll No
		const rollNoCell = ws.getCell(currentRow, 2);
		rollNoCell.value = student.rollNo;
		styleCell(rollNoCell, { align: "center" });

		// Name
		const nameCell = ws.getCell(currentRow, 3);
		nameCell.value = student.name.toUpperCase();
		styleCell(nameCell, { align: "left" });

		// Absentee
		const absenteeCell = ws.getCell(currentRow, 4);
		absenteeCell.value = student.absentee || "";
		styleCell(absenteeCell, { align: "center" });

		// Assessment marks
		assessmentColumns.forEach(({ name, startCol }, idx) => {
			const assessment = assessments[idx];
			const marks = student.assessmentMarks[name] || {};
			coNames.forEach((coName, i) => {
				const markValue = marks[coName] || 0;
				const cell = ws.getCell(currentRow, startCol + i);
				cell.value = (assessment.coMaxMarks[coName] || 0) > 0 ? markValue : "";
				styleCell(cell, { align: "center" });
			});
		});

		// Grand total
		const grandTotal = student.coTotals.total;
		const grandTotalCell = ws.getCell(currentRow, totalStartCol);
		grandTotalCell.value = Number(grandTotal.toFixed(2));
		styleCell(grandTotalCell, {
			align: "center",
			fillColor: "FFFFFF00",
		});

		// CO percentages
		let coPercentagesSum = 0;
		coNames.forEach((coName, i) => {
			const percentage = student.coTotals[coName] || 0;
			if (coHasQuestions[coName]) {
				coPercentagesSum += percentage;
			}
			const cell = ws.getCell(currentRow, coStartCol + i);
			cell.value = coHasQuestions[coName] ? Number(percentage.toFixed(2)) : "";
			
			let fillColor: string | undefined;
			if (coHasQuestions[coName]) {
				if (percentage >= 70) {
					fillColor = "FF90EE90"; // Light green
				} else if (percentage >= 60) {
					fillColor = "FFFFFF00"; // Yellow
				} else if (percentage >= 50) {
					fillColor = "FFFFA500"; // Orange
				} else {
					fillColor = "FFFF6B6B"; // Light red
				}
			}

			styleCell(cell, {
				align: "center",
				fillColor,
			});
		});

		// ΣCO average percentage
		const sigmaCoAverage =
			activeCOCount > 0 ? coPercentagesSum / activeCOCount : 0;
		const sigmaCoCell = ws.getCell(currentRow, sigmaCoCol);
		sigmaCoCell.value = Number(sigmaCoAverage.toFixed(2));
		styleCell(sigmaCoCell, { align: "center" });

		currentRow++;
	});
}
