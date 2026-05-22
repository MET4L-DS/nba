import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { debugLogger } from "@/lib/debugLogger";
import React from "react";
import { motion } from "framer-motion";

interface POComputation3PointTableProps {
	data: {
		rows: { co: string; values: Record<string, number | null> }[];
		averages: Record<string, number | null>;
		overall: number;
	};
}

export const POComputation3PointTable = React.memo(function POComputation3PointTable({
	data,
}: POComputation3PointTableProps) {
	const pos = [
		"PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
		"PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
		"PSO1", "PSO2", "PSO3",
	];

	debugLogger.info("POComputation3PointTable", "Rendering 3-point scale", {
		overall: Number(data.overall).toFixed(2),
		poAverages: Object.fromEntries(
			pos.map((po) => [po, data.averages[po] != null ? Number(data.averages[po]).toFixed(2) : null]),
		),
	});

	return (
		<motion.div
			className="mt-6"
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
		>
			<Card className="bg-card/80 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent" />
				<CardHeader className="bg-gradient-to-r from-blue-500/8 via-indigo-500/5 to-transparent border-b border-muted/30 py-3.5 px-5">
					<CardTitle className="text-sm font-bold flex items-center justify-between text-foreground">
						<span className="uppercase tracking-wider">PO &amp; PSO Attainment (3 Point Scale)</span>
						<span className="text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full tabular-nums">
							Overall: {Number(data.overall).toFixed(2)}
						</span>
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/[0.08] hover:bg-transparent border-b border-muted/30">
								<TableHead className="w-[110px] border-r border-muted/30 font-bold text-xs uppercase tracking-wider text-muted-foreground/80 min-w-20 py-3">
									Course Outcome
								</TableHead>
								{pos.map((po) => (
									<TableHead
										key={po}
										className={`text-center border-r border-muted/20 last:border-r-0 font-bold text-xs py-2.5 min-w-[58px] ${
											po.startsWith("PSO")
												? "text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20"
												: "text-foreground/80"
										}`}
									>
										{po}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.rows.map((row, idx) => (
								<motion.tr
									key={row.co}
									className="border-b border-muted/20 hover:bg-muted/[0.04] transition-colors"
									initial={{ opacity: 0, x: -6 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ type: "spring" as const, stiffness: 280, damping: 24, delay: idx * 0.04 }}
								>
									<TableCell className="font-semibold border-r border-muted/20 text-sm text-foreground/90 py-2.5 px-4">
										{row.co}
									</TableCell>
									{pos.map((po) => (
										<TableCell
											key={po}
											className={`text-center border-r border-muted/20 last:border-r-0 text-sm tabular-nums py-2.5 px-3 ${
												po.startsWith("PSO") ? "bg-violet-50/20 dark:bg-violet-950/10" : ""
											}`}
										>
											{row.values[po] !== null
												? Number(row.values[po]!).toFixed(2)
												: <span className="text-muted-foreground/30">—</span>}
										</TableCell>
									))}
								</motion.tr>
							))}

							{/* Average Row */}
							<TableRow className="bg-indigo-50/40 dark:bg-indigo-950/20 border-t-2 border-indigo-200/40 dark:border-indigo-800/30 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30">
								<TableCell className="border-r border-muted/30 font-bold text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-400 py-3 px-4">
									Average
								</TableCell>
								{pos.map((po) => {
									const val = data.averages[po];
									return (
										<TableCell
											key={po}
											className={`text-center border-r border-muted/20 last:border-r-0 font-bold text-sm tabular-nums py-3 px-3 text-indigo-700 dark:text-indigo-400 ${
												po.startsWith("PSO") ? "bg-violet-50/30 dark:bg-violet-950/15" : ""
											}`}
										>
											{val !== null && val !== undefined
												? Number(val).toFixed(2)
												: <span className="text-muted-foreground/30">—</span>}
										</TableCell>
									);
								})}
							</TableRow>
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</motion.div>
	);
});
