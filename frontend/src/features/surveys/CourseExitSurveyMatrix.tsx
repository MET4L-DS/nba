import { Fragment } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableHeader,
	TableHead,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import {
	RatingCell,
	WeightedValCell,
	VarianceCell,
	WeightCell,
	CoLabelCell,
} from "./courseSurveyMatrixCells";
import type {
	CourseExitSurveyResultsResponse,
	CourseExitSurveyQuestionAnalysis,
} from "@/services/api";
import { motion } from "framer-motion";

const CO_RANGE = [1, 2, 3, 4, 5, 6] as const;

interface CourseExitSurveyMatrixProps {
	results: CourseExitSurveyResultsResponse | null;
	coGroups: Record<
		number,
		{ questions: CourseExitSurveyQuestionAnalysis[]; avg: number | null }
	>;
	filterText: string;
	onFilterTextChange: (val: string) => void;
}

function filterQuestions(
	questions: CourseExitSurveyQuestionAnalysis[],
	filter: string,
) {
	if (!filter) return questions;
	const lower = filter.toLowerCase();
	return questions.filter((q) =>
		(q.question_text ?? "").toLowerCase().includes(lower),
	);
}

interface CoGroupSectionProps {
	coNum: number;
	group: {
		questions: CourseExitSurveyQuestionAnalysis[];
		avg: number | null;
	};
	filterText: string;
}

const listVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			staggerChildren: 0.02,
		},
	},
};

const rowVariants = {
	hidden: { opacity: 0, y: 6 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.35,
			ease: [0.16, 1, 0.3, 1] as const,
		},
	},
};

function CoGroupSection({ coNum, group, filterText }: CoGroupSectionProps) {
	const filtered = filterQuestions(group.questions, filterText);
	if (!filtered.length) return null;

	return (
		<Fragment>
			{filtered.map((q, qIdx) => (
				<motion.tr
					key={q.question_id ?? `q-${coNum}-${qIdx}`}
					variants={rowVariants}
					className="border-b border-border hover:bg-muted/30 transition-colors"
				>
					{qIdx === 0 && (
						<CoLabelCell
							coNum={coNum}
							rowSpan={filtered.length}
						/>
					)}
					<TableCell className="font-sans text-xs truncate max-w-[260px] border-r">
						{q.question_text}
					</TableCell>
					<RatingCell rating={q.normalized_rating} />
					<WeightCell weight={q.mapping_weight} />
					<WeightedValCell
						rating={q.normalized_rating}
						weight={q.mapping_weight}
					/>
					<VarianceCell variance={q.rating_variance} />
				</motion.tr>
			))}
			<motion.tr
				variants={rowVariants}
				className="border-b-2 border-muted-foreground/20 bg-muted/10 font-sans"
			>
				<TableCell
					className="text-right font-semibold italic text-muted-foreground border-r"
					colSpan={1}
				>
					CO{coNum} Indirect Subtotal
				</TableCell>
				<TableCell className="border-r" />
				<TableCell className="text-right font-bold bg-primary/5 border-r font-mono">
					{group.avg !== null ? Number(group.avg).toFixed(2) : "-"}
				</TableCell>
				<TableCell className="text-right text-muted-foreground border-r">
					-
				</TableCell>
				<TableCell className="text-right border-r">-</TableCell>
				<TableCell />
			</motion.tr>
		</Fragment>
	);
}

export function CourseExitSurveyMatrix({
	results,
	coGroups,
	filterText,
	onFilterTextChange,
}: CourseExitSurveyMatrixProps) {
	return (
		<div className="border rounded-lg overflow-hidden bg-card">
			<div className="px-4 sm:px-5 py-4 border-b flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-background/50 backdrop-blur-md">
				<div>
					<h2 className="font-semibold text-base">
						Course Exit Survey Analysis Matrix
					</h2>
					<p className="text-xs text-muted-foreground mt-0.5">
						Detailed breakdown of indirect assessment responses
						mapped to Course Outcomes.
					</p>
				</div>
				<div className="relative w-full sm:w-auto">
					<Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-8 pr-3 py-1.5 h-8 text-xs w-full sm:w-44"
						placeholder="Filter questions..."
						value={filterText}
						onChange={(e) => onFilterTextChange(e.target.value)}
					/>
				</div>
			</div>

			<div className="overflow-x-auto w-full">
				<Table className="min-w-[700px]">
					<TableHeader>
						<TableRow>
							<TableHead className="w-14 text-center font-bold">
								CO
							</TableHead>
							<TableHead className="font-bold">
								Survey Question / Metric
							</TableHead>
							<TableHead className="w-24 text-right font-bold">
								Avg Score (0-3)
							</TableHead>
							<TableHead className="w-24 text-right font-bold">
								Mapping Wt.
							</TableHead>
							<TableHead className="w-24 text-right font-bold">
								Weighted Val.
							</TableHead>
							<TableHead className="w-28 font-bold">
								Statistical Var.
							</TableHead>
						</TableRow>
					</TableHeader>
					<motion.tbody
						variants={listVariants}
						initial="hidden"
						animate="show"
					>
						{results?.question_analysis?.length ? (
							CO_RANGE.map((coNum) => {
								const group = coGroups[coNum];
								if (!group || !group.questions.length)
									return null;
								return (
									<CoGroupSection
										key={coNum}
										coNum={coNum}
										group={group}
										filterText={filterText}
									/>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={6}
									className="py-8 text-center text-muted-foreground font-sans text-sm"
								>
									No survey data available. Import CSV or
									enter responses manually to populate the
									analysis matrix.
								</TableCell>
							</TableRow>
						)}
					</motion.tbody>
				</Table>
			</div>

			<div className="px-4 py-2 border-t bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
				<span>
					Showing {results?.question_analysis?.length ?? 0} questions
					mapped to {results?.co_results?.length ?? 0} outcomes
				</span>
				<Badge
					variant="secondary"
					className="flex items-center gap-1.5 text-[11px] font-normal"
				>
					<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
					Data up to date
				</Badge>
			</div>
		</div>
	);
}
