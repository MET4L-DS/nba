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
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">
					Loading consolidated matrix...
				</CardContent>
			</Card>
		);
	}

	if (!matrix) {
		return (
			<Card>
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
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Consolidated Indirect Survey Matrix</CardTitle>
						<p className="text-xs text-muted-foreground mt-1">
							Batch {batchYear} — Normalised PO attainment levels (0.00 – 3.00)
						</p>
					</div>
					<Badge variant={hasAnyData ? "default" : "secondary"}>
						{hasAnyData ? "Data available" : "No data"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-b-2 bg-muted/[.5]">
								<TableHead className="text-left font-semibold w-56">INDIRECT SURVEY</TableHead>
								{PO_LIST.map((po) => (
									<TableHead key={po} className="text-center font-semibold tabular-nums min-w-[56px]">
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
										className={idx % 2 === 0 ? "" : "bg-muted/[.1]"}
									>
										<TableCell className="font-medium text-sm">{SURVEY_LABELS[type] ?? type}</TableCell>
										{PO_LIST.map((po) => {
											const val = row[po];
											return (
												<TableCell key={po} className="text-center tabular-nums">
													{val != null ? (
														<span className="inline-block px-1.5 py-0.5 rounded bg-muted/[.4] font-medium">
															{val.toFixed(2)}
														</span>
													) : (
														<span className="text-muted-foreground/30">—</span>
													)}
												</TableCell>
											);
										})}
									</TableRow>
								);
							})}
						</TableBody>
						<TableFooter className="border-t-2 border-primary/[.3] bg-primary/[.05]">
							<TableRow>
								<TableCell className="font-bold text-sm text-primary">Average</TableCell>
								{PO_LIST.map((po) => {
									const avg = matrix.averages[po];
									return (
										<TableCell key={po} className="text-center tabular-nums font-bold text-primary">
											{avg != null ? avg.toFixed(2) : "—"}
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
