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
		<div className="h-[calc(100vh-4rem)] flex flex-col gap-6 p-8 overflow-y-auto bg-background/50">
			<header className="mb-2 relative">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/20">
						<BookOpen className="h-5 w-5 text-primary-foreground" />
					</div>
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							Stakeholder Surveys & Indirect Attainment
						</h2>
						<p className="text-sm text-muted-foreground mt-0.5">
							Configure surveys, import responses, and review consolidated indirect PO attainment.
						</p>
					</div>
				</div>
			</header>

			<div className="flex flex-wrap gap-4 items-end bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
				<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-primary/20 pointer-events-none"></div>
				<div className="space-y-1.5">
					<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block ml-0.5">Academic Programme</span>
					<Select
						value={String(selectedProgId ?? "")}
						onValueChange={(v) => {
							setSearchParams({ programmeId: v });
						}}
						disabled={loading}
					>
						<SelectTrigger className="w-[280px] bg-background/60 shadow-inner">
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
				<div className="space-y-1.5 w-[160px]">
					<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block ml-0.5">Active Batch</span>
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
					<div className="ml-auto flex items-center mb-0.5">
						<ProgrammeWeightageConfig programmeId={selectedProgId} onSaved={handleRefresh} />
					</div>
				)}
			</div>

			{selectedProgId && selectedBatchYear ? (
				<div className="flex flex-col gap-6 flex-1">
					<section className="bg-card border border-muted/50 rounded-xl overflow-hidden shadow-md backdrop-blur-md bg-card/80 transition-all">
						<div className="p-4 border-b bg-muted/[.15] flex justify-between items-center">
							<div>
								<h3 className="font-semibold text-sm">Survey Configuration</h3>
								<p className="text-xs text-muted-foreground">Batch {selectedBatchYear}</p>
							</div>
						</div>

						<div className="border-b bg-muted/[.05] px-4 py-2">
							<div className="flex flex-wrap gap-2 py-1">
								{SURVEY_TYPES.map((type) => {
									const active = selectedType === type.id;
									return (
										<button
											key={type.id}
											onClick={() => setSelectedType(type.id)}
											className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 border ${
												active
													? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 border-primary"
													: "bg-background/80 text-muted-foreground hover:bg-muted/50 border-muted/60"
											}`}
										>
											{type.label}
										</button>
									);
								})}
							</div>
						</div>

						<div className="border-b bg-muted/[.1] px-4 py-2">
							<div className="flex flex-wrap gap-2 py-1">
								{[
									{ id: "ledger", label: "Response Ledger" },
									{ id: "configure", label: "Question Config" },
									{ id: "import", label: "Import CSV" },
									{ id: "manual", label: "Manual Entry" },
								].map((tab) => {
									const active = activeSubTab === tab.id;
									return (
										<button
											key={tab.id}
											onClick={() => setActiveSubTab(tab.id)}
											className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 border ${
												active
													? "bg-card text-foreground border-muted/50 shadow-sm font-semibold"
													: "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
											}`}
										>
											{tab.label}
										</button>
									);
								})}
							</div>
						</div>

						<div className="overflow-y-auto bg-muted/[.05]">
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
						<div className="w-16 h-16 mx-auto rounded-full bg-primary/[.08] flex items-center justify-center mb-4 border border-primary/[0.08]">
							<Calculator className="h-8 w-8 text-primary" />
						</div>
						<p className="text-xl font-bold text-foreground tracking-tight">Active Department Batches</p>
						<p className="text-sm text-muted-foreground max-w-sm mt-1 mx-auto">
							Select an active batch below or use the dropdown filters above to load the matrices.
						</p>
					</div>
					{activeBatches.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{activeBatches.map((batch) => (
								<button
									key={`${batch.programmeId}-${batch.batchId}`}
									onClick={() => handleSelectBatch(batch)}
									className="flex items-start gap-4 p-5 bg-card/75 backdrop-blur-sm border border-muted/55 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 hover:shadow-primary/[0.02] hover:-translate-y-1 transition-all duration-300 text-left group relative overflow-hidden"
								>
									<div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-5 rounded-bl-full bg-primary transition-opacity duration-300"></div>
									<div className="w-11 h-11 rounded-xl bg-primary/[.08] border border-primary/[0.12] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[.15] group-hover:scale-105 transition-all duration-300 shadow-sm">
										<GraduationCap className="h-5 w-5 text-primary" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
											{batch.programmeCode}
										</p>
										<p className="text-xs text-muted-foreground truncate mt-0.5 leading-snug">
											{batch.programmeName}
										</p>
										<div className="flex items-center gap-1.5 mt-2.5">
											<span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-muted/30">
												Batch {batch.batchYear}
											</span>
											{batch.studentCount != null && (
												<span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
													🎓 {batch.studentCount} students
												</span>
											)}
										</div>
									</div>
								</button>
							))}
						</div>
					) : (
						<div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted rounded-xl p-8 bg-card/40">
							<div className="text-center">
								<BookOpen className="mx-auto h-8 w-8 text-muted-foreground/[.5] mb-3" />
								<p className="text-sm font-semibold text-foreground">No active batches found</p>
								<p className="text-xs text-muted-foreground mt-1">Please create batches in the Programmes panel first.</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
