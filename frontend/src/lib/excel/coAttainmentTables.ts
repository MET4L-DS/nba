import type ExcelJS from "exceljs";
import type { StudentMarksData, COMarks } from "./types";
import { styleCell, mergeAndStyle } from "./excelUtils";

interface COStats {
	above70: number;
	abovePass: number;
	sumPercentage: number;
	averagePercentage: number;
}

interface AttainmentCalculation {
	totalStudents: number;
	absentees: number;
	presentStudents: number;
	coStats: {
		[coName: string]: COStats;
	};
}

interface AttainmentThreshold {
	id: number;
	percentage: number;
}

/**
 * Check if a CO is assessed (has total max marks > 0)
 */
function isCOAssessed(co: string, coMaxMarks?: COMarks): boolean {
	if (!coMaxMarks) return true; // Default to assessed if no data provided
	return (coMaxMarks[co] || 0) > 0;
}

/**
 * Calculate CO attainment statistics from student data
 */
function calculateCOAttainment(
	studentsData: StudentMarksData[],
	passingThreshold: number,
	coThreshold: number,
	coNames: string[]
): AttainmentCalculation {
	const totalStudents = studentsData.length;
	let absentees = 0;

	const coStats: Record<string, COStats> = {};
	coNames.forEach((coName) => {
		coStats[coName] = { above70: 0, abovePass: 0, sumPercentage: 0, averagePercentage: 0 };
	});

	studentsData.forEach((student) => {
		if (student.absentee === "AB" || student.absentee === "UR") {
			absentees++;
			return;
		}

		coNames.forEach((co) => {
			const percentage = student.coTotals[co] || 0;
			const roundedPercentage = Math.round(percentage * 100) / 100;
			if (percentage >= coThreshold) coStats[co].above70++;
			if (percentage >= passingThreshold) coStats[co].abovePass++;
			coStats[co].sumPercentage += roundedPercentage;
		});
	});

	const presentStudents = totalStudents - absentees;
	
	// Calculate average percentage for each CO
	coNames.forEach((co) => {
		if (presentStudents > 0) {
			coStats[co].averagePercentage = 
				Math.round((coStats[co].sumPercentage / presentStudents) * 100) / 100;
		}
	});
	
	return { totalStudents, absentees, presentStudents, coStats };
}

/**
 * Get attainment level based on percentage and thresholds
 */
function getAttainmentLevel(
	percentage: number,
	thresholds: AttainmentThreshold[]
): number {
	const sorted = [...thresholds].sort(
		(a, b) => b.percentage - a.percentage
	);

	if (sorted.length === 0) return 0;
	if (percentage >= sorted[0].percentage) return sorted.length;

	for (let i = 1; i < sorted.length; i++) {
		if (percentage >= sorted[i].percentage) {
			const baseLevel = sorted.length - i;
			const basePct = sorted[i].percentage;
			const nextPct = sorted[i - 1].percentage;
			const diff = nextPct - basePct;
			if (diff === 0) return baseLevel;
			return baseLevel + (percentage - basePct) / diff;
		}
	}

	return 0;
}

/**
 * Get background color based on percentage
 */
function getPercentageColor(
	percentage: number,
	thresholds: AttainmentThreshold[]
): string {
	const level = getAttainmentLevel(percentage, thresholds);
	const maxLevel = thresholds.length;

	const flooredLevel = Math.floor(level);
	if (flooredLevel === maxLevel) return "FFAAFFAA"; // Light green
	if (flooredLevel === maxLevel - 1) return "FFFFFFAA"; // Light yellow
	if (flooredLevel === maxLevel - 2) return "FFFFCCAA"; // Light orange
	return "FFFFAAAA"; // Light red
}

/**
 * Create CO Attainment in x.0 Point Scale table
 */
