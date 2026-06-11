import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatOrdinal(n: number | string | null | undefined): string {
	if (n === null || n === undefined || n === "") return "—";
	const num = Number(n);
	if (isNaN(num)) return String(n);

	const s = ["th", "st", "nd", "rd"];
	const v = num % 100;
	return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function downloadCSVTemplate(filename: string, headers: string[], sampleRows: string[][]) {
	const content = [
		headers.join(","),
		...sampleRows.map(row => row.map(cell => {
			// Escape double quotes and wrap cells containing commas
			const str = String(cell);
			if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
				return `"${str.replace(/"/g, '""')}"`;
			}
			return str;
		}).join(","))
	].join("\n");

	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", filename);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
