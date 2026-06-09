import type ExcelJS from "exceljs";
import type { StudentMarksData, COMarks } from "./types";
import { styleCell, mergeAndStyle } from "./excelUtils";

interface AttainmentThreshold {
	id: number;
	percentage: number;
}

interface COPOMatrix {
	[co: string]: {
		[po: string]: number;
	};
}

interface AttainmentCalculation {
	totalStudents: number;
	absentees: number;
	presentStudents: number;
	coStats: {
		[coName: string]: {
			abovePass: number;
			above70: number;
			aboveCOThreshold: number;
			sumPercentage: number;
			averagePercentage: number;
		};
	};
}

/**
 * Check if a CO is assessed (has total max marks > 0)
 */
function isCOAssessed(co: string, coMaxMarks?: COMarks): boolean {
	if (!coMaxMarks) return true;
	return (coMaxMarks[co] || 0) > 0;
}

/**
 * Calculate CO attainment statistics from student data
 */
function calculateCOAttainment(
	studentsData: StudentMarksData[],
	coThreshold: number,
	coNames: string[]
): AttainmentCalculation {
	const totalStudents = studentsData.length;
	let absentees = 0;

	const coStats: Record<string, any> = {};
	coNames.forEach((co) => {
		coStats[co] = { abovePass: 0, above70: 0, aboveCOThreshold: 0, sumPercentage: 0, averagePercentage: 0 };
	});

	studentsData.forEach((student) => {
		if (student.absentee === "AB" || student.absentee === "UR") {
			absentees++;
			return;
		}

		coNames.forEach((co) => {
			const percentage = student.coTotals[co] || 0;
			const roundedPercentage = Math.round(percentage * 100) / 100;
			if (roundedPercentage >= 70) coStats[co].above70++;
			if (roundedPercentage >= coThreshold) coStats[co].aboveCOThreshold++;
			coStats[co].sumPercentage += roundedPercentage;
		});
	});

	const presentStudents = totalStudents - absentees;
	
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
 * Get color based on numeric attainment level
 */
function getLevelColor(
	level: number,
	maxLevel: number
): string {
	const flooredLevel = Math.floor(level);
	if (flooredLevel === maxLevel) return "FFAAFFAA";
	if (flooredLevel === maxLevel - 1) return "FFFFFFAA";
	if (flooredLevel === maxLevel - 2) return "FFFFCCAA";
	return "FFFFAAAA";
}

/**
 * Calculate PO/PSO attainment using 3-point scale computation
 */
function calculatePOAttainment(
	po: string,
	copoMatrix: COPOMatrix,
	attainmentData: AttainmentCalculation,
	attainmentThresholds: AttainmentThreshold[],
	coMaxMarks?: COMarks,
	coNames?: string[]
): number {
	const cos = coNames || [];
	const attainmentPointsScale = attainmentThresholds.length;
	let sum = 0;
	let mappedCount = 0;

	cos.forEach((co) => {
		if (!isCOAssessed(co, coMaxMarks)) return;

		const percentage =
			attainmentData.presentStudents > 0
				? (attainmentData.coStats[co].aboveCOThreshold / attainmentData.presentStudents) * 100
				: 0;

		const coLevel = getAttainmentLevel(percentage, attainmentThresholds);
		const poMapping = copoMatrix[co]?.[po] || 0;

		if (poMapping > 0) {
			sum += (coLevel * poMapping) / attainmentPointsScale;
			mappedCount++;
		}
	});

	return mappedCount > 0 ? sum / mappedCount : 0;
}

/**
 * Create all CO-PO tables sequentially in the sheet
 */
export function createCOPOMappingTable(
	ws: ExcelJS.Worksheet,
	startRow: number,
	studentsData: StudentMarksData[],
	coThreshold: number,
	attainmentThresholds: AttainmentThreshold[],
	copoMatrix: COPOMatrix,
	coMaxMarks: COMarks,
	coNames: string[]
): number {
	const attainment = calculateCOAttainment(studentsData, coThreshold, coNames);
	const coList = coNames;
	
	// Extract unique PO/PSO names from the matrix dynamically
	const poSet = new Set<string>();
	Object.values(copoMatrix).forEach((pos) => {
		Object.keys(pos).forEach((po) => {
			poSet.add(po.toUpperCase());
		});
	});

	// If no PO/PSOs in matrix, fallback to standard PO1-12, PSO1-3
	if (poSet.size === 0) {
		for (let i = 1; i <= 12; i++) poSet.add(`PO${i}`);
		for (let i = 1; i <= 3; i++) poSet.add(`PSO${i}`);
	}

	const poList = Array.from(poSet).sort((a, b) => {
		const isAPso = a.startsWith("PSO");
		const isBPso = b.startsWith("PSO");
		if (isAPso !== isBPso) return isAPso ? 1 : -1;
		const numA = parseInt(a.replace(/^\D+/g, "")) || 0;
		const numB = parseInt(b.replace(/^\D+/g, "")) || 0;
		return numA - numB;
	});

	let currentRow = startRow;

	// ==========================================
	// TABLE 1: CO-PO-PSO Mapping Matrix (Raw Input)
	// ==========================================
	currentRow = createTable1MappingMatrix(
		ws,
		currentRow,
		coList,
		poList,
		copoMatrix,
		coMaxMarks,
		attainment,
		attainmentThresholds
	);

	currentRow += 3; // Space out

	// ==========================================
	// TABLE 2: PO Attainment Using CO (Direct Method)
	// ==========================================
	currentRow = createTable2DirectMethod(
		ws,
		currentRow,
		coList,
		poList,
		copoMatrix,
		coMaxMarks
	);

	currentRow += 3; // Space out

	// ==========================================
	// TABLE 3: PO & PSO Attainment (3 Point Scale)
	// ==========================================
	currentRow = createTable3ThreePointScale(
		ws,
		currentRow,
		coList,
		poList,
		copoMatrix,
		coMaxMarks,
		attainment,
		attainmentThresholds
	);

	currentRow += 3; // Space out

	// ==========================================
	// TABLE 4: PO & PSO Attainment (Percentage Scale)
	// ==========================================
	currentRow = createTable4PercentageScale(
		ws,
		currentRow,
		coList,
		poList,
		copoMatrix,
		coMaxMarks,
		studentsData
	);

	return currentRow;
}

/**
 * Helper to build Table 1: Mapping Matrix
 */
function createTable1MappingMatrix(
	ws: ExcelJS.Worksheet,
	startRow: number,
	coList: string[],
	poList: string[],
	copoMatrix: COPOMatrix,
	coMaxMarks: COMarks,
	attainment: AttainmentCalculation,
	attainmentThresholds: AttainmentThreshold[]
): number {
	let currentRow = startRow;
	const totalCols = 2 + poList.length;

	// Title Row
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: "COURSE OUTCOME - PROGRAM OUTCOME - PROGRAM SPECIFIC OUTCOME MAPPING MATRIX",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFE4B5", // Moccasin/Orange Accent
	});
	currentRow++;

	// Header row 1
	mergeAndStyle(ws, currentRow, 1, currentRow + 1, 1, {
		value: "CO",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		fillColor: "FFFFE0",
	});

	mergeAndStyle(ws, currentRow, 2, currentRow + 1, 2, {
		value: "CO Attainment Level",
		bold: true,
		align: "center",
		verticalAlign: "middle",
		wrapText: true,
		fillColor: "FFFFE0",
	});

	const splitIdx = poList.findIndex(po => po.startsWith("PSO"));
	const numPOsOnly = splitIdx === -1 ? poList.length : splitIdx;
	const numPSOsOnly = poList.length - numPOsOnly;

	if (numPOsOnly > 0) {
		mergeAndStyle(ws, currentRow, 3, currentRow, 2 + numPOsOnly, {
			value: "CO-PO Mapping Matrix",
			bold: true,
			align: "center",
			fillColor: "E0EEE0",
		});
	}

	if (numPSOsOnly > 0) {
		mergeAndStyle(ws, currentRow, 3 + numPOsOnly, currentRow, totalCols, {
			value: "CO-PSO Mapping Matrix",
			bold: true,
			align: "center",
			fillColor: "E6E6FA",
		});
	}
	currentRow++;

	// Header row 2 - PO/PSO names
	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 3 + idx);
		cell.value = po;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "F5F5F5",
		});
	});
	currentRow++;

	// CO rows
	coList.forEach((co) => {
		const assessed = isCOAssessed(co, coMaxMarks);

		const coCell = ws.getCell(currentRow, 1);
		coCell.value = co;
		styleCell(coCell, {
			bold: true,
			align: "center",
			fillColor: assessed ? "FFF8DC" : "FFD3D3D3",
		});

		// Attainment Level Column
		const levelCell = ws.getCell(currentRow, 2);
		let coLevel = 0;
		if (assessed) {
			const percentage =
				attainment.presentStudents > 0
					? (attainment.coStats[co].aboveCOThreshold / attainment.presentStudents) * 100
					: 0;
			coLevel = getAttainmentLevel(percentage, attainmentThresholds);
			levelCell.value = Number(coLevel.toFixed(2));
			styleCell(levelCell, {
				bold: true,
				align: "center",
				fillColor: getPercentageColor(percentage, attainmentThresholds),
			});
		} else {
			levelCell.value = "NA";
			styleCell(levelCell, {
				bold: true,
				align: "center",
				color: "FF808080",
				fillColor: "FFD3D3D3",
			});
		}

		// Mappings
		poList.forEach((po, idx) => {
			const cell = ws.getCell(currentRow, 3 + idx);
			const mappingValue = copoMatrix[co]?.[po] || 0;
			cell.value = mappingValue > 0 ? mappingValue : "";
			styleCell(cell, {
				align: "center",
				fillColor: mappingValue === 0 ? "FFF8F8F8" : undefined,
			});
		});

		currentRow++;
	});

	// PO Attainment Level Row
	mergeAndStyle(ws, currentRow, 1, currentRow, 2, {
		value: "PO Attainment Level",
		bold: true,
		align: "center",
		fillColor: "FFE4B5",
	});

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 3 + idx);
		const poAtt = calculatePOAttainment(
			po,
			copoMatrix,
			attainment,
			attainmentThresholds,
			coMaxMarks,
			coList
		);
		cell.value = poAtt > 0 ? Number(poAtt.toFixed(2)) : "";
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: poAtt > 0 ? getLevelColor(poAtt, attainmentThresholds.length) : "FFE4B5",
		});
	});
	currentRow++;

	return currentRow;
}

