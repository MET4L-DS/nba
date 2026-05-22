import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { debugLogger } from "@/lib/debugLogger";
import type { COPOMatrixState, AttainmentData } from "./types";
import { motion } from "framer-motion";

interface COPOMatrixGridProps {
	copoMatrix: COPOMatrixState;
	updateCOPOMapping: (co: string, po: string, value: number) => void;
	calculatePOAttainment: (po: string) => number;
	attainmentData: AttainmentData | null;
	getAttainmentLevel: (percentage: number) => number;
	getLevelColor: (level: number) => string;
	attainmentThresholds: { id: number; percentage: number }[];
	coMaxMarks?: Record<string, number>;
	readOnly?: boolean;
	snapshotIndirectData?: Array<{
		co_name: string;
		final_attainment_level?: number | null;
		attainment_level: number;
	}>;
}

export function COPOMatrixGrid({
	copoMatrix,
	updateCOPOMapping,
	calculatePOAttainment,
	attainmentData,
	getAttainmentLevel,
	getLevelColor,
	attainmentThresholds,
	coMaxMarks,
	readOnly = false,
	snapshotIndirectData,
}: COPOMatrixGridProps) {
	const [hoveredCell, setHoveredCell] = useState<{ co: string; col: string } | null>(null);
	const [focusedCell, setFocusedCell] = useState<{ co: string; col: string } | null>(null);

	const activeCo = focusedCell?.co || hoveredCell?.co;
	const activeCol = focusedCell?.col || hoveredCell?.col;

	const getBadgeShadow = (level: number) => {
		if (level >= 2.5) return "shadow-[0_0_12px_rgba(34,197,94,0.45)] dark:shadow-[0_0_16px_rgba(34,197,94,0.65)]";
		if (level >= 1.5) return "shadow-[0_0_12px_rgba(234,179,8,0.45)] dark:shadow-[0_0_16px_rgba(234,179,8,0.65)]";
		if (level > 0) return "shadow-[0_0_12px_rgba(239,68,68,0.45)] dark:shadow-[0_0_16px_rgba(239,68,68,0.65)]";
		return "";
	};

	// Lookup: final CO level from snapshot when available
	const getCoLevel = (coName: string): number | null => {
		if (!snapshotIndirectData) return null;
		const entry = snapshotIndirectData.find(
			(d) => d.co_name === coName,
		);
		if (!entry) return null;
		return entry.final_attainment_level ?? entry.attainment_level ?? null;
	};

	// Helper to check if a CO is assessed
	const isCOAssessed = (co: string): boolean => {
		if (!coMaxMarks) return true;
		return (coMaxMarks[co] || 0) > 0;
	};

	// Log PO attainment values for debugging
	const poAttainments: Record<string, number> = {};
	const allPos = ["PO1","PO2","PO3","PO4","PO5","PO6","PO7","PO8","PO9","PO10","PO11","PO12","PSO1","PSO2","PSO3"];
	allPos.forEach((po) => { poAttainments[po] = calculatePOAttainment(po); });
	debugLogger.info("COPOMatrixGrid", "PO Attainment values rendered", {
		poAttainments,
		readOnly,
		usingSnapshotCoLevels: snapshotIndirectData?.some((d) => d.final_attainment_level != null) ?? false,
		coLevels: ["CO1","CO2","CO3","CO4","CO5","CO6"].map((co) => ({
			co,
			snapshotLevel: getCoLevel(co),
			liveLevel: attainmentData && isCOAssessed(co)
				? getAttainmentLevel(
						attainmentData.presentStudents > 0
							? (attainmentData.coStats[co as keyof typeof attainmentData.coStats].aboveCOThreshold / attainmentData.presentStudents) * 100
							: 0,
					)
				: null,
		})),
	});

	return (
		<Table className="relative select-none border-collapse">
			<TableHeader>
				<TableRow className="bg-blue-50/80 dark:bg-blue-950/40 backdrop-blur">
					<TableHead
						rowSpan={2}
						className="border border-gray-300 dark:border-gray-700 font-bold text-center align-middle bg-yellow-100/80 dark:bg-yellow-950/40 text-foreground"
					>
						CO
					</TableHead>
					<TableHead
						rowSpan={2}
						className="border border-gray-300 dark:border-gray-700 font-bold text-center align-middle bg-yellow-100/80 dark:bg-yellow-950/40 text-foreground min-w-[100px]"
					>
						CO Attainment Level
					</TableHead>
					<TableHead
						colSpan={12}
						className="border border-gray-300 dark:border-gray-700 font-bold text-center bg-green-50/80 dark:bg-green-950/40 text-foreground"
					>
						CO-PO Mapping Matrix
					</TableHead>
					<TableHead
						colSpan={3}
						className="border border-gray-300 dark:border-gray-700 font-bold text-center bg-purple-50/80 dark:bg-purple-950/40 text-foreground"
					>
						CO-PSO Mapping Matrix
					</TableHead>
				</TableRow>
				<TableRow className="bg-zinc-50/80 dark:bg-zinc-900/40 backdrop-blur">
					{[
						"PO1",
						"PO2",
						"PO3",
						"PO4",
						"PO5",
						"PO6",
						"PO7",
						"PO8",
						"PO9",
						"PO10",
						"PO11",
						"PO12",
					].map((po) => (
						<TableHead
							key={po}
							className={`border border-gray-300 dark:border-gray-700 font-bold text-center text-xs transition-colors duration-150 ${
								activeCol === po
									? "bg-primary/20 dark:bg-primary/40 text-primary font-extrabold shadow-inner"
									: "text-foreground/80"
							}`}
						>
							{po}
						</TableHead>
					))}
					{["PSO1", "PSO2", "PSO3"].map((pso) => (
						<TableHead
							key={pso}
							className={`border border-gray-300 dark:border-gray-700 font-bold text-center text-xs transition-colors duration-150 ${
								activeCol === pso
									? "bg-primary/20 dark:bg-primary/40 text-primary font-extrabold shadow-inner"
									: "text-foreground/80"
							}`}
						>
							{pso}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{/* CO Rows */}
				{["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"].map((co) => {
					const assessed = isCOAssessed(co);
					const snapshotLevel = getCoLevel(co);
					const coLevel = snapshotLevel !== null
						? snapshotLevel
						: assessed && attainmentData
							? getAttainmentLevel(
									attainmentData.presentStudents > 0
										? (attainmentData.coStats[
												co as keyof typeof attainmentData.coStats
											].aboveCOThreshold /
												attainmentData.presentStudents) *
												100
										: 0,
								)
							: 0;

					const isRowActive = activeCo === co;

					return (
						<TableRow 
							key={co}
							className={`transition-colors duration-150 ${
								isRowActive ? "bg-primary/[0.02] dark:bg-primary/[0.04]" : ""
							}`}
						>
							<TableCell 
								className={`border border-gray-300 dark:border-gray-700 font-bold text-center transition-colors duration-150 ${
									isRowActive
										? "bg-primary/10 dark:bg-primary/25 text-primary font-extrabold"
										: "bg-zinc-50/50 dark:bg-zinc-900/30 text-foreground"
								}`}
							>
								{co}
							</TableCell>
							<TableCell 
								className={`border border-gray-300 dark:border-gray-700 text-center transition-colors duration-150 ${
									isRowActive ? "bg-primary/[0.04] dark:bg-primary/[0.08]" : ""
								}`}
							>
								{assessed ? (
									<Badge className={`${getLevelColor(coLevel)} ${getBadgeShadow(Number(coLevel))} hover:scale-110 transition-transform duration-200 cursor-default font-mono shadow-sm`}>
										{Number(coLevel).toFixed(2)}
									</Badge>
								) : (
									<span className="text-gray-500 font-semibold text-xs">
										NA
									</span>
								)}
							</TableCell>
							{/* PO Mappings */}
							{[
								"PO1",
								"PO2",
								"PO3",
								"PO4",
								"PO5",
								"PO6",
								"PO7",
								"PO8",
								"PO9",
								"PO10",
								"PO11",
								"PO12",
							].map((po) => {
								const isColActive = activeCol === po;
								const isIntersection = isRowActive && isColActive;
								return (
									<TableCell
										key={po}
										className={`border border-gray-300 dark:border-gray-700 text-center p-1 transition-all duration-150 ${
											isIntersection
												? "bg-primary/20 dark:bg-primary/35 border-primary/50"
												: isRowActive || isColActive
													? "bg-primary/[0.05] dark:bg-primary/[0.1]"
													: ""
										}`}
									>
										<motion.div
											whileHover={{ scale: 1.08 }}
											animate={{ scale: focusedCell?.co === co && focusedCell?.col === po ? 1.08 : 1 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
											className="inline-block"
										>
											<Input
												type="number"
												min="0"
												max={attainmentThresholds.length}
												disabled={readOnly}
												value={
													copoMatrix[
														co as keyof COPOMatrixState
													][po]
												}
												onChange={(e) =>
													updateCOPOMapping(
														co,
														po,
														Number(e.target.value),
													)
												}
												onFocus={(e) => {
													e.target.select();
													setFocusedCell({ co, col: po });
												}}
												onBlur={() => setFocusedCell(null)}
												onMouseEnter={() => setHoveredCell({ co, col: po })}
												onMouseLeave={() => setHoveredCell(null)}
												className={`w-16 h-8 text-center transition-all duration-150 font-medium ${
													isIntersection
														? "ring-2 ring-primary border-primary font-bold shadow-lg"
														: isRowActive || isColActive
															? "border-primary/30"
															: ""
												}`}
											/>
										</motion.div>
									</TableCell>
								);
							})}
							{/* PSO Mappings */}
							{["PSO1", "PSO2", "PSO3"].map((pso) => {
								const isColActive = activeCol === pso;
								const isIntersection = isRowActive && isColActive;
								return (
									<TableCell
										key={pso}
										className={`border border-gray-300 dark:border-gray-700 text-center p-1 transition-all duration-150 ${
											isIntersection
												? "bg-primary/20 dark:bg-primary/35 border-primary/50"
												: isRowActive || isColActive
													? "bg-primary/[0.05] dark:bg-primary/[0.1]"
													: ""
										}`}
									>
										<motion.div
											whileHover={{ scale: 1.08 }}
											animate={{ scale: focusedCell?.co === co && focusedCell?.col === pso ? 1.08 : 1 }}
											transition={{ type: "spring", stiffness: 300, damping: 15 }}
											className="inline-block"
										>
											<Input
												type="number"
												min="0"
												max={attainmentThresholds.length}
												disabled={readOnly}
												value={
													copoMatrix[
														co as keyof COPOMatrixState
													][pso]
												}
												onChange={(e) =>
													updateCOPOMapping(
														co,
														pso,
														Number(e.target.value),
													)
												}
												onFocus={(e) => {
													e.target.select();
													setFocusedCell({ co, col: pso });
												}}
												onBlur={() => setFocusedCell(null)}
												onMouseEnter={() => setHoveredCell({ co, col: pso })}
												onMouseLeave={() => setHoveredCell(null)}
												className={`w-16 h-8 text-center transition-all duration-150 font-medium ${
													isIntersection
														? "ring-2 ring-primary border-primary font-bold shadow-lg"
														: isRowActive || isColActive
															? "border-primary/30"
															: ""
												}`}
											/>
										</motion.div>
									</TableCell>
								);
							})}
						</TableRow>
					);
				})}

				{/* PO Attainment Row */}
				<TableRow className="bg-orange-50/80 dark:bg-orange-950/30 font-bold backdrop-blur">
					<TableCell
						colSpan={2}
						className="border border-gray-300 dark:border-gray-700 text-center text-sm font-bold text-orange-900 dark:text-orange-200"
					>
						PO Attainment Level
					</TableCell>
					{[
						"PO1",
						"PO2",
						"PO3",
						"PO4",
						"PO5",
						"PO6",
						"PO7",
						"PO8",
						"PO9",
						"PO10",
						"PO11",
						"PO12",
					].map((po) => {
						const attainment = calculatePOAttainment(po);
						const isColActive = activeCol === po;
						return (
							<TableCell
								key={po}
								className={`border border-gray-300 dark:border-gray-700 text-center transition-colors duration-150 ${
									isColActive ? "bg-orange-200/40 dark:bg-orange-900/40" : ""
								}`}
							>
								<Badge
									className={`${getLevelColor(
										Math.round(attainment),
									)} ${getBadgeShadow(Number(attainment))} hover:scale-110 transition-transform duration-200 cursor-default font-mono shadow-sm`}
								>
									{Number(attainment).toFixed(2)}
								</Badge>
							</TableCell>
						);
					})}
					{["PSO1", "PSO2", "PSO3"].map((pso) => {
						const attainment = calculatePOAttainment(pso);
						const isColActive = activeCol === pso;
						return (
							<TableCell
								key={pso}
								className={`border border-gray-300 dark:border-gray-700 text-center transition-colors duration-150 ${
									isColActive ? "bg-orange-200/40 dark:bg-orange-900/40" : ""
								}`}
							>
								<Badge
									className={`${getLevelColor(
										Math.round(attainment),
									)} ${getBadgeShadow(Number(attainment))} hover:scale-110 transition-transform duration-200 cursor-default font-mono shadow-sm`}
								>
									{Number(attainment).toFixed(2)}
								</Badge>
							</TableCell>
						);
					})}
				</TableRow>
			</TableBody>
		</Table>
	);
}
