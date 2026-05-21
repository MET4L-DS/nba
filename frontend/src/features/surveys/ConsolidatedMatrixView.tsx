import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
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
				<div className="overflow-x-auto max-h-[60vh]">
						<Table>
							<TableHeader className="sticky top-0 bg-card">
								<TableRow>
									<TableHead className="w-10">#</TableHead>
									<TableHead>Respondent</TableHead>
									<TableHead>Qualification</TableHead>
									{PO_NAMES.map((po) => (
										<TableHead key={po} className="text-center font-medium">{po}</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{ledger.length === 0 ? (
									<TableRow>
										<TableCell colSpan={PO_NAMES.length + 3} className="py-8 text-center text-muted-foreground">
											{loading ? "Loading..." : "No responses yet. Use Import CSV or Manual Entry to add data."}
										</TableCell>
									</TableRow>
								) : ledger.map((row, index) => (
									<TableRow key={row.respondent_identifier ?? `row-${index}`}>
										<TableCell className="text-muted-foreground">{index + 1}</TableCell>
										<TableCell className="font-medium">{row.respondent_name || row.respondent_identifier || `Respondent ${index + 1}`}</TableCell>
										<TableCell className="text-muted-foreground">{row.qualification || "-"}</TableCell>
										{PO_NAMES.map((po) => (
											<TableCell key={po} className="text-center tabular-nums">{row.ratings?.[po] ?? "-"}</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