/**
 * Helper to build Table 2: PO Attainment Using CO (Direct Method)
 */
function createTable2DirectMethod(
	ws: ExcelJS.Worksheet,
	startRow: number,
	coList: string[],
	poList: string[],
	copoMatrix: COPOMatrix,
	coMaxMarks: COMarks
): number {
	let currentRow = startRow;
	const totalCols = 1 + poList.length;

	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: "PO ATTAINMENT USING CO (DIRECT METHOD)",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFD3B3",
	});
	currentRow++;

	// Headers
	const cCell = ws.getCell(currentRow, 1);
	cCell.value = "—";
	styleCell(cCell, { bold: true, align: "center", fillColor: "FFF5EE" });

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		cell.value = po;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: po.startsWith("PSO") ? "FFEBF5" : "FFF5EE",
		});
	});
	currentRow++;

	// CO rows
	coList.forEach((co) => {
		const assessed = isCOAssessed(co, coMaxMarks);
		const coCell = ws.getCell(currentRow, 1);
		coCell.value = co;
		styleCell(coCell, {
			bold: true,
			align: "center",
			fillColor: assessed ? "FFF5EE" : "FFD3D3D3",
		});

		poList.forEach((po, idx) => {
			const cell = ws.getCell(currentRow, 2 + idx);
			const mappingValue = copoMatrix[co]?.[po] || 0;
			
			if (assessed) {
				cell.value = mappingValue > 0 ? mappingValue : "—";
			} else {
				cell.value = "NA";
			}
			styleCell(cell, {
				align: "center",
				color: (!assessed || mappingValue === 0) ? "FF808080" : undefined,
				fillColor: po.startsWith("PSO") ? "FFF8F8FF" : undefined,
			});
		});
		currentRow++;
	});

	// Wt. Sum Row
	const wtCell = ws.getCell(currentRow, 1);
	wtCell.value = "Wt. Sum";
	styleCell(wtCell, {
		bold: true,
		align: "center",
		fillColor: "FFD3B3",
	});

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		let sum = 0;
		coList.forEach((co) => {
			if (isCOAssessed(co, coMaxMarks)) {
				sum += copoMatrix[co]?.[po] || 0;
			}
		});
		cell.value = sum > 0 ? Number(sum.toFixed(2)) : "—";
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "FFD3B3",
		});
	});
	currentRow++;

	return currentRow;
}

