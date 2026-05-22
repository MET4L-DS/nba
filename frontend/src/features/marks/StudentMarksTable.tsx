import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface StudentMark {
	student_id: string;
	student_name: string;
	CO1: string | number;
	CO2: string | number;
	CO3: string | number;
	CO4: string | number;
	CO5: string | number;
	CO6: string | number;
}

interface StudentMarksTableProps {
	marks: StudentMark[];
	passMarks?: number;
	loading?: boolean;
}

const CO_COLORS = [
	"text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40",
	"text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40",
	"text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40",
	"text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
	"text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
	"text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40",
];

const CO_KEYS = ["CO1", "CO2", "CO3", "CO4", "CO5", "CO6"] as const;

export function StudentMarksTable({
	marks,
	loading = false,
}: StudentMarksTableProps) {
	if (loading) {
		return (
			<div className="space-y-2 p-2">
				{[...Array(5)].map((_, i) => (
					<Skeleton key={i} className="h-11 w-full rounded-lg" />
				))}
			</div>
		);
	}

	if (!marks || marks.length === 0) {
		return (
			<div className="text-center py-10">
				<p className="text-muted-foreground text-sm font-medium">No marks data available</p>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-muted/50 overflow-hidden shadow-sm">
			<Table>
				<TableHeader className="bg-muted/[0.18]">
					<TableRow className="border-b border-muted/50 hover:bg-transparent">
						<TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 py-3 px-4 border-r border-muted/30">
							Student ID
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground/80 py-3 px-4 border-r border-muted/30">
							Student Name
						</TableHead>
						{CO_KEYS.map((co, i) => (
							<TableHead
								key={co}
								className={`text-center font-bold text-xs py-2 px-3 border-r border-muted/30 last:border-r-0 ${CO_COLORS[i].split(" ").slice(0, 2).join(" ")}`}
							>
								{co}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{marks.map((mark, idx) => (
						<motion.tr
							key={`${mark.student_id}-${idx}`}
							className="border-b border-muted/30 last:border-b-0 hover:bg-muted/[0.06] transition-colors"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								type: "spring",
								stiffness: 280,
								damping: 24,
								delay: idx * 0.03,
							}}
						>
							<TableCell className="font-mono text-xs font-semibold text-foreground/80 py-3 px-4 border-r border-muted/20">
								<Badge variant="outline" className="font-mono text-xs">
									{mark.student_id}
								</Badge>
							</TableCell>
							<TableCell className="font-medium text-sm text-foreground/90 py-3 px-4 max-w-[180px] truncate border-r border-muted/20">
								{mark.student_name}
							</TableCell>
							{CO_KEYS.map((co, i) => {
								const val = mark[co];
								const num = typeof val === "number" ? val : parseFloat(String(val));
								const hasValue = !isNaN(num) && num > 0;
								return (
									<TableCell
										key={co}
										className={`text-center py-2.5 px-3 border-r border-muted/20 last:border-r-0 tabular-nums`}
									>
										{hasValue ? (
											<span
												className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md text-xs font-bold ${CO_COLORS[i]}`}
											>
												{num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}
											</span>
										) : (
											<span className="text-muted-foreground/30 text-sm">—</span>
										)}
									</TableCell>
								);
							})}
						</motion.tr>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
