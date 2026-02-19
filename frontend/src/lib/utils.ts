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
