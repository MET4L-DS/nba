import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { CourseLevelProgrammeAttainmentResponse } from "@/services/api";
import { styleCell, mergeAndStyle } from "./excelUtils";

export interface ProgrammeAttainmentExportOptions {
	programmeCode: string;
	programmeName: string;
	batchYear: string;
	data: CourseLevelProgrammeAttainmentResponse;
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

export async function exportProgrammeAttainmentExcel(opts: ProgrammeAttainmentExportOptions) {
	const { programmeCode, programmeName, batchYear, data } = opts;
	const poList = data.po_list || [];

	const wb = new ExcelJS.Workbook();
	wb.creator = "OBEMS Platform";
	wb.created = new Date();

	const ws = wb.addWorksheet("Programme Attainment");

	// Initial column widths
	ws.getColumn(1).width = 6;   // Sl No.
	ws.getColumn(2).width = 15;  // Course Code
	ws.getColumn(3).width = 35;  // Course Name

	// Width of PO columns
	const poStartCol = 4;
	const totalCols = poStartCol + poList.length - 1;
	for (let col = poStartCol; col <= totalCols; col++) {
		ws.getColumn(col).width = 10;
	}

	let currentRow = 1;

	// Title 1: Tezpur University
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: "TEZPUR UNIVERSITY",
		bold: true,
		size: 12,
		align: "center",
		fillColor: "FFE4B57E",
	});
	currentRow++;

	// Title 2: Programme Articulation Matrix
	mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
		value: "EXECUTIVE ANALYTICS — PROGRAMME ARTICULATION MATRIX",
		bold: true,
		size: 14,
		align: "center",
		fillColor: "FFCCEEFF",
	});
	currentRow++;

	// Info Row: Programme details and Batch Year
	mergeAndStyle(ws, currentRow, 1, currentRow, 2, {
		value: "Programme:",
		bold: true,
		align: "left",
		fillColor: "FFEEEEEE",
	});
	mergeAndStyle(ws, currentRow, 3, currentRow, Math.max(3, totalCols - 2), {
		value: `${programmeCode} - ${programmeName}`,
		bold: true,
		align: "left",
	});

	if (totalCols > 4) {
		const batchLabelCol = totalCols - 1;
		const batchValCol = totalCols;
		ws.getCell(currentRow, batchLabelCol).value = "Batch:";
		styleCell(ws.getCell(currentRow, batchLabelCol), {
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		ws.getCell(currentRow, batchValCol).value = batchYear;
		styleCell(ws.getCell(currentRow, batchValCol), {
			bold: true,
			align: "center",
		});
	} else {
		// Fallback for narrow layout
		const cell = ws.getCell(currentRow, totalCols);
		cell.value = `Batch: ${batchYear}`;
		styleCell(cell, { bold: true, align: "right" });
	}
	currentRow++;

	// Empty spacing row
	currentRow++;

	// Table Headers
	const headerRow = currentRow;
	ws.getCell(headerRow, 1).value = "#";
	styleCell(ws.getCell(headerRow, 1), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws.getCell(headerRow, 2).value = "Code";
	styleCell(ws.getCell(headerRow, 2), { bold: true, align: "center", fillColor: "FFD3D3D3" });

	ws.getCell(headerRow, 3).value = "Course";
	styleCell(ws.getCell(headerRow, 3), { bold: true, align: "left", fillColor: "FFD3D3D3" });

	poList.forEach((po, idx) => {
		const cell = ws.getCell(headerRow, poStartCol + idx);
		cell.value = po;
		styleCell(cell, { bold: true, align: "center", fillColor: "FFD3D3D3" });
	});
	currentRow++;

	// Table Rows: Courses
	if (data.courses.length === 0) {
		mergeAndStyle(ws, currentRow, 1, currentRow, totalCols, {
			value: "No courses found for this programme and batch.",
			align: "center",
			italic: true,
		});
		currentRow++;
	} else {
		data.courses.forEach((course, idx) => {
			// Sl No.
			const slCell = ws.getCell(currentRow, 1);
			slCell.value = idx + 1;
			styleCell(slCell, { align: "center" });

			// Course Code
			const codeCell = ws.getCell(currentRow, 2);
			codeCell.value = course.course_code;
			styleCell(codeCell, { align: "center", bold: true });

			// Course Name
			const nameCell = ws.getCell(currentRow, 3);
			nameCell.value = course.course_name;
			styleCell(nameCell, { align: "left" });

			// PO Values
			poList.forEach((po, poIdx) => {
				const cell = ws.getCell(currentRow, poStartCol + poIdx);
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
			currentRow++;
		});

		// Empty separator border row
		currentRow++;

		// Footer Row 1: Direct Attainment (Average)
		mergeAndStyle(ws, currentRow, 1, currentRow, 3, {
			value: "Direct Attainment (Average)",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws.getCell(currentRow, poStartCol + poIdx);
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
		currentRow++;

		// Footer Row 2: Indirect Attainment (Surveys)
		mergeAndStyle(ws, currentRow, 1, currentRow, 3, {
			value: "Indirect Attainment (Surveys)",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws.getCell(currentRow, poStartCol + poIdx);
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
		currentRow++;

		// Footer Row 3: Final Attainment (Blended)
		mergeAndStyle(ws, currentRow, 1, currentRow, 3, {
			value: "Final Attainment (Blended)",
			bold: true,
			align: "right",
			fillColor: "FFE8F5E9", // Light Green header background
		});
		poList.forEach((po, poIdx) => {
			const cell = ws.getCell(currentRow, poStartCol + poIdx);
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
		currentRow++;

		// Footer Row 4: Target Level
		mergeAndStyle(ws, currentRow, 1, currentRow, 3, {
			value: "Target Level",
			bold: true,
			align: "right",
			fillColor: "FFEEEEEE",
		});
		poList.forEach((po, poIdx) => {
			const cell = ws.getCell(currentRow, poStartCol + poIdx);
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
					fillColor: isMet ? "FFD1FAE5" : "FFFEE2E2", // Green if met, Red if not met
				});
			} else {
				cell.value = "—";
				styleCell(cell, { bold: true, align: "center", color: "FF808080" });
			}
		});
		currentRow++;
	}

	// Finalize and save
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const fileName = `${programmeCode || "Programme"}_Batch_${batchYear}_Attainment.xlsx`;
	saveAs(blob, fileName);
}
