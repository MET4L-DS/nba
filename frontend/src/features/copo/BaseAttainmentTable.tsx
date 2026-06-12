import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttainmentData } from "./types";
import { motion } from "framer-motion";

interface BaseAttainmentTableProps {
	title: string;
	coList: string[];
	isCOAssessed: (co: string) => boolean;
	attainmentData: AttainmentData;
	rows: {
		label: string;
		getValue: (co: string, isAssessed: boolean) => React.ReactNode;
		rowClass?: string;
		cellClass?: (co: string) => string;
	}[];
}

const CO_HEADER_COLORS = [
	"text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40",
	"text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/40",
	"text-pink-600 dark:text-pink-400 bg-pink-50/80 dark:bg-pink-950/40",
	"text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40",
	"text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40",
	"text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/40",
];

export function BaseAttainmentTable({
	title,
	coList,
	isCOAssessed,
	rows,
}: BaseAttainmentTableProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
		>
			<Card className="bg-card/80 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				{/* Accent top bar */}
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-rose-500 to-transparent" />

				<CardHeader className="bg-gradient-to-r from-rose-500/8 via-pink-500/6 to-transparent border-b border-muted/30 py-3 px-5">
					<CardTitle className="text-sm font-bold text-center text-foreground uppercase tracking-wider">
						{title}
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								{/* CO Group Header */}
								<TableRow className="bg-blue-500/[0.06] hover:bg-transparent border-b border-muted/30">
									<TableHead
										className="border-r border-muted/30 font-bold text-center align-middle bg-amber-500/[0.10] text-amber-700 dark:text-amber-400 py-3 px-4 text-xs uppercase tracking-wider"
										rowSpan={2}
									>
										Attainment Table
									</TableHead>
									<TableHead
										className="border-r border-muted/20 font-bold text-center text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 py-3"
										colSpan={6}
									>
										CO1 to CO6
									</TableHead>
								</TableRow>

								{/* Individual CO Headers */}
								<TableRow className="bg-muted/[0.08] hover:bg-transparent border-b border-muted/30">
									{coList.map((co, i) => (
										<TableHead
											key={co}
											className={`border-r border-muted/20 last:border-r-0 font-bold text-center text-xs py-2.5 min-w-[70px] ${
												isCOAssessed(co) ? CO_HEADER_COLORS[i] : "text-muted-foreground/50"
											}`}
										>
											{co}
											{!isCOAssessed(co) && (
												<span className="block text-[9px] font-normal opacity-60">N/A</span>
											)}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>

							<TableBody>
								{rows.map((row, i) => (
									<motion.tr
										key={i}
										className={`border-b border-muted/20 last:border-b-0 transition-colors ${
											row.rowClass?.includes("bg-") ? "" : "hover:bg-muted/[0.04]"
										} ${row.rowClass || ""}`}
										initial={{ opacity: 0, x: -6 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											type: "spring",
											stiffness: 280,
											damping: 24,
											delay: i * 0.05,
										}}
									>
										<TableCell className={`border-r border-muted/20 font-semibold text-xs py-3 px-4 max-w-[280px] ${
											row.rowClass?.includes("text-") ? "text-inherit" : "text-foreground/85"
										}`}>
											{row.label}
										</TableCell>
										{coList.map((co) => (
											<TableCell
												key={co}
												className={`border-r border-muted/20 last:border-r-0 text-center text-sm tabular-nums py-3 px-3 ${
													row.cellClass?.(co) || ""
												}`}
											>
												{row.getValue(co, isCOAssessed(co))}
											</TableCell>
										))}
									</motion.tr>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
