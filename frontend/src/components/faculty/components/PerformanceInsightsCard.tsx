import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import type { Course } from "@/services/api";

interface PerformanceInsightsCardProps {
	courses: Course[];
}

export const PerformanceInsightsCard = memo(function PerformanceInsightsCard({
	courses,
}: PerformanceInsightsCardProps) {
	return (
		<Card className="bg-card/85 backdrop-blur-md border border-muted/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative">
			<div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-transparent"></div>
			<CardHeader className="pb-4 border-b bg-muted/[.06] pt-6">
				<CardTitle className="flex items-center gap-3 text-base font-bold bg-gradient-to-r from-foreground to-foreground/85 bg-clip-text">
					<div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner text-emerald-600 dark:text-emerald-400">
						<TrendingUp className="w-5 h-5" />
					</div>
					<div>
						<span>Performance Insights</span>
						<p className="text-xs text-muted-foreground mt-0.5 font-normal">
							General metrics for overall registered credit loads and semester catalogs.
						</p>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="p-4 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-inner">
						<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
							Total Courses
						</p>
						<p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
							{courses.length}
						</p>
					</div>
					<div className="p-4 bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 rounded-xl shadow-inner">
						<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
							Active Semester
						</p>
						<p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
							{courses[0]?.semester ?? "N/A"}
						</p>
					</div>
					<div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-inner">
						<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
							Total Credits
						</p>
						<p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
							{courses.reduce((sum, c) => sum + c.credit, 0)}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
});
