import { BaseAttainmentTable } from "./BaseAttainmentTable";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { debugLogger } from "@/lib/debugLogger";
import type { AttainmentData } from "./types";
import { motion } from "framer-motion";

interface COAttainmentTableProps {
	attainmentData: AttainmentData;
	coThreshold: number;
	coMaxMarks?: Record<string, number>;
	getAttainmentLevel: (percentage: number) => number;
	getPercentageColor: (percentage: number) => string;
	snapshotIndirectData?: Array<{
		co_name: string;
		attainment_percentage: number;
		attainment_level: number;
		indirect_attainment_percentage?: number | null;
		indirect_attainment_level?: number | null;
		final_attainment_percentage?: number | null;
		final_attainment_level?: number | null;
	}>;
}

export function COAttainmentTable({
	attainmentData,
	coThreshold,
	coMaxMarks,
	getAttainmentLevel,
	getPercentageColor,
	snapshotIndirectData,
}: COAttainmentTableProps) {
	const coList = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];

	const isCOAssessed = (co: string): boolean => {
		if (!coMaxMarks) return true;
		return (coMaxMarks[co] || 0) > 0;
	};

	const getPercentage = (_co: string, field: 'aboveCOThreshold' | 'abovePass') => {
		if (attainmentData.presentStudents === 0) return 0;
		return (attainmentData.coStats[_co as keyof typeof attainmentData.coStats][field] / attainmentData.presentStudents) * 100;
	};
	
	const getAveragePercentage = (_co: string) => {
		if (attainmentData.presentStudents === 0) return 0;
		return attainmentData.coStats[_co as keyof typeof attainmentData.coStats].averagePercentage || 0;
	};

	if (snapshotIndirectData && snapshotIndirectData.length > 0) {
		debugLogger.info("COAttainmentTable", "Rendering Direct/Indirect/Final breakdown", {
			coCount: snapshotIndirectData.length,
			sample: snapshotIndirectData[0],
			hasIndirect: snapshotIndirectData.some(
				(d) => d.indirect_attainment_level !== null && d.indirect_attainment_level !== undefined,
			),
			blendedCos: snapshotIndirectData
				.filter((d) => d.final_attainment_percentage != null && d.final_attainment_percentage !== d.attainment_percentage)
				.map((d) => ({
					co: d.co_name,
					direct: d.attainment_percentage,
					final: d.final_attainment_percentage,
					diff: d.final_attainment_percentage != null && d.attainment_percentage != null
						? (d.final_attainment_percentage - d.attainment_percentage).toFixed(2)
						: null,
				})),
		});
	}

	return (
		<>
			<BaseAttainmentTable
				title="CO ATTAINMENT in 3.0 POINT Scale"
				coList={coList}
				isCOAssessed={isCOAssessed}
				attainmentData={attainmentData}
				rows={[
					{
						label: "ABSENTEE+NOT ATTEMPT",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.absentees : "NA"
					},
					{
						label: "PRESENT STUDENT OR ATTEMPT",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.presentStudents : "NA"
					},
					{
						label: `NO. OF STUDENTS SECURE MARKS > ${coThreshold}% (CO THRESHOLD)`,
						rowClass: "bg-gray-900 dark:bg-gray-950 text-white",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.coStats[_co as keyof typeof attainmentData.coStats].aboveCOThreshold : "NA"
					},
					{
						label: `PC. OF STUDENTS SECURE MARKS > ${coThreshold}% (CO THRESHOLD)`,
						getValue: (co, isAssessed) => isAssessed ? getPercentage(co, 'aboveCOThreshold').toFixed(2) : "NA",
						cellClass: (co) => !isCOAssessed(co) ? "text-gray-500" : ""
					},
					{
						label: "CO Attainment Level (Based on Criteria)",
						getValue: (co, isAssessed) => {
							if (!isAssessed) return "NA";
							const p = getPercentage(co, 'aboveCOThreshold');
							return getAttainmentLevel(p).toFixed(2);
						},
						cellClass: (co) => {
							if (!isCOAssessed(co)) return "text-gray-500 bg-gray-100 dark:bg-gray-800";
							return `font-bold ${getPercentageColor(getPercentage(co, 'aboveCOThreshold'))}`;
						}
					},
					{
						label: "Final attainment level CO (by Direct Assessment):",
						rowClass: "bg-orange-100 dark:bg-orange-950 font-bold",
						getValue: (co, isAssessed) => {
							if (!isAssessed) return "NA";
							const p = getPercentage(co, 'aboveCOThreshold');
							return getAttainmentLevel(p).toFixed(2);
						},
						cellClass: (co) => !isCOAssessed(co) ? "text-gray-500" : "font-bold text-lg"
					}
				]}
			/>

			<BaseAttainmentTable
				title="CO ATTAINMENT in ABSOLUTE Scale"
				coList={coList}
				isCOAssessed={isCOAssessed}
				attainmentData={attainmentData}
				rows={[
					{
						label: "ABSENTEE+NOT ATTEMPT",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.absentees : "NA"
					},
					{
						label: "PRESENT STUDENT OR ATTEMPT",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.presentStudents : "NA"
					},
					{
						label: "NO. OF STUDENTS SECURE MARKS > PASSING MARKS",
						rowClass: "bg-gray-900 dark:bg-gray-950 text-white",
						getValue: (_co, isAssessed) => isAssessed ? attainmentData.coStats[_co as keyof typeof attainmentData.coStats].abovePass : "NA"
					},
					{
						label: "PC. OF STUDENTS SECURE MARKS > PASSING MARKS",
						getValue: (co, isAssessed) => isAssessed ? getPercentage(co, 'abovePass').toFixed(2) : "NA",
						cellClass: (co) => !isCOAssessed(co) ? "text-gray-500" : ""
					},
					{
						label: "CO Attainment (AVERAGE OF PERCENTAGE ATTAINMENTS)",
						getValue: (co, isAssessed) => isAssessed ? getAveragePercentage(co).toFixed(2) : "NA",
						cellClass: (co) => {
							if (!isCOAssessed(co)) return "text-gray-500 bg-gray-100 dark:bg-gray-800";
							return `font-bold ${getPercentageColor(getAveragePercentage(co))}`;
						}
					},
					{
						label: "Final attainment level CO (IN ABSOLUTE SCALE):",
						rowClass: "bg-orange-100 dark:bg-orange-950 font-bold",
						getValue: (co, isAssessed) => isAssessed ? getAveragePercentage(co).toFixed(2) + "%" : "NA",
						cellClass: (co) => !isCOAssessed(co) ? "text-gray-500" : "font-bold text-lg"
					}
				]}
			/>

			{snapshotIndirectData && snapshotIndirectData.length > 0 && (
				<SnapshotIndirectTable
					snapshotIndirectData={snapshotIndirectData}
				/>
			)}
		</>
	);
}