/**
 * Helper to build Table 3: 3 Point Scale
 */
function createTable3ThreePointScale(
	ws: ExcelJS.Worksheet,
	startRow: number,
	coList: string[],
	poList: string[],
	copoMatrix: COPOMatrix,
	coMaxMarks: COMarks,
	attainment: AttainmentCalculation,
	attainmentThresholds: AttainmentThreshold[]
): number {
	let currentRow = startRow;
	const totalCols = 1 + poList.length;
	const attainmentPointsScale = attainmentThresholds.length;

	// Calculate overall average for 3 point scale
	const columnAverages: Record<string, number | null> = {};
	let overallSum = 0;
	let overallCount = 0;

	poList.forEach((po) => {
		let sum = 0;
		let count = 0;
		coList.forEach((co) => {
			if (isCOAssessed(co, coMaxMarks)) {
				const percentage =
					attainment.presentStudents > 0
						? (attainment.coStats[co].aboveCOThreshold / attainment.presentStudents) * 100
						: 0;
				const coLevel = getAttainmentLevel(percentage, attainmentThresholds);
				const poMapping = copoMatrix[co]?.[po] || 0;
				if (poMapping > 0) {
					sum += (coLevel * poMapping) / attainmentPointsScale;
					count++;
				}
			}
		});
		if (count > 0) {
			const avg = sum / count;
			columnAverages[po] = avg;
			if (avg > 0) {
				overallSum += avg;
				overallCount++;
			}
		} else {
			columnAverages[po] = null;
		}
	});

	const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;

	// Title Row
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: `PO & PSO ATTAINMENT (3 POINT SCALE) - OVERALL: ${overallAverage.toFixed(2)}`,
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFEBCD",
	});
	currentRow++;

	// Headers
	const coHeadCell = ws.getCell(currentRow, 1);
	coHeadCell.value = "Course Outcome";
	styleCell(coHeadCell, { bold: true, align: "center", fillColor: "FFF8F8" });

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		cell.value = po;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: po.startsWith("PSO") ? "FFF0F5" : "FFF8F8",
		});
	});
	currentRow++;

	// CO rows
	coList.forEach((co) => {
		const assessed = isCOAssessed(co, coMaxMarks);
		const coCell = ws.getCell(currentRow, 1);
		coCell.value = co;
		styleCell(coCell, {
			bold: true,
			align: "center",
			fillColor: assessed ? "FFF8F8" : "FFD3D3D3",
		});

		poList.forEach((po, idx) => {
			const cell = ws.getCell(currentRow, 2 + idx);
			const mappingValue = copoMatrix[co]?.[po] || 0;
			if (assessed) {
				if (mappingValue > 0) {
					const percentage =
						attainment.presentStudents > 0
							? (attainment.coStats[co].aboveCOThreshold / attainment.presentStudents) * 100
							: 0;
					const coLevel = getAttainmentLevel(percentage, attainmentThresholds);
					const val = (coLevel * mappingValue) / attainmentPointsScale;
					cell.value = Number(val.toFixed(2));
				} else {
					cell.value = "—";
				}
			} else {
				cell.value = "NA";
			}
			styleCell(cell, {
				align: "center",
				color: (!assessed || mappingValue === 0) ? "FF808080" : undefined,
				fillColor: po.startsWith("PSO") ? "FFF8F8FF" : undefined,
			});
		});
		currentRow++;
	});

	// Average Row
	const avgCell = ws.getCell(currentRow, 1);
	avgCell.value = "Average";
	styleCell(avgCell, {
		bold: true,
		align: "center",
		fillColor: "FFEBCD",
	});

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		const val = columnAverages[po];
		cell.value = (val !== null && val !== undefined) ? Number(val.toFixed(2)) : "—";
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "FFEBCD",
		});
	});
	currentRow++;

	return currentRow;
}

