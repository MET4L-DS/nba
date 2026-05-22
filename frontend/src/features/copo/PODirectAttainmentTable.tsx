import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { COPOMatrixState } from "./types";
import { motion } from "framer-motion";

interface PODirectAttainmentTableProps {
	copoMatrix: COPOMatrixState;
	coMaxMarks?: Record<string, number>;
}

const CO_ROW_COLORS = [
	"text-indigo-600 dark:text-indigo-400",
	"text-purple-600 dark:text-purple-400",
	"text-pink-600 dark:text-pink-400",
	"text-amber-600 dark:text-amber-400",
	"text-emerald-600 dark:text-emerald-400",
	"text-cyan-600 dark:text-cyan-400",
];

export function PODirectAttainmentTable({
	copoMatrix,
	coMaxMarks,
}: PODirectAttainmentTableProps) {
	const cos = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];
	const pos = [
		"PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
		"PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
		"PSO1", "PSO2", "PSO3",
	];

	const isCOAssessed = (co: string): boolean => {
		if (!coMaxMarks) return true;
		return (coMaxMarks[co] || 0) > 0;
	};

	const calculateWeightSum = (po: string) => {
		let sum = 0;
		cos.forEach((co) => {
			if (isCOAssessed(co)) {
				const val = copoMatrix[co as keyof COPOMatrixState][po] || 0;
				sum += val;
			}
		});
		return sum;
	};

	return (
		<motion.div
			className="mt-6"
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
		>
			<Card className="bg-card/80 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				{/* Accent top bar */}
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 via-amber-500 to-transparent" />

				<CardHeader className="bg-gradient-to-r from-orange-500/8 via-amber-500/5 to-transparent border-b border-muted/30 py-3 px-5">
					<CardTitle className="text-sm font-bold text-center text-foreground uppercase tracking-wider">
						PO Attainment Using CO (Direct Method)
					</CardTitle>
				</CardHeader>

				<CardContent className="p-0 overflow-auto">
					<Table>
						<TableHeader>
							{/* CO-PO Mapping Header */}
							<TableRow className="bg-blue-500/[0.06] hover:bg-transparent border-b border-muted/30">
								<TableHead
									className="w-[90px] border-r border-muted/30 font-bold text-center text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 py-3"
									colSpan={16}
								>
									CO-PO Mapping
								</TableHead>
							</TableRow>
							<TableRow className="bg-muted/[0.08] hover:bg-transparent border-b border-muted/30">
								<TableHead className="w-[90px] border-r border-muted/30 font-bold text-center text-xs py-2.5 text-muted-foreground">
									—
								</TableHead>
								{pos.map((po) => (
									<TableHead
										key={po}
										className={`text-center border-r border-muted/20 last:border-r-0 font-bold text-xs py-2.5 min-w-[52px] ${
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
							{cos.map((co, i) => (
								<motion.tr
									key={co}
									className="border-b border-muted/20 hover:bg-muted/[0.04] transition-colors"
									initial={{ opacity: 0, x: -8 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{
										type: "spring",
										stiffness: 280,
										damping: 24,
										delay: i * 0.04,
									}}
								>
									<TableCell
										className={`font-bold border-r border-muted/20 text-center py-2.5 px-3 bg-muted/[0.06] text-sm ${
											isCOAssessed(co) ? CO_ROW_COLORS[i] : "text-muted-foreground/40"
										}`}
									>
										{co}
										{!isCOAssessed(co) && (
											<span className="block text-[9px] font-normal opacity-60">N/A</span>
										)}
									</TableCell>
									{pos.map((po) => {
										const val = copoMatrix[co as keyof COPOMatrixState][po];
										const hasVal = val > 0 && isCOAssessed(co);
										return (
											<TableCell
												key={po}
												className={`text-center border-r border-muted/20 last:border-r-0 text-sm tabular-nums py-2.5 px-2 ${
													po.startsWith("PSO") ? "bg-violet-50/20 dark:bg-violet-950/10" : ""
												}`}
											>
												{hasVal ? (
													<span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs bg-primary/10 text-primary">
														{val}
													</span>
												) : (
													<span className="text-muted-foreground/25 text-sm">—</span>
												)}
											</TableCell>
										);
									})}
								</motion.tr>
							))}

							{/* Weight Sum Row */}
							<TableRow className="bg-orange-50/60 dark:bg-orange-950/20 border-t-2 border-orange-200/50 dark:border-orange-800/30 hover:bg-orange-50/80 dark:hover:bg-orange-950/30">
								<TableCell className="border-r border-muted/30 text-center py-3 px-3 font-bold text-xs text-orange-700 dark:text-orange-400 uppercase tracking-wider">
									Wt. Sum
								</TableCell>
								{pos.map((po) => {
									const sum = calculateWeightSum(po);
									return (
										<TableCell
											key={po}
											className={`text-center border-r border-muted/20 last:border-r-0 tabular-nums py-3 px-2 font-bold text-sm ${
												sum > 0
													? "text-orange-700 dark:text-orange-400"
													: "text-muted-foreground/30"
											}`}
										>
											{sum > 0 ? sum.toFixed(2) : "—"}
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
}
