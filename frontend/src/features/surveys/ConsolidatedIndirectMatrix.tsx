import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
		(type) => matrix.matrix[type] && Object.values(matrix.matrix[type]).some((v) => v > 0),
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
					<table className="w-full text-sm border-collapse">
						<thead>
							<tr className="border-b-2 border-border bg-muted/50">
								<th className="px-3 py-2.5 text-left font-semibold w-56">INDIRECT SURVEY</th>
								{PO_LIST.map((po) => (
									<th key={po} className="px-2 py-2.5 text-center font-semibold tabular-nums min-w-[56px]">
										{po}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{SURVEY_ORDER.map((type, idx) => {
								const row = matrix.matrix[type] ?? {};
								return (
									<tr
										key={type}
										className={`border-b hover:bg-muted/10 ${idx % 2 === 0 ? "bg-card" : "bg-muted/10"}`}
									>
										<td className="px-3 py-2.5 font-medium text-sm">{SURVEY_LABELS[type] ?? type}</td>
										{PO_LIST.map((po) => {
											const val = row[po] ?? 0;
											return (
												<td key={po} className="px-2 py-2.5 text-center tabular-nums">
													{val > 0 ? (
														<span className="inline-block px-1.5 py-0.5 rounded bg-muted/40 font-medium">
															{val.toFixed(2)}
														</span>
													) : (
														<span className="text-muted-foreground/30">—</span>
													)}
												</td>
											);
										})}
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr className="border-t-2 border-primary/30 bg-primary/5">
								<td className="px-3 py-3 font-bold text-sm text-primary">Average</td>
								{PO_LIST.map((po) => {
									const avg = matrix.averages[po] ?? 0;
									return (
										<td key={po} className="px-2 py-3 text-center tabular-nums font-bold text-primary">
											{avg > 0 ? avg.toFixed(2) : "—"}
										</td>
									);
								})}
							</tr>
						</tfoot>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
