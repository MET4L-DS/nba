import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
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
			<span className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm transition-all hover:bg-emerald-500/15">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 shadow-sm transition-all hover:bg-amber-500/15">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2 py-0.5 rounded-md font-semibold text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 shadow-sm transition-all hover:bg-rose-500/15">
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
			<span className="inline-block px-2 py-1 rounded-md font-bold text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2 py-1 rounded-md font-bold text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2 py-1 rounded-md font-bold text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-sm">
			{val.toFixed(2)}
		</span>
	);
}

export function ConsolidatedIndirectMatrix({ programmeId, batchYear, refreshTrigger = 0 }: ConsolidatedIndirectMatrixProps) {
	const [matrix, setMatrix] = useState<StakeholderConsolidatedMatrixResponse | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		surveyApi.getStakeholderResults(programmeId, batchYear)
			.then((res) => setMatrix(res.consolidated_matrix ?? null))
			.finally(() => setLoading(false));
	}, [programmeId, batchYear, refreshTrigger]);

	if (loading) {
		return (
			<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg">
				<CardContent className="py-8 text-center text-muted-foreground">
					Loading consolidated matrix...
				</CardContent>
			</Card>
		);
	}

	if (!matrix) {
		return (
			<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg">
				<CardHeader>
					<CardTitle className="text-base">Consolidated Indirect Survey Matrix</CardTitle>
				</CardHeader>
				<CardContent className="py-8 text-center text-muted-foreground">
					No survey data for this programme/batch. Import responses first.
				</CardContent>
			</Card>
		);
	}

	const hasAnyData = SURVEY_ORDER.some(
		(type) => matrix.matrix[type] && Object.values(matrix.matrix[type]).some((v) => v !== null && v !== undefined),
	);

	return (
		<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
			<CardHeader className="pb-3 border-b bg-muted/[.1]">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Consolidated Indirect Survey Matrix
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-1">
							Batch {batchYear} — Normalised PO attainment levels (0.00 – 3.00)
						</p>
					</div>
					<Badge variant={hasAnyData ? "default" : "secondary"} className={hasAnyData ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15" : ""}>
						{hasAnyData ? "Data available" : "No data"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="overflow-x-auto rounded-lg border border-muted/40">
					<Table>
						<TableHeader>
							<TableRow className="border-b bg-muted/[.4] hover:bg-muted/[.4]">
								<TableHead className="text-left font-semibold w-56 text-foreground/80">INDIRECT SURVEY</TableHead>
								{PO_LIST.map((po) => (
									<TableHead key={po} className="text-center font-semibold tabular-nums min-w-[56px] text-foreground/80">
										{po}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{SURVEY_ORDER.map((type, idx) => {
								const row = matrix.matrix[type] ?? {};
								return (
									<TableRow
										key={type}
										className={`${idx % 2 === 0 ? "bg-card" : "bg-muted/[.05]"} hover:bg-muted/[.1] transition-colors`}
									>
										<TableCell className="font-medium text-sm text-foreground/90">{SURVEY_LABELS[type] ?? type}</TableCell>
										{PO_LIST.map((po) => {
											const val = row[po];
											return (
												<TableCell key={po} className="text-center tabular-nums p-2.5">
													{getAttainmentBadge(val)}
												</TableCell>
											);
										})}
									</TableRow>
								);
							})}
						</TableBody>
						<TableFooter className="border-t bg-muted/[.2] hover:bg-muted/[.2]">
							<TableRow>
								<TableCell className="font-bold text-sm text-foreground/95">Average</TableCell>
								{PO_LIST.map((po) => {
									const avg = matrix.averages[po];
									return (
										<TableCell key={po} className="text-center tabular-nums p-2.5">
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