/**
 * Helper to build Table 4: Percentage Scale
 */
function createTable4PercentageScale(
	ws: ExcelJS.Worksheet,
	startRow: number,
	coList: string[],
	poList: string[],
	copoMatrix: COPOMatrix,
	coMaxMarks: COMarks,
	studentsData: StudentMarksData[]
): number {
	let currentRow = startRow;
	const totalCols = 1 + poList.length;

	// Calculate class average percentage for each CO
	const coPercentages: Record<string, number> = {};
	coList.forEach((co) => {
		let sumPercentage = 0;
		let presentCount = 0;
		studentsData.forEach((student) => {
			if (student.absentee !== "AB" && student.absentee !== "UR") {
				sumPercentage += student.coTotals[co] || 0;
				presentCount++;
			}
		});
		coPercentages[co] = presentCount > 0 ? sumPercentage / presentCount : 0;
	});

	// Calculations for PO percentages
	const sums: Record<string, number> = {};
	const weightSums: Record<string, number> = {};
	const averages: Record<string, number | null> = {};
	let overallSum = 0;
	let overallCount = 0;

	poList.forEach((po) => {
		let sum = 0;
		let wSum = 0;
		coList.forEach((co) => {
			if (isCOAssessed(co, coMaxMarks)) {
				const poMapping = copoMatrix[co]?.[po] || 0;
				if (poMapping > 0) {
					sum += coPercentages[co] * poMapping;
					wSum += poMapping;
				}
			}
		});
		sums[po] = sum;
		weightSums[po] = wSum;

		if (wSum > 0) {
			const avg = sum / wSum;
			averages[po] = avg;
			overallSum += avg;
			overallCount++;
		} else {
			averages[po] = null;
		}
	});

	const overallAverage = overallCount > 0 ? overallSum / overallCount : 0;

	// Title Row
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: `PO & PSO ATTAINMENT (PERCENTAGE SCALE) - OVERALL AVERAGE: ${overallAverage.toFixed(2)}%`,
		bold: true,
		size: 12,
		align: "center",
		fillColor: "E6E6FA", // Lavender
	});
	currentRow++;

	// Headers
	const coHeadCell = ws.getCell(currentRow, 1);
	coHeadCell.value = "Course Outcome";
	styleCell(coHeadCell, { bold: true, align: "center", fillColor: "FFF8F8" });

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		cell.value = po;
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: po.startsWith("PSO") ? "FFF5EE" : "FFF8F8",
		});
	});
	currentRow++;

	// CO rows
	coList.forEach((co) => {
		const assessed = isCOAssessed(co, coMaxMarks);
		const coCell = ws.getCell(currentRow, 1);
		coCell.value = co;
		styleCell(coCell, {
			bold: true,
			align: "center",
			fillColor: assessed ? "FFF8F8" : "FFD3D3D3",
		});

		poList.forEach((po, idx) => {
			const cell = ws.getCell(currentRow, 2 + idx);
			const mappingValue = copoMatrix[co]?.[po] || 0;
			if (assessed) {
				if (mappingValue > 0) {
					const val = coPercentages[co] * mappingValue;
					cell.value = Number(val.toFixed(2));
				} else {
					cell.value = "—";
				}
			} else {
				cell.value = "NA";
			}
			styleCell(cell, {
				align: "center",
				color: (!assessed || mappingValue === 0) ? "FF808080" : undefined,
				fillColor: po.startsWith("PSO") ? "FFF8F8FF" : undefined,
			});
		});
		currentRow++;
	});

	// Sum Row
	const sumLabelCell = ws.getCell(currentRow, 1);
	sumLabelCell.value = "Sum";
	styleCell(sumLabelCell, { bold: true, align: "center", fillColor: "FFF0F5" });
	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		cell.value = weightSums[po] > 0 ? Number(sums[po].toFixed(2)) : "—";
		styleCell(cell, { align: "center", fillColor: "FFF0F5" });
	});
	currentRow++;

	// Weight Sum Row
	const wSumLabelCell = ws.getCell(currentRow, 1);
	wSumLabelCell.value = "Weight Sum";
	styleCell(wSumLabelCell, { bold: true, align: "center", fillColor: "FFF0F5" });
	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		cell.value = weightSums[po] > 0 ? Number(weightSums[po].toFixed(2)) : "—";
		styleCell(cell, { align: "center", fillColor: "FFF0F5" });
	});
	currentRow++;

	// Direct PO Attainment % Row
	const directLabelCell = ws.getCell(currentRow, 1);
	directLabelCell.value = "Direct PO Attainment %";
	styleCell(directLabelCell, {
		bold: true,
		align: "center",
		fillColor: "E6E6FA",
	});

	poList.forEach((po, idx) => {
		const cell = ws.getCell(currentRow, 2 + idx);
		const val = averages[po];
		cell.value = (val !== null && val !== undefined) ? `${val.toFixed(2)}%` : "—";
		styleCell(cell, {
			bold: true,
			align: "center",
			fillColor: "E6E6FA",
			color: "FF8A2BE2", // BlueViolet
		});
	});
	currentRow++;

	return currentRow;
}
