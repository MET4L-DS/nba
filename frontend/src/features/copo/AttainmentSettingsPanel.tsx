import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Save, Plus, Trash2, SlidersHorizontal, ListOrdered, Sparkles } from "lucide-react";
import type { AttainmentThreshold } from "./types";
import {
	Table,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

interface AttainmentSettingsPanelProps {
	showSettings: boolean;
	coThreshold: number;
	setCoThreshold: (value: number) => void;
	passingThreshold: number;
	setPassingThreshold: (value: number) => void;
	attainmentThresholds: AttainmentThreshold[];
	addThreshold: () => void;
	updateThreshold: (id: number, value: number) => void;
	removeThreshold: (id: number) => void;
	saveSettings: () => void;
}

const listVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.06 },
	},
};

const rowVariants = {
	hidden: { opacity: 0, x: -12 },
	show: {
		opacity: 1,
		x: 0,
		transition: { type: "spring" as const, stiffness: 280, damping: 24 },
	},
};

const LEVEL_COLORS = [
	{ bar: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
	{ bar: "bg-lime-500", badge: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30" },
	{ bar: "bg-amber-400", badge: "bg-amber-400/15 text-amber-700 dark:text-amber-400 border-amber-400/30" },
	{ bar: "bg-orange-400", badge: "bg-orange-400/15 text-orange-700 dark:text-orange-400 border-orange-400/30" },
	{ bar: "bg-red-500", badge: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30" },
];

export function AttainmentSettingsPanel({
	showSettings,
	coThreshold,
	setCoThreshold,
	passingThreshold,
	setPassingThreshold,
	attainmentThresholds,
	addThreshold,
	updateThreshold,
	removeThreshold,
	saveSettings,
}: AttainmentSettingsPanelProps) {
	if (!showSettings) return null;

	const sortedThresholds = [...attainmentThresholds].sort(
		(a, b) => b.percentage - a.percentage,
	);

	// Build visualization sections
	const buildSections = () => {
		if (!sortedThresholds.length) return [];
		const lowestThreshold = sortedThresholds[sortedThresholds.length - 1].percentage;
		const sections = [];

		sections.push({ id: "level-0", width: lowestThreshold, label: `< ${lowestThreshold}%`, level: 0, colorIdx: 4 });

		for (let i = sortedThresholds.length - 1; i > 0; i--) {
			const current = sortedThresholds[i].percentage;
			const next = sortedThresholds[i - 1].percentage;
			const level = attainmentThresholds.length - i;
			sections.push({
				id: `level-${level}`,
				width: next - current,
				label: `${current}%–${next}%`,
				level,
				colorIdx: Math.max(0, 3 - level),
			});
		}

		const highestThreshold = sortedThresholds[0].percentage;
		sections.push({
			id: `level-${sortedThresholds.length}`,
			width: 100 - highestThreshold,
			label: `≥ ${highestThreshold}%`,
			level: sortedThresholds.length,
			colorIdx: 0,
		});

		return sections;
	};

	const sections = buildSections();

	return (
		<motion.div
			className="flex flex-col gap-6 w-full h-full relative"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ type: "spring", stiffness: 260, damping: 26 }}
		>

			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<Sparkles className="w-4 h-4 text-indigo-500" />
						<h1 className="text-xl font-black text-foreground tracking-tight">
							CO-PO Attainment Configuration
						</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						Configure threshold levels and attainment targets for Course Outcomes.
					</p>
				</div>
			</div>

			{/* Visualization Bar */}
			<div className="w-full bg-muted/[0.12] border border-muted/40 p-5 rounded-xl">
				<div className="flex justify-between items-center mb-3">
					<span className="text-sm font-bold text-foreground">Threshold Distribution Preview</span>
					<span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">Live Preview</span>
				</div>
				<div className="h-8 w-full flex rounded-xl overflow-hidden border border-muted/40 shadow-inner">
					{sections.map((section) => {
						const color = LEVEL_COLORS[section.colorIdx]?.bar ?? "bg-gray-400";
						return (
							<motion.div
								key={section.id}
								style={{ width: `${section.width}%` }}
								className={`${color} h-full flex items-center justify-center text-white font-bold text-[10px] px-1 truncate border-r border-white/20 last:border-r-0`}
								title={`Level ${section.level}: ${section.label}`}
								layout
								transition={{ type: "spring", stiffness: 280, damping: 24 }}
							>
								{section.width > 8 ? `L${section.level}` : ""}
							</motion.div>
						);
					})}
				</div>
				<div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
					{sections.map((section) => {
						const color = LEVEL_COLORS[section.colorIdx]?.bar ?? "bg-gray-400";
						return (
							<div key={section.id} className="flex items-center gap-1.5">
								<div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
								<span className="text-[11px] text-muted-foreground font-medium">
									L{section.level}: {section.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column: Global Parameters */}
				<div className="lg:col-span-1">
					<Card className="flex flex-col h-full bg-card/60 border-muted/40 shadow-sm">
						<CardHeader className="bg-muted/[0.08] border-b border-muted/30 py-4 px-5">
							<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
								<SlidersHorizontal className="w-4 h-4 text-indigo-500" />
								Global Parameters
							</CardTitle>
						</CardHeader>
						<CardContent className="p-5 flex flex-col gap-6 flex-1">
							{/* Passing Threshold Slider */}
							<motion.div
								className="flex flex-col gap-3"
								whileHover={{ scale: 1.01 }}
								transition={{ type: "spring", stiffness: 380, damping: 28 }}
							>
								<div className="flex justify-between items-center">
									<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Student Passing Threshold
									</Label>
									<span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
										{passingThreshold}%
									</span>
								</div>
								<Slider
									min={0}
									max={100}
									step={5}
									value={[passingThreshold]}
									onValueChange={(val) => setPassingThreshold(val[0])}
									className="py-2"
								/>
								<p className="text-xs text-muted-foreground">
									Minimum score for a student to be considered passed.
								</p>
							</motion.div>

							{/* CO Threshold Slider */}
							<motion.div
								className="flex flex-col gap-3"
								whileHover={{ scale: 1.01 }}
								transition={{ type: "spring", stiffness: 380, damping: 28 }}
							>
								<div className="flex justify-between items-center">
									<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										CO Attainment Target
									</Label>
									<span className="text-lg font-black text-violet-600 dark:text-violet-400 tabular-nums">
										{coThreshold}%
									</span>
								</div>
								<Slider
									min={0}
									max={100}
									step={5}
									value={[coThreshold]}
									onValueChange={(val) => setCoThreshold(val[0])}
									className="py-2"
								/>
								<p className="text-xs text-muted-foreground">
									Target percentage of students expected to pass.
								</p>
							</motion.div>
						</CardContent>

						{/* Save Button */}
						<div className="p-4 border-t border-muted/30">
							<motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
								<Button
									onClick={saveSettings}
									className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
								>
									<Save className="h-4 w-4" />
									Save Parameters
								</Button>
							</motion.div>
						</div>
					</Card>
				</div>

				{/* Right Column: Attainment Level Settings */}
				<div className="lg:col-span-2">
					<Card className="flex flex-col h-full bg-card/60 border-muted/40 shadow-sm">
						<CardHeader className="bg-muted/[0.08] border-b border-muted/30 py-4 px-5 flex flex-row justify-between items-center space-y-0">
							<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
								<ListOrdered className="w-4 h-4 text-indigo-500" />
								Attainment Level Settings
							</CardTitle>
							<motion.div whileTap={{ scale: 0.92 }}>
								<Button
									onClick={addThreshold}
									variant="ghost"
									className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1.5 h-8 px-3 rounded-lg text-xs"
								>
									<Plus className="h-3.5 w-3.5" />
									Add Level
								</Button>
							</motion.div>
						</CardHeader>
						<CardContent className="p-0 overflow-x-auto">
							<Table>
								<TableHeader className="bg-muted/[0.10]">
									<TableRow className="border-b border-muted/30 hover:bg-transparent">
										<TableHead className="py-3 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Level</TableHead>
										<TableHead className="py-3 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</TableHead>
										<TableHead className="py-3 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Range (%)</TableHead>
										<TableHead className="py-3 px-5 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<motion.tbody
									variants={listVariants}
									initial="hidden"
									animate="show"
								>
									<AnimatePresence>
										{sortedThresholds.map((threshold, idx) => {
											const level = sortedThresholds.length - idx;
											const nextThreshold = sortedThresholds[idx - 1]?.percentage;
											let description = "High Attainment";
											if (level === 1) description = "Low Attainment";
											else if (level > 1 && level < sortedThresholds.length) description = "Medium Attainment";
											const colorIdx = Math.min(idx, LEVEL_COLORS.length - 1);
											const colors = LEVEL_COLORS[colorIdx];

											return (
												<motion.tr
													key={threshold.id}
													variants={rowVariants}
													exit={{ opacity: 0, x: 20 }}
													className="border-b border-muted/20 hover:bg-muted/[0.05] transition-colors"
												>
													<TableCell className="py-3.5 px-5">
														<div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs border ${colors.badge}`}>
															{level}
														</div>
													</TableCell>
													<TableCell className="py-3.5 px-5 font-medium text-sm text-foreground/90">
														{description}
													</TableCell>
													<TableCell className="py-3.5 px-5">
														<div className="flex items-center gap-2">
															<span className="text-sm font-bold text-muted-foreground">≥</span>
															<Input
																type="number"
																min="0"
																max="100"
																value={threshold.percentage}
																onChange={(e) => updateThreshold(threshold.id, Number(e.target.value))}
																className="w-20 py-1 px-2 h-8 text-sm font-bold bg-background/60 border-muted/50 rounded-lg focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
															/>
															{nextThreshold !== undefined && (
																<span className="text-sm text-muted-foreground whitespace-nowrap">
																	and &lt; {nextThreshold}
																</span>
															)}
														</div>
													</TableCell>
													<TableCell className="py-3.5 px-5 text-right">
														<motion.div whileTap={{ scale: 0.88 }}>
															<Button
																variant="ghost"
																size="icon"
																onClick={() => removeThreshold(threshold.id)}
																disabled={attainmentThresholds.length <= 1}
																className="h-7 w-7 text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
															>
																<Trash2 className="h-3.5 w-3.5" />
															</Button>
														</motion.div>
													</TableCell>
												</motion.tr>
											);
										})}
									</AnimatePresence>

									{/* Level 0 Row */}
									<TableRow className="hover:bg-muted/[0.04]">
										<TableCell className="py-3.5 px-5">
											<div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs border ${LEVEL_COLORS[4].badge}`}>
												0
											</div>
										</TableCell>
										<TableCell className="py-3.5 px-5 font-medium text-sm text-foreground/90">
											No Attainment
										</TableCell>
										<TableCell className="py-3.5 px-5">
											<div className="flex items-center gap-2">
												<span className="text-sm font-bold text-muted-foreground">&lt;</span>
												<Input
													type="number"
													disabled
													value={sortedThresholds[sortedThresholds.length - 1]?.percentage || 0}
													className="w-20 py-1 px-2 h-8 text-sm font-bold bg-muted/30 border-muted/30 text-muted-foreground cursor-not-allowed rounded-lg"
												/>
											</div>
										</TableCell>
										<TableCell className="py-3.5 px-5 text-right">
											<span className="text-xs italic text-muted-foreground/60">Default</span>
										</TableCell>
									</TableRow>
								</motion.tbody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</motion.div>
	);
}