export function createCOAttainmentPointScaleTable(
	ws: ExcelJS.Worksheet,
	startRow: number,
	studentsData: StudentMarksData[],
	passingThreshold: number,
	coThreshold: number,
	attainmentThresholds: AttainmentThreshold[],
	coMaxMarks: COMarks,
	coNames: string[]
): number {
	const attainment = calculateCOAttainment(
		studentsData,
		passingThreshold,
		coThreshold,
		coNames
	);

	let currentRow = startRow;
	const numCOs = coNames.length;
	const totalCols = 4 + numCOs;

	// Title row
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: `CO ATTAINMENT in ${attainmentThresholds.length}.0 POINT Scale`,
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFFFC0CB", // Pink
	});
	currentRow++;

	// Header row 1
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "ATTAINMENT TABLE",
		bold: true,
		align: "center",
		fillColor: "FFFFFF00", // Yellow
	});

	mergeAndStyle(ws, currentRow, 5, currentRow, totalCols, {
		value: `${coNames[0]} to ${coNames[numCOs - 1]}`,
		bold: true,
		align: "center",
		fillColor: "FFADD8E6", // Light blue
	});
	currentRow++;

	// Header row 2 - CO columns
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = co;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "FFD3D3D3",
		});
	});
	currentRow++;

	// Row 1: ABSENTEE+NOT ATTEMPT
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "ABSENTEE+NOT ATTEMPT",
		bold: true,
		align: "left",
	});
	coNames.forEach((_, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = attainment.absentees;
		styleCell(cell, { align: "center" });
	});
	currentRow++;

	// Row 2: PRESENT STUDENT OR ATTEMPT
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "PRESENT STUDENT OR ATTEMPT",
		bold: true,
		align: "left",
	});
	coNames.forEach((_, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = attainment.presentStudents;
		styleCell(cell, { align: "center" });
	});
	currentRow++;

	// Row 3: SECURED > THRESHOLD
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "NO. OF STUDENTS SECURE MARKS > THRESHOLD % FOR CO ATTAINMENT",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		cell.value = assessed ? attainment.coStats[co].above70 : "NA";
		styleCell(cell, {
			align: "center",
			fillColor: assessed ? "FF404040" : "FFD3D3D3",
			color: assessed ? "FFFFFFFF" : "FF808080",
			bold: !assessed,
		});
	});
	currentRow++;

	// Row 4: PC. OF STUDENTS
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "PC. OF STUDENTS SECURE MARKS > THRESHOLD % FOR CO ATTAINMENT",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage =
				attainment.presentStudents > 0
					? (attainment.coStats[co].above70 / attainment.presentStudents) * 100
					: 0;
			cell.value = Number(percentage.toFixed(2));
			styleCell(cell, { align: "center" });
		} else {
			cell.value = "NA";
			styleCell(cell, {
				align: "center",
				color: "FF808080",
				bold: true,
			});
		}
	});
	currentRow++;

	// Row 5: Attainment Level (Based on Criteria)
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "CO Attainment Level (Based on Criteria)",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage =
				attainment.presentStudents > 0
					? (attainment.coStats[co].above70 / attainment.presentStudents) * 100
					: 0;
			const level = getAttainmentLevel(percentage, attainmentThresholds);
			cell.value = Number(level.toFixed(2));
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: getPercentageColor(percentage, attainmentThresholds),
			});
		} else {
			cell.value = "NA";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: "FFD3D3D3",
				color: "FF808080",
			});
		}
	});
	currentRow++;

	// Row 6: Final attainment level CO (by Direct Assessment)
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "Final attainment level CO (by Direct Assessment):",
		bold: true,
		align: "left",
		fillColor: "FFFFA500", // Orange
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage =
				attainment.presentStudents > 0
					? (attainment.coStats[co].above70 / attainment.presentStudents) * 100
					: 0;
			const level = getAttainmentLevel(percentage, attainmentThresholds);
			cell.value = Number(level.toFixed(2));
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: getPercentageColor(percentage, attainmentThresholds),
			});
		} else {
			cell.value = "NA";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: "FFD3D3D3",
				color: "FF808080",
			});
		}
	});
	currentRow++;

	return currentRow;
}

/**
 * Create CO Attainment in Absolute Scale table
 */
