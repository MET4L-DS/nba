import type ExcelJS from "exceljs";

export interface CellStyleOptions {
	bold?: boolean;
	italic?: boolean;
	size?: number;
	color?: string; // ARGB hex string
	align?: "center" | "left" | "right";
	verticalAlign?: "top" | "middle" | "bottom";
	fillColor?: string; // ARGB hex string
	border?: boolean;
	wrapText?: boolean;
}

/**
 * Standard thin border helper
 */
export const thinBorder = {
	style: "thin" as const,
};

export const standardCellBorder = {
	top: thinBorder,
	left: thinBorder,
	bottom: thinBorder,
	right: thinBorder,
} as any;

/**
 * Apply styles directly to an ExcelJS cell
 */
export function styleCell(cell: ExcelJS.Cell, options: CellStyleOptions) {
	const font: Partial<ExcelJS.Font> = {};
	if (options.bold !== undefined) font.bold = options.bold;
	if (options.italic !== undefined) font.italic = options.italic;
	if (options.size !== undefined) font.size = options.size;
	if (options.color !== undefined) {
		font.color = { argb: options.color };
	}
	cell.font = font;

	if (options.align || options.verticalAlign || options.wrapText !== undefined) {
		cell.alignment = {
			horizontal: options.align || "center",
			vertical: options.verticalAlign || "middle",
			wrapText: options.wrapText,
		};
	}

	if (options.fillColor) {
		cell.fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: options.fillColor },
		};
	}

	if (options.border !== false) {
		cell.border = standardCellBorder;
	}
}

/**
 * Merge cells and style the top-left merged cell
 */
export function mergeAndStyle(
	ws: ExcelJS.Worksheet,
	startRow: number,
	startCol: number,
	endRow: number,
	endCol: number,
	options: CellStyleOptions & { value?: any }
) {
	ws.mergeCells(startRow, startCol, endRow, endCol);
	const cell = ws.getCell(startRow, startCol);
	if (options.value !== undefined) {
		cell.value = options.value;
	}
	styleCell(cell, options);

	// ExcelJS requires borders/styles to be applied to all cells in a merged range
	// to render borders correctly around the entire merged range.
	for (let r = startRow; r <= endRow; r++) {
		for (let c = startCol; c <= endCol; c++) {
			const rangeCell = ws.getCell(r, c);
			if (options.border !== false) {
				rangeCell.border = standardCellBorder;
			}
		}
	}
}
