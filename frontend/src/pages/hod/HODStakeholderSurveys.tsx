import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BatchSelector } from "@/features/shared";
import { Calculator, GraduationCap, BookOpen } from "lucide-react";
import { hodApi, type Programme, type ProgrammeWithBatch } from "@/services/api";
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

interface ActiveBatch {
	programmeId: number;
	programmeCode: string;
	programmeName: string;
	batchId: number;
	batchYear: number;
	studentCount?: number;
}

export function HODStakeholderSurveys() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeBatches, setActiveBatches] = useState<ActiveBatch[]>([]);
	const [selectedProgId, setSelectedProgId] = useState<number | undefined>(
		() => {
			const p = searchParams.get("programmeId");
			return p ? Number(p) : undefined;
		},
	);
	const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
	const [selectedBatchYear, setSelectedBatchYear] = useState<string>(
		() => searchParams.get("batchYear") ?? "",
	);
	const [selectedType, setSelectedType] = useState<string>("Alumni");
	const [activeSubTab, setActiveSubTab] = useState<string>("ledger");
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	// Load programs and active batches on mount only
	useEffect(() => {
		Promise.all([
			hodApi.getDepartmentProgrammes({ limit: 100 }),
			hodApi.getProgrammesWithBatches(),
		]).then(([progRes, batches]) => {
			const progs = progRes.data ?? [];
			setProgrammes(progs);
			const actives: ActiveBatch[] = (batches ?? [])
				.filter((b: ProgrammeWithBatch) => b.batch_status === "active")
				.map((b: ProgrammeWithBatch) => ({
					programmeId: b.programme_id,
					programmeCode: b.programme_code,
					programmeName: b.programme_name,
					batchId: b.batch_id,
					batchYear: b.batch_year,
					studentCount: b.student_count,
				}));
			setActiveBatches(actives);
		}).finally(() => setLoading(false));
	}, []);

	// Sync state when search parameters change (supporting direct links, reload, and back/forward navigation)
	useEffect(() => {
		const urlProg = searchParams.get("programmeId");
		const urlBatch = searchParams.get("batchYear");

		if (urlProg) {
			const progId = Number(urlProg);
			setSelectedProgId(progId);

			if (urlBatch) {
				setSelectedBatchYear(urlBatch);
				hodApi.getBatchesByProgramme(progId)
					.then((bRes) => {
						const match = bRes?.find(
							(b: { batch_id: number; batch_year: number | string }) => String(b.batch_year) === urlBatch,
						);
						if (match) {
							setSelectedBatchId(match.batch_id);
						} else {
							setSelectedBatchId(null);
						}
					})
					.catch((err) => {
						console.error("Failed to resolve batch from URL:", err);
						setSelectedBatchId(null);
					});
			} else {
				setSelectedBatchId(null);
				setSelectedBatchYear("");
			}
		} else {
			setSelectedProgId(undefined);
			setSelectedBatchId(null);
			setSelectedBatchYear("");
		}
	}, [searchParams]);

	const handleSelectBatch = (batch: ActiveBatch) => {
		setSearchParams({
			programmeId: String(batch.programmeId),
			batchYear: String(batch.batchYear),
		});
	};

	const handleRefresh = () => setRefreshTrigger(n => n + 1);

	const renderActiveContent = () => {
		if (!selectedProgId || !selectedBatchYear) return null;
		const props = {
			programmeId: selectedProgId,
			batchYear: Number(selectedBatchYear),
			stakeholderType: selectedType,
		};
		switch (activeSubTab) {
			case "ledger":
				return <ConsolidatedMatrixView {...props} refreshTrigger={refreshTrigger} />;
			case "configure":
				return (
					<div className="p-4">
						<StakeholderSurveyConfig
							{...props}
							batchYear={selectedBatchYear}
							onConfigSaved={handleRefresh}
						/>
					</div>
				);
			case "import":
				return (
					<div className="p-4">
						<div className="max-w-3xl mx-auto pt-8">
							<StakeholderSurveyImport
								{...props}
								batchYear={selectedBatchYear}
								onImportComplete={handleRefresh}
							/>
						</div>
					</div>
				);
			case "manual":
				return <StakeholderManualEntry {...props} onSaved={handleRefresh} />;
			default:
				return null;
		}
	};

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
							setSearchParams({ programmeId: v });
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
						value={selectedBatchId}
						onChange={(_id, batch) => {
							if (batch?.batch_year && selectedProgId) {
								setSearchParams({
									programmeId: String(selectedProgId),
									batchYear: String(batch.batch_year),
								});
							} else if (selectedProgId) {
								setSearchParams({ programmeId: String(selectedProgId) });
							} else {
								setSearchParams({});
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
					<section className="bg-card border rounded-xl overflow-hidden shadow-sm">
						<div className="p-4 border-b bg-muted/[.4] flex justify-between items-center">
							<div>
								<h3 className="font-semibold">Survey Configuration</h3>
								<p className="text-xs text-muted-foreground">Batch {selectedBatchYear}</p>
							</div>
						</div>

						<div className="border-b px-4">
							<div className="flex h-12 space-x-6">
								{SURVEY_TYPES.map((type) => (
									<button
										key={type.id}
										onClick={() => setSelectedType(type.id)}
										className={`rounded-none h-full px-0 text-sm font-medium transition-colors hover:text-foreground ${
											selectedType === type.id
												? "border-b-2 border-primary text-foreground"
												: "border-b-2 border-transparent text-muted-foreground"
										}`}
									>
										{type.label}
									</button>
								))}
							</div>
						</div>

						<div className="border-b px-4">
							<div className="flex h-10 space-x-4">
								{[
									{ id: "ledger", label: "Response Ledger" },
									{ id: "configure", label: "Question Config" },
									{ id: "import", label: "Import CSV" },
									{ id: "manual", label: "Manual Entry" },
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveSubTab(tab.id)}
										className={`rounded-none h-full px-0 text-sm font-medium transition-colors hover:text-foreground ${
											activeSubTab === tab.id
												? "border-b-2 border-primary text-foreground"
												: "border-b-2 border-transparent text-muted-foreground"
										}`}
									>
										{tab.label}
									</button>
								))}
							</div>
						</div>

						<div className="overflow-y-auto bg-muted/[.1]">
							{renderActiveContent()}
						</div>
					</section>

					<ConsolidatedIndirectMatrix
						programmeId={selectedProgId}
						batchYear={Number(selectedBatchYear)}
						refreshTrigger={refreshTrigger}
					/>
				</div>
			) : (
				<div className="flex-1 flex flex-col gap-6 mt-4">
					<div className="text-center mb-2">
						<Calculator className="mx-auto h-8 w-8 text-muted-foreground/[.5] mb-3" />
						<p className="text-lg font-medium text-foreground">Active Programme Batches</p>
						<p className="text-sm text-muted-foreground max-w-sm mt-1 mx-auto">
							Select an active batch below or use the dropdown above to get started.
						</p>
					</div>
					{activeBatches.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{activeBatches.map((batch) => (
								<button
									key={`${batch.programmeId}-${batch.batchId}`}
									onClick={() => handleSelectBatch(batch)}
									className="flex items-start gap-3 p-4 bg-card border rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all text-left group"
								>
									<div className="w-10 h-10 rounded-lg bg-primary/[.1] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[.2] transition-colors">
										<GraduationCap className="h-5 w-5 text-primary" />
									</div>
									<div className="min-w-0">
										<p className="font-semibold text-sm truncate">
											{batch.programmeCode} — {batch.programmeName}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Batch {batch.batchYear}
											{batch.studentCount != null && ` · ${batch.studentCount} students`}
										</p>
									</div>
								</button>
							))}
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-xl">
							<div className="text-center">
								<BookOpen className="mx-auto h-8 w-8 text-muted-foreground/[.5] mb-3" />
								<p className="text-sm text-muted-foreground">No active batches found.</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