export function createCOAttainmentAbsoluteScaleTable(
	ws: ExcelJS.Worksheet,
	startRow: number,
	studentsData: StudentMarksData[],
	passingThreshold: number,
	coThreshold: number,
	attainmentThresholds: AttainmentThreshold[],
	coMaxMarks: COMarks,
	coNames: string[],
	snapshotIndirectData?: Array<{
		co_name: string;
		indirect_attainment_percentage?: number | null;
		indirect_attainment_level?: number | null;
		final_attainment_percentage?: number | null;
		final_attainment_level?: number | null;
	}>
): number {
	const attainment = calculateCOAttainment(
		studentsData,
		passingThreshold,
		coThreshold,
		coNames
	);

	let currentRow = startRow;
	const numCOs = coNames.length;
	const totalCols = 4 + numCOs;

	// Title row
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: "CO ATTAINMENT in ABSOLUTE Scale",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFFFC0CB", // Pink
	});
	currentRow++;

	// Header row 1
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "ATTAINMENT TABLE",
		bold: true,
		align: "center",
		fillColor: "FFFFFF00", // Yellow
	});

	mergeAndStyle(ws, currentRow, 5, currentRow, totalCols, {
		value: `${coNames[0]} to ${coNames[numCOs - 1]}`,
		bold: true,
		align: "center",
		fillColor: "FFADD8E6", // Light blue
	});
	currentRow++;

	// Header row 2 - CO columns
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = co;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "FFD3D3D3",
		});
	});
	currentRow++;

	// Row 1: ABSENTEE+NOT ATTEMPT
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "ABSENTEE+NOT ATTEMPT",
		bold: true,
		align: "left",
	});
	coNames.forEach((_, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = attainment.absentees;
		styleCell(cell, { align: "center" });
	});
	currentRow++;

	// Row 2: PRESENT STUDENT OR ATTEMPT
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "PRESENT STUDENT OR ATTEMPT",
		bold: true,
		align: "left",
	});
	coNames.forEach((_, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		cell.value = attainment.presentStudents;
		styleCell(cell, { align: "center" });
	});
	currentRow++;

	// Row 3: NO. OF STUDENTS SECURE MARKS > PASSING MARKS
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "NO. OF STUDENTS SECURE MARKS > PASSING MARKS",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		cell.value = assessed ? attainment.coStats[co].abovePass : "NA";
		styleCell(cell, {
			align: "center",
			fillColor: assessed ? "FF505050" : "FFD3D3D3",
			color: assessed ? "FFFFFFFF" : "FF808080",
			bold: !assessed,
		});
	});
	currentRow++;

	// Row 4: % of Students Above Passing Marks
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "% of Students Above Passing Marks",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage =
				attainment.presentStudents > 0
					? (attainment.coStats[co].abovePass / attainment.presentStudents) * 100
					: 0;
			cell.value = Number(percentage.toFixed(2));
			styleCell(cell, { align: "center" });
		} else {
			cell.value = "NA";
			styleCell(cell, {
				align: "center",
				color: "FF808080",
				bold: true,
			});
		}
	});
	currentRow++;

	// Row 5: CO Attainment (AVERAGE OF PERCENTAGE ATTAINMENTS)
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "CO Attainment (AVERAGE OF PERCENTAGE ATTAINMENTS)",
		bold: true,
		align: "left",
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage = attainment.coStats[co].averagePercentage || 0;
			cell.value = Number(percentage.toFixed(2));
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: getPercentageColor(percentage, attainmentThresholds),
			});
		} else {
			cell.value = "NA";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: "FFD3D3D3",
				color: "FF808080",
			});
		}
	});
	currentRow++;

	// Row 6: Final attainment level CO (IN ABSOLUTE SCALE)
	mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
		value: "Final attainment level CO (IN ABSOLUTE SCALE):",
		bold: true,
		align: "left",
		fillColor: "FFFFA500", // Orange
	});
	coNames.forEach((co, idx) => {
		const cell = ws.getCell(currentRow, idx + 5);
		const assessed = isCOAssessed(co, coMaxMarks);
		if (assessed) {
			const percentage = attainment.coStats[co].averagePercentage || 0;
			cell.value = Number(percentage.toFixed(2)) + "%";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: getPercentageColor(percentage, attainmentThresholds),
			});
		} else {
			cell.value = "NA";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: "FFD3D3D3",
				color: "FF808080",
			});
		}
	});
	currentRow++;

	// Dynamic addition of Indirect & Blended attainment if available
	if (snapshotIndirectData && snapshotIndirectData.length > 0) {
		// Row 7: Indirect CO Attainment Level (Based on surveys)
		mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
			value: "Indirect CO Attainment Level (Based on surveys):",
			bold: true,
			align: "left",
			fillColor: "FFF0F8FF", // Alice Blue
		});
		coNames.forEach((co, idx) => {
			const cell = ws.getCell(currentRow, idx + 5);
			const assessed = isCOAssessed(co, coMaxMarks);
			const indirectItem = snapshotIndirectData.find(item => item.co_name === co);
			
			if (assessed && indirectItem && indirectItem.indirect_attainment_level != null) {
				cell.value = Number(indirectItem.indirect_attainment_level.toFixed(2));
				const pct = indirectItem.indirect_attainment_percentage || 0;
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getPercentageColor(pct, attainmentThresholds),
				});
			} else {
				cell.value = assessed ? "Not Set" : "NA";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: "FFD3D3D3",
					color: "FF808080",
				});
			}
		});
		currentRow++;

		// Row 8: Final Blended Attainment Level (Direct + Indirect)
		mergeAndStyle(ws, currentRow, 1, currentRow, 4, {
			value: "Final Blended Attainment Level (Direct + Indirect):",
			bold: true,
			align: "left",
			fillColor: "FFADFF2F", // GreenYellow
		});
		coNames.forEach((co, idx) => {
			const cell = ws.getCell(currentRow, idx + 5);
			const assessed = isCOAssessed(co, coMaxMarks);
			const indirectItem = snapshotIndirectData.find(item => item.co_name === co);

			if (assessed && indirectItem && indirectItem.final_attainment_level != null) {
				cell.value = Number(indirectItem.final_attainment_level.toFixed(2));
				const pct = indirectItem.final_attainment_percentage || 0;
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getPercentageColor(pct, attainmentThresholds),
				});
			} else {
				cell.value = assessed ? "Not Set" : "NA";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: "FFD3D3D3",
					color: "FF808080",
				});
			}
		});
		currentRow++;
	}

	return currentRow;
}
