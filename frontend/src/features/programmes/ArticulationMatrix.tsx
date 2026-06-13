import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { CoursePOAttainmentRow } from "@/services/api";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ArticulationMatrixProps {
	data: {
		courses: CoursePOAttainmentRow[];
		averages: Record<string, number>;
		indirect: Record<string, number | null>;
		finals: Record<string, number>;
		targets: Record<string, number>;
	};
	poList: string[];
}

function getAttainmentBadge(val: number | null | undefined) {
	if (val == null || val <= 0) {
		return <span className="text-muted-foreground/30">—</span>;
	}
	if (val >= 2.50) {
		return (
			<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.05)] transition-all hover:bg-emerald-500/25 hover:scale-105">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.05)] transition-all hover:bg-amber-500/25 hover:scale-105">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2.5 py-0.5 rounded-md font-semibold text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.05)] transition-all hover:bg-rose-500/25 hover:scale-105">
			{val.toFixed(2)}
		</span>
	);
}

function getAverageBadge(val: number | null | undefined) {
	if (val == null || val <= 0) {
		return <span className="text-muted-foreground/30">—</span>;
	}
	if (val >= 2.50) {
		return (
			<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-md">
				{val.toFixed(2)}
			</span>
		);
	}
	if (val >= 1.50) {
		return (
			<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-md">
				{val.toFixed(2)}
			</span>
		);
	}
	return (
		<span className="inline-block px-2.5 py-1 rounded-md font-bold text-xs bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-md">
			{val.toFixed(2)}
		</span>
	);
}

