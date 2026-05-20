import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { attainmentApi } from "@/services/api/attainment";
import { hodApi } from "@/services/api";
import { debugLogger } from "@/lib/debugLogger";
import type {
	CourseLevelProgrammeAttainmentResponse,
	Programme,
} from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BatchSelector, type StatItem } from "@/features/shared";
import { AttainmentStatCard } from "./AttainmentStatCard";
import { ArticulationMatrix } from "./ArticulationMatrix";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Target, FileText, TrendingUp, ChevronDown, BarChart3, PieChart } from "lucide-react";
import { StakeholderSurveyImport } from "@/features/surveys/StakeholderSurveyImport";
import { StakeholderSurveyConfig } from "@/features/surveys/StakeholderSurveyConfig";
import { StakeholderSurveyResults } from "@/features/surveys/StakeholderSurveyResults";
import { SetTargetsDialog } from "@/features/programmes/SetTargetsDialog";
import { ActionPlansSection } from "@/features/programmes/ActionPlansSection";
import { AttainmentComparisonCharts } from "@/features/programmes/AttainmentComparisonCharts";

interface ProgrammeAttainmentRouteState {
	programmeId: number;
	programmeName: string;
	batchYear?: string;
	batchId?: number;
}

export function ProgrammeAttainmentDashboard() {
	const location = useLocation();
	const routeState = location.state as ProgrammeAttainmentRouteState | null;

	const [selectedProgrammeId, setSelectedProgrammeId] = useState<
		number | null
	>(routeState?.programmeId ?? null);
	const [batchId, setBatchId] = useState<number | null>(
		routeState?.batchId ?? null,
	);
	const [batchYear, setBatchYear] = useState<string>(
		routeState?.batchYear ?? "",
	);
	const [loading, setLoading] = useState(false);
	const [calculating, setCalculating] = useState(false);
	const [data, setData] =
		useState<CourseLevelProgrammeAttainmentResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [programmes, setProgrammes] = useState<Programme[]>([]);
	const [programmesLoading, setProgrammesLoading] = useState(true);
	const [chartsOpen, setChartsOpen] = useState(false);
	const [stakeholderRefresh, setStakeholderRefresh] = useState(0);
	const [stakeholderBatchYear, setStakeholderBatchYear] = useState("");
	const [stakeholderType, setStakeholderType] = useState("");

	const loadAttainment = useCallback(async () => {
		if (!selectedProgrammeId) return;
		const year = batchYear.trim();
		if (year === "") return;
		setLoading(true);
		setError(null);
		try {
			const response = await attainmentApi.getCourseLevelProgrammeAttainment(
				selectedProgrammeId,
				Number(year),
			);
			setData(response);
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [selectedProgrammeId, batchYear]);

	const programmesLoadedRef = useRef(false);

	useEffect(() => {
		const loadProgrammes = async () => {
			try {
				const response = await hodApi.getDepartmentProgrammes({
					limit: 100,
				});
				setProgrammes(response.data ?? []);
				if (response.data?.length > 0 && !routeState?.programmeId) {
					setSelectedProgrammeId(response.data[0].programme_id);
				}
			} catch (err) {
				debugLogger.error(
					"ProgrammeAttainmentDashboard",
					"Failed to load programmes",
					err,
				);
			} finally {
				setProgrammesLoading(false);
				programmesLoadedRef.current = true;
			}
		};
		loadProgrammes();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Resolve batchId → batchYear when dashboard loads with batchId but no batchYear
	useEffect(() => {
		if (!batchId || batchYear) return;
		(async () => {
			try {
				const batch = await hodApi.getBatch(batchId);
				if (batch.batch_year) {
					setBatchYear(String(batch.batch_year));
				}
			} catch {
				// silently fail, user can pick batch year manually
			}
		})();
	}, [batchId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (
			programmesLoadedRef.current &&
			selectedProgrammeId &&
			batchYear.trim() !== ""
		) {
			loadAttainment();
		}
	}, [programmesLoadedRef.current, selectedProgrammeId, batchYear, loadAttainment]);

	const selectedProgramme = useMemo(
		() =>
			programmes.find((p) => p.programme_id === selectedProgrammeId) ?? null,
		[programmes, selectedProgrammeId],
	);

	const handleCalculate = async () => {
		if (!selectedProgrammeId) return;
		const year = batchYear.trim();
		if (year === "") return;
		setCalculating(true);
		setError(null);
		try {
			await attainmentApi.calculateProgrammeAttainment(
				selectedProgrammeId,
				Number(year),
			);
		} catch (err) {
			setError(
				`Calculate warning: ${err instanceof Error ? err.message : String(err)}`,
			);
		} finally {
			setCalculating(false);
		}
	};

	const kpiStats: StatItem[] = useMemo(() => {
		if (!data) return [];

		const avgValues = Object.values(data.averages);
		const finalValues = Object.values(data.finals);
		const indirectValues = Object.values(data.indirect).filter(
			(v) => v !== null,
		) as number[];
		const targetValues = Object.values(data.targets);

		const overallDirect =
			avgValues.length > 0
				? avgValues.reduce((a, b) => a + b, 0) / avgValues.length
				: 0;
		const overallFinal =
			finalValues.length > 0
				? finalValues.reduce((a, b) => a + b, 0) / finalValues.length
				: 0;
		const overallIndirect =
			indirectValues.length > 0
				? indirectValues.reduce((a, b) => a + b, 0) /
					indirectValues.length
				: 0;

		const hasTargets = targetValues.some((v) => v > 0);
		const gapCount = hasTargets
			? finalValues.filter(
					(v, i) => v < (targetValues[i] ?? Infinity),
				).length
			: 0;
		const targetMet = !hasTargets || gapCount === 0;

		const stats: StatItem[] = [
			{
				label: "Overall Direct Attainment",
				value: Number(overallDirect.toFixed(2)),
				icon: Target,
				suffix: " / 3",
				color: "#3b82f6",
			},
			{
				label: "Overall Indirect Attainment",
				value: Number(overallIndirect.toFixed(2)),
				icon: FileText,
				suffix: " / 3",
				color: "#8b5cf6",
			},
			{
				label: "Final Blended Attainment",
				value: Number(overallFinal.toFixed(2)),
				icon: TrendingUp,
				suffix: " / 3",
				color: "#10b981",
			},
			{
				label: targetMet ? "Target Achieved" : "Gap Identified",
				value: gapCount,
				icon: Target,
				suffix: targetMet ? "" : " PO(s) below target",
				color: targetMet ? "#10b981" : "#ef4444",
				description: targetMet
					? "All PO targets met"
					: `${gapCount} PO(s) below target`,
			},
		];

		return stats;
	}, [data]);

	const poList = data?.po_list ?? [];

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Executive Analytics Dashboard
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						{selectedProgramme ? (
							<>
								{selectedProgramme.programme_code} - {selectedProgramme.programme_name}
								{batchYear.trim() !== "" ? ` (Batch ${batchYear})` : " - Overview"}
							</>
						) : "Select a programme and batch to view attainment"}
					</p>
				</div>
				<div className="flex gap-3 items-end">
					<div className="space-y-1">
						<Select
							value={String(selectedProgrammeId ?? "")}
							onValueChange={(v) => {
								setSelectedProgrammeId(Number(v));
								setBatchId(null);
								setBatchYear("");
							}}
							disabled={programmesLoading}
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
							programmeId={selectedProgrammeId}
							value={batchId}
							onChange={(id, batch) => {
								setBatchId(id);
								if (batch?.batch_year) {
									setBatchYear(String(batch.batch_year));
								}
							}}
							disabled={programmesLoading || !selectedProgrammeId}
						/>
					</div>
					<Button
						onClick={handleCalculate}
						disabled={calculating || !selectedProgrammeId || !batchYear.trim()}
						variant="outline"
						className="gap-2"
					>
						<BarChart3 className="w-4 h-4" />
						{calculating ? "Recalculating..." : "Recalculate"}
					</Button>
					{data && (
						<SetTargetsDialog
							programmeId={selectedProgrammeId!}
							batchYear={batchYear}
							poList={poList}
							onSaved={loadAttainment}
						/>
					)}
				</div>
			</div>

			{error && (
				<div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
					{error}
				</div>
			)}

			{/* KPI Stats */}
			{data && kpiStats.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{kpiStats.map((stat, idx) => (
						<AttainmentStatCard
							key={idx}
							stat={{
								label: stat.label,
								value: stat.value,
								target: data.targets[stat.label] ?? 0,
								icon: stat.label.includes('Blended') ? Target : (idx % 2 === 0 ? TrendingUp : PieChart),
								iconColorClass: stat.label.includes('Blended') ? 'text-primary' : (idx % 2 === 0 ? 'text-emerald-600' : 'text-blue-600'),
								iconBgClass: stat.label.includes('Blended') ? 'bg-primary/10' : (idx % 2 === 0 ? 'bg-emerald-100' : 'bg-blue-100'),
								diffValue: stat.value - (data.targets[stat.label] ?? 0),
							}}
							isLoading={loading}
						/>
					))}
				</div>
			)}

			{/* Course × PO/PSO Matrix */}
			{data && <ArticulationMatrix data={data} poList={poList} />}

			{/* Consolidated Indirect Survey Breakdown */}
			{selectedProgrammeId && batchYear && (
				<Card className="p-6">
					<div className="flex items-center gap-2 mb-6">
						<FileText className="h-5 w-5 text-primary" />
						<h3 className="text-lg font-semibold">Stakeholder Surveys (Indirect Attainment)</h3>
					</div>
					<Tabs defaultValue="results">
						<TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
							<TabsTrigger value="results" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
								Results
							</TabsTrigger>
							<TabsTrigger value="import" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
								Import CSV
							</TabsTrigger>
							<TabsTrigger value="config" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
								Question Config
							</TabsTrigger>
						</TabsList>
						<TabsContent value="results" className="pt-6">
							<StakeholderSurveyResults
								programmeId={selectedProgrammeId}
								refreshTrigger={stakeholderRefresh}
							/>
						</TabsContent>
						<TabsContent value="import" className="pt-6">
							<StakeholderSurveyImport
								programmeId={selectedProgrammeId}
								onImportComplete={() =>
									setStakeholderRefresh((n) => n + 1)
								}
								batchYear={stakeholderBatchYear}
								stakeholderType={stakeholderType}
								onBatchYearChange={
									setStakeholderBatchYear
								}
								onStakeholderTypeChange={
									setStakeholderType
								}
							/>
						</TabsContent>
						<TabsContent value="config" className="pt-6">
							<StakeholderSurveyConfig
								programmeId={selectedProgrammeId}
								batchYear={stakeholderBatchYear}
								stakeholderType={stakeholderType}
								onConfigSaved={() =>
									setStakeholderRefresh((n) => n + 1)
								}
							/>
						</TabsContent>
					</Tabs>
				</Card>
			)}

			{/* Comparison Charts */}
			<Collapsible
				open={chartsOpen}
				onOpenChange={setChartsOpen}
				className="space-y-2"
			>
				<Card>
					<CollapsibleTrigger asChild>
						<Button
							variant="ghost"
							className="flex w-full justify-between p-4 h-auto"
						>
							<div className="flex items-center gap-2">
								<BarChart3 className="h-5 w-5 text-muted-foreground" />
								<span className="font-semibold">
									Attainment Comparison Charts
								</span>
							</div>
							<ChevronDown
								className={`h-4 w-4 transition-transform ${
									chartsOpen ? "rotate-180" : ""
								}`}
							/>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="px-4 pb-4">
						{data ? (
							<AttainmentComparisonCharts data={data} />
						) : (
							<p className="text-sm text-muted-foreground text-center py-8">
								Load attainment data to view charts.
							</p>
						)}
					</CollapsibleContent>
				</Card>
			</Collapsible>

			{/* Action Plans */}
			{selectedProgrammeId && batchYear.trim() && (
				<ActionPlansSection
					programmeId={selectedProgrammeId}
					batchYear={batchYear}
				/>
			)}
		</div>
	);
}
