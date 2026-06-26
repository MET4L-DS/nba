import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type {
	CourseLevelProgrammeAttainmentResponse,
	ActionPlan,
	CoPoMappingRow,
	StakeholderConsolidatedMatrixResponse,
} from "@/services/api";
import { styleCell, mergeAndStyle } from "./excelUtils";

export interface ProgrammeAttainmentExportOptions {
	programmeCode: string;
	programmeName: string;
	batchYear: string;
	directWeightage?: number;
	indirectWeightage?: number;
	data: CourseLevelProgrammeAttainmentResponse;
	stakeholderMatrix?: StakeholderConsolidatedMatrixResponse | null;
	actionPlans?: ActionPlan[];
	courseMappings?: Record<number, CoPoMappingRow[]>;
	pastBatchesAttainment?: Array<{ batchYear: string; poAttainment: Record<string, number> }>;
}

/**
 * Get background color based on attainment value (3-point scale)
 */
function getScaleColor(val: number | null | undefined): string | undefined {
	if (val == null || val <= 0) return undefined;
	if (val >= 2.5) return "FFD1FAE5"; // Light Emerald
	if (val >= 1.5) return "FFFEF3C7"; // Light Amber
	return "FFFEE2E2"; // Light Rose
}

/**
 * Get background color based on discrete level (1, 2, 3)
 */
function getLevelColor(level: number | null | undefined): string | undefined {
	if (level == null || level <= 0) return "FFFEE2E2"; // Light Rose / Red for unmet
	if (level === 3) return "FFD1FAE5"; // Light Emerald
	if (level === 2) return "FFFEF3C7"; // Light Amber
	return "FFFFE4B5"; // Light Orange
}

/**
 * Convert final value and target value to a discrete level (1/2/3)
 */
function computeDiscreteLevel(finalVal: number | null | undefined, targetVal: number | null | undefined): number {
	if (!targetVal || targetVal <= 0 || !finalVal || finalVal <= 0) return 0;
	const percentage = (finalVal / targetVal) * 100;
	if (percentage >= 90) return 3;
	if (percentage >= 85) return 2;
	if (percentage >= 80) return 1;
	return 0;
}

