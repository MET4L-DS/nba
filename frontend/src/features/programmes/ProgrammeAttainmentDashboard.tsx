import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { attainmentApi } from "@/services/api/attainment";
import { hodApi } from "@/services/api";
import { debugLogger } from "@/lib/debugLogger";
import type {
	CourseLevelProgrammeAttainmentResponse,
	Programme,
} from "@/services/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { BatchSelector } from "@/features/shared";
import { AttainmentStatCard } from "./AttainmentStatCard";
import { ArticulationMatrix } from "./ArticulationMatrix";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Target, FileText, TrendingUp, ChevronDown, BarChart3, ExternalLink } from "lucide-react";
import { SetTargetsDialog } from "@/features/programmes/SetTargetsDialog";
import { ActionPlansSection } from "@/features/programmes/ActionPlansSection";
import { AttainmentComparisonCharts } from "@/features/programmes/AttainmentComparisonCharts";
import { motion } from "framer-motion";

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05
		}
	}
};

const itemVariants = {
	hidden: { opacity: 0, y: 15 },
	show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

interface ProgrammeAttainmentRouteState {
	programmeId: number;
	programmeName: string;
	batchYear?: string;
	batchId?: number;
}

export function ProgrammeAttainmentDashboard() {
	const location = useLocation();
	const navigate = useNavigate();
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
			await loadAttainment();
		} catch (err) {
			setError(
				`Failed to calculate: ${err instanceof Error ? err.message : String(err)}`,
			);
		} finally {
			setCalculating(false);
		}
	};

	const kpiStats = useMemo(() => {
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

		return [
			{
				label: "Overall Direct Attainment",
				value: Number(overallDirect.toFixed(2)),
				icon: Target,
				iconColorClass: "text-blue-600",
				iconBgClass: "bg-blue-100",
			},
			{
				label: "Overall Indirect Attainment",
				value: Number(overallIndirect.toFixed(2)),
				icon: FileText,
				iconColorClass: "text-purple-600",
				iconBgClass: "bg-purple-100",
			},
			{
				label: "Final Blended Attainment",
				value: Number(overallFinal.toFixed(2)),
				icon: TrendingUp,
				iconColorClass: "text-primary",
				iconBgClass: "bg-primary/10",
			},
			{
				label: targetMet ? "Target Achieved" : "Gap Identified",
				value: gapCount,
				icon: Target,
				iconColorClass: targetMet ? "text-emerald-600" : "text-red-600",
				iconBgClass: targetMet ? "bg-emerald-100" : "bg-red-100",
				description: targetMet
					? "All PO targets met"
					: `${gapCount} PO(s) below target`,
				isStatusCard: true,
			},
		];
	}, [data]);

	const poList = data?.po_list ?? [];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className="space-y-6"
		>
			{/* Header Section */}
			<motion.div
				initial={{ opacity: 0, y: -12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
				className="flex flex-wrap gap-4 items-end bg-card/60 backdrop-blur-md border border-muted/50 rounded-xl p-5 shadow-sm relative"
			>
				<div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
					<div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full bg-primary/20"></div>
				</div>
				<div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
				<div className="flex-1 min-w-[280px] relative z-10">
					<h1 className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
						Executive Analytics Dashboard
					</h1>
					<p className="text-xs text-muted-foreground mt-1">
						{selectedProgramme ? (
							<span className="inline-flex items-center gap-1.5 mt-0.5">
								<span className="font-semibold text-primary">{selectedProgramme.programme_code}</span> 
								<span className="text-muted-foreground/30">—</span> 
								<span>{selectedProgramme.programme_name}</span>
								{batchYear.trim() !== "" && (
									<Badge variant="outline" className="ml-1.5 text-[10px] font-bold bg-primary/5 text-primary border-primary/20">
										Batch {batchYear}
									</Badge>
								)}
							</span>
						) : "Select a programme and batch to view attainment"}
					</p>
				</div>
				<div className="flex flex-wrap gap-3 items-end relative z-10">
					<div className="space-y-1.5 w-[280px]">
						<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block ml-0.5">Programme</span>
						<Select
							value={String(selectedProgrammeId ?? "")}
							onValueChange={(v) => {
								setSelectedProgrammeId(Number(v));
								setBatchId(null);
								setBatchYear("");
								setData(null);
								setError(null);
							}}
							disabled={programmesLoading}
						>
							<SelectTrigger 
								className="w-full bg-background/60 shadow-inner hover:border-primary/50 transition-colors whitespace-normal [&>span]:line-clamp-none text-left"
								style={{ height: 'auto', minHeight: '40px' }}
							>
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
					<div className="space-y-1.5 w-[180px]">
						<span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block ml-0.5">Batch Year</span>
						<BatchSelector
							label=""
							programmeId={selectedProgrammeId}
							value={batchId}
							onChange={(id, batch) => {
								setBatchId(id);
								setData(null);
								setError(null);
								if (batch?.batch_year) {
									setBatchYear(String(batch.batch_year));
								}
							}}
							disabled={programmesLoading || !selectedProgrammeId}
						/>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							onClick={handleCalculate}
							disabled={calculating || !selectedProgrammeId || !batchYear.trim()}
							variant="outline"
							className="gap-1.5 h-9 text-xs font-semibold hover:bg-primary/[0.04] hover:text-primary transition-all duration-200 active:scale-95"
						>
							<BarChart3 className="w-3.5 h-3.5" />
							{calculating ? "Calculating..." : "Recalculate"}
						</Button>
						{selectedProgrammeId && batchYear && (
							<SetTargetsDialog
								programmeId={selectedProgrammeId}
								batchYear={batchYear}
								poList={poList}
								onSaved={loadAttainment}
							/>
						)}
					</div>
				</div>
			</motion.div>

			{error && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-sm text-red-500 bg-red-50 dark:bg-rose-950/20 border border-red-200 dark:border-rose-900/30 rounded px-3 py-2"
				>
					{error}
				</motion.div>
			)}

			{loading && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="space-y-6"
				>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<Card key={i} className="p-6 space-y-3">
								<div className="flex justify-between items-start">
									<Skeleton className="h-10 w-10 rounded-lg" />
									<Skeleton className="h-5 w-20 rounded-full" />
								</div>
								<Skeleton className="h-4 w-32 animate-pulse" />
								<Skeleton className="h-8 w-20 animate-pulse" />
							</Card>
						))}
					</div>
					<Card className="border border-outline-variant shadow-sm overflow-hidden">
						<div className="p-4 border-b bg-muted/20">
							<Skeleton className="h-6 w-48 animate-pulse" />
							<Skeleton className="h-4 w-64 mt-2 animate-pulse" />
						</div>
						<div className="p-4 space-y-3">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="flex gap-4">
									<Skeleton className="h-4 w-8" />
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-48 flex-1" />
									{[...Array(6)].map((_, j) => (
										<Skeleton key={j} className="h-4 w-12" />
									))}
								</div>
							))}
						</div>
					</Card>
				</motion.div>
			)}

			{/* KPI Stats */}
			{data && kpiStats.length > 0 && data.courses.length > 0 && (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="show"
					className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
				>
					{kpiStats.map((stat, idx) => (
						<motion.div key={idx} variants={itemVariants}>
							<AttainmentStatCard
								stat={stat}
								isLoading={loading}
							/>
						</motion.div>
					))}
				</motion.div>
			)}

			{data && data.courses.length === 0 && (
				<motion.div
					initial={{ opacity: 0, scale: 0.98 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ type: "spring" }}
				>
					<Card className="border border-dashed p-8 text-center bg-card/50 backdrop-blur-xs">
						<div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
							<BarChart3 className="w-6 h-6 text-muted-foreground" />
						</div>
						<p className="text-sm font-medium text-foreground">No Courses Found</p>
						<p className="text-xs text-muted-foreground mt-1">
							No courses are mapped to this programme for batch {batchYear}. Add course offerings to see attainment data.
						</p>
					</Card>
				</motion.div>
			)}

			{/* Course × PO/PSO Matrix */}
			{data && (
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
				>
					<ArticulationMatrix data={data} poList={poList} />
				</motion.div>
			)}

			{/* Stakeholder Surveys Link */}
			{selectedProgrammeId && batchYear && (
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", delay: 0.15, duration: 0.5 }}
				>
					<Card className="border border-outline-variant shadow-sm overflow-hidden bg-card/60 backdrop-blur-md relative hover:shadow-md transition-all duration-300 hover:border-primary/20 group">
						<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/80 to-transparent"></div>
						<div className="p-4 border-b bg-muted/20">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center border border-emerald-500/20">
									<FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
								</div>
								Stakeholder Surveys
							</h3>
							<p className="text-sm text-muted-foreground mt-1 ml-10">
								Configure surveys, import responses, and review consolidated indirect attainment.
							</p>
						</div>
						<div className="p-6 flex flex-wrap gap-4 items-center justify-between">
							<div className="text-sm text-muted-foreground">
								Batch {batchYear} — Manage alumni, employer, graduate exit, parent, and academic peer surveys.
							</div>
							<Button
								variant="default"
								size="sm"
								className="active:scale-95 duration-200 transition-all shadow-sm hover:shadow-md"
								onClick={() => {
									navigate(`/hod/stakeholder-surveys?programmeId=${selectedProgrammeId}&batchYear=${batchYear}`);
								}}
							>
								<ExternalLink className="h-4 w-4 mr-1.5" />
								View Surveys
							</Button>
						</div>
					</Card>
				</motion.div>
			)}

			{/* Comparison Charts */}
			{data && (
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", delay: 0.2, duration: 0.5 }}
				>
					<Collapsible
						open={chartsOpen}
						onOpenChange={setChartsOpen}
						className="space-y-2"
					>
						<Card className="bg-card/60 backdrop-blur-md border border-muted/50">
							<CollapsibleTrigger asChild>
								<Button
									variant="ghost"
									className="flex w-full justify-between p-4 h-auto hover:bg-muted/10 transition-colors"
								>
									<div className="flex items-center gap-2">
										<BarChart3 className="h-5 w-5 text-muted-foreground" />
										<span className="font-semibold text-foreground/90">
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
								<AttainmentComparisonCharts data={data} />
							</CollapsibleContent>
						</Card>
					</Collapsible>
				</motion.div>
			)}

			{/* Action Plans */}
			{selectedProgrammeId && batchYear.trim() && !loading && (
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ type: "spring", delay: 0.25, duration: 0.5 }}
				>
					<ActionPlansSection
						programmeId={selectedProgrammeId}
						batchYear={batchYear}
					/>
				</motion.div>
			)}
		</motion.div>
	);
}
