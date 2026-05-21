import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BatchSelector } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Download, Filter, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hodApi, type Programme } from "@/services/api";
import { ConsolidatedMatrixView } from "@/features/surveys/ConsolidatedMatrixView";
import { StakeholderManualEntry } from "@/features/surveys/StakeholderManualEntry";
import { ProgrammeWeightageConfig } from "@/features/surveys/ProgrammeWeightageConfig";
import { StakeholderSurveyConfig } from "@/features/surveys/StakeholderSurveyConfig";
import { StakeholderSurveyImport } from "@/features/surveys/StakeholderSurveyImport";
import { ConsolidatedIndirectMatrix } from "@/features/surveys/ConsolidatedIndirectMatrix";

const SURVEY_TYPES = [
	{ id: "Alumni", label: "Alumni Survey", shortLabel: "Alumni" },
	{ id: "Employer", label: "Employer Survey", shortLabel: "Employer" },
	{ id: "Graduate Exit", label: "Graduate Exit Survey", shortLabel: "Grad Exit" },
	{ id: "Parent", label: "Parent Survey", shortLabel: "Parent" },
	{ id: "Academic Peer", label: "Academic Peers Survey", shortLabel: "Acad Peers" },
];

export function HODStakeholderSurveys() {
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedProgId, setSelectedProgId] = useState<number>();
	const [selectedBatchYear, setSelectedBatchYear] = useState<string>("");
	const [selectedType, setSelectedType] = useState<string>("Alumni");
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	useEffect(() => {
		hodApi.getDepartmentProgrammes({ limit: 100 })
			.then((res) => setProgrammes(res.data ?? []))
			.finally(() => setLoading(false));
	}, []);

	const handleRefresh = () => setRefreshTrigger(n => n + 1);

	return (
		<div className="h-[calc(100vh-4rem)] flex flex-col gap-6 p-8 overflow-y-auto">
			<header className="mb-2">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Stakeholder Surveys & Indirect Attainment
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Configure surveys, import responses, and review consolidated indirect PO attainment.
				</p>
			</header>

			<div className="flex gap-4 items-end border-b pb-4">
				<div className="space-y-1">
					<Select
						value={String(selectedProgId ?? "")}
						onValueChange={(v) => {
							setSelectedProgId(Number(v));
							setSelectedBatchYear("");
						}}
						disabled={loading}
					>
						<SelectTrigger className="w-[280px]">
							<SelectValue placeholder="Select programme..." />
						</SelectTrigger>
						<SelectContent>
							{programmes.map((p) => (
								<SelectItem key={p.programme_id} value={String(p.programme_id)}>
									{p.programme_code} - {p.programme_name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1 w-[160px]">
					<BatchSelector
						programmeId={selectedProgId ?? null}
						value={undefined}
						onChange={(_, batch) => {
							if (batch?.batch_year) {
								setSelectedBatchYear(String(batch.batch_year));
							}
						}}
						disabled={!selectedProgId}
					/>
				</div>
				{selectedProgId && (
					<div className="ml-auto flex items-center">
						<ProgrammeWeightageConfig programmeId={selectedProgId} onSaved={handleRefresh} />
					</div>
				)}
			</div>

			{selectedProgId && selectedBatchYear ? (
				<div className="flex flex-col gap-6 flex-1">
					{/* Survey Type Tabs */}
					<section className="bg-card border rounded-xl overflow-hidden shadow-sm">
						<div className="p-4 border-b bg-muted/40 flex justify-between items-center">
							<div>
								<h3 className="font-semibold">Survey Configuration</h3>
								<p className="text-xs text-muted-foreground">Batch {selectedBatchYear}</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" className="h-8 w-8 p-0">
									<Filter className="h-4 w-4" />
								</Button>
								<Button variant="outline" size="sm" className="h-8 w-8 p-0">
									<Download className="h-4 w-4" />
								</Button>
							</div>
						</div>

						<Tabs value={selectedType} onValueChange={setSelectedType} className="flex-1 flex flex-col">
							<div className="border-b px-4">
								<TabsList className="bg-transparent h-12 p-0 space-x-6">
									{SURVEY_TYPES.map((type) => (
										<TabsTrigger
											key={type.id}
											value={type.id}
											className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0"
										>
											{type.label}
										</TabsTrigger>
									))}
								</TabsList>
							</div>

							<div className="flex-1 overflow-y-auto bg-muted/10 relative">
								{SURVEY_TYPES.map((type) => (
									<TabsContent key={type.id} value={type.id} className="m-0 h-full">
										<Tabs defaultValue="ledger" className="flex-1 flex flex-col h-full">
											<div className="border-b px-4">
												<TabsList className="bg-transparent h-10 p-0 space-x-4">
													<TabsTrigger
														value="ledger"
														className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 text-sm"
													>
														Response Ledger
													</TabsTrigger>
													<TabsTrigger
														value="configure"
														className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 text-sm"
													>
														Question Config
													</TabsTrigger>
													<TabsTrigger
														value="import"
														className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 text-sm"
													>
														Import CSV
													</TabsTrigger>
													<TabsTrigger
														value="manual"
														className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0 text-sm"
													>
														Manual Entry
													</TabsTrigger>
												</TabsList>
											</div>

											<div className="flex-1 overflow-y-auto">
												<TabsContent value="ledger" className="m-0 h-full">
													<ConsolidatedMatrixView
														programmeId={selectedProgId}
														batchYear={Number(selectedBatchYear)}
														stakeholderType={type.id}
														refreshTrigger={refreshTrigger}
													/>
												</TabsContent>
												<TabsContent value="configure" className="m-0 p-4 h-full">
													<StakeholderSurveyConfig
														programmeId={selectedProgId}
														batchYear={selectedBatchYear}
														stakeholderType={type.id}
														onConfigSaved={handleRefresh}
													/>
												</TabsContent>
												<TabsContent value="import" className="m-0 p-4 h-full">
													<div className="max-w-3xl mx-auto pt-8">
														<StakeholderSurveyImport
															programmeId={selectedProgId}
															batchYear={selectedBatchYear}
															stakeholderType={type.id}
															onImportComplete={handleRefresh}
														/>
													</div>
												</TabsContent>
												<TabsContent value="manual" className="m-0 h-full">
													<StakeholderManualEntry
														programmeId={selectedProgId}
														batchYear={Number(selectedBatchYear)}
														stakeholderType={type.id}
														onSaved={handleRefresh}
													/>
												</TabsContent>
											</div>
										</Tabs>
									</TabsContent>
								))}
							</div>
						</Tabs>
					</section>

					{/* Consolidated Indirect Survey Matrix (programme-level, not type-specific) */}
					<ConsolidatedIndirectMatrix
						programmeId={selectedProgId}
						batchYear={Number(selectedBatchYear)}
						refreshTrigger={refreshTrigger}
					/>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-xl mt-4">
					<div className="text-center">
						<Calculator className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
						<p className="text-lg font-medium text-foreground">Select Programme & Batch</p>
						<p className="text-sm text-muted-foreground max-w-sm mt-1">
							Choose a programme and batch year from the dropdown above to view stakeholder surveys.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