export async function exportProgrammeAttainmentExcel(opts: ProgrammeAttainmentExportOptions) {
	const {
		programmeCode,
		programmeName,
		batchYear,
		directWeightage = 80,
		indirectWeightage = 20,
		data,
		stakeholderMatrix,
		actionPlans = [],
		courseMappings = {},
		pastBatchesAttainment = [],
	} = opts;

	if (!data) {
		throw new Error("No data provided for export");
	}

	if (!data.averages) data.averages = {};
	if (!data.finals) data.finals = {};
	if (!data.indirect) data.indirect = {};
	if (!data.targets) data.targets = {};

	const plansList = actionPlans || [];
	const mappingsObj = courseMappings || {};
	const pastList = pastBatchesAttainment || [];

	const poList = data.po_list || [];
	const wb = new ExcelJS.Workbook();
	wb.creator = "OBEMS Platform";
	wb.created = new Date();

	// ==========================================
	// SHEET 1: PROGRAMME ATTAINMENT
	// ==========================================
	const ws1 = wb.addWorksheet("Programme Attainment");

	// Column widths
	ws1.getColumn(1).width = 6;   // Sl No.
	ws1.getColumn(2).width = 15;  // Course Code
	ws1.getColumn(3).width = 35;  // Course Name

	const poStartCol = 4;
	const totalCols = poStartCol + poList.length - 1;
	for (let col = poStartCol; col <= totalCols; col++) {
		ws1.getColumn(col).width = 10;
	}

	let r1 = 1;

	// Tezpur University
	mergeAndStyle(ws1, r1, 1, r1, totalCols, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r1++;

	// Title
	mergeAndStyle(ws1, r1, 1, r1, totalCols, {
		value: "EXECUTIVE ANALYTICS — PROGRAMME ARTICULATION MATRIX",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFCCEEFF",
	});
	r1++;

	// Info Row
	mergeAndStyle(ws1, r1, 1, r1, 2, {
		value: "Programme:",
		bold: true,
		align: "left",
		fillColor: "FFEEEEEE",
	});
	mergeAndStyle(ws1, r1, 3, r1, Math.max(3, totalCols - 2), {
		value: `${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});

	if (totalCols > 4) {
		const batchLabelCol = totalCols - 1;
		const batchValCol = totalCols;
		ws1.getCell(r1, batchLabelCol).value = "Batch:";
		styleCell(ws1.getCell(r1, batchLabelCol), {
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		ws1.getCell(r1, batchValCol).value = batchYear;
		styleCell(ws1.getCell(r1, batchValCol), {
			bold: true,
			align: "center",
		});
	} else {
		const cell = ws1.getCell(r1, totalCols);
		cell.value = `Batch: ${batchYear}`;
		styleCell(cell, { bold: true, align: "right" });
	}
	r1++;

	// Empty spacer row
	r1++;

	// Headers
	ws1.getCell(r1, 1).value = "#";
	styleCell(ws1.getCell(r1, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws1.getCell(r1, 2).value = "Code";
	styleCell(ws1.getCell(r1, 2), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws1.getCell(r1, 3).value = "Course";
	styleCell(ws1.getCell(r1, 3), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	poList.forEach((po, idx) => {
		const cell = ws1.getCell(r1, poStartCol + idx);
		cell.value = po;
		styleCell(cell, { bold: true, align: "center", fillColor: "FFD3D3D3" });
	});
	r1++;

	// Course Rows
	if (data.courses.length === 0) {
		mergeAndStyle(ws1, r1, 1, r1, totalCols, {
			value: "No courses found for this programme and batch.",
			align: "center",
			italic: true,
		});
		r1++;
	} else {
		data.courses.forEach((course, idx) => {
			const slCell = ws1.getCell(r1, 1);
			slCell.value = idx + 1;
			styleCell(slCell, { align: "center" });

			const codeCell = ws1.getCell(r1, 2);
			codeCell.value = course.course_code;
			styleCell(codeCell, { align: "center", bold: true });

			const nameCell = ws1.getCell(r1, 3);
			nameCell.value = course.course_name;
			styleCell(nameCell, { align: "left" });

			poList.forEach((po, poIdx) => {
				const cell = ws1.getCell(r1, poStartCol + poIdx);
				const val = course.values[po];
				if (val != null && val > 0) {
					cell.value = Number(val);
					cell.numFmt = "0.00";
					styleCell(cell, {
						align: "center",
						fillColor: getScaleColor(val),
					});
				} else {
					cell.value = "—";
					styleCell(cell, { align: "center", color: "FF808080" });
				}
			});
			r1++;
		});

		// Empty separator border row
		r1++;

		// Footer Row 1: Direct Attainment
		mergeAndStyle(ws1, r1, 1, r1, 3, {
			value: "Direct Attainment (Average)",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws1.getCell(r1, poStartCol + poIdx);
			const val = data.averages[po];
			if (val != null && val > 0) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getScaleColor(val),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		r1++;

		// Footer Row 2: Indirect Attainment
		mergeAndStyle(ws1, r1, 1, r1, 3, {
			value: "Indirect Attainment (Surveys)",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws1.getCell(r1, poStartCol + poIdx);
			const val = data.indirect[po];
			if (val != null && val > 0) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getScaleColor(val),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		r1++;

		// Footer Row 3: Final Attainment (Blended)
		mergeAndStyle(ws1, r1, 1, r1, 3, {
			value: "Final Attainment (Blended)",
			bold: true,
			align: "right",
			fillColor: "FFE8F5E9",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws1.getCell(r1, poStartCol + poIdx);
			const val = data.finals[po];
			if (val != null && val > 0) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getScaleColor(val),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		r1++;

		// Footer Row 4: Level of Attainment (Discrete)
		mergeAndStyle(ws1, r1, 1, r1, 3, {
			value: "Level of Attainment (Discrete)",
			bold: true,
			align: "right",
			fillColor: "FFFFF2E2",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws1.getCell(r1, poStartCol + poIdx);
			const finalVal = data.finals[po] ?? 0;
			const targetVal = data.targets[po] ?? 0;
			const level = computeDiscreteLevel(finalVal, targetVal);

			if (targetVal > 0) {
				cell.value = level;
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getLevelColor(level),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		r1++;

		// Footer Row 5: Target Level
		mergeAndStyle(ws1, r1, 1, r1, 3, {
			value: "Target Level",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws1.getCell(r1, poStartCol + poIdx);
			const val = data.targets[po];
			const finalVal = data.finals[po] ?? 0;
			const hasTarget = val != null && val > 0;
			const isMet = hasTarget && finalVal >= val;

			if (hasTarget) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: isMet ? "FFD1FAE5" : "FFFEE2E2",
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		r1++;
	}

	// Weightage Configuration
	r1 += 2;
	mergeAndStyle(ws1, r1, 1, r1, 3, {
		value: "ATTAINMENT WEIGHTAGE CONFIGURATION",
		bold: true,
		align: "center",
		fillColor: "FFE6E6FA", // Lavender
	});
	for (let col = 4; col <= totalCols; col++) {
		styleCell(ws1.getCell(r1, col), { fillColor: "FFE6E6FA", bold: true });
	}
	r1++;

	mergeAndStyle(ws1, r1, 1, r1, 3, {
		value: "Direct Attainment Weightage",
		bold: true,
		align: "left",
	});
	ws1.getCell(r1, 4).value = `${directWeightage}%`;
	styleCell(ws1.getCell(r1, 4), { align: "center", bold: true });
	r1++;

	mergeAndStyle(ws1, r1, 1, r1, 3, {
		value: "Indirect Attainment Weightage",
		bold: true,
		align: "left",
	});
	ws1.getCell(r1, 4).value = `${indirectWeightage}%`;
	styleCell(ws1.getCell(r1, 4), { align: "center", bold: true });
	r1++;

	// Formula Note
	r1 += 1;
	mergeAndStyle(ws1, r1, 1, r1, totalCols, {
		value: `* Final PO Attainment = ${directWeightage}% × Direct Attainment (Average) + ${indirectWeightage}% × Indirect Attainment (Surveys)`,
		italic: true,
		align: "left",
		border: false,
		size: 10,
	});

	// ==========================================
	// SHEET 2: INDIRECT SURVEY BREAKDOWN
	// ==========================================
	const ws2 = wb.addWorksheet("Consolidated Indirect Surveys");

	ws2.getColumn(1).width = 6;   // Sl No
	ws2.getColumn(2).width = 35;  // Survey Type
	for (let col = 3; col <= 3 + poList.length - 1; col++) {
		ws2.getColumn(col).width = 10;
	}

	let r2 = 1;

	// Tezpur University
	mergeAndStyle(ws2, r2, 1, r2, totalCols - 1, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r2++;

	// Title
	mergeAndStyle(ws2, r2, 1, r2, totalCols - 1, {
		value: "CONSOLIDATED INDIRECT SURVEY MATRIX",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFD1FAE5",
	});
	r2++;

	// Info
	mergeAndStyle(ws2, r2, 1, r2, 2, {
		value: `Programme: ${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});
	mergeAndStyle(ws2, r2, 3, r2, totalCols - 1, {
		value: `Batch: ${batchYear}`,
		bold: true,
		align: "right",
	});
	r2 += 2;

	// Table Headers
	ws2.getCell(r2, 1).value = "#";
	styleCell(ws2.getCell(r2, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws2.getCell(r2, 2).value = "Indirect Survey Type";
	styleCell(ws2.getCell(r2, 2), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	poList.forEach((po, idx) => {
		const cell = ws2.getCell(r2, 3 + idx);
		cell.value = po;
		styleCell(cell, { bold: true, align: "center", fillColor: "FFD3D3D3" });
	});
	r2++;

	const surveyTypes = [
		{ key: "Alumni", label: "Alumni Survey Form" },
		{ key: "Graduate Exit", label: "Graduate Exit Survey Form" },
		{ key: "Parent", label: "Parent Survey Form" },
		{ key: "Academic Peer", label: "Academic Peers Survey Form" },
		{ key: "Employer", label: "Employer Survey Form" },
	];

	surveyTypes.forEach((st, idx) => {
		ws2.getCell(r2, 1).value = idx + 1;
		styleCell(ws2.getCell(r2, 1), { align: "center" });

		ws2.getCell(r2, 2).value = st.label;
		styleCell(ws2.getCell(r2, 2), { align: "left", bold: true });

		poList.forEach((po, poIdx) => {
			const cell = ws2.getCell(r2, 3 + poIdx);
			let val = null;
			if (stakeholderMatrix && stakeholderMatrix.matrix && stakeholderMatrix.matrix[st.key]) {
				val = stakeholderMatrix.matrix[st.key][po];
			}
			if (val != null && val > 0) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					align: "center",
					fillColor: getScaleColor(val),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { align: "center", color: "FF808080" });
			}
		});
		r2++;
	});

	// Weighted Average Row
	r2++;
	mergeAndStyle(ws2, r2, 1, r2, 2, {
		value: "Weighted Average (Consolidated)",
		bold: true,
		align: "right",
		fillColor: "FFE8F5E9",
	});

	poList.forEach((po, poIdx) => {
		const cell = ws2.getCell(r2, 3 + poIdx);
		let avgVal = null;
		if (stakeholderMatrix && stakeholderMatrix.averages) {
			avgVal = stakeholderMatrix.averages[po];
		}
		if (avgVal != null && avgVal > 0) {
			cell.value = Number(avgVal);
			cell.numFmt = "0.00";
			styleCell(cell, {
				bold: true,
				align: "center",
				fillColor: getScaleColor(avgVal),
			});
		} else {
			cell.value = "—";
			styleCell(cell, { bold: true, align: "center", color: "FF808080" });
		}
	});

	// ==========================================
	// SHEET 3: PO & PSO SUMMARY
	// ==========================================
	const ws3 = wb.addWorksheet("PO & PSO Summary");

	ws3.getColumn(1).width = 12;  // PO / PSO
	ws3.getColumn(2).width = 25;  // Target CO-PO Correlation
	ws3.getColumn(3).width = 25;  // Overall Attainment
	ws3.getColumn(4).width = 25;  // Level of Attainment

	let r3 = 1;

	// Tezpur University
	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r3++;

	// Title
	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "PROGRAMME OUTCOMES (PO) & PSOs ATTAINMENT SUMMARY",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFFFF2E2",
	});
	r3++;

	// Info
	mergeAndStyle(ws3, r3, 1, r3, 2, {
		value: `Programme: ${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});
	mergeAndStyle(ws3, r3, 3, r3, 4, {
		value: `Batch: ${batchYear}`,
		bold: true,
		align: "right",
	});
	r3 += 2;

	// Table Headers
	ws3.getCell(r3, 1).value = "PO / PSO";
	styleCell(ws3.getCell(r3, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws3.getCell(r3, 2).value = "Target Correlation";
	styleCell(ws3.getCell(r3, 2), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws3.getCell(r3, 3).value = "Overall Attainment";
	styleCell(ws3.getCell(r3, 3), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws3.getCell(r3, 4).value = "Level of Attainment";
	styleCell(ws3.getCell(r3, 4), { bold: true, align: "center", fillColor: "FFD3D3D3" });
	r3++;

	poList.forEach((po) => {
		const targetVal = data.targets[po] ?? 0;
		const finalVal = data.finals[po] ?? 0;
		const level = computeDiscreteLevel(finalVal, targetVal);

		// PO / PSO
		const poCell = ws3.getCell(r3, 1);
		poCell.value = po;
		styleCell(poCell, { bold: true, align: "center" });

		// Target Correlation
		const targetCell = ws3.getCell(r3, 2);
		if (targetVal > 0) {
			targetCell.value = Number(targetVal);
			targetCell.numFmt = "0.00";
			styleCell(targetCell, { align: "center" });
		} else {
			targetCell.value = "—";
			styleCell(targetCell, { align: "center", color: "FF808080" });
		}

		// Overall Attainment
		const finalCell = ws3.getCell(r3, 3);
		if (finalVal > 0) {
			finalCell.value = Number(finalVal);
			finalCell.numFmt = "0.00";
			styleCell(finalCell, {
				align: "center",
				fillColor: getScaleColor(finalVal),
			});
		} else {
			finalCell.value = "—";
			styleCell(finalCell, { align: "center", color: "FF808080" });
		}

		// Level of Attainment
		const levelCell = ws3.getCell(r3, 4);
		if (targetVal > 0) {
			levelCell.value = level;
			styleCell(levelCell, {
				bold: true,
				align: "center",
				fillColor: getLevelColor(level),
			});
		} else {
			levelCell.value = "—";
			styleCell(levelCell, { align: "center", color: "FF808080" });
		}

		r3++;
	});

	// Target Settings note
	r3 += 2;
	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "Target Setting & Attainment Thresholds Criteria:",
		bold: true,
		align: "left",
		border: false,
		size: 11,
	});
	r3++;

	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "• Level 1: Attainment is 80% and above of CO-PO/CO-PSO target correlation mapping.",
		align: "left",
		border: false,
		size: 10,
	});
	r3++;

	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "• Level 2: Attainment is 85% and above of CO-PO/CO-PSO target correlation mapping.",
		align: "left",
		border: false,
		size: 10,
	});
	r3++;

	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "• Level 3: Attainment is 90% and above of CO-PO/CO-PSO target correlation mapping.",
		align: "left",
		border: false,
		size: 10,
	});
	r3++;

	mergeAndStyle(ws3, r3, 1, r3, 4, {
		value: "• Desired Program Target: Level 3",
		bold: true,
		align: "left",
		border: false,
		size: 10,
	});

	// ==========================================
	// SHEET 4: GAP ANALYSIS
	// ==========================================
	const ws4 = wb.addWorksheet("Gap Analysis");

	ws4.getColumn(1).width = 6;   // Sl No.
	ws4.getColumn(2).width = 12;  // PO / PSO
	ws4.getColumn(3).width = 12;  // Target Level
	ws4.getColumn(4).width = 12;  // Attained
	ws4.getColumn(5).width = 12;  // Gap
	ws4.getColumn(6).width = 40;  // Observations (Gap Description)
	ws4.getColumn(7).width = 40;  // Action Taken / Proposed
	ws4.getColumn(8).width = 15;  // Status

	let r4 = 1;

	// Tezpur University
	mergeAndStyle(ws4, r4, 1, r4, 8, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r4++;

	// Title
	mergeAndStyle(ws4, r4, 1, r4, 8, {
		value: "PROGRAMME OUTCOMES GAP ANALYSIS & CONTINOUS IMPROVEMENT ACTION PLAN",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFFEE2E2",
	});
	r4++;

	// Info
	mergeAndStyle(ws4, r4, 1, r4, 3, {
		value: `Programme: ${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});
	mergeAndStyle(ws4, r4, 4, r4, 8, {
		value: `Batch: ${batchYear}`,
		bold: true,
		align: "right",
	});
	r4 += 2;

	// Table Headers
	ws4.getCell(r4, 1).value = "#";
	styleCell(ws4.getCell(r4, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 2).value = "PO / PSO";
	styleCell(ws4.getCell(r4, 2), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 3).value = "Target";
	styleCell(ws4.getCell(r4, 3), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 4).value = "Attained";
	styleCell(ws4.getCell(r4, 4), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 5).value = "Gap";
	styleCell(ws4.getCell(r4, 5), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 6).value = "Observations (Gap description)";
	styleCell(ws4.getCell(r4, 6), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 7).value = "Action Taken / Proposed";
	styleCell(ws4.getCell(r4, 7), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	ws4.getCell(r4, 8).value = "Status";
	styleCell(ws4.getCell(r4, 8), { bold: true, align: "center", fillColor: "FFD3D3D3" });
	r4++;

	const filteredPlans = plansList.filter(p => p && p.po_name && poList.includes(p.po_name));

	if (filteredPlans.length === 0) {
		mergeAndStyle(ws4, r4, 1, r4, 8, {
			value: "No gaps identified or action plans configured for this batch.",
			align: "center",
			italic: true,
		});
		r4++;
	} else {
		filteredPlans.forEach((plan, idx) => {
			const po = plan.po_name || "";
			const targetVal = data.targets[po] ?? 0;
			const finalVal = data.finals[po] ?? 0;
			const gap = targetVal > 0 && finalVal > 0 ? Number((targetVal - finalVal).toFixed(2)) : 0;

			// Sl No.
			ws4.getCell(r4, 1).value = idx + 1;
			styleCell(ws4.getCell(r4, 1), { align: "center" });

			// PO
			ws4.getCell(r4, 2).value = po;
			styleCell(ws4.getCell(r4, 2), { align: "center", bold: true });

			// Target
			const targetCell = ws4.getCell(r4, 3);
			if (targetVal > 0) {
				targetCell.value = Number(targetVal);
				targetCell.numFmt = "0.00";
				styleCell(targetCell, { align: "center" });
			} else {
				targetCell.value = "—";
				styleCell(targetCell, { align: "center", color: "FF808080" });
			}

			// Attained
			const attainedCell = ws4.getCell(r4, 4);
			if (finalVal > 0) {
				attainedCell.value = Number(finalVal);
				attainedCell.numFmt = "0.00";
				styleCell(attainedCell, { align: "center" });
			} else {
				attainedCell.value = "—";
				styleCell(attainedCell, { align: "center", color: "FF808080" });
			}

			// Gap
			const gapCell = ws4.getCell(r4, 5);
			if (gap > 0) {
				gapCell.value = gap;
				gapCell.numFmt = "0.00";
				styleCell(gapCell, { align: "center", bold: true, color: "FFFF0000" });
			} else {
				gapCell.value = gap <= 0 && targetVal > 0 ? "Met" : "—";
				styleCell(gapCell, { align: "center", color: gap <= 0 && targetVal > 0 ? "FF10B981" : "FF808080" });
			}

			// Observation
			const obsCell = ws4.getCell(r4, 6);
			obsCell.value = plan.gap_description || "—";
			styleCell(obsCell, { align: "left", wrapText: true });

			// Action Taken
			const actionCell = ws4.getCell(r4, 7);
			actionCell.value = plan.action_text || "—";
			styleCell(actionCell, { align: "left", wrapText: true });

			// Status
			const statusCell = ws4.getCell(r4, 8);
			statusCell.value = plan.status || "Open";
			let statusBg = "FFFEE2E2"; // Red for Open
			if (plan.status === "Completed") statusBg = "FFD1FAE5";
			if (plan.status === "In Progress") statusBg = "FFFEF3C7";
			styleCell(statusCell, {
				align: "center",
				bold: true,
				fillColor: statusBg,
			});

			r4++;
		});
	}

	// ==========================================
	// SHEET 5: CO-PO MAPPING MATRIX (RAW STRENGTH)
	// ==========================================
	const ws5 = wb.addWorksheet("CO-PO Mapping Matrix");

	ws5.getColumn(1).width = 6;   // Sl No.
	ws5.getColumn(2).width = 15;  // Course Code
	ws5.getColumn(3).width = 35;  // Course Name
	for (let col = 4; col <= 4 + poList.length - 1; col++) {
		ws5.getColumn(col).width = 10;
	}

	let r5 = 1;

	// Tezpur University
	mergeAndStyle(ws5, r5, 1, r5, totalCols, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r5++;

	// Title
	mergeAndStyle(ws5, r5, 1, r5, totalCols, {
		value: "PROGRAMME-LEVEL RAW CO-PO/PSO MAPPING STRENGTH MATRIX",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFE6E6FA",
	});
	r5++;

	// Info
	mergeAndStyle(ws5, r5, 1, r5, 2, {
		value: `Programme: ${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});
	mergeAndStyle(ws5, r5, 3, r5, totalCols, {
		value: `Batch: ${batchYear}`,
		bold: true,
		align: "right",
	});
	r5 += 2;

	// Headers
	ws5.getCell(r5, 1).value = "#";
	styleCell(ws5.getCell(r5, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws5.getCell(r5, 2).value = "Code";
	styleCell(ws5.getCell(r5, 2), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws5.getCell(r5, 3).value = "Course";
	styleCell(ws5.getCell(r5, 3), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	poList.forEach((po, idx) => {
		const cell = ws5.getCell(r5, poStartCol + idx);
		cell.value = po;
		styleCell(cell, { bold: true, align: "center", fillColor: "FFD3D3D3" });
	});
	r5++;

	// Group course mapping calculations to aggregate the average mapping value
	const courseAverages: Record<number, Record<string, number | null>> = {};

	if (data.courses.length === 0) {
		mergeAndStyle(ws5, r5, 1, r5, totalCols, {
			value: "No courses found for this programme and batch.",
			align: "center",
			italic: true,
		});
		r5++;
	} else {
		data.courses.forEach((course, idx) => {
			ws5.getCell(r5, 1).value = idx + 1;
			styleCell(ws5.getCell(r5, 1), { align: "center" });

			ws5.getCell(r5, 2).value = course.course_code;
			styleCell(ws5.getCell(r5, 2), { align: "center", bold: true });

			ws5.getCell(r5, 3).value = course.course_name;
			styleCell(ws5.getCell(r5, 3), { align: "left" });

			const mappingList = mappingsObj[course.offering_id] || [];
			courseAverages[course.offering_id] = {};

			poList.forEach((po, poIdx) => {
				const cell = ws5.getCell(r5, poStartCol + poIdx);

				// Find all CO mappings for this PO in this course
				const poMappings = mappingList.filter(m => m.po_name === po && m.value !== null && m.value > 0);
				if (poMappings.length > 0) {
					const sum = poMappings.reduce((acc, curr) => acc + curr.value, 0);
					const avg = Number((sum / poMappings.length).toFixed(2));
					cell.value = avg;
					cell.numFmt = "0.00";
					styleCell(cell, {
						align: "center",
						fillColor: getScaleColor(avg),
					});
					courseAverages[course.offering_id][po] = avg;
				} else {
					cell.value = "—";
					styleCell(cell, { align: "center", color: "FF808080" });
					courseAverages[course.offering_id][po] = null;
				}
			});
			r5++;
		});

		r5++;

		// Average Row
		mergeAndStyle(ws5, r5, 1, r5, 3, {
			value: "Average Mapping Strength (Department-Level)",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});

		poList.forEach((po, poIdx) => {
			const cell = ws5.getCell(r5, poStartCol + poIdx);
			let sum = 0;
			let count = 0;

			data.courses.forEach((c) => {
				const val = courseAverages[c.offering_id]?.[po];
				if (val !== null && val !== undefined && val > 0) {
					sum += val;
					count++;
				}
			});

			if (count > 0) {
				const overallAvg = Number((sum / count).toFixed(2));
				cell.value = overallAvg;
				cell.numFmt = "0.00";
				styleCell(cell, {
					bold: true,
					align: "center",
					fillColor: getScaleColor(overallAvg),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
	}

	// ==========================================
	// SHEET 6: BATCH COMPARISON
	// ==========================================
	const ws6 = wb.addWorksheet("Batch Comparison");

	ws6.getColumn(1).width = 18;  // Batch Year
	for (let col = 2; col <= 2 + poList.length - 1; col++) {
		ws6.getColumn(col).width = 10;
	}

	let r6 = 1;

	// Tezpur University
	mergeAndStyle(ws6, r6, 1, r6, totalCols - 2, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	r6++;

	// Title
	mergeAndStyle(ws6, r6, 1, r6, totalCols - 2, {
		value: "BATCH-WISE PO ATTAINMENT COMPARISON (CONTINUOUS IMPROVEMENT)",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFCCEEFF",
	});
	r6++;

	// Info
	mergeAndStyle(ws6, r6, 1, r6, 3, {
		value: `Programme: ${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});
	mergeAndStyle(ws6, r6, 4, r6, totalCols - 2, {
		value: "Continuous Improvement Analysis",
		bold: true,
		align: "right",
	});
	r6 += 2;

	// Headers
	ws6.getCell(r6, 1).value = "Batch Year";
	styleCell(ws6.getCell(r6, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	poList.forEach((po, idx) => {
		const cell = ws6.getCell(r6, 2 + idx);
		cell.value = po;
		styleCell(cell, { bold: true, align: "center", fillColor: "FFD3D3D3" });
	});
	r6++;

	// Add current batch to the comparison list
	const currentBatchAttainment: Record<string, number> = {};
	poList.forEach((po) => {
		if (data.finals[po] !== undefined && data.finals[po] !== null) {
			currentBatchAttainment[po] = data.finals[po];
		}
	});

	const comparisonList = [
		...pastList,
		{ batchYear: batchYear, poAttainment: currentBatchAttainment }
	].sort((a, b) => Number(a.batchYear) - Number(b.batchYear));

	comparisonList.forEach((batch) => {
		ws6.getCell(r6, 1).value = `Batch ${batch.batchYear}`;
		styleCell(ws6.getCell(r6, 1), { align: "left", bold: true });

		poList.forEach((po, poIdx) => {
			const cell = ws6.getCell(r6, 2 + poIdx);
			const val = batch.poAttainment ? batch.poAttainment[po] : null;
			if (val !== undefined && val !== null && val > 0) {
				cell.value = Number(val);
				cell.numFmt = "0.00";
				styleCell(cell, {
					align: "center",
					fillColor: getScaleColor(val),
				});
			} else {
				cell.value = "—";
				styleCell(cell, { align: "center", color: "FF808080" });
			}
		});
		r6++;
	});

	// Continuous Improvement Trend Row
	r6++;
	ws6.getCell(r6, 1).value = "Trend / Improvement";
	styleCell(ws6.getCell(r6, 1), { align: "left", bold: true, fillColor: "FFEEEEEE" });

	poList.forEach((po, poIdx) => {
		const cell = ws6.getCell(r6, 2 + poIdx);

		// Compare current batch to previous batch (if multiple batches exist)
		if (comparisonList.length >= 2) {
			const currentBatch = comparisonList[comparisonList.length - 1];
			const prevBatch = comparisonList[comparisonList.length - 2];

			const currVal = currentBatch.poAttainment ? currentBatch.poAttainment[po] : undefined;
			const prevVal = prevBatch.poAttainment ? prevBatch.poAttainment[po] : undefined;

			if (currVal !== undefined && currVal !== null && prevVal !== undefined && prevVal !== null) {
				const diff = currVal - prevVal;
				if (diff > 0.05) {
					cell.value = "▲ Up";
					styleCell(cell, { bold: true, align: "center", fillColor: "FFD1FAE5", color: "FF065F46" });
				} else if (diff < -0.05) {
					cell.value = "▼ Down";
					styleCell(cell, { bold: true, align: "center", fillColor: "FFFEE2E2", color: "FF991B1B" });
				} else {
					cell.value = "— Stable";
					styleCell(cell, { bold: true, align: "center", fillColor: "FFFEF3C7", color: "FF92400E" });
				}
			} else {
				cell.value = "N/A";
				styleCell(cell, { align: "center", color: "FF808080" });
			}
		} else {
			cell.value = "N/A";
			styleCell(cell, { align: "center", color: "FF808080" });
		}
	});

	// Finalize workbook
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const fileName = `${programmeCode || "Programme"}_Batch_${batchYear}_Attainment_Detailed.xlsx`;
	saveAs(blob, fileName);
}
