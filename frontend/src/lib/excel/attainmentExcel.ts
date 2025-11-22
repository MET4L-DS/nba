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
	} = opts;

	// Sort thresholds descending
	const sorted = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage
	);

	const wb = new ExcelJS.Workbook();
	wb.creator = "NBA System";
	wb.created = new Date();

	const ws = wb.addWorksheet("Attainment");

	// Columns widths for nice layout
	ws.columns = [
		{ key: "a", width: 14 },
		{ key: "b", width: 14 },
		{ key: "c", width: 12 },
		{ key: "d", width: 12 },
		{ key: "e", width: 20 },
		{ key: "f", width: 14 },
		{ key: "g", width: 14 },
	];

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

	// Finalize and save
	const buffer = await wb.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const fileName = `${courseCode || "attainment"}_attainment.xlsx`;
	saveAs(blob, fileName);
}
