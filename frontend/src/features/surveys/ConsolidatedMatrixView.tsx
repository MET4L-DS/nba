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

function getLikertBadge(val: number | null | undefined) {
	if (val == null || val <= 0) {
		return <span className="text-muted-foreground/30">—</span>;
	}
	// Map 1-5 Likert ratings to clean, premium visual badges matching Faculty levels
	const configs: Record<number, { bg: string; text: string; border: string }> = {
		5: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-500/20 dark:border-emerald-500/30" },
		4: { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-700 dark:text-teal-300", border: "border-teal-500/20 dark:border-teal-500/30" },
		3: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", border: "border-amber-500/20 dark:border-amber-500/30" },
		2: { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-300", border: "border-orange-500/20 dark:border-orange-500/30" },
		1: { bg: "bg-rose-500/10 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-300", border: "border-rose-500/20 dark:border-rose-500/30" }
	};
	const rounded = Math.round(val);
	const config = configs[rounded] || { bg: "bg-muted/[.4]", text: "text-muted-foreground", border: "border-transparent" };
	return (
		<span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border shadow-sm transition-all hover:brightness-105 ${config.bg} ${config.text} ${config.border}`}>
			{val}
		</span>
	);
}

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
			<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
				<CardHeader className="pb-3 border-b bg-muted/[.1]">
					<div className="flex items-center justify-between">
						<CardTitle className="text-base font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
							Response Ledger — {stakeholderType}
						</CardTitle>
						<Badge variant={data?.has_data ? "default" : "secondary"} className={data?.has_data ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : ""}>
							{loading ? "Loading..." : data?.has_data ? `${ledger.length} responses` : "No data"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="overflow-x-auto max-h-[60vh] rounded-lg border border-muted/40">
						<Table>
							<TableHeader className="sticky top-0 bg-muted/[.4] backdrop-blur z-20 shadow-sm border-b">
								<TableRow className="hover:bg-transparent">
									<TableHead className="w-12 text-left font-semibold text-foreground/80">#</TableHead>
									<TableHead className="font-semibold text-foreground/80">Respondent</TableHead>
									<TableHead className="font-semibold text-foreground/80">Qualification</TableHead>
									{PO_NAMES.map((po) => (
										<TableHead key={po} className="text-center font-semibold text-foreground/80 min-w-[56px]">{po}</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{ledger.length === 0 ? (
									<TableRow>
										<TableCell colSpan={PO_NAMES.length + 3} className="py-8 text-center text-muted-foreground font-medium">
											{loading ? "Loading..." : "No responses yet. Use Import CSV or Manual Entry to add data."}
										</TableCell>
									</TableRow>
								) : ledger.map((row, index) => (
									<TableRow key={row.respondent_identifier ?? `row-${index}`} className={`${index % 2 === 0 ? "bg-card" : "bg-muted/[.03]"} hover:bg-muted/[.1] transition-colors`}>
										<TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
										<TableCell className="font-medium text-sm text-foreground/90">{row.respondent_name || row.respondent_identifier || `Respondent ${index + 1}`}</TableCell>
										<TableCell className="text-muted-foreground text-xs font-medium">{row.qualification || "-"}</TableCell>
										{PO_NAMES.map((po) => (
											<TableCell key={po} className="text-center tabular-nums p-2">
												{getLikertBadge(row.ratings?.[po])}
											</TableCell>
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
