import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BatchSelector } from "@/features/shared";
import { Button } from "@/components/ui/button";
import { Download, Filter, ChevronRight, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hodApi, type Programme } from "@/services/api";
import { ConsolidatedMatrixView } from "@/features/surveys/ConsolidatedMatrixView";
import { StakeholderManualEntry } from "@/features/surveys/StakeholderManualEntry";
import { ProgrammeWeightageConfig } from "@/features/surveys/ProgrammeWeightageConfig";
import { StakeholderSurveyConfig } from "@/features/surveys/StakeholderSurveyConfig";
import { StakeholderSurveyImport } from "@/features/surveys/StakeholderSurveyImport";

export function HODStakeholderSurveys() {
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedProgId, setSelectedProgId] = useState<number>();
	const [selectedBatchYear, setSelectedBatchYear] = useState<string>("");
	
	const [selectedType, setSelectedType] = useState<string>("Alumni");
	
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	useEffect(() => {
		hodApi.getDepartmentProgrammes({ limit: 100 }).then((response) => setProgrammes(response.data ?? [])).finally(() => setLoading(false));
	}, []);

	// Mock survey types - in reality we might fetch these
	const SURVEY_TYPES = [
		{ id: "Alumni", label: "Alumni Survey", status: "Active", count: 142 },
		{ id: "Employer", label: "Employer Survey", status: "Draft", count: 45 },
		{ id: "Graduate Exit", label: "Graduate Exit", status: "Closed", count: 320 },
		{ id: "Parent", label: "Parent Feedback", status: "Active", count: 89 },
		{ id: "Academic Peer", label: "Academic Peer", status: "Draft", count: 12 },
	];

	const handleRefresh = () => setRefreshTrigger(n => n + 1);

	return (
		<div className="h-[calc(100vh-4rem)] flex flex-col gap-6 p-8 overflow-y-auto">
			<header className="mb-2">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Technical Data Hub & Articulation Matrix
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage survey configurations and analyze consolidated indirect PO attainment.
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
						value={null}
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
				<div className="flex flex-col lg:flex-row gap-6 min-h-[600px] flex-1">
					{/* Left Panel: Survey Selection */}
					<section className="w-full lg:w-1/4 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm">
						<div className="p-4 border-b bg-muted/40">
							<h3 className="font-semibold">Survey Configuration</h3>
						</div>
						<div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
							{SURVEY_TYPES.map((type) => {
								const isActive = selectedType === type.id;
								return (
									<button
										key={type.id}
										onClick={() => setSelectedType(type.id)}
										className={`w-full text-left p-3 rounded-lg border transition-all ${
											isActive
												? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
												: "border-border bg-card hover:bg-muted/50 hover:border-primary/30"
										}`}
									>
										<div className="flex justify-between items-center mb-1">
											<span className="font-medium text-sm">{type.label}</span>
											{isActive && <ChevronRight className="w-4 h-4 text-primary" />}
										</div>
										<p className="text-xs text-muted-foreground">
											Batch {selectedBatchYear}
										</p>
									</button>
								);
							})}
						</div>
					</section>

					{/* Right Panel: Content */}
					<section className="w-full lg:w-3/4 flex flex-col bg-card border rounded-xl overflow-hidden shadow-sm">
						<div className="p-4 border-b flex justify-between items-center bg-muted/40">
							<div>
								<h3 className="font-semibold">
									{selectedType} Survey Management
								</h3>
								<p className="text-xs text-muted-foreground">
									Batch {selectedBatchYear}
								</p>
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

						<Tabs defaultValue="matrix" className="flex-1 flex flex-col">
							<div className="border-b px-4">
								<TabsList className="bg-transparent h-12 p-0 space-x-6">
									<TabsTrigger 
										value="matrix" 
										className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0"
									>
										Matrix View
									</TabsTrigger>
									<TabsTrigger 
										value="configure" 
										className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0"
									>
										Question Config
									</TabsTrigger>
									<TabsTrigger 
										value="import" 
										className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0"
									>
										Import CSV
									</TabsTrigger>
									<TabsTrigger 
										value="manual" 
										className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full data-[state=active]:shadow-none data-[state=active]:bg-transparent px-0"
									>
										Manual Entry
									</TabsTrigger>
								</TabsList>
							</div>

							<div className="flex-1 overflow-y-auto bg-muted/10 relative">
								<TabsContent value="matrix" className="m-0 h-full">
									<ConsolidatedMatrixView 
										programmeId={selectedProgId}
										batchYear={Number(selectedBatchYear)}
										stakeholderType={selectedType}
										refreshTrigger={refreshTrigger}
									/>
								</TabsContent>
								
								<TabsContent value="configure" className="m-0 p-4 h-full">
									<StakeholderSurveyConfig 
										programmeId={selectedProgId}
										batchYear={selectedBatchYear}
										stakeholderType={selectedType}
										onConfigSaved={handleRefresh}
									/>
								</TabsContent>
								
								<TabsContent value="import" className="m-0 p-4 h-full">
									<div className="max-w-3xl mx-auto pt-8">
										<StakeholderSurveyImport 
											programmeId={selectedProgId}
											batchYear={selectedBatchYear}
											stakeholderType={selectedType}
											onImportComplete={handleRefresh}
											onBatchYearChange={() => {}}
											onStakeholderTypeChange={() => {}}
										/>
									</div>
								</TabsContent>

								<TabsContent value="manual" className="m-0 h-full">
									<StakeholderManualEntry 
										programmeId={selectedProgId}
										batchYear={Number(selectedBatchYear)}
										stakeholderType={selectedType}
										onSaved={handleRefresh}
									/>
								</TabsContent>
							</div>
						</Tabs>
					</section>
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