export function ArticulationMatrix({ data, poList }: ArticulationMatrixProps) {
	const [hoveredCell, setHoveredCell] = useState<{ row: string | number | null; po: string | null }>({
		row: null,
		po: null,
	});

	const tableBodyVariants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.04,
			},
		},
	};

	const rowVariants = {
		hidden: { opacity: 0, y: 8 },
		show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },
	};

	return (
		<Card className="bg-card/70 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl hover:border-primary/20 flex flex-col">
			<div className="p-4 border-b bg-muted/[.1]">
				<h3 className="text-lg font-semibold flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
					<div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
					</div>
					Programme Articulation Matrix
				</h3>
				<p className="text-sm text-muted-foreground mt-1 ml-10">
					Course-level PO/PSO attainment with summary footer rows. Hover cells for coordinate cross-hairs.
				</p>
			</div>
			<div className="overflow-x-auto max-h-[600px] rounded-b-xl border border-muted/40 m-4">
				<table className="w-full text-sm whitespace-nowrap">
					<thead className="bg-muted/[.4] sticky top-0 z-10 shadow-sm border-b backdrop-blur">
						<tr>
							<th className="text-left px-4 py-3 w-12 font-semibold text-foreground/80">#</th>
							<th className="text-left px-4 py-3 min-w-[100px] font-semibold text-foreground/80">
								Code
							</th>
							<th className="text-left px-4 py-3 min-w-[200px] font-semibold text-foreground/80">
								Course
							</th>
							{poList.map((po) => {
								const isPoHovered = hoveredCell.po === po;
								return (
									<th
										key={po}
										className={`text-center px-4 py-3 min-w-[64px] font-bold transition-all duration-200 ${isPoHovered ? 'bg-primary/10 text-primary scale-110 shadow-sm rounded-t-md' : 'text-foreground/80'}`}
									>
										{po}
									</th>
								);
							})}
						</tr>
					</thead>
					<motion.tbody
						className="divide-y divide-muted/30"
						variants={tableBodyVariants}
						initial="hidden"
						animate="show"
					>
						{data.courses.length === 0 ? (
							<tr>
								<td
									colSpan={3 + poList.length}
									className="px-4 py-8 text-muted-foreground text-center"
								>
									No courses found for this programme and
									batch.
								</td>
							</tr>
						) : (
							data.courses.map((course, idx) => {
								const isRowHovered = hoveredCell.row === course.offering_id;
								return (
									<motion.tr
										key={course.offering_id}
										variants={rowVariants}
										className={`transition-colors duration-150 ${isRowHovered ? "bg-primary/5 dark:bg-primary/10" : idx % 2 === 0 ? "bg-card" : "bg-muted/[.03]"} hover:bg-muted/[.08]`}
									>
										<td className="px-4 py-3 text-muted-foreground text-xs">
											{idx + 1}
										</td>
										<td className="px-4 py-3 font-mono text-xs font-medium text-foreground/90">
											{course.course_code}
										</td>
										<td className="px-4 py-3 text-ellipsis overflow-hidden max-w-[250px] font-medium text-sm text-foreground/90" title={course.course_name}>
											{course.course_name}
										</td>
										{poList.map((po) => {
											const val = course.values[po];
											const isColHovered = hoveredCell.po === po;
											return (
												<td
													key={po}
													className={`px-4 py-2.5 text-center tabular-nums transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10" : ""}`}
													onMouseEnter={() => setHoveredCell({ row: course.offering_id, po })}
													onMouseLeave={() => setHoveredCell({ row: null, po: null })}
												>
													{getAttainmentBadge(val)}
												</td>
											);
										})}
									</motion.tr>
								);
							})
						)}
					</motion.tbody>
					{data.courses.length > 0 && (
						<tfoot className="font-medium text-sm border-t bg-muted/[.1]">
							{/* Direct row */}
							<tr className={`hover:bg-muted/[.05] border-t border-muted/30 transition-colors ${hoveredCell.row === 'direct' ? 'bg-primary/5' : ''}`}>
								<td
									colSpan={3}
									className="px-4 py-3 text-foreground/80 text-right pr-6 font-semibold"
								>
									<TooltipProvider delayDuration={100}>
										<div className="flex items-center justify-end gap-1.5">
											<span>Direct Attainment (Average)</span>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" className="max-w-xs font-normal text-xs leading-relaxed text-foreground bg-popover border border-muted/50 p-2 rounded-lg shadow-md">
													Calculated using a Weighted Average based on CO-PO correlation levels (1, 2, or 3), rather than a simple arithmetic mean.
												</TooltipContent>
											</Tooltip>
										</div>
									</TooltipProvider>
								</td>
								{poList.map((po) => {
									const isColHovered = hoveredCell.po === po;
									return (
										<td
											key={po}
											className={`px-4 py-2.5 text-center tabular-nums transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10 font-bold scale-105" : ""}`}
											onMouseEnter={() => setHoveredCell({ row: 'direct', po })}
											onMouseLeave={() => setHoveredCell({ row: null, po: null })}
										>
											{getAverageBadge(data.averages[po])}
										</td>
									);
								})}
							</tr>
							{/* Indirect row */}
							<tr className={`hover:bg-muted/[.05] border-t border-dashed border-muted/30 transition-colors ${hoveredCell.row === 'indirect' ? 'bg-primary/5' : ''}`}>
								<td
									colSpan={3}
									className="px-4 py-3 text-foreground/80 text-right pr-6 font-semibold"
								>
									Indirect Attainment (Surveys)
								</td>
								{poList.map((po) => {
									const val = data.indirect[po];
									const isColHovered = hoveredCell.po === po;
									return (
										<td
											key={po}
											className={`px-4 py-2.5 text-center tabular-nums transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10 font-bold scale-105" : ""}`}
											onMouseEnter={() => setHoveredCell({ row: 'indirect', po })}
											onMouseLeave={() => setHoveredCell({ row: null, po: null })}
										>
											{getAverageBadge(val)}
										</td>
									);
								})}
							</tr>
							{/* Final row */}
							<tr className={`bg-primary/[.05] hover:bg-primary/[.08] border-t border-primary/20 font-bold transition-colors ${hoveredCell.row === 'final' ? 'bg-primary/[.1]' : ''}`}>
								<td
									colSpan={3}
									className="px-4 py-3 text-primary font-bold text-right pr-6"
								>
									<TooltipProvider delayDuration={100}>
										<div className="flex items-center justify-end gap-1.5">
											<span>Final Attainment (Blended)</span>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-4 w-4 text-primary/75 cursor-pointer hover:text-primary transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" className="max-w-xs font-normal text-xs leading-relaxed text-foreground bg-popover border border-muted/50 p-2 rounded-lg shadow-md">
													Calculated as a blended combination of Direct Attainment (80%) and Indirect Attainment (20%) from stakeholder exit surveys.
												</TooltipContent>
											</Tooltip>
										</div>
									</TooltipProvider>
								</td>
								{poList.map((po) => {
									const isColHovered = hoveredCell.po === po;
									return (
										<td
											key={po}
											className={`px-4 py-2.5 text-center tabular-nums transition-colors duration-150 ${isColHovered ? "bg-primary/10 font-bold scale-105" : ""}`}
											onMouseEnter={() => setHoveredCell({ row: 'final', po })}
											onMouseLeave={() => setHoveredCell({ row: null, po: null })}
										>
											{getAverageBadge(data.finals[po])}
										</td>
									);
								})}
							</tr>
							{/* Target row */}
							<tr className={`hover:bg-muted/[.05] border-t bg-muted/[.1] border-muted/30 transition-colors ${hoveredCell.row === 'target' ? 'bg-primary/5' : ''}`}>
								<td
									colSpan={3}
									className="px-4 py-3 text-foreground/80 font-bold text-right pr-6"
								>
									Target Level
								</td>
								{poList.map((po) => {
									const val = data.targets[po];
									const final = data.finals[po] ?? 0;
									const hasTarget = val != null && val > 0;
									const isMet = hasTarget && final >= val;
									const isColHovered = hoveredCell.po === po;
									return (
										<td
											key={po}
											className={`px-4 py-2.5 text-center tabular-nums transition-colors duration-150 ${isColHovered ? "bg-primary/5 dark:bg-primary/10 font-bold scale-105" : ""}`}
											onMouseEnter={() => setHoveredCell({ row: 'target', po })}
											onMouseLeave={() => setHoveredCell({ row: null, po: null })}
										>
											{hasTarget ? (
												<span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${isMet ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 shadow-sm' : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 shadow-sm'}`}>
													{Number(val).toFixed(2)}
												</span>
											) : (
												<span className="text-muted-foreground/30">—</span>
											)}
										</td>
									);
								})}
							</tr>
						</tfoot>
					)}
				</table>
			</div>
		</Card>
	);
}

