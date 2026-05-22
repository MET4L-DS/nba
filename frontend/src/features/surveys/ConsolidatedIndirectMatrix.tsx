import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { surveyApi } from "@/services/api/surveys";
import type { StakeholderConsolidatedMatrixResponse } from "@/services/api/types";

interface ConsolidatedIndirectMatrixProps {
	programmeId: number;
	batchYear: number;
	refreshTrigger?: number;
}

const SURVEY_LABELS: Record<string, string> = {
	"Alumni": "Alumni Survey Form",
	"Graduate Exit": "Graduate Exit Survey Form",
	"Parent": "Parent Survey Form",
	"Academic Peer": "Academic Peers Survey Form",
	"Employer": "Employer Survey Form",
};

const SURVEY_ORDER = ["Alumni", "Graduate Exit", "Parent", "Academic Peer", "Employer"];

const PO_LIST = [
	"PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12",
	"PSO1", "PSO2", "PSO3",
];

function getAttainmentBadge(val: number | null | undefined) {
	if (val == null || val <= 0) {
		return <span className="text-muted-foreground/30">—</span>;
	}
	if (val >= 2.50) {
		return (
			<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.05)] transition-all hover:bg-emerald-500/25 hover:scale-105">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.05)] transition-all hover:bg-amber-500/25 hover:scale-105">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.05)] transition-all hover:bg-rose-500/25 hover:scale-105">
			{val.toFixed(2)}
		</span>
	);
}

function getAverageBadge(val: number | null | undefined) {
	if (val == null || val <= 0) {
		return <span className="text-muted-foreground/30">—</span>;
	}
	if (val >= 2.50) {
		return (
			<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-md">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-md">
			{val.toFixed(2)}
		</span>
	);
}

export function ConsolidatedIndirectMatrix({ programmeId, batchYear, refreshTrigger = 0 }: ConsolidatedIndirectMatrixProps) {
	const [matrix, setMatrix] = useState<StakeholderConsolidatedMatrixResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [hoveredCell, setHoveredCell] = useState<{ row: string | null; po: string | null }>({
		row: null,
		po: null,
	});

	useEffect(() => {
		setLoading(true);
		surveyApi.getStakeholderResults(programmeId, batchYear)
			.then((res) => setMatrix(res.consolidated_matrix ?? null))
			.finally(() => setLoading(false));
	}, [programmeId, batchYear, refreshTrigger]);

	const listVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.05,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, y: 10 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
	};

	if (loading) {
		return (
			<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg">
				<CardContent className="py-12 flex flex-col items-center justify-center gap-3">
					<div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
					<p className="text-sm text-muted-foreground font-medium animate-pulse">Loading consolidated matrix...</p>
				</CardContent>
			</Card>
		);
	}

	if (!matrix) {
		return (
			<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg">
				<CardHeader>
					<CardTitle className="text-base font-bold">Consolidated Indirect Survey Matrix</CardTitle>
				</CardHeader>
				<CardContent className="py-8 text-center text-muted-foreground font-medium">
					⚠️ No survey data for this programme/batch. Import responses first.
				</CardContent>
			</Card>
		);
	}

	const hasAnyData = SURVEY_ORDER.some(
		(type) => matrix.matrix[type] && Object.values(matrix.matrix[type]).some((v) => v !== null && v !== undefined),
	);

	return (
		<Card className="bg-card/80 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:border-primary/30 relative">
			<div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-primary via-indigo-500 to-transparent"></div>
			<CardHeader className="pb-4 border-b bg-muted/[.06]">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
							Consolidated Indirect Survey Matrix
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-1.5">
							Batch {batchYear} — Normalised PO attainment levels (0.00 – 3.00) based on direct feedback
						</p>
					</div>
					<Badge variant={hasAnyData ? "default" : "secondary"} className={hasAnyData ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/15" : ""}>
						{hasAnyData ? "Responses Available" : "No Responses"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="overflow-x-auto rounded-xl border border-muted/50 shadow-inner bg-background/50">
					<Table className="border-collapse">
						<TableHeader>
							<TableRow className="border-b border-muted/50 bg-muted/[0.22] hover:bg-muted/[0.22] transition-colors">
								<TableHead className="text-left font-bold text-xs uppercase tracking-wider text-muted-foreground/90 w-64 h-12 px-4 border-r border-muted/30">INDIRECT SURVEY</TableHead>
								{PO_LIST.map((po) => {
									const isPoHovered = hoveredCell.po === po;
									return (
										<TableHead
											key={po}
											className={`text-center font-bold text-xs uppercase tracking-wider min-w-[62px] h-12 p-2 border-r border-muted/30 last:border-r-0 transition-all duration-200 ${isPoHovered ? "bg-primary/10 text-primary scale-110 shadow-sm" : "text-muted-foreground/90"}`}
										>
											{po}
										</TableHead>
									);
								})}
							</TableRow>
						</TableHeader>
						<motion.tbody
							variants={listVariants}
							initial="hidden"
							animate="show"
							className="divide-y divide-muted/30"
						>
							{SURVEY_ORDER.map((type, idx) => {
								const row = matrix.matrix[type] ?? {};
								const isRowHovered = hoveredCell.row === type;
								return (
									<motion.tr
										key={type}
										variants={rowVariants}
										className={`transition-colors duration-150 border-b border-muted/30 last:border-b-0 ${isRowHovered ? "bg-primary/5 dark:bg-primary/10" : idx % 2 === 0 ? "bg-card" : "bg-muted/[.03]"} hover:bg-muted/[.08]`}
									>
										<TableCell className="font-semibold text-xs text-foreground/90 px-4 py-3 border-r border-muted/20">{SURVEY_LABELS[type] ?? type}</TableCell>
										{PO_LIST.map((po) => {
											const val = row[po];
											const isColHovered = hoveredCell.po === po;
											return (
												<TableCell
													key={po}
													className={`text-center tabular-nums p-2 border-r border-muted/20 last:border-r-0 transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10" : ""}`}
													onMouseEnter={() => setHoveredCell({ row: type, po })}
													onMouseLeave={() => setHoveredCell({ row: null, po: null })}
												>
													{getAttainmentBadge(val)}
												</TableCell>
											);
										})}
									</motion.tr>
								);
							})}
						</motion.tbody>
						<TableFooter className="border-t-2 border-muted/60 bg-muted/[0.18] hover:bg-muted/[0.18]">
							<TableRow className={`transition-colors duration-150 ${hoveredCell.row === 'weighted' ? 'bg-primary/5' : ''}`}>
								<TableCell className="font-bold text-sm text-foreground px-4 py-3.5 border-r border-muted/30">Weighted Average</TableCell>
								{PO_LIST.map((po) => {
									const avg = matrix.averages[po];
									const isColHovered = hoveredCell.po === po;
									return (
										<TableCell
											key={po}
											className={`text-center tabular-nums p-2 border-r border-muted/30 last:border-r-0 transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10 font-bold scale-105" : ""}`}
											onMouseEnter={() => setHoveredCell({ row: 'weighted', po })}
											onMouseLeave={() => setHoveredCell({ row: null, po: null })}
										>
											{getAverageBadge(avg)}
										</TableCell>
									);
								})}
							</TableRow>
						</TableFooter>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