function SnapshotIndirectTable({
	snapshotIndirectData,
}: {
	snapshotIndirectData: NonNullable<
		COAttainmentTableProps["snapshotIndirectData"]
	>;
}) {
	const cos = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"];
	const filtered = cos
		.map((name) =>
			snapshotIndirectData.find((d) => d.co_name === name),
		)
		.filter(Boolean);

	if (!filtered.length) return null;

	const hasIndirect = filtered.some(
		(d) =>
			d!.indirect_attainment_level !== null &&
			d!.indirect_attainment_level !== undefined,
	);

	return (
		<motion.div
			className="mt-4"
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
		>
			<Card className="bg-card/80 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
				<div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-violet-500 to-transparent" />
				<CardHeader className="bg-gradient-to-r from-purple-500/8 via-violet-500/5 to-transparent border-b border-muted/30 py-3 px-5">
					<CardTitle className="text-sm font-bold text-center text-foreground uppercase tracking-wider">
						CO Attainment — Direct vs Indirect vs Final
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0 overflow-auto">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/[0.10] hover:bg-transparent border-b border-muted/30">
								<TableHead className="border-r border-muted/30 font-bold text-center text-xs uppercase py-3 text-foreground/80">CO</TableHead>
								<TableHead className="border-r border-muted/20 font-bold text-center text-xs py-3 text-blue-600 dark:text-blue-400">Direct %</TableHead>
								<TableHead className="border-r border-muted/20 font-bold text-center text-xs py-3 text-blue-600 dark:text-blue-400">Direct Level</TableHead>
								{hasIndirect && (
									<>
										<TableHead className="border-r border-muted/20 font-bold text-center text-xs py-3 text-amber-600 dark:text-amber-400">Indirect %</TableHead>
										<TableHead className="border-r border-muted/20 font-bold text-center text-xs py-3 text-amber-600 dark:text-amber-400">Indirect Level</TableHead>
									</>
								)}
								<TableHead className="border-r border-muted/20 font-bold text-center text-xs py-3 text-emerald-600 dark:text-emerald-400">Final %</TableHead>
								<TableHead className="font-bold text-center text-xs py-3 text-emerald-600 dark:text-emerald-400">Final Level</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((d, idx) => {
								if (!d) return null;
								return (
									<motion.tr
										key={d.co_name}
										className="border-b border-muted/20 last:border-b-0 hover:bg-muted/[0.04] transition-colors"
										initial={{ opacity: 0, x: -8 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.05 }}
									>
										<TableCell className="font-bold border-r border-muted/20 text-center py-3 px-4 bg-muted/[0.06] text-foreground">{d.co_name}</TableCell>
										<TableCell className="text-center border-r border-muted/20 py-3 px-3 text-blue-600 dark:text-blue-400 tabular-nums text-sm">
											{d.attainment_percentage != null ? Number(d.attainment_percentage).toFixed(2) : "—"}
										</TableCell>
										<TableCell className="text-center border-r border-muted/20 py-3 px-3 tabular-nums text-sm">
											{d.attainment_level != null ? Number(d.attainment_level).toFixed(2) : "—"}
										</TableCell>
										{hasIndirect && (
											<>
												<TableCell className="text-center border-r border-muted/20 py-3 px-3 text-amber-600 dark:text-amber-400 tabular-nums text-sm">
													{d.indirect_attainment_percentage != null ? Number(d.indirect_attainment_percentage).toFixed(2) : "—"}
												</TableCell>
												<TableCell className="text-center border-r border-muted/20 py-3 px-3 tabular-nums text-sm">
													{d.indirect_attainment_level != null ? Number(d.indirect_attainment_level).toFixed(2) : "—"}
												</TableCell>
											</>
										)}
										<TableCell className="text-center border-r border-muted/20 py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
											{d.final_attainment_percentage != null
												? Number(d.final_attainment_percentage).toFixed(2)
												: d.attainment_percentage != null
													? Number(d.attainment_percentage).toFixed(2)
													: "—"}
										</TableCell>
										<TableCell className="text-center py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">
											{d.final_attainment_level != null
												? Number(d.final_attainment_level).toFixed(2)
												: d.attainment_level != null
													? Number(d.attainment_level).toFixed(2)
													: "—"}
										</TableCell>
									</motion.tr>
								);
							})}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</motion.div>
	);
}