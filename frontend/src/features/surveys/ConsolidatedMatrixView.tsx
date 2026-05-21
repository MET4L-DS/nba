import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { surveyApi } from "@/services/api/surveys";
import type { StakeholderIndividualResponse, StakeholderSurveyResultsResponse } from "@/services/api/types";

interface ConsolidatedMatrixViewProps {
	programmeId: number;
	batchYear: number;
	stakeholderType: string;
	refreshTrigger?: number;
}

const PO_NAMES = [
	"PO1", "PO2", "PO3", "PO4", "PO5", "PO6", "PO7", "PO8", "PO9", "PO10", "PO11", "PO12", "PSO1", "PSO2", "PSO3",
];

export function ConsolidatedMatrixView({ programmeId, batchYear, stakeholderType, refreshTrigger = 0 }: ConsolidatedMatrixViewProps) {
	const [data, setData] = useState<StakeholderSurveyResultsResponse | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		surveyApi.getStakeholderResults(programmeId, batchYear, stakeholderType)
			.then(setData)
			.finally(() => setLoading(false));
	}, [programmeId, batchYear, stakeholderType, refreshTrigger]);

	const ledger = useMemo<StakeholderIndividualResponse[]>(() => {
		if (!data?.individual) return [];
		return data.individual[stakeholderType] ?? [];
	}, [data, stakeholderType]);

	return (
		<div className="p-4">
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base">Response Ledger — {stakeholderType}</CardTitle>
						<Badge variant={data?.has_data ? "default" : "secondary"}>
							{loading ? "Loading" : data?.has_data ? `${ledger.length} responses` : "No data"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto max-h-[520px]">
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-card border-b">
								<tr>
									<th className="px-3 py-2 text-left">#</th>
									<th className="px-3 py-2 text-left">Respondent</th>
									<th className="px-3 py-2 text-left">Qualification</th>
									{PO_NAMES.map((po) => (
										<th key={po} className="px-3 py-2 text-center font-medium">{po}</th>
									))}
								</tr>
							</thead>
							<tbody>
								{ledger.length === 0 ? (
									<tr>
										<td colSpan={PO_NAMES.length + 3} className="px-3 py-8 text-center text-muted-foreground">
											{loading ? "Loading..." : "No responses yet. Use Import CSV or Manual Entry to add data."}
										</td>
									</tr>
								) : ledger.map((row, index) => (
									<tr key={`${row.respondent_identifier ?? index}`} className="border-b hover:bg-muted/10">
										<td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
										<td className="px-3 py-2 font-medium">{row.respondent_name || row.respondent_identifier || `Respondent ${index + 1}`}</td>
										<td className="px-3 py-2 text-muted-foreground">{row.qualification || "-"}</td>
										{PO_NAMES.map((po) => (
											<td key={po} className="px-3 py-2 text-center tabular-nums">{row.ratings?.[po] ?? "-"}</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
