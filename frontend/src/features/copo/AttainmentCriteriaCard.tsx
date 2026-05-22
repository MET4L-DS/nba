import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AttainmentCriteria } from "./types";
import { formatCriteriaRange } from "./utils";
import { BarChart } from "lucide-react";

interface AttainmentCriteriaCardProps {
	attainmentCriteria: AttainmentCriteria[];
	getLevelColor: (level: number) => string;
}

export function AttainmentCriteriaCard({
	attainmentCriteria,
	getLevelColor,
}: AttainmentCriteriaCardProps) {
	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
			{/* Soft decorative left glow border */}
			<div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-500 via-primary/50 to-transparent"></div>
			
			<CardHeader className="py-4 border-b bg-muted/[.06] px-6">
				<CardTitle className="flex items-center gap-2 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
					<BarChart className="h-4 w-4 text-indigo-500 group-hover:rotate-12 transition-transform duration-300" />
					Attainment Criteria
				</CardTitle>
			</CardHeader>
			<CardContent className="p-6">
				<div className="flex gap-4 flex-wrap">
					{attainmentCriteria
						.sort((a, b) => b.level - a.level)
						.map((criteria) => (
							<div
								key={criteria.id}
								className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-muted/40 bg-card/45 hover:bg-muted/[.08] hover:border-indigo-500/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-sm cursor-default"
							>
								<Badge
									className={`${getLevelColor(criteria.level)} rounded-md font-bold px-2.5 py-0.5 shadow-xs`}
								>
									Level {criteria.level}
								</Badge>
								<span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
									{formatCriteriaRange(
										criteria.minPercentage,
										criteria.maxPercentage,
									)}
								</span>
							</div>
						))}
				</div>
			</CardContent>
		</Card>
	);
}
