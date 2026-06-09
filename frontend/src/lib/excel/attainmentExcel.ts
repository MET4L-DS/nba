import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { AttainmentExportOptions } from "./types";
import { calculateTotalCOMaxMarks } from "./types";

import {
	createAttainmentCriteriaSection,
	createPassingMarksSection,
	createUniversitySection,
	createFacultyInfoSection,
} from "./headerSections";
import { createTableHeaders } from "./tableHeaders";
import { fillStudentData } from "./studentRows";
import {
	createCOAttainmentPointScaleTable,
	createCOAttainmentAbsoluteScaleTable,
} from "./coAttainmentTables";
import { createCOPOMappingTable } from "./copoMappingTable";

// Re-export types for backward compatibility
export type {
	AttainmentExportOptions,
	StudentMarksData,
	COMarks,
	AssessmentInfo,
	COPOMatrix,
} from "./types";

export async function exportAttainmentExcel(opts: AttainmentExportOptions) {
	const {
		attainmentThresholds,
		coThreshold,
		passingThreshold,
		courseCode,
		facultyName = "",
		branch = "",
		programme = "",
		year = "",
		semester = "",
		courseName = "",
		session = "",
		studentsData = [],
		assessments = [],
		copoMatrix = {},
		snapshotIndirectData = [],
	} = opts;

	// Determine unique CO names dynamically from the data
	const coNames = Array.from(
		new Set([
			...(studentsData ? studentsData.flatMap(s => Object.keys(s.coTotals || {}).filter(k => k.startsWith("CO"))) : []),
			...(assessments ? assessments.flatMap(a => Object.keys(a.coMaxMarks || {}).filter(k => k.startsWith("CO"))) : [])
		])
	).filter(co => co !== "CO" && co !== "ΣCO" && co !== "total").sort();

	if (coNames.length === 0) {
		coNames.push("CO1", "CO2", "CO3", "CO4", "CO5", "CO6");
	}

	const wb = new ExcelJS.Workbook();
	wb.creator = "NBA System";
	wb.created = new Date();

	const ws = wb.addWorksheet("Attainment");

	// Initial column widths
	ws.getColumn(1).width = 6;
	ws.getColumn(2).width = 12;
	ws.getColumn(3).width = 30;
	ws.getColumn(4).width = 20;

	const totalCols = 4 + assessments.length * coNames.length + 1 + coNames.length + 1;

	// Create header sections
	const rowsNeeded = createAttainmentCriteriaSection(
		ws,
		attainmentThresholds
	);
	createPassingMarksSection(ws, passingThreshold, coThreshold, totalCols);

	const universityRow = rowsNeeded + 1;
	createUniversitySection(ws, universityRow, totalCols);

	const infoRow1 = universityRow + 1;
	const infoRow2 = universityRow + 2;
	createFacultyInfoSection(ws, infoRow1, infoRow2, {
		facultyName,
		branch,
		courseName,
		programme,
		year,
		semester,
		courseCode,
		session,
	}, totalCols);

	// Create student marks table
	const tableStartRow = infoRow2 + 1;
	const { assessmentColumns, totalStartCol, coStartCol, sigmaCoCol } =
		createTableHeaders(ws, tableStartRow, assessments, coNames);

	// Set dynamic column widths after finding out headers
	for (let col = 5; col < totalStartCol; col++) {
		ws.getColumn(col).width = 5;
	}
	ws.getColumn(totalStartCol).width = 8;
	for (let col = coStartCol; col <= sigmaCoCol; col++) {
		ws.getColumn(col).width = 8;
	}

	// Fill student data
	fillStudentData(
		ws,
		tableStartRow + 4, // Start after 4-row header
		studentsData,
		assessments,
		assessmentColumns,
		totalStartCol,
		coStartCol,
		sigmaCoCol,
		coNames
	);

	// Add CO Attainment tables
	const studentDataEndRow = tableStartRow + 4 + studentsData.length;
	const attainmentTablesStartRow = studentDataEndRow + 3; // Leave 2 empty rows

	// Calculate total CO max marks from all assessments
	const coMaxMarks = calculateTotalCOMaxMarks(assessments);

	// Create CO Attainment in x.0 Point Scale table
	const pointScaleEndRow = createCOAttainmentPointScaleTable(
		ws,
		attainmentTablesStartRow,
		studentsData,
		passingThreshold,
		coThreshold,
		attainmentThresholds,
		coMaxMarks,
		coNames,
		coStartCol
	);

	// Create CO Attainment in Absolute Scale table (with snapshotIndirectData)
	createCOAttainmentAbsoluteScaleTable(
		ws,
		pointScaleEndRow + 2, // Leave 1 empty row between tables
		studentsData,
		passingThreshold,
		coThreshold,
		attainmentThresholds,
		coMaxMarks,
		coNames,
		coStartCol,
		snapshotIndirectData
	);

	// Create CO-PO Mapping table on a separate sheet (only if copoMatrix is provided)
	if (copoMatrix && Object.keys(copoMatrix).length > 0) {
		const copoWs = wb.addWorksheet("CO-PO Mapping");

		// Extract unique PO/PSO names from the matrix dynamically to set widths
		const poSet = new Set<string>();
		Object.values(copoMatrix).forEach((pos) => {
			Object.keys(pos).forEach((po) => {
				poSet.add(po.toUpperCase());
			});
		});

		copoWs.getColumn(1).width = 10; // CO labels
		const poListLength = poSet.size || 15;
		for (let col = 2; col <= 1 + poListLength; col++) {
			copoWs.getColumn(col).width = 8; // PO/PSO columns
		}

		createCOPOMappingTable(
			copoWs,
			1, // Start from row 1 on the new sheet
			studentsData,
			coThreshold,
			attainmentThresholds,
			copoMatrix,
			coMaxMarks,
			coNames
		);
	}

	// Finalize and save
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const fileName = `${courseCode || "attainment"}_attainment.xlsx`;
	saveAs(blob, fileName);
}
